mod api_key_middleware;
mod auth;
mod compliance;
mod handlers;
mod models;
mod mor_engine;
mod payment_engine;

use axum::{
    routing::{delete, get, post},
    Router,
};
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

use handlers::{
    // Legacy /api/ routes
    compliance_scan, confirm_checkout, create_api_key, create_checkout, health,
    list_transactions,
    // V1 checkout
    create_checkout_v1, confirm_checkout_v1, compliance_scan_v1, list_transactions_v1,
    // V1 key management
    create_api_key_v1, rotate_api_key,
    // V1 webhooks
    create_webhook, delete_webhook, list_webhooks,
    AppState, SharedState,
};

#[tokio::main]
async fn main() {
    let state: SharedState = Arc::new(Mutex::new(AppState::new()));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        // ── Legacy routes (no auth — kept for frontend demo) ──────────────────
        .route("/api/checkout/create", post(create_checkout))
        .route("/api/checkout/confirm", post(confirm_checkout))
        .route("/api/compliance-scan", get(compliance_scan))
        .route("/api/transactions", get(list_transactions))
        .route("/api/keys/create", post(create_api_key))
        .route("/api/health", get(health))
        // ── V1 routes — API key authenticated (MCP clients) ───────────────────
        .route("/v1/checkout/create", post(create_checkout_v1))
        .route("/v1/checkout/confirm", post(confirm_checkout_v1))
        .route("/v1/compliance-scan", get(compliance_scan_v1))
        .route("/v1/transactions", get(list_transactions_v1))
        // V1 key management (create requires JWT; rotate requires current key)
        .route("/v1/api-keys/create", post(create_api_key_v1))
        .route("/v1/api-keys/rotate", post(rotate_api_key))
        // V1 webhooks
        .route("/v1/webhooks", post(create_webhook))
        .route("/v1/webhooks", get(list_webhooks))
        .route("/v1/webhooks/:id", delete(delete_webhook))
        // Health (unauthenticated — used by Container Apps probes)
        .route("/v1/health", get(health))
        .layer(cors)
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{}", port);
    println!("╔══════════════════════════════════════════╗");
    println!("║        Paynexus Backend v0.1.0           ║");
    println!("╠══════════════════════════════════════════╣");
    println!("║  PaymentEngine    → online               ║");
    println!("║  MorEngine        → online               ║");
    println!("║  ComplianceEngine → online (GraphSAGE)   ║");
    println!("║  ApiKeyMiddleware → online               ║");
    println!("╠══════════════════════════════════════════╣");
    println!("║  Listening on http://{}             ║", addr);
    println!("╚══════════════════════════════════════════╝");

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
