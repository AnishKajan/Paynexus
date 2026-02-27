-- ============================================================
--  Paynexus — Migration 003: Webhooks table
--  Run in Supabase SQL Editor after 001_init.sql + 002_rls.sql
--
--  Webhooks are org-scoped. HMAC-SHA256 signing secret is stored
--  hashed (never return raw secret after creation).
-- ============================================================

CREATE TABLE IF NOT EXISTS webhooks (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url             text        NOT NULL,
    events          text[]      NOT NULL DEFAULT '{}',
    secret_hash     text        NOT NULL,   -- SHA-256 of raw signing secret
    active          boolean     NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_triggered_at timestamptz,

    CONSTRAINT webhooks_url_not_empty CHECK (url <> ''),
    CONSTRAINT webhooks_events_not_empty CHECK (array_length(events, 1) > 0)
);

CREATE INDEX idx_webhooks_org_id ON webhooks(org_id);
CREATE INDEX idx_webhooks_active ON webhooks(org_id, active) WHERE active = true;

-- ── Row Level Security ─────────────────────────────────────────────────────────

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Members can view their org's webhooks
CREATE POLICY "members can view org webhooks"
    ON webhooks
    FOR SELECT
    USING (is_org_member(org_id));

-- Admins/owners can create, update, delete webhooks
CREATE POLICY "admins can manage org webhooks"
    ON webhooks
    FOR ALL
    USING (is_org_admin_or_owner(org_id));

-- ── Webhook delivery log (optional, for audit trail) ─────────────────────────

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id      uuid        NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    org_id          uuid        NOT NULL,
    event_type      text        NOT NULL,
    payload         jsonb       NOT NULL DEFAULT '{}',
    http_status     int,
    response_body   text,
    delivered_at    timestamptz NOT NULL DEFAULT now(),
    success         boolean     NOT NULL DEFAULT false
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id, delivered_at DESC);
CREATE INDEX idx_webhook_deliveries_org_id ON webhook_deliveries(org_id, delivered_at DESC);

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can view webhook deliveries"
    ON webhook_deliveries
    FOR SELECT
    USING (is_org_member(org_id));
