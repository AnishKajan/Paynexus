# Paynexus — Integration & Deployment Guide

## Table of Contents

1. [Supabase Setup](#1-supabase-setup)
2. [Environment Variables Reference](#2-environment-variables-reference)
3. [Local Development](#3-local-development)
4. [Azure Infrastructure (Bicep)](#4-azure-infrastructure-bicep)
5. [CI/CD — GitHub Actions](#5-cicd--github-actions)
6. [Azure OIDC Setup (one-time)](#6-azure-oidc-setup-one-time)
7. [JWT Verification Details](#7-jwt-verification-details)
8. [RLS & Org Membership Enforcement](#8-rls--org-membership-enforcement)
9. [Auth Flow Diagram](#9-auth-flow-diagram)
10. [Using AuthUser in Handlers](#10-using-authuser-in-handlers)
11. [Supabase-js Client (Frontend)](#11-supabase-js-client-frontend)
12. [File Reference](#12-file-reference)

---

## 1. Supabase Setup

### 1a. Run SQL Migrations

In Supabase Dashboard → **SQL Editor**, run each file in order:

```
migrations/001_init.sql   ← tables, indexes, constraints
migrations/002_rls.sql    ← RLS policies, helper functions, owner trigger
```

Verify in **Table Editor** that these tables exist:
`organizations`, `organization_members`, `api_keys`,
`checkout_sessions`, `transactions`, `compliance_scans`

### 1b. Enable Auth Providers

Supabase Dashboard → **Authentication → Providers**:

| Provider | Config |
|----------|--------|
| Email | Enable **Email OTP** (magic link). Disable password sign-in for cleaner UX. |
| Google | Add OAuth client ID + secret from Google Cloud Console. |

---

## 2. Environment Variables Reference

### Backend Container App (Rust)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | `https://<ref>.supabase.co` |
| `SUPABASE_JWT_SECRET` | ✅ | JWT secret from Settings → API → JWT Secret |
| `SUPABASE_JWKS_URL` | ✅ | `https://<ref>.supabase.co/auth/v1/keys` (for RS256 future use) |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anon (public) key |
| `PORT` | ✅ | Set to `8080` by Container Apps automatically |
| `RUST_LOG` | optional | Log level — `info` recommended |
| `PAYNEXUS_ENV` | optional | `sandbox` or `production` |
| `DATABASE_URL` | optional | `postgresql://postgres:<pw>@db.<ref>.supabase.co:5432/postgres` — only needed if backend queries Postgres directly via sqlx |

### Frontend — Vercel Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_API_BASE_URL` | Backend Container App URL (from Bicep output `apiUrl`) |
| `NEXT_PUBLIC_DOCS_URL` | `https://paynexus-docs.vercel.app/` |
| `NEXT_PUBLIC_DEFAULT_ENV` | `sandbox` |

Set in: Vercel Dashboard → Project → Settings → Environment Variables.

### Local Development (`.env` files)

**`backend/.env`**
```env
SUPABASE_JWT_SECRET=<jwt-secret>
SUPABASE_PROJECT_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_JWKS_URL=https://<ref>.supabase.co/auth/v1/keys
PAYNEXUS_ENV=sandbox
PORT=3001
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_DOCS_URL=https://paynexus-docs.vercel.app/
NEXT_PUBLIC_DEFAULT_ENV=sandbox
```

---

## 3. Local Development

```bash
# From repo root
make install   # npm install + cargo fetch
make dev       # starts frontend :3000 + backend :3001 concurrently

# Backend only
cd backend && cargo run

# Frontend only
cd frontend && npm run dev

# Quick API test
curl -s localhost:3001/api/health | jq .
curl -s localhost:3001/api/compliance-scan | jq .
curl -X POST localhost:3001/api/checkout/create \
  -H 'Content-Type: application/json' \
  -d '{"amount":4900,"currency":"usd"}' | jq .
```

---

## 4. Azure Infrastructure (Bicep)

### Folder structure

```
infra/
  main.bicep           ← entry point — calls the two modules
  loganalytics.bicep   ← Log Analytics workspace
  containerapps.bicep  ← Container Apps env + both container apps
  params.json          ← production parameter values (fill placeholders)
  params.dev.json      ← dev/sandbox parameter values
```

### Manual deploy (hackathon)

```bash
# Prerequisites: az login, correct subscription selected
az account set --subscription <subscriptionId>

# Deploy to dev
az deployment group create \
  --resource-group Paynexus \
  --template-file infra/main.bicep \
  --parameters @infra/params.dev.json \
  --parameters \
      ghcrToken="$(gh auth token)" \
      supabaseUrl="https://<ref>.supabase.co" \
      supabaseAnonKey="<anon-key>" \
      supabaseJwtSecret="<jwt-secret>" \
      supabaseJwksUrl="https://<ref>.supabase.co/auth/v1/keys"

# Deploy to prod
az deployment group create \
  --resource-group Paynexus \
  --template-file infra/main.bicep \
  --parameters @infra/params.json \
  --parameters \
      ghcrToken="$(gh auth token)" \
      supabaseUrl="..." \
      supabaseAnonKey="..." \
      supabaseJwtSecret="..." \
      supabaseJwksUrl="..."
```

### Get deployed URLs

```bash
az deployment group show \
  --resource-group Paynexus \
  --name main \
  --query "properties.outputs" -o json
```

### What gets provisioned

| Resource | Name | SKU |
|----------|------|-----|
| Log Analytics Workspace | `law-paynexus-prod` | PerGB2018, 30d |
| Container Apps Environment | `cae-paynexus-prod` | Consumption |
| Container App — API | `paynexus-api` | 0.25 vCPU / 0.5 Gi, scale-to-zero |
| Container App — MCP | `paynexus-mcp` | 0.25 vCPU / 0.5 Gi, scale-to-zero |

---

## 5. CI/CD — GitHub Actions

Two separate workflows in `.github/workflows/`:

### `build-and-push-backend.yml`
- **Triggers**: push to `main` (path filter: `backend/**`)
- **What it does**: builds `backend/Dockerfile` with `rust:1.85-slim`, pushes to
  `ghcr.io/anishkajan/paynexus-backend:<sha>` and `:latest`
- **Cache**: GitHub Actions cache (`type=gha`) for fast rebuilds

### `deploy-azure.yml`
- **Triggers**: automatically after `build-and-push-backend` succeeds on `main`,
  or manually via `workflow_dispatch`
- **What it does**:
  1. Azure OIDC login (no client secret stored)
  2. `az deployment group create` — idempotent Bicep deploy
  3. `az containerapp update` — forces new image pull
  4. Health check gate (15 attempts × 10s = ~2.5 min)
- **Manual deploy**: Actions → Deploy to Azure → Run workflow

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Where to find |
|--------|--------------|
| `AZURE_CLIENT_ID` | App registration → Overview → Application (client) ID |
| `AZURE_TENANT_ID` | Azure AD → Overview → Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Subscriptions → your subscription → Subscription ID |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret |
| `SUPABASE_JWKS_URL` | `https://<ref>.supabase.co/auth/v1/keys` |

> `GITHUB_TOKEN` is automatic — no setup needed for GHCR push.

---

## 6. Azure OIDC Setup (one-time)

Run these once to enable passwordless Azure login from GitHub Actions:

```bash
# 1. Create app registration
APP_ID=$(az ad app create --display-name "paynexus-github-oidc" \
  --query appId -o tsv)
echo "Client ID: $APP_ID"

# 2. Create service principal
SP_OBJ_ID=$(az ad sp create --id $APP_ID --query id -o tsv)

# 3. Grant Contributor on the Paynexus resource group
az role assignment create \
  --role "Contributor" \
  --assignee-object-id $SP_OBJ_ID \
  --assignee-principal-type ServicePrincipal \
  --scope "/subscriptions/<subscriptionId>/resourceGroups/Paynexus"

# 4. Add federated credential (replace AnishKajan/Paynexus + main)
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:AnishKajan/Paynexus:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# 5. Store in GitHub Secrets
# AZURE_CLIENT_ID  = $APP_ID
# AZURE_TENANT_ID  = $(az account show --query tenantId -o tsv)
# AZURE_SUBSCRIPTION_ID = $(az account show --query id -o tsv)
```

---

## 7. JWT Verification Details

Supabase issues **HS256** JWTs signed with the project's JWT secret (symmetric).

The `src/auth.rs` extractor:
1. Reads `Authorization: Bearer <token>` from request headers
2. Calls `jsonwebtoken::decode` with `Algorithm::HS256` and `SUPABASE_JWT_SECRET`
3. Validates `exp` claim automatically (rejects expired tokens)
4. Returns `AuthUser { user_id, email, role }` where `user_id = sub = auth.users.id`

**No JWKS fetch needed** for the current implementation — HS256 is symmetric.
`SUPABASE_JWKS_URL` is included as an env var for forward-compatibility if you
switch to RS256 verification via JWKS in the future.

---

## 8. RLS & Org Membership Enforcement

### How RLS works

All 6 tables have Row-Level Security enabled. Supabase automatically enforces
policies when the user's JWT is passed as the `Authorization` header to PostgREST.

Key helper functions (defined in `migrations/002_rls.sql`):

```sql
is_org_member(org_id uuid)          -- returns true if current user is a member
is_org_owner(org_id uuid)           -- returns true if current user is the owner
is_org_admin_or_owner(org_id uuid)  -- returns true if admin or owner
```

### Owner auto-enrollment

`auto_enroll_org_owner` trigger fires `AFTER INSERT` on `organizations`,
automatically inserting the creator into `organization_members` with role `'owner'`.

### Enforcement options

**Option A — Rely on RLS (hackathon default):**
- Pass the user's JWT to Supabase when making any DB call
- RLS silently filters rows the user shouldn't see
- No extra code needed in the Rust backend

**Option B — Explicit backend check (production-grade):**
```rust
// In handlers, after extracting AuthUser:
assert_org_membership(&auth.user_id, &req.org_id).await?;
```
Replace the stub in `src/auth.rs::assert_org_membership` with a real sqlx query:
```sql
SELECT 1 FROM organization_members
WHERE org_id = $1 AND user_id = $2
LIMIT 1
```
Using: `DATABASE_URL=postgresql://postgres:<pw>@db.<ref>.supabase.co:5432/postgres`

---

## 9. Auth Flow Diagram

```
Browser              Next.js              Rust Backend         Supabase Auth
  │                     │                      │                      │
  │── OTP / OAuth ──────►│                      │                      │
  │                     │── signInWithOtp() ──────────────────────────►│
  │◄── session + JWT ───│◄────────────────────────── HS256 JWT ────────│
  │                     │                      │                      │
  │── POST /api/... ────────── Authorization: Bearer <JWT> ───────────►│
  │                     │                      │── verify_jwt() ───────│
  │                     │                      │   extract sub (UUID)  │
  │                     │                      │── handler logic ──────│
  │◄── JSON response ───────────────────────────│                      │
```

---

## 10. Using AuthUser in Handlers

```rust
use crate::auth::AuthUser;
use axum::{extract::State, http::StatusCode, Json};
use serde_json::{json, Value};

pub async fn create_checkout(
    auth: AuthUser,                    // ← JWT verified automatically
    State(state): State<SharedState>,
    Json(req): Json<CreateCheckoutRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    // auth.user_id = Supabase auth.users.id (UUID string)
    // auth.email   = user's email address
    // auth.role    = "authenticated" for signed-in users

    // Optional: enforce org membership before proceeding
    crate::auth::assert_org_membership(&auth.user_id, &req.org_id).await?;

    let mut st = state.lock().await;
    let session = st.engine.create_session(req.amount, &req.currency, &auth.user_id);
    Ok(Json(json!({ "session": session })))
}
```

---

## 11. Supabase-js Client (Frontend)

```typescript
import {
  supabase,
  getAccessToken,
  getUserOrganizations,
} from "@/lib/supabaseClient";

// Sign in with email OTP
await supabase.auth.signInWithOtp({ email: "user@example.com" });

// Get JWT to send to Rust backend
const token = await getAccessToken();
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

const res = await fetch(`${apiBase}/api/checkout/create`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 4900, currency: "usd" }),
});

// Query Postgres directly (RLS applied automatically)
const orgs = await getUserOrganizations();
```

---

## 12. File Reference

| File | Purpose |
|------|---------|
| `migrations/001_init.sql` | All tables, constraints, indexes |
| `migrations/002_rls.sql` | RLS policies, `is_org_member` helper, owner trigger |
| `src/auth.rs` | JWT extractor, `AuthUser` type, org membership stub |
| `src/main.rs` | Router setup, reads `PORT` from env |
| `../frontend/lib/supabaseClient.ts` | Typed Supabase JS client + query helpers |
| `Dockerfile` | Two-stage Rust build (`rust:1.85-slim` → `debian:bookworm-slim`) |
| `../infra/main.bicep` | Bicep entry point |
| `../infra/containerapps.bicep` | Container Apps environment + app definitions |
| `../infra/loganalytics.bicep` | Log Analytics workspace |
| `../infra/params.json` | Production deployment parameters |
| `../infra/params.dev.json` | Dev/sandbox deployment parameters |
| `../.github/workflows/build-and-push-backend.yml` | Build + push backend image to GHCR |
| `../.github/workflows/deploy-azure.yml` | Deploy Bicep + update Container App |
| `.env.example` | Environment variable template |
