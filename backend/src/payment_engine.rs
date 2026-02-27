use crate::compliance::ComplianceEngine;
use crate::models::{CheckoutSession, ComplianceReport, PaymentMethod, Transaction};
use crate::mor_engine::MorEngine;

pub struct PaymentEngine {
    mor: MorEngine,
    compliance: ComplianceEngine,
}

impl PaymentEngine {
    pub fn new() -> Self {
        Self {
            mor: MorEngine::new(),
            compliance: ComplianceEngine::new(),
        }
    }

    pub fn create_session(
        &self,
        amount: u64,
        currency: String,
        country: Option<&str>,
    ) -> CheckoutSession {
        let fees = self.mor.calculate_fees(amount, &currency);
        let tax_nexus = self.mor.determine_tax_nexus(country.unwrap_or("US"));
        CheckoutSession::new(amount, currency, fees, tax_nexus)
    }

    pub fn confirm_session(
        &self,
        session: &CheckoutSession,
        _payment_method: &PaymentMethod,
    ) -> Transaction {
        let compliance = self.compliance.run_gnn_scan();
        let net_amount = session.fees.net_amount;
        Transaction::new(
            session.id.clone(),
            session.amount,
            net_amount,
            session.currency.clone(),
            session.fees.clone(),
            compliance,
        )
    }

    /// Run a standalone compliance scan without a payment session.
    pub fn scan_compliance(&self) -> ComplianceReport {
        self.compliance.run_gnn_scan()
    }

    pub fn validate_payment_method(&self, token: &str) -> bool {
        !token.is_empty() && token.len() > 4
    }
}

impl Default for PaymentEngine {
    fn default() -> Self {
        Self::new()
    }
}
