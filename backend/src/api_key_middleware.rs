// ─── API Key Middleware ────────────────────────────────────────────────────────
//
// Validates `Authorization: Bearer pnx_sbx_... / pnx_prd_...` tokens.
//
// Flow:
//   1. Extract Bearer token from Authorization header
//   2. Determine environment from prefix (pnx_sbx_ / pnx_prd_)
//   3. Hash the raw token with SHA-256
//   4. Look up the hash in AppState::api_key_records
//   5. Reject if revoked
//   6. Update last_used timestamp
//   7. Inject ApiKeyContext into the request pipeline
//
// Handlers use `ApiKeyContext` as an Axum extractor — if the key is invalid,
// the request is rejected with 401 before the handler body runs.

use axum::{
    extract::{FromRef, FromRequestParts},
    http::{request::Parts, StatusCode},
    Json,
};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::handlers::SharedState;
use crate::models::KeyEnvironment;

// ─── Context injected into authenticated handlers ─────────────────────────────

#[derive(Debug, Clone)]
pub struct ApiKeyContext {
    pub key_id: String,
    pub org_id: String,
    pub env: KeyEnvironment,
    pub scopes: Vec<String>,
}

// ─── Key utilities ────────────────────────────────────────────────────────────

/// SHA-256 hash of the raw API key (stored in DB, never the raw key).
pub fn hash_key(raw: &str) -> String {
    let mut h = Sha256::new();
    h.update(raw.as_bytes());
    h.finalize().iter().map(|b| format!("{:02x}", b)).collect()
}

/// Generate a new raw API key for the given environment.
/// Format: pnx_sbx_<32 random hex chars>
pub fn generate_raw_key(env: &KeyEnvironment) -> String {
    let a = uuid::Uuid::new_v4().to_string().replace('-', "");
    let b = uuid::Uuid::new_v4().to_string().replace('-', "");
    let random = format!("{}{}", a, b);
    format!("{}{}", env.key_prefix(), &random[..32])
}

/// Mask a raw key for safe display: pnx_sbx_****...****<last4>
pub fn mask_key(raw: &str) -> String {
    if raw.len() < 12 {
        return "****".to_string();
    }
    let prefix_end = raw.find('_').and_then(|i| raw[i + 1..].find('_').map(|j| i + j + 2));
    let prefix = prefix_end.map(|e| &raw[..e]).unwrap_or("pnx_");
    let last4 = &raw[raw.len() - 4..];
    format!("{}****{}****{}", prefix, "", last4)
}

// ─── Axum extractor ───────────────────────────────────────────────────────────

#[axum::async_trait]
impl<S> FromRequestParts<S> for ApiKeyContext
where
    S: Send + Sync,
    SharedState: FromRef<S>,
{
    type Rejection = (StatusCode, Json<Value>);

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        // 1. Extract Authorization header
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "missing Authorization header" })),
            ))?;

        // 2. Strip Bearer prefix
        let raw_key = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Authorization must use Bearer scheme" })),
            ))?;

        // 3. Validate key prefix → determine environment
        let env = KeyEnvironment::from_prefix(raw_key).ok_or_else(|| (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "error": "invalid key format",
                "hint": "keys must start with pnx_sbx_ (sandbox) or pnx_prd_ (production)"
            })),
        ))?;

        // 4. Hash the raw key for DB comparison
        let key_hash = hash_key(raw_key);

        // 5. Look up in AppState
        let app_state = SharedState::from_ref(state);
        let mut st = app_state.lock().await;

        let record = st
            .api_key_records
            .iter_mut()
            .find(|k| k.key_hash == key_hash)
            .ok_or_else(|| (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "invalid API key" })),
            ))?;

        // 6. Reject revoked keys
        if record.revoked_at.is_some() {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "API key has been revoked" })),
            ));
        }

        // 7. Update last_used
        record.last_used = Some(chrono::Utc::now());

        let ctx = ApiKeyContext {
            key_id: record.id.clone(),
            org_id: record.org_id.clone(),
            env,
            scopes: record.scopes.clone(),
        };

        Ok(ctx)
    }
}
