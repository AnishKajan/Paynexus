use axum::{
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    Json,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// ─── Config ───────────────────────────────────────────────────────────────────

/// Pull from environment at startup. Set in .env or shell:
///   SUPABASE_JWT_SECRET=<your-supabase-project-jwt-secret>
///   SUPABASE_PROJECT_URL=https://<ref>.supabase.co
pub struct AuthConfig {
    pub jwt_secret: String,
    pub project_url: String,
}

impl AuthConfig {
    pub fn from_env() -> Self {
        Self {
            jwt_secret: std::env::var("SUPABASE_JWT_SECRET")
                .expect("SUPABASE_JWT_SECRET must be set"),
            project_url: std::env::var("SUPABASE_PROJECT_URL")
                .expect("SUPABASE_PROJECT_URL must be set"),
        }
    }
}

// ─── Claims ───────────────────────────────────────────────────────────────────

/// JWT claims issued by Supabase Auth.
/// `sub` is the Supabase user UUID (auth.users.id).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupabaseClaims {
    /// User UUID — maps to auth.users.id in Postgres.
    pub sub: String,
    pub email: Option<String>,
    pub role: String,
    pub iss: String,
    pub iat: i64,
    pub exp: i64,
    #[serde(default)]
    pub app_metadata: serde_json::Value,
    #[serde(default)]
    pub user_metadata: serde_json::Value,
}

/// Thin wrapper carried through the request pipeline.
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: String,
    pub email: Option<String>,
    pub role: String,
}

// ─── Token verification ───────────────────────────────────────────────────────

/// Verify a Supabase JWT using the project's JWT secret (HS256).
/// Returns the decoded claims on success.
pub fn verify_jwt(
    token: &str,
    jwt_secret: &str,
) -> Result<SupabaseClaims, jsonwebtoken::errors::Error> {
    let key = DecodingKey::from_secret(jwt_secret.as_bytes());

    let mut validation = Validation::new(Algorithm::HS256);
    // Supabase issues tokens with "authenticated" or "anon" as the role claim.
    // We don't validate audience here — Supabase sets it to the project URL.
    validation.validate_aud = false;

    let token_data = decode::<SupabaseClaims>(token, &key, &validation)?;
    Ok(token_data.claims)
}

// ─── Axum extractor ───────────────────────────────────────────────────────────

/// Axum extractor that pulls `Authorization: Bearer <token>` from the request,
/// verifies the JWT, and injects an `AuthUser` into the handler.
///
/// Usage:
/// ```rust
/// async fn my_handler(
///     auth: AuthUser,
///     State(state): State<SharedState>,
/// ) -> Json<Value> { ... }
/// ```
#[axum::async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, Json<Value>);

    async fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        // Extract Authorization header
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({ "error": "missing Authorization header" })),
                )
            })?;

        // Strip "Bearer " prefix
        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({ "error": "Authorization header must use Bearer scheme" })),
                )
            })?;

        // Read JWT secret from environment
        let jwt_secret = std::env::var("SUPABASE_JWT_SECRET").map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "server misconfiguration: missing SUPABASE_JWT_SECRET" })),
            )
        })?;

        // Verify and decode
        let claims = verify_jwt(token, &jwt_secret).map_err(|e| {
            (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": format!("invalid token: {}", e) })),
            )
        })?;

        Ok(AuthUser {
            user_id: claims.sub,
            email: claims.email,
            role: claims.role,
        })
    }
}

// ─── Org membership guard ─────────────────────────────────────────────────────

/// In a full implementation this queries Supabase Postgres (via postgrest or
/// a direct pg connection) to verify the user is a member of the org.
///
/// For the demo, we accept the claim and rely on RLS in Supabase enforcing it
/// when the backend uses the user's JWT for database operations.
///
/// Swap the body for a real DB check when connecting supabase-rs or sqlx.
pub async fn assert_org_membership(
    user_id: &str,
    org_id: &str,
) -> Result<(), (StatusCode, Json<Value>)> {
    // TODO: replace with:
    //   SELECT 1 FROM organization_members
    //   WHERE org_id = $1 AND user_id = $2
    // using sqlx or the Supabase REST API with the service-role key.
    let _ = (user_id, org_id);
    Ok(())
}
