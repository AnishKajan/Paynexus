use crate::models::{ComplianceReport, RiskLevel};

/// GNN-powered compliance engine (mocked for demo).
/// Simulates GraphSAGE inference on transaction graphs.
pub struct ComplianceEngine {
    model_version: String,
    auc_score: f64,
}

impl ComplianceEngine {
    pub fn new() -> Self {
        Self {
            model_version: "GraphSAGE-v1.2.0".to_string(),
            auc_score: 0.94,
        }
    }

    /// Run GNN compliance scan — returns realistic demo scores.
    /// In production this would call IBM watsonx inference endpoint.
    pub fn run_gnn_scan(&self) -> ComplianceReport {
        // Deterministic "good" scores for demo — realistic LOW risk profile
        let aml_risk = 0.12_f64;
        let fraud_risk = 0.08_f64;
        let pci_risk = 0.06_f64;
        let sanctions_risk = 0.03_f64;
        let tax_nexus_risk = 0.27_f64;

        // Weighted overall risk
        let overall_risk = aml_risk * 0.35
            + fraud_risk * 0.30
            + pci_risk * 0.10
            + sanctions_risk * 0.15
            + tax_nexus_risk * 0.10;

        let risk_level = Self::classify_risk(overall_risk);

        let flagged_patterns = if tax_nexus_risk > 0.25 {
            vec![
                "Unusual cross-border velocity detected".to_string(),
                "Round-amount structuring pattern in last 48h".to_string(),
            ]
        } else {
            vec![]
        };

        ComplianceReport {
            aml_risk,
            fraud_risk,
            pci_risk,
            sanctions_risk,
            tax_nexus_risk,
            overall_risk,
            risk_level,
            high_risk_countries: vec!["IR".to_string(), "KP".to_string(), "SY".to_string()],
            high_risk_states: vec!["CA".to_string(), "NY".to_string(), "TX".to_string()],
            flagged_patterns,
            model_version: self.model_version.clone(),
            inference_ms: 38,
            auc_score: self.auc_score,
        }
    }

    /// Scan with custom risk parameters (for testing varied scenarios).
    pub fn run_gnn_scan_with_params(
        &self,
        aml_risk: f64,
        fraud_risk: f64,
        sanctions_risk: f64,
    ) -> ComplianceReport {
        let pci_risk = 0.06_f64;
        let tax_nexus_risk = 0.15_f64;
        let overall_risk = aml_risk * 0.35
            + fraud_risk * 0.30
            + pci_risk * 0.10
            + sanctions_risk * 0.15
            + tax_nexus_risk * 0.10;

        let risk_level = Self::classify_risk(overall_risk);

        ComplianceReport {
            aml_risk,
            fraud_risk,
            pci_risk,
            sanctions_risk,
            tax_nexus_risk,
            overall_risk,
            risk_level,
            high_risk_countries: vec!["IR".to_string(), "KP".to_string(), "SY".to_string()],
            high_risk_states: vec!["CA".to_string(), "NY".to_string(), "TX".to_string()],
            flagged_patterns: vec![],
            model_version: self.model_version.clone(),
            inference_ms: 42,
            auc_score: self.auc_score,
        }
    }

    fn classify_risk(score: f64) -> RiskLevel {
        if score < 0.2 {
            RiskLevel::Low
        } else if score < 0.5 {
            RiskLevel::Medium
        } else if score < 0.75 {
            RiskLevel::High
        } else {
            RiskLevel::Critical
        }
    }
}

impl Default for ComplianceEngine {
    fn default() -> Self {
        Self::new()
    }
}
