use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::models::{
    ApiKey, CheckoutSession, ConfirmCheckoutRequest, CreateApiKeyRequest,
    CreateCheckoutRequest, SessionStatus, Transaction,
};
use crate::payment_engine::PaymentEngine;

// ─── App State ───────────────────────────────────────────────────────────────

pub struct AppState {
    pub engine: PaymentEngine,
    pub sessions: Vec<CheckoutSession>,
    pub transactions: Vec<Transaction>,
    pub api_keys: Vec<ApiKey>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            engine: PaymentEngine::new(),
            sessions: Vec::new(),
            transactions: Vec::new(),
            api_keys: Vec::new(),
        }
    }
}

pub type SharedState = Arc<Mutex<AppState>>;

// ─── Handlers ────────────────────────────────────────────────────────────────

/// POST /api/checkout/create
/// Create a new checkout session.
pub async fn create_checkout(
    State(state): State<SharedState>,
    Json(req): Json<CreateCheckoutRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if req.amount == 0 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "amount must be greater than 0" })),
        ));
    }

    let currency = req.currency.to_lowercase();
    let supported = ["usd", "eur", "gbp", "cad", "aud"];
    if !supported.contains(&currency.as_str()) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": format!("unsupported currency: {}", currency) })),
        ));
    }

    let mut st = state.lock().await;
    let session = st.engine.create_session(
        req.amount,
        currency,
        req.country.as_deref(),
    );

    let response = json!({
        "session_id": session.id,
        "checkout_url": session.checkout_url,
        "client_secret": session.client_secret,
        "amount": session.amount,
        "currency": session.currency,
        "status": session.status,
        "fees": session.fees,
        "tax_nexus": session.tax_nexus,
        "created_at": session.created_at,
        "expires_at": session.expires_at,
    });

    st.sessions.push(session);
    Ok(Json(response))
}

/// POST /api/checkout/confirm
/// Confirm an existing checkout session → creates a Transaction.
pub async fn confirm_checkout(
    State(state): State<SharedState>,
    Json(req): Json<ConfirmCheckoutRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let mut st = state.lock().await;

    // Find the session
    let session_idx = st.sessions.iter().position(|s| s.id == req.session_id);
    let session_idx = match session_idx {
        Some(i) => i,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "session not found" })),
            ))
        }
    };

    // Validate payment method
    if !st.engine.validate_payment_method(&req.payment_method.token) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "invalid payment method token" })),
        ));
    }

    let session = st.sessions[session_idx].clone();

    // Mark session confirmed
    st.sessions[session_idx].status = SessionStatus::Confirmed;

    // Create transaction
    let txn = st.engine.confirm_session(&session, &req.payment_method);

    let response = json!({
        "transaction_id": txn.id,
        "session_id": txn.session_id,
        "status": txn.status,
        "amount": txn.amount,
        "net_amount": txn.net_amount,
        "currency": txn.currency,
        "fees": txn.fees,
        "compliance": txn.compliance,
        "created_at": txn.created_at,
    });

    st.transactions.push(txn);
    Ok(Json(response))
}

/// GET /api/compliance-scan
/// Run a standalone GNN compliance scan.
pub async fn compliance_scan(
    State(state): State<SharedState>,
) -> Json<Value> {
    let st = state.lock().await;
    let report = st.engine.scan_compliance();

    Json(json!({
        "aml_risk": report.aml_risk,
        "fraud_risk": report.fraud_risk,
        "pci_risk": report.pci_risk,
        "sanctions_risk": report.sanctions_risk,
        "tax_nexus_risk": report.tax_nexus_risk,
        "overall_risk": report.overall_risk,
        "risk_level": report.risk_level,
        "high_risk_countries": report.high_risk_countries,
        "high_risk_states": report.high_risk_states,
        "flagged_patterns": report.flagged_patterns,
        "model": {
            "version": report.model_version,
            "auc": report.auc_score,
            "architecture": "GraphSAGE · 3 layers · 256→128→64",
            "training_data": "IBM AML Dataset",
            "inference_ms": report.inference_ms,
        }
    }))
}

/// GET /api/transactions
/// List all recorded transactions.
pub async fn list_transactions(
    State(state): State<SharedState>,
) -> Json<Value> {
    let st = state.lock().await;
    let txns: Vec<Value> = st.transactions.iter().map(|t| {
        json!({
            "id": t.id,
            "session_id": t.session_id,
            "amount": t.amount,
            "net_amount": t.net_amount,
            "currency": t.currency,
            "status": t.status,
            "created_at": t.created_at,
        })
    }).collect();
    let total = txns.len();

    Json(json!({ "transactions": txns, "total": total }))
}

/// POST /api/keys/create
/// Create a new API key.
pub async fn create_api_key(
    State(state): State<SharedState>,
    Json(req): Json<CreateApiKeyRequest>,
) -> Json<Value> {
    let key = ApiKey::new(req.tag);
    let response = json!({
        "id": key.id,
        "key": key.key,
        "tag": key.tag,
        "scopes": key.scopes,
        "created_at": key.created_at,
    });
    let mut st = state.lock().await;
    st.api_keys.push(key);
    Json(response)
}

/// GET /api/health
pub async fn health() -> Json<Value> {
    Json(json!({
        "status": "operational",
        "service": "paynexus-backend",
        "version": "0.1.0",
        "engines": {
            "payment": "online",
            "compliance": "online",
            "mor": "online"
        }
    }))
}
