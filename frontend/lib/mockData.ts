// ─── Types ────────────────────────────────────────────────────────────────────
export type TxStatus = "succeeded" | "pending" | "failed" | "refunded";
export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface Transaction {
    id: string;
    type: string;
    amount: string;
    currency: string;
    status: TxStatus;
    time: string;
    fullDate: string;
    customer: string;
    country: string;
    fee: string;
    paymentMethod: string;
    riskScore: number;
    description: string;
}

export interface ComplianceItem {
    id: string;
    category: string;
    name: string;
    status: "Compliant" | "Needs Review" | "Missing";
    detail: string;
    lastChecked: string;
}

export interface RiskFactor {
    id: string;
    name: string;
    description: string;
    severity: Severity;
    score: number;
    trend: "up" | "down" | "stable";
    suggestedAction: string;
    affectedCountries?: string[];
}

export interface MorSummary {
    activeRegions: number;
    vatStatus: string;
    nextPayout: string;
    openDisputes: number;
}

export interface NexusTrigger {
    id: string;
    jurisdiction: string;
    threshold: string;
    current: string;
    progress: number;
    status: "Approaching" | "Triggered" | "Safe";
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export const TRANSACTIONS: Transaction[] = [
    {
        id: "txn_001",
        type: "Checkout Payment",
        amount: "$249.99",
        currency: "USD",
        status: "succeeded",
        time: "2 min ago",
        fullDate: "Feb 27, 2026 · 18:41 EST",
        customer: "Acme Corp",
        country: "United States",
        fee: "$7.25",
        paymentMethod: "Visa •••• 4242",
        riskScore: 4,
        description: "API subscription — monthly billing cycle",
    },
    {
        id: "txn_002",
        type: "Subscription Renewal",
        amount: "€89.00",
        currency: "EUR",
        status: "succeeded",
        time: "18 min ago",
        fullDate: "Feb 27, 2026 · 18:25 EST",
        customer: "Globex GmbH",
        country: "Germany",
        fee: "€2.81",
        paymentMethod: "Mastercard •••• 9876",
        riskScore: 6,
        description: "Pro plan — 3 seats",
    },
    {
        id: "txn_003",
        type: "Refund Issued",
        amount: "$34.50",
        currency: "USD",
        status: "pending",
        time: "1 hour ago",
        fullDate: "Feb 27, 2026 · 17:41 EST",
        customer: "Pied Piper Inc",
        country: "United States",
        fee: "$0.00",
        paymentMethod: "Visa •••• 1337",
        riskScore: 18,
        description: "Customer-requested refund for overpayment",
    },
    {
        id: "txn_004",
        type: "Checkout Payment",
        amount: "£149.00",
        currency: "GBP",
        status: "succeeded",
        time: "3 hours ago",
        fullDate: "Feb 27, 2026 · 15:41 EST",
        customer: "Hooli Ltd",
        country: "United Kingdom",
        fee: "£4.81",
        paymentMethod: "Amex •••• 0005",
        riskScore: 9,
        description: "One-time developer seat purchase",
    },
    {
        id: "txn_005",
        type: "API Charge",
        amount: "$12.00",
        currency: "USD",
        status: "succeeded",
        time: "5 hours ago",
        fullDate: "Feb 27, 2026 · 13:41 EST",
        customer: "Initech Systems",
        country: "United States",
        fee: "$0.48",
        paymentMethod: "Visa •••• 7654",
        riskScore: 3,
        description: "7,340 API calls · metered billing",
    },
    {
        id: "txn_006",
        type: "Payout",
        amount: "$3,200.00",
        currency: "USD",
        status: "succeeded",
        time: "Yesterday",
        fullDate: "Feb 26, 2026 · 12:00 EST",
        customer: "Internal Treasury",
        country: "United States",
        fee: "$0.00",
        paymentMethod: "ACH Transfer",
        riskScore: 2,
        description: "Weekly settlement to primary bank account",
    },
    {
        id: "txn_007",
        type: "Checkout Payment",
        amount: "¥18,000",
        currency: "JPY",
        status: "failed",
        time: "2 days ago",
        fullDate: "Feb 25, 2026 · 09:13 EST",
        customer: "Nakatomi Corp",
        country: "Japan",
        fee: "$0.00",
        paymentMethod: "JCB •••• 3310",
        riskScore: 62,
        description: "Payment declined — card velocity limit exceeded",
    },
    {
        id: "txn_008",
        type: "Subscription Renewal",
        amount: "$499.00",
        currency: "USD",
        status: "refunded",
        time: "3 days ago",
        fullDate: "Feb 24, 2026 · 14:30 EST",
        customer: "Umbrella Corp",
        country: "United States",
        fee: "$0.00",
        paymentMethod: "Mastercard •••• 5555",
        riskScore: 45,
        description: "Refunded due to billing error",
    },
];

// ─── Compliance ───────────────────────────────────────────────────────────────
export const COMPLIANCE_ITEMS: ComplianceItem[] = [
    { id: "c1", category: "Tax", name: "VAT Registration (EU)", status: "Compliant", detail: "VAT registered in DE, FR, NL, ES. OSS filing active.", lastChecked: "Feb 27, 2026" },
    { id: "c2", category: "Tax", name: "US Sales Tax Nexus", status: "Needs Review", detail: "Nexus detected in CA, TX, NY — pending registration.", lastChecked: "Feb 25, 2026" },
    { id: "c3", category: "AML", name: "KYC Policy", status: "Compliant", detail: "Full KYC verified for all orgs above $10k monthly volume.", lastChecked: "Feb 27, 2026" },
    { id: "c4", category: "AML", name: "AML Monitoring", status: "Needs Review", detail: "3 transactions flagged for manual review in the last 30 days.", lastChecked: "Feb 27, 2026" },
    { id: "c5", category: "AML", name: "Sanctions Screening", status: "Compliant", detail: "OFAC/SDN list screening runs on every transaction.", lastChecked: "Feb 27, 2026" },
    { id: "c6", category: "Data", name: "GDPR Compliance", status: "Compliant", detail: "DPA signed with all sub-processors. Right-to-erasure implemented.", lastChecked: "Feb 20, 2026" },
    { id: "c7", category: "Data", name: "Data Retention Policy", status: "Missing", detail: "Retention schedule not formally documented. Action required.", lastChecked: "Jan 10, 2026" },
    { id: "c8", category: "Security", name: "PCI DSS Posture", status: "Compliant", detail: "SAQ-D completed. No cardholder data stored on our systems.", lastChecked: "Feb 15, 2026" },
    { id: "c9", category: "Security", name: "SOC 2 Type II", status: "Needs Review", detail: "Audit in progress. Results expected Mar 2026.", lastChecked: "Feb 10, 2026" },
    { id: "c10", category: "Licensing", name: "MOR License (US)", status: "Compliant", detail: "Licensed as Merchant of Record in all 50 states.", lastChecked: "Feb 1, 2026" },
];

// ─── Risk Factors ─────────────────────────────────────────────────────────────
export const RISK_FACTORS: RiskFactor[] = [
    {
        id: "r1",
        name: "API Key Abuse",
        description: "Unusual spike in API calls from 3 unknown IP ranges. Volume is 4× baseline.",
        severity: "Critical",
        score: 82,
        trend: "up",
        suggestedAction: "Rotate affected API keys and enable IP allowlist.",
        affectedCountries: ["US", "RO", "UA"],
    },
    {
        id: "r2",
        name: "Chargeback Rate",
        description: "Chargeback rate at 0.82%, approaching Visa's 1% threshold.",
        severity: "High",
        score: 68,
        trend: "up",
        suggestedAction: "Implement 3DS2 on high-risk checkouts and review return policy.",
    },
    {
        id: "r3",
        name: "Sanctions Adjacency",
        description: "2 transactions routed through IPs near sanctioned territories.",
        severity: "High",
        score: 71,
        trend: "stable",
        suggestedAction: "Geo-block suspicious IP ranges, file SAR if unresolved.",
        affectedCountries: ["IR", "KP"],
    },
    {
        id: "r4",
        name: "Tax Nexus Exposure",
        description: "Economic nexus triggered in CA, TX, NY due to revenue thresholds.",
        severity: "Medium",
        score: 44,
        trend: "up",
        suggestedAction: "Register for sales tax in nexus states within 30 days.",
        affectedCountries: ["US"],
    },
    {
        id: "r5",
        name: "Unusual Geo Access",
        description: "Dashboard accessed from 5 new countries this week.",
        severity: "Medium",
        score: 38,
        trend: "down",
        suggestedAction: "Enable MFA enforcement for all team members.",
    },
    {
        id: "r6",
        name: "Rapid User Growth",
        description: "Monthly active org count grew 214% MoM — compliance controls may not scale.",
        severity: "Low",
        score: 22,
        trend: "up",
        suggestedAction: "Review KYC thresholds and onboarding risk tiers.",
    },
];

// ─── MoR Data ────────────────────────────────────────────────────────────────
export const MOR_SUMMARY: Record<string, MorSummary> = {
    sandbox: {
        activeRegions: 12,
        vatStatus: "Active (Test)",
        nextPayout: "$0.00 (Sandbox)",
        openDisputes: 0,
    },
    production: {
        activeRegions: 54,
        vatStatus: "Compliant",
        nextPayout: "$14,250.00 · Mar 5",
        openDisputes: 3,
    },
};

export const MOR_COMPLIANCE_ITEMS: ComplianceItem[] = [
    { id: "mor_c1", category: "Legal", name: "KYC Verification", status: "Compliant", detail: "Identity verification for all account owners and significant controllers (10%+).", lastChecked: "Feb 27, 2026" },
    { id: "mor_c2", category: "Legal", name: "AML Program", status: "Compliant", detail: "Anti-Money Laundering policy and automated transaction monitoring active.", lastChecked: "Feb 27, 2026" },
    { id: "mor_c3", category: "Security", name: "PCI DSS Compliance", status: "Compliant", detail: "Merchant of Record Level 1 PCI certification active.", lastChecked: "Feb 15, 2026" },
    { id: "mor_c4", category: "Legal", name: "Data Retention", status: "Needs Review", detail: "Updated policy for 7-year financial record keeping needs signature.", lastChecked: "Jan 10, 2026" },
    { id: "mor_c5", category: "Policy", name: "Refund Policy", status: "Compliant", detail: "Publicly accessible refund policy meets region-specific mandates.", lastChecked: "Feb 20, 2026" },
    { id: "mor_c6", category: "Policy", name: "Terms of Service", status: "Compliant", detail: "Platform ToS includes required MOR disclosures (e.g. 'Paynexus' as seller).", lastChecked: "Feb 20, 2026" },
    { id: "mor_c7", category: "Risk", name: "Chargeback Protection", status: "Missing", detail: "Enhanced chargeback representment service not enabled.", lastChecked: "Feb 1, 2026" },
];

export const SUPPORTED_COUNTRIES = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands",
    "Sweden", "Norway", "Denmark", "Finland", "Ireland", "Belgium", "Austria", "Switzerland", "Japan",
    "Australia", "Singapore", "New Zealand", "Portugal", "Poland", "Czech Republic", "Greece", "Israel",
    "United Arab Emirates", "Brazil", "Mexico", "India", "South Africa", "South Korea", "Singapore",
    "Malaysia", "Thailand", "Vietnam", "Philippines", "Turkey", "Saudi Arabia", "Argentina", "Chile",
];

export const BLOCKED_COUNTRIES_INITIAL = [
    "North Korea", "Iran", "Syria", "Cuba", "Russia", "Belarus", "Crimea Region",
];

export const NEXUS_TRIGGERS: NexusTrigger[] = [
    { id: "nex_1", jurisdiction: "California, US", threshold: "$500,000", current: "$482,000", progress: 96, status: "Approaching" },
    { id: "nex_2", jurisdiction: "New York, US", threshold: "$100,000", current: "$104,200", progress: 100, status: "Triggered" },
    { id: "nex_3", jurisdiction: "Texas, US", threshold: "$500,000", current: "$120,000", progress: 24, status: "Safe" },
    { id: "nex_4", jurisdiction: "European Union (OSS)", threshold: "€10,000", current: "€14,800", progress: 100, status: "Triggered" },
    { id: "nex_5", jurisdiction: "United Kingdom", threshold: "£85,000", current: "£12,000", progress: 14, status: "Safe" },
];
