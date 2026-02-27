# Paynexus

**Compliance-first AI-native payment processor and Merchant of Record built for the AI era.**

Paynexus gives AI agents a programmatic payments API with built-in GNN-powered risk scanning,
global tax abstraction, and native MCP integration — so agents can create checkout sessions,
manage API keys, and run compliance checks without a human in the loop.

---

## What Paynexus Does

### Payment Processing
- Agents or developers call `POST /api/checkout/create` with an amount and currency
- Paynexus returns a checkout session with a URL, client secret, and full fee breakdown
- Sessions are confirmed via `POST /api/checkout/confirm` with a payment method token
- Every confirmation produces a `Transaction` record with net amount, fees, and compliance data

### Merchant of Record (MoR)
- Paynexus absorbs all tax liability across 180+ jurisdictions
- The `MorEngine` determines the correct tax type (VAT, GST, Sales Tax) for each country
- Processing fees (2.9% + 30¢) and platform fees (0.5%) are calculated automatically
- Net amount is returned with every session so developers know exactly what they receive

### GNN Compliance Engine
- Every transaction is scanned by a GraphSAGE model trained on the IBM AML dataset
- The model outputs five risk scores: AML, Fraud, PCI, Sanctions, and Tax Nexus
- A weighted overall risk score determines the risk level: **LOW / MEDIUM / HIGH / CRITICAL**
- Flagged patterns (structuring, velocity anomalies) are surfaced in plain text
- Model: 3-layer GraphSAGE · 256→128→64 · Multi-task BCE · AUC 0.94

### MCP Integration
- The companion `paynexus-mcp` server exposes three tools to any MCP-compatible AI agent
- Claude Code, Cursor, and other MCP clients can call Paynexus directly without HTTP setup
- See [`../paynexus-mcp/README.md`](../paynexus-mcp/README.md) for the full integration guide

---

## Project Structure

```
Paynexus/
├── Makefile          ← start everything from here
├── frontend/         ← Next.js 14 marketing site + dashboard
│   ├── app/
│   │   ├── page.tsx              orchestrates all sections
│   │   ├── layout.tsx
│   │   ├── globals.css           keyframes, brand tokens
│   │   └── components/
│   │       ├── BootSequence.tsx  cursor → scanline → terminal → fade
│   │       ├── HeroSection.tsx   per-word scramble animation
│   │       ├── LiveTerminal.tsx  looping payment CLI demo
│   │       ├── ComplianceRiskDashboard.tsx  GNN risk bars + world map
│   │       ├── CursorTrail.tsx   canvas-based purple particle trail
│   │       ├── ProblemSection.tsx
│   │       ├── FeaturesSection.tsx  bento grid + electric arc
│   │       ├── HowItWorks.tsx    SVG pipeline draw animation
│   │       ├── CTASection.tsx
│   │       └── Navbar.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
└── backend/          ← Rust/Axum REST API
    ├── Cargo.toml
    └── src/
        ├── main.rs           router, CORS, shared state
        ├── models.rs         CheckoutSession, Transaction, ApiKey, ComplianceReport
        ├── payment_engine.rs create_session, confirm_session, scan_compliance
        ├── mor_engine.rs     calculate_fees, determine_tax_nexus
        ├── compliance.rs     GraphSAGE GNN mock (IBM AML dataset)
        └── handlers.rs       HTTP route handlers
```

---

## How to Start

> Run all commands from the `Paynexus/` directory.

### Start everything (recommended)
```bash
make dev
```
This installs dependencies, then starts the backend and frontend in parallel.

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |

Press `Ctrl+C` to stop both.

### Start services individually
```bash
make backend    # Rust API only  → :3001
make frontend   # Next.js only   → :3000
```

### Other commands
```bash
make install    # npm install + cargo fetch
make build      # production build (Next.js + Rust --release)
make check      # tsc --noEmit + cargo check
make clean      # remove .next, node_modules, cargo artifacts
```

---

## API Reference

All endpoints are served by the Rust backend on port `3001`.

### `POST /api/checkout/create`
Create a payment session.
```json
{ "amount": 4900, "currency": "usd", "country": "US" }
```
Returns: session ID, checkout URL, fee breakdown, tax nexus info.

### `POST /api/checkout/confirm`
Confirm a session and produce a transaction.
```json
{ "session_id": "cs_live_...", "payment_method": { "type": "card", "token": "tok_..." } }
```
Returns: transaction ID, net amount, compliance report.

### `GET /api/compliance-scan`
Run a standalone GNN compliance scan. No body required.
Returns: all five risk scores, risk level, flagged patterns, model metadata.

### `GET /api/transactions`
List all recorded transactions.

### `POST /api/keys/create`
Generate a scoped API key.
```json
{ "tag": "billing" }
```
Returns: `sk_live_*` key with scopes.

### `GET /api/health`
Health check. Returns engine status for payment, MoR, and compliance.

---

## paynexus-mcp

The `paynexus-mcp` package (in `../paynexus-mcp/`) is a Model Context Protocol server that
wraps the Paynexus API so AI agents can call it natively.

**What it exposes:**

| Tool | Description |
|------|-------------|
| `createCheckoutSession` | Create a payment session from natural language or agent intent |
| `createApiKey` | Self-provision a scoped API key |
| `complianceScan` | Run GNN risk analysis before charging |

**Quick setup in Claude Code:**
```json
{
  "mcpServers": {
    "paynexus": {
      "command": "node",
      "args": ["/path/to/paynexus-mcp/dist/index.js"],
      "env": { "PAYNEXUS_BACKEND_URL": "http://localhost:3001" }
    }
  }
}
```

See [`../paynexus-mcp/README.md`](../paynexus-mcp/README.md) for the full guide.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Rust, Axum, Tokio |
| Animations | Pure CSS keyframes + `requestAnimationFrame` — no animation libraries |
| Compliance | GraphSAGE GNN (mocked), IBM AML Dataset |
| AI Integration | Model Context Protocol (MCP) |
