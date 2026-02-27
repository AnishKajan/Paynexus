use crate::models::{FeeSummary, TaxNexus, TaxNexusType};

/// Merchant of Record engine.
/// Handles tax nexus determination, fee calculation, and net amount computation.
pub struct MorEngine {
    processing_rate: f64,
    platform_rate: f64,
}

impl MorEngine {
    pub fn new() -> Self {
        Self {
            processing_rate: 0.029, // 2.9%
            platform_rate: 0.005,   // 0.5%
        }
    }

    /// Calculate all fees for a given amount (in cents) and currency.
    pub fn calculate_fees(&self, amount: u64, _currency: &str) -> FeeSummary {
        let processing_fee = (amount as f64 * self.processing_rate).round() as u64 + 30;
        let platform_fee = (amount as f64 * self.platform_rate).round() as u64;
        // Tax will be computed separately after nexus determination
        let tax_amount = 0u64;
        let total_fees = processing_fee + platform_fee + tax_amount;
        let net_amount = amount.saturating_sub(total_fees);
        FeeSummary {
            processing_fee,
            platform_fee,
            tax_amount,
            total_fees,
            net_amount,
        }
    }

    /// Determine tax nexus type and rate based on country/region.
    pub fn determine_tax_nexus(&self, country: &str) -> TaxNexus {
        match country.to_uppercase().as_str() {
            "US" | "USA" => TaxNexus {
                nexus_type: TaxNexusType::SalesTax,
                jurisdiction: "United States".to_string(),
                rate: 0.0875,
                mor_liability: true,
            },
            "GB" | "UK" => TaxNexus {
                nexus_type: TaxNexusType::Vat,
                jurisdiction: "United Kingdom".to_string(),
                rate: 0.20,
                mor_liability: true,
            },
            "DE" | "FR" | "IT" | "ES" | "NL" => TaxNexus {
                nexus_type: TaxNexusType::Vat,
                jurisdiction: "European Union".to_string(),
                rate: 0.21,
                mor_liability: true,
            },
            "AU" | "NZ" => TaxNexus {
                nexus_type: TaxNexusType::Gst,
                jurisdiction: "Australia / NZ".to_string(),
                rate: 0.10,
                mor_liability: true,
            },
            "CA" => TaxNexus {
                nexus_type: TaxNexusType::Gst,
                jurisdiction: "Canada".to_string(),
                rate: 0.05,
                mor_liability: true,
            },
            _ => TaxNexus {
                nexus_type: TaxNexusType::None,
                jurisdiction: country.to_string(),
                rate: 0.0,
                mor_liability: false,
            },
        }
    }

    /// Compute net amount after applying fees and taxes.
    pub fn compute_net_amount(&self, amount: u64, fees: &FeeSummary, tax_nexus: &TaxNexus) -> u64 {
        let tax_amount = (amount as f64 * tax_nexus.rate).round() as u64;
        amount.saturating_sub(fees.processing_fee + fees.platform_fee + tax_amount)
    }
}

impl Default for MorEngine {
    fn default() -> Self {
        Self::new()
    }
}
