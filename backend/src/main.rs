mod compliance;
mod handlers;
mod models;
mod mor_engine;
mod payment_engine;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

use handlers::{
    compliance_scan, confirm_checkout, create_api_key, create_checkout, health,
    list_transactions, AppState, SharedState,
};

#[tokio::main]
async fn main() {
    let state: SharedState = Arc::new(Mutex::new(AppState::new()));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        // Payment endpoints
        .route("/api/checkout/create", post(create_checkout))
        .route("/api/checkout/confirm", post(confirm_checkout))
        // Compliance
        .route("/api/compliance-scan", get(compliance_scan))
        // Transactions
        .route("/api/transactions", get(list_transactions))
        // API keys
        .route("/api/keys/create", post(create_api_key))
        // Health
        .route("/api/health", get(health))
        .layer(cors)
        .with_state(state);

    let addr = "0.0.0.0:3001";
    println!("╔══════════════════════════════════════════╗");
    println!("║        Paynexus Backend v0.1.0           ║");
    println!("╠══════════════════════════════════════════╣");
    println!("║  PaymentEngine    → online               ║");
    println!("║  MorEngine        → online               ║");
    println!("║  ComplianceEngine → online (GraphSAGE)   ║");
    println!("╠══════════════════════════════════════════╣");
    println!("║  Listening on http://{}          ║", addr);
    println!("╚══════════════════════════════════════════╝");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
