-- ============================================================
--  Paynexus — Migration 001: Schema Init
--  Run against: Supabase Postgres
--  Auth source of truth: auth.users (Supabase managed)
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid(), crypt()

-- ── organizations ─────────────────────────────────────────────────────────────
create table public.organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  owner_user_id   uuid not null references auth.users(id) on delete restrict,
  created_at      timestamptz not null default now()
);

comment on table public.organizations is
  'Top-level billing entity. One user may own multiple orgs.';

create index organizations_owner_user_id_idx on public.organizations(owner_user_id);

-- ── organization_members ──────────────────────────────────────────────────────
create table public.organization_members (
  org_id      uuid not null references public.organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'developer'
                constraint organization_members_role_check
                check (role in ('owner', 'admin', 'developer', 'viewer')),
  created_at  timestamptz not null default now(),
  primary key (org_id, user_id)
);

comment on table public.organization_members is
  'Maps Supabase users to organizations with a role.';

create index organization_members_user_id_idx on public.organization_members(user_id);

-- ── api_keys ──────────────────────────────────────────────────────────────────
create table public.api_keys (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references public.organizations(id) on delete cascade,
  tag                   text,
  key_prefix            text not null,          -- e.g. "sk_live_Kx9m"
  key_hash              text not null,          -- bcrypt hash of the full key
  environment           text not null default 'sandbox'
                          constraint api_keys_environment_check
                          check (environment in ('sandbox', 'production')),
  rate_limit_per_minute int not null default 60,
  is_test_key           boolean not null default true,
  created_at            timestamptz not null default now(),
  last_used_at          timestamptz,
  revoked_at            timestamptz
);

comment on table public.api_keys is
  'Scoped API credentials. Raw key shown once at creation; only hash stored.';

create index api_keys_org_id_idx        on public.api_keys(org_id);
create index api_keys_key_prefix_idx    on public.api_keys(key_prefix);
create index api_keys_revoked_at_idx    on public.api_keys(revoked_at) where revoked_at is null;

-- ── checkout_sessions ─────────────────────────────────────────────────────────
create table public.checkout_sessions (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.organizations(id),
  api_key_id          uuid references public.api_keys(id),
  environment         text not null default 'sandbox'
                        constraint checkout_sessions_environment_check
                        check (environment in ('sandbox', 'production')),
  amount_cents        int not null check (amount_cents > 0),
  currency            text not null default 'usd',
  status              text not null default 'created'
                        constraint checkout_sessions_status_check
                        check (status in ('created', 'confirmed', 'failed', 'expired')),
  compliance_overall  numeric(4, 2),
  hosted_url          text,
  created_at          timestamptz not null default now(),
  confirmed_at        timestamptz
);

comment on table public.checkout_sessions is
  'Represents a single payment intent created by the Paynexus API.';

create index checkout_sessions_org_id_idx     on public.checkout_sessions(org_id);
create index checkout_sessions_status_idx     on public.checkout_sessions(status);
create index checkout_sessions_created_at_idx on public.checkout_sessions(created_at desc);

-- ── transactions ──────────────────────────────────────────────────────────────
create table public.transactions (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references public.organizations(id),
  checkout_session_id   uuid references public.checkout_sessions(id),
  external_reference_id text,
  amount_cents          int,
  fees_cents            int not null default 0,
  tax_cents             int not null default 0,
  net_cents             int not null default 0,
  status                text not null default 'succeeded'
                          constraint transactions_status_check
                          check (status in ('succeeded', 'failed', 'refunded')),
  created_at            timestamptz not null default now()
);

comment on table public.transactions is
  'Settled payment records linked to a checkout session.';

create index transactions_org_id_idx              on public.transactions(org_id);
create index transactions_checkout_session_id_idx on public.transactions(checkout_session_id);
create index transactions_status_idx              on public.transactions(status);
create index transactions_created_at_idx          on public.transactions(created_at desc);

-- ── compliance_scans ──────────────────────────────────────────────────────────
create table public.compliance_scans (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id),
  transaction_id  uuid references public.transactions(id),
  aml_risk        numeric(4, 2) not null,
  fraud_risk      numeric(4, 2) not null,
  pci_risk        numeric(4, 2) not null,
  sanctions_risk  numeric(4, 2) not null,
  tax_nexus_risk  numeric(4, 2) not null,
  overall_risk    numeric(4, 2) not null,
  risk_level      text not null
                    constraint compliance_scans_risk_level_check
                    check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  model_name      text not null default 'GraphSAGE',
  model_meta      jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

comment on table public.compliance_scans is
  'GNN inference results stored per transaction. model_meta holds layer config and AUC.';

create index compliance_scans_org_id_idx         on public.compliance_scans(org_id);
create index compliance_scans_transaction_id_idx on public.compliance_scans(transaction_id);
create index compliance_scans_risk_level_idx     on public.compliance_scans(risk_level);
create index compliance_scans_created_at_idx     on public.compliance_scans(created_at desc);
