# Paynexus Backend — Supabase Integration Checklist

## 1. Run SQL Migrations in Supabase

In the Supabase Dashboard → **SQL Editor**, run each file in order:

```
migrations/001_init.sql   ← creates all tables and indexes
migrations/002_rls.sql    ← enables RLS, creates policies and helper functions
```

Verify in **Table Editor** that these tables exist:
- `organizations`
- `organization_members`
- `api_keys`
- `checkout_sessions`
- `transactions`
- `compliance_scans`

---

## 2. Enable Auth Providers

In Supabase Dashboard → **Authentication → Providers**:

| Provider | Config |
|----------|--------|
| Email | Enable "Email OTP" (magic link) — disable password sign-in for cleaner UX |
| Google | Add OAuth client ID + secret from Google Cloud Console |

---

## 3. Set Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Find these in: Supabase Dashboard → **Settings → API**.

### Backend (`backend/.env`)
```env
SUPABASE_JWT_SECRET=<jwt-secret>
SUPABASE_PROJECT_URL=https://<ref>.supabase.co
```

Find JWT secret in: Supabase Dashboard → **Settings → API → JWT Secret**.

---

## 4. How the Auth Flow Works

```
Browser                Next.js                Rust Backend           Supabase
  │                       │                        │                      │
  │── signIn (OTP/OAuth) ─►│                        │                      │
  │                       │── supabase.auth.signIn ─────────────────────►│
  │◄── session + JWT ─────│◄────────────────────────────── JWT (HS256) ───│
  │                       │                        │                      │
  │── POST /api/checkout ─────── Authorization: Bearer <JWT> ──────────►│
  │                       │                        │── verify_jwt() ──────│
  │                       │                        │── extract sub (user_id)
  │                       │                        │── call handler ──────│
  │◄── session response ──────────────────────────│                      │
```

---

## 5. Using `AuthUser` in a Protected Handler

```rust
use crate::auth::AuthUser;
use axum::{extract::State, Json};
use serde_json::{json, Value};

pub async fn create_checkout(
    auth: AuthUser,                  // ← JWT verified, user_id extracted
    State(state): State<SharedState>,
    Json(req): Json<CreateCheckoutRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    // auth.user_id is the Supabase auth.users.id (UUID string)
    // auth.email   is the user's email
    // auth.role    is "authenticated" for signed-in users

    // Enforce org membership:
    assert_org_membership(&auth.user_id, &req.org_id).await?;

    // ... rest of handler
}
```

---

## 6. JWT Verification Details

Supabase issues **HS256** JWTs signed with the project's JWT secret.

The `auth.rs` module:
1. Extracts `Authorization: Bearer <token>` from the request header
2. Calls `jsonwebtoken::decode` with `Algorithm::HS256` and the JWT secret
3. Validates expiry (`exp` claim) automatically
4. Returns `AuthUser { user_id, email, role }` — `user_id` = `sub` claim = `auth.users.id`

**No JWKS fetch needed** — Supabase uses symmetric HS256, not RS256.

---

## 7. Enforce Org Membership in Handlers

Option A — **Rely on RLS** (simplest for demo):
- Pass the user's JWT to Supabase when making database calls
- Supabase enforces `is_org_member(org_id)` automatically
- Any row the user shouldn't see is simply not returned

Option B — **Explicit DB check** (production-grade):
- Replace the stub in `auth::assert_org_membership` with a real query:
```sql
SELECT 1 FROM organization_members
WHERE org_id = $1 AND user_id = $2
```
- Use `sqlx` with the Supabase Postgres connection string:
  `postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres`

---

## 8. Supabase-js Client Usage (Frontend)

```typescript
import { supabase, getAccessToken, getUserOrganizations } from "@/lib/supabaseClient";

// Sign in with OTP
await supabase.auth.signInWithOtp({ email: "user@example.com" });

// Get JWT to send to Rust backend
const token = await getAccessToken();
const response = await fetch("http://localhost:3001/api/checkout/create", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 4900, currency: "usd" }),
});

// Query Postgres directly (RLS applied automatically)
const orgs = await getUserOrganizations();
```

---

## 9. File Reference

| File | Purpose |
|------|---------|
| `migrations/001_init.sql` | Creates all tables with indexes |
| `migrations/002_rls.sql` | RLS policies + helper functions + owner trigger |
| `src/auth.rs` | JWT extractor + `AuthUser` type + org membership guard |
| `../frontend/lib/supabaseClient.ts` | Typed Supabase JS client + query helpers |
| `.env.example` | Environment variable template |
