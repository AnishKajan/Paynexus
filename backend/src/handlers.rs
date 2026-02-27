use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::api_key_middleware::{generate_raw_key, hash_key, mask_key, ApiKeyContext};
use crate::auth::AuthUser;
use crate::models::{
    ApiKey, ApiKeyRecord, CheckoutSession, ConfirmCheckoutRequest, CreateApiKeyRequest,
    CreateApiKeyV1Request, CreateCheckoutRequest, CreateWebhookRequest,
    RotateApiKeyRequest, SessionStatus, Transaction, Webhook,
};
use crate::payment_engine::PaymentEngine;

// ─── App State ────────────────────────────────────────────────────────────────

pub struct AppState {
    pub engine: PaymentEngine,
    pub sessions: Vec<CheckoutSession>,
    pub transactions: Vec<Transaction>,
    pub api_keys: Vec<ApiKey>,              // legacy display keys (/api/ routes)
    pub api_key_records: Vec<ApiKeyRecord>, // v1 hashed records
    pub webhooks: Vec<Webhook>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            engine: PaymentEngine::new(),
            sessions: Vec::new(),
            transactions: Vec::new(),
            api_keys: Vec::new(),
            api_key_records: Vec::new(),
            webhooks: Vec::new(),
        }
    }
}

pub type SharedState = Arc<Mutex<AppState>>;

// ─── Legacy handlers (kept for backward compatibility) ────────────────────────

/// POST /api/checkout/create
pub async fn create_checkout(
    State(state): State<SharedState>,
    Json(req): Json<CreateCheckoutRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if req.amount == 0 {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "amount must be greater than 0" }))));
    }
    let currency = req.currency.to_lowercase();
    let supported = ["usd", "eur", "gbp", "cad", "aud"];
    if !supported.contains(&currency.as_str()) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": format!("unsupported currency: {}", currency) }))));
    }
    let mut st = state.lock().await;
    let session = st.engine.create_session(req.amount, currency, req.country.as_deref());
    let response = json!({
        "session_id": session.id, "checkout_url": session.checkout_url,
        "client_secret": session.client_secret, "amount": session.amount,
        "currency": session.currency, "status": session.status,
        "fees": session.fees, "tax_nexus": session.tax_nexus,
        "created_at": session.created_at, "expires_at": session.expires_at,
    });
    st.sessions.push(session);
    Ok(Json(response))
}

/// POST /api/checkout/confirm
pub async fn confirm_checkout(
    State(state): State<SharedState>,
    Json(req): Json<ConfirmCheckoutRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let mut st = state.lock().await;
    let idx = st.sessions.iter().position(|s| s.id == req.session_id)
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(json!({ "error": "session not found" }))))?;
    if !st.engine.validate_payment_method(&req.payment_method.token) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "invalid payment method token" }))));
    }
    let session = st.sessions[idx].clone();
    st.sessions[idx].status = SessionStatus::Confirmed;
    let txn = st.engine.confirm_session(&session, &req.payment_method);
    let response = json!({
        "transaction_id": txn.id, "session_id": txn.session_id,
        "status": txn.status, "amount": txn.amount, "net_amount": txn.net_amount,
        "currency": txn.currency, "fees": txn.fees,
        "compliance": txn.compliance, "created_at": txn.created_at,
    });
    st.transactions.push(txn);
    Ok(Json(response))
}

/// GET /api/compliance-scan
pub async fn compliance_scan(State(state): State<SharedState>) -> Json<Value> {
    let st = state.lock().await;
    let r = st.engine.scan_compliance();
    Json(json!({
        "aml_risk": r.aml_risk, "fraud_risk": r.fraud_risk, "pci_risk": r.pci_risk,
        "sanctions_risk": r.sanctions_risk, "tax_nexus_risk": r.tax_nexus_risk,
        "overall_risk": r.overall_risk, "risk_level": r.risk_level,
        "high_risk_countries": r.high_risk_countries, "high_risk_states": r.high_risk_states,
        "flagged_patterns": r.flagged_patterns,
        "model": { "version": r.model_version, "auc": r.auc_score,
                   "architecture": "GraphSAGE · 3 layers · 256→128→64",
                   "training_data": "IBM AML Dataset", "inference_ms": r.inference_ms }
    }))
}

/// GET /api/transactions
pub async fn list_transactions(State(state): State<SharedState>) -> Json<Value> {
    let st = state.lock().await;
    let txns: Vec<Value> = st.transactions.iter().map(|t| json!({
        "id": t.id, "session_id": t.session_id, "amount": t.amount,
        "net_amount": t.net_amount, "currency": t.currency,
        "status": t.status, "created_at": t.created_at,
    })).collect();
    let total = txns.len();
    Json(json!({ "transactions": txns, "total": total }))
}

/// POST /api/keys/create (legacy)
pub async fn create_api_key(
    State(state): State<SharedState>,
    Json(req): Json<CreateApiKeyRequest>,
) -> Json<Value> {
    let key = ApiKey::new(req.tag);
    let response = json!({ "id": key.id, "key": key.key, "tag": key.tag,
                            "scopes": key.scopes, "created_at": key.created_at });
    state.lock().await.api_keys.push(key);
    Json(response)
}

/// GET /api/health
pub async fn health() -> Json<Value> {
    Json(json!({
        "status": "operational", "service": "paynexus-backend", "version": "0.1.0",
        "engines": { "payment": "online", "compliance": "online", "mor": "online" }
    }))
}

// ─── V1 handlers — API key authenticated ─────────────────────────────────────

/// POST /v1/checkout/create
/// Stamps session with org_id + env from the API key.
pub async fn create_checkout_v1(
    api_key: ApiKeyContext,
    State(state): State<SharedState>,
    Json(req): Json<CreateCheckoutRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if req.amount == 0 {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "amount must be greater than 0" }))));
    }
    let currency = req.currency.to_lowercase();
    let supported = ["usd", "eur", "gbp", "cad", "aud"];
    if !supported.contains(&currency.as_str()) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": format!("unsupported currency: {}", currency) }))));
    }
    let mut st = state.lock().await;
    let session = st.engine
        .create_session(req.amount, currency, req.country.as_deref())
        .with_org(api_key.org_id.clone(), api_key.env.clone());
    let response = json!({
        "session_id": session.id, "org_id": session.org_id, "env": session.env,
        "checkout_url": session.checkout_url, "client_secret": session.client_secret,
        "amount": session.amount, "currency": session.currency, "status": session.status,
        "fees": session.fees, "tax_nexus": session.tax_nexus,
        "created_at": session.created_at, "expires_at": session.expires_at,
    });
    st.sessions.push(session);
    Ok(Json(response))
}

/// POST /v1/checkout/confirm
/// Enforces: same org + same env (sandbox key → sandbox sessions only).
pub async fn confirm_checkout_v1(
    api_key: ApiKeyContext,
    State(state): State<SharedState>,
    Json(req): Json<ConfirmCheckoutRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let mut st = state.lock().await;
    let idx = st.sessions.iter().position(|s| s.id == req.session_id)
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(json!({ "error": "session not found" }))))?;

    // Environment enforcement
    if let Some(session_env) = st.sessions[idx].env.as_ref() {
        if session_env != &api_key.env {
            return Err((StatusCode::FORBIDDEN, Json(json!({
                "error": "environment mismatch",
                "detail": format!("{} key cannot confirm a {} session",
                    api_key.env.as_str(), session_env.as_str())
            }))));
        }
    }

    // Org enforcement
    if let Some(session_org) = st.sessions[idx].org_id.as_deref() {
        if session_org != api_key.org_id {
            return Err((StatusCode::FORBIDDEN, Json(json!({ "error": "session belongs to a different organization" }))));
        }
    }

    if !st.engine.validate_payment_method(&req.payment_method.token) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "invalid payment method token" }))));
    }

    let session = st.sessions[idx].clone();
    st.sessions[idx].status = SessionStatus::Confirmed;
    let txn = st.engine
        .confirm_session(&session, &req.payment_method)
        .with_org(api_key.org_id.clone(), api_key.env.clone());

    let response = json!({
        "transaction_id": txn.id, "session_id": txn.session_id,
        "org_id": txn.org_id, "env": txn.env,
        "status": txn.status, "amount": txn.amount, "net_amount": txn.net_amount,
        "currency": txn.currency, "fees": txn.fees,
        "compliance": txn.compliance, "created_at": txn.created_at,
    });
    st.transactions.push(txn);
    Ok(Json(response))
}

/// GET /v1/compliance-scan
pub async fn compliance_scan_v1(
    _api_key: ApiKeyContext,
    State(state): State<SharedState>,
) -> Json<Value> {
    let st = state.lock().await;
    let r = st.engine.scan_compliance();
    Json(json!({
        "aml_risk": r.aml_risk, "fraud_risk": r.fraud_risk, "pci_risk": r.pci_risk,
        "sanctions_risk": r.sanctions_risk, "tax_nexus_risk": r.tax_nexus_risk,
        "overall_risk": r.overall_risk, "risk_level": r.risk_level,
        "high_risk_countries": r.high_risk_countries, "high_risk_states": r.high_risk_states,
        "flagged_patterns": r.flagged_patterns,
        "model": { "version": r.model_version, "auc": r.auc_score,
                   "architecture": "GraphSAGE · 3 layers · 256→128→64",
                   "inference_ms": r.inference_ms }
    }))
}

/// GET /v1/transactions
/// Returns only transactions for the caller's org + env.
pub async fn list_transactions_v1(
    api_key: ApiKeyContext,
    State(state): State<SharedState>,
) -> Json<Value> {
    let st = state.lock().await;
    let txns: Vec<Value> = st.transactions.iter()
        .filter(|t| {
            t.org_id.as_deref() == Some(api_key.org_id.as_str())
                && t.env.as_ref() == Some(&api_key.env)
        })
        .map(|t| json!({
            "id": t.id, "session_id": t.session_id,
            "org_id": t.org_id, "env": t.env,
            "amount": t.amount, "net_amount": t.net_amount,
            "currency": t.currency, "status": t.status, "created_at": t.created_at,
        }))
        .collect();
    let total = txns.len();
    Json(json!({ "transactions": txns, "total": total }))
}

// ─── V1 API Key management ────────────────────────────────────────────────────

/// POST /v1/api-keys/create
/// JWT-protected: user must be authenticated via Supabase.
/// Returns raw key once — hash is stored internally.
pub async fn create_api_key_v1(
    _auth: AuthUser,
    State(state): State<SharedState>,
    Json(req): Json<CreateApiKeyV1Request>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let default_scopes = vec![
        "checkout:create".to_string(),
        "checkout:confirm".to_string(),
        "compliance:read".to_string(),
        "transactions:read".to_string(),
        "webhooks:manage".to_string(),
    ];
    let scopes = req.scopes.unwrap_or(default_scopes);
    let raw_key = generate_raw_key(&req.env);
    let key_hash = hash_key(&raw_key);
    let key_display = mask_key(&raw_key);
    let id = format!("key_{}", &uuid::Uuid::new_v4().to_string().replace('-', "")[..12]);

    let record = ApiKeyRecord {
        id: id.clone(),
        org_id: req.org_id.clone(),
        key_hash,
        key_display: key_display.clone(),
        env: req.env.clone(),
        tag: req.tag.clone(),
        scopes: scopes.clone(),
        created_at: chrono::Utc::now(),
        last_used: None,
        revoked_at: None,
    };

    let response = json!({
        "id": id,
        "raw_key": raw_key,           // shown once — MCP must store this
        "key_display": key_display,
        "org_id": req.org_id,
        "env": req.env,
        "tag": req.tag,
        "scopes": scopes,
        "created_at": record.created_at,
        "warning": "Store raw_key securely — it will not be shown again."
    });

    state.lock().await.api_key_records.push(record);
    Ok(Json(response))
}

/// POST /v1/api-keys/rotate
/// Revokes current key and issues a new one with the same org/env/scopes.
/// Raw key returned exactly once.
pub async fn rotate_api_key(
    api_key: ApiKeyContext,
    State(state): State<SharedState>,
    Json(req): Json<RotateApiKeyRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let mut st = state.lock().await;

    let old_record = st.api_key_records.iter_mut()
        .find(|k| k.id == api_key.key_id)
        .ok_or_else(|| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "key record not found" }))))?;

    let old_tag = old_record.tag.clone();
    let old_org = old_record.org_id.clone();
    let old_scopes = old_record.scopes.clone();
    old_record.revoked_at = Some(chrono::Utc::now());

    let new_tag = req.tag.unwrap_or(old_tag);
    let raw_key = generate_raw_key(&api_key.env);
    let key_hash = hash_key(&raw_key);
    let key_display = mask_key(&raw_key);
    let new_id = format!("key_{}", &uuid::Uuid::new_v4().to_string().replace('-', "")[..12]);

    let response = json!({
        "rotated": true,
        "old_key_id": api_key.key_id,
        "new_key": {
            "id": new_id,
            "raw_key": raw_key,       // shown once — store immediately
            "key_display": key_display.clone(),
            "org_id": old_org.clone(),
            "env": api_key.env,
            "tag": new_tag.clone(),
            "scopes": old_scopes.clone(),
            "created_at": chrono::Utc::now(),
        },
        "warning": "Store raw_key securely — it will not be shown again."
    });

    st.api_key_records.push(ApiKeyRecord {
        id: new_id,
        org_id: old_org,
        key_hash,
        key_display,
        env: api_key.env,
        tag: new_tag,
        scopes: old_scopes,
        created_at: chrono::Utc::now(),
        last_used: None,
        revoked_at: None,
    });

    Ok(Json(response))
}

// ─── V1 Webhook management ────────────────────────────────────────────────────

const VALID_EVENTS: &[&str] = &[
    "checkout.created", "checkout.confirmed",
    "transaction.succeeded", "transaction.failed",
    "compliance.flagged", "key.rotated",
];

/// POST /v1/webhooks
pub async fn create_webhook(
    api_key: ApiKeyContext,
    State(state): State<SharedState>,
    Json(req): Json<CreateWebhookRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if req.url.is_empty() {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "url is required" }))));
    }
    if req.events.is_empty() {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "at least one event is required" }))));
    }
    for event in &req.events {
        if !VALID_EVENTS.contains(&event.as_str()) {
            return Err((StatusCode::BAD_REQUEST, Json(json!({
                "error": format!("unknown event: {}", event),
                "valid_events": VALID_EVENTS
            }))));
        }
    }
    let webhook = Webhook::new(api_key.org_id.clone(), req.url, req.events);
    let response = json!({
        "id": webhook.id, "org_id": webhook.org_id,
        "url": webhook.url, "events": webhook.events,
        "secret": webhook.secret,     // signing secret — shown once
        "active": webhook.active, "created_at": webhook.created_at,
        "warning": "Store the signing secret — it will not be shown again."
    });
    state.lock().await.webhooks.push(webhook);
    Ok(Json(response))
}

/// GET /v1/webhooks
pub async fn list_webhooks(
    api_key: ApiKeyContext,
    State(state): State<SharedState>,
) -> Json<Value> {
    let st = state.lock().await;
    let hooks: Vec<Value> = st.webhooks.iter()
        .filter(|w| w.org_id == api_key.org_id)
        .map(|w| json!({
            "id": w.id, "url": w.url, "events": w.events,
            "active": w.active, "created_at": w.created_at,
            "last_triggered_at": w.last_triggered_at,
            // secret intentionally omitted after creation
        }))
        .collect();
    let total = hooks.len();
    Json(json!({ "webhooks": hooks, "total": total }))
}

/// DELETE /v1/webhooks/:id
pub async fn delete_webhook(
    api_key: ApiKeyContext,
    State(state): State<SharedState>,
    Path(webhook_id): Path<String>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let mut st = state.lock().await;
    let idx = st.webhooks.iter().position(|w| w.id == webhook_id)
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(json!({ "error": "webhook not found" }))))?;
    if st.webhooks[idx].org_id != api_key.org_id {
        return Err((StatusCode::FORBIDDEN, Json(json!({ "error": "webhook belongs to a different org" }))));
    }
    st.webhooks.remove(idx);
    Ok(Json(json!({ "deleted": true, "id": webhook_id })))
}
