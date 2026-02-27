use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ─── Environment ──────────────────────────────────────────────────────────────

/// Determines which data a key can access.
/// Sandbox keys → sandbox sessions/transactions only.
/// Production keys → production sessions/transactions only.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum KeyEnvironment {
    Sandbox,
    Production,
}

impl KeyEnvironment {
    pub fn key_prefix(&self) -> &'static str {
        match self {
            KeyEnvironment::Sandbox => "pnx_sbx_",
            KeyEnvironment::Production => "pnx_prd_",
        }
    }

    pub fn from_prefix(raw: &str) -> Option<Self> {
        if raw.starts_with("pnx_sbx_") {
            Some(KeyEnvironment::Sandbox)
        } else if raw.starts_with("pnx_prd_") {
            Some(KeyEnvironment::Production)
        } else {
            None
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            KeyEnvironment::Sandbox => "sandbox",
            KeyEnvironment::Production => "production",
        }
    }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionStatus {
    Pending,
    Confirmed,
    Cancelled,
    Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckoutSession {
    pub id: String,
    pub org_id: Option<String>,
    pub env: Option<KeyEnvironment>,
    pub amount: u64,
    pub currency: String,
    pub status: SessionStatus,
    pub checkout_url: String,
    pub client_secret: String,
    pub fees: FeeSummary,
    pub tax_nexus: TaxNexus,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl CheckoutSession {
    pub fn new(amount: u64, currency: String, fees: FeeSummary, tax_nexus: TaxNexus) -> Self {
        let id = format!("cs_live_{}", &Uuid::new_v4().to_string().replace('-', "")[..12]);
        let client_secret = format!("cs_secret_{}", &Uuid::new_v4().to_string().replace('-', "")[..20]);
        let checkout_url = format!("https://checkout.paynexus.ai/pay/{}", &id);
        let now = Utc::now();
        Self {
            id,
            org_id: None,
            env: None,
            amount,
            currency,
            status: SessionStatus::Pending,
            checkout_url,
            client_secret,
            fees,
            tax_nexus,
            created_at: now,
            expires_at: now + chrono::Duration::hours(24),
        }
    }

    pub fn with_org(mut self, org_id: String, env: KeyEnvironment) -> Self {
        self.org_id = Some(org_id);
        self.env = Some(env);
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCheckoutRequest {
    pub amount: u64,
    pub currency: String,
    #[serde(default)]
    pub metadata: Option<serde_json::Value>,
    pub country: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfirmCheckoutRequest {
    pub session_id: String,
    pub payment_method: PaymentMethod,
}

// ─── Payment ──────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentMethodType {
    Card,
    BankTransfer,
    Crypto,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentMethod {
    #[serde(rename = "type")]
    pub method_type: PaymentMethodType,
    pub token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TransactionStatus {
    Processing,
    Succeeded,
    Failed,
    Refunded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub session_id: String,
    pub org_id: Option<String>,
    pub env: Option<KeyEnvironment>,
    pub amount: u64,
    pub net_amount: u64,
    pub currency: String,
    pub status: TransactionStatus,
    pub fees: FeeSummary,
    pub compliance: ComplianceReport,
    pub created_at: DateTime<Utc>,
}

impl Transaction {
    pub fn new(
        session_id: String,
        amount: u64,
        net_amount: u64,
        currency: String,
        fees: FeeSummary,
        compliance: ComplianceReport,
    ) -> Self {
        let id = format!("txn_live_{}", &Uuid::new_v4().to_string().replace('-', "")[..12]);
        Self {
            id,
            session_id,
            org_id: None,
            env: None,
            amount,
            net_amount,
            currency,
            status: TransactionStatus::Succeeded,
            fees,
            compliance,
            created_at: Utc::now(),
        }
    }

    pub fn with_org(mut self, org_id: String, env: KeyEnvironment) -> Self {
        self.org_id = Some(org_id);
        self.env = Some(env);
        self
    }
}

// ─── MOR / Fees ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeSummary {
    pub processing_fee: u64,
    pub platform_fee: u64,
    pub tax_amount: u64,
    pub total_fees: u64,
    pub net_amount: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaxNexusType {
    None,
    SalesTax,
    Vat,
    Gst,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxNexus {
    pub nexus_type: TaxNexusType,
    pub jurisdiction: String,
    pub rate: f64,
    pub mor_liability: bool,
}

// ─── Compliance ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub aml_risk: f64,
    pub fraud_risk: f64,
    pub pci_risk: f64,
    pub sanctions_risk: f64,
    pub tax_nexus_risk: f64,
    pub overall_risk: f64,
    pub risk_level: RiskLevel,
    pub high_risk_countries: Vec<String>,
    pub high_risk_states: Vec<String>,
    pub flagged_patterns: Vec<String>,
    pub model_version: String,
    pub inference_ms: u32,
    pub auc_score: f64,
}

// ─── API Keys (v1) ────────────────────────────────────────────────────────────

/// Internal key record — key_hash is never exposed via API.
#[derive(Debug, Clone)]
pub struct ApiKeyRecord {
    pub id: String,
    pub org_id: String,
    pub key_hash: String,         // SHA-256(raw_key) — used for comparison
    pub key_display: String,      // pnx_sbx_****...****6f2a — safe to show
    pub env: KeyEnvironment,
    pub tag: String,
    pub scopes: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub last_used: Option<DateTime<Utc>>,
    pub revoked_at: Option<DateTime<Utc>>,
}

/// Returned at key creation and rotation — raw_key shown exactly once.
#[derive(Debug, Clone, Serialize)]
pub struct ApiKeyCreated {
    pub id: String,
    pub raw_key: String,       // pnx_sbx_... — store this, never shown again
    pub key_display: String,   // pnx_sbx_****...****6f2a
    pub org_id: String,
    pub env: KeyEnvironment,
    pub tag: String,
    pub scopes: Vec<String>,
    pub created_at: DateTime<Utc>,
}

/// Legacy display struct (kept for old /api/keys/create endpoint).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKey {
    pub id: String,
    pub key: String,
    pub tag: String,
    pub created_at: DateTime<Utc>,
    pub last_used: Option<DateTime<Utc>>,
    pub scopes: Vec<String>,
}

impl ApiKey {
    pub fn new(tag: String) -> Self {
        let suffix = &Uuid::new_v4().to_string().replace('-', "")[..12];
        Self {
            id: format!("key_{}", &Uuid::new_v4().to_string().replace('-', "")[..8]),
            key: format!("sk_live_•••••••••••••{}", &suffix[..4]),
            tag,
            created_at: Utc::now(),
            last_used: None,
            scopes: vec![
                "checkout:create".to_string(),
                "checkout:confirm".to_string(),
                "compliance:read".to_string(),
            ],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateApiKeyRequest {
    pub tag: String,
    pub scopes: Option<Vec<String>>,
}

/// v1 key creation request — org and env required.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateApiKeyV1Request {
    pub org_id: String,
    pub tag: String,
    pub env: KeyEnvironment,
    pub scopes: Option<Vec<String>>,
}

/// Key rotation — current key is in the Authorization header.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RotateApiKeyRequest {
    pub tag: Option<String>, // optional new tag; keeps existing if omitted
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Webhook {
    pub id: String,
    pub org_id: String,
    pub url: String,
    pub events: Vec<String>,
    /// HMAC-SHA256 signing secret — show once at creation.
    pub secret: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub last_triggered_at: Option<DateTime<Utc>>,
}

impl Webhook {
    pub fn new(org_id: String, url: String, events: Vec<String>) -> Self {
        let rand = Uuid::new_v4().to_string().replace('-', "")
            + &Uuid::new_v4().to_string().replace('-', "");
        let secret = format!("whsec_{}", rand);
        Self {
            id: format!("wh_{}", &Uuid::new_v4().to_string().replace('-', "")[..12]),
            org_id,
            url,
            events,
            secret,
            active: true,
            created_at: Utc::now(),
            last_triggered_at: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWebhookRequest {
    pub url: String,
    pub events: Vec<String>,
}
