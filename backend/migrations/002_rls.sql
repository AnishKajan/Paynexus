-- ============================================================
--  Paynexus — Migration 002: Row-Level Security
--  Must be run AFTER 001_init.sql
-- ============================================================

-- ── Helper function: is_org_member ────────────────────────────────────────────
-- Returns true if the currently authenticated user (auth.uid()) belongs to
-- the given org. Called inside every RLS policy below.
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.org_id   = $1
      and om.user_id  = auth.uid()
  );
$$;

-- ── Helper function: is_org_owner ─────────────────────────────────────────────
-- Returns true if the current user is the org owner. Used for admin policies.
create or replace function public.is_org_owner(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organizations o
    where o.id            = $1
      and o.owner_user_id = auth.uid()
  );
$$;

-- ── Helper function: is_org_admin_or_owner ────────────────────────────────────
create or replace function public.is_org_admin_or_owner(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.org_id  = $1
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin')
  );
$$;

-- ============================================================
--  Enable RLS on all tables
-- ============================================================
alter table public.organizations         enable row level security;
alter table public.organization_members  enable row level security;
alter table public.api_keys              enable row level security;
alter table public.checkout_sessions     enable row level security;
alter table public.transactions          enable row level security;
alter table public.compliance_scans      enable row level security;

-- ============================================================
--  organizations
-- ============================================================

-- Any member of the org can read it.
create policy "org: members can select"
  on public.organizations
  for select
  using ( public.is_org_member(id) );

-- Only the owner can create an org — owner_user_id must equal the caller.
create policy "org: owner can insert"
  on public.organizations
  for insert
  with check ( owner_user_id = auth.uid() );

-- Only the owner can update org metadata (e.g. rename).
create policy "org: owner can update"
  on public.organizations
  for update
  using ( owner_user_id = auth.uid() );

-- Only the owner can delete the org.
create policy "org: owner can delete"
  on public.organizations
  for delete
  using ( owner_user_id = auth.uid() );

-- ============================================================
--  organization_members
-- ============================================================

-- Members can see who else is in their org.
create policy "org_members: members can select"
  on public.organization_members
  for select
  using ( public.is_org_member(org_id) );

-- Only owners/admins can add new members.
create policy "org_members: admin can insert"
  on public.organization_members
  for insert
  with check ( public.is_org_admin_or_owner(org_id) );

-- Only owners/admins can change roles.
create policy "org_members: admin can update"
  on public.organization_members
  for update
  using ( public.is_org_admin_or_owner(org_id) );

-- Owners/admins can remove members. Members can remove themselves.
create policy "org_members: admin or self can delete"
  on public.organization_members
  for delete
  using (
    public.is_org_admin_or_owner(org_id)
    or user_id = auth.uid()
  );

-- ============================================================
--  api_keys
-- ============================================================

-- Any member can list keys (but key_hash is never returned in app queries).
create policy "api_keys: members can select"
  on public.api_keys
  for select
  using ( public.is_org_member(org_id) );

-- Admins/owners can create keys.
create policy "api_keys: admin can insert"
  on public.api_keys
  for insert
  with check ( public.is_org_admin_or_owner(org_id) );

-- Admins/owners can update (revoke, update rate limit, etc.).
create policy "api_keys: admin can update"
  on public.api_keys
  for update
  using ( public.is_org_admin_or_owner(org_id) );

-- Admins/owners can hard-delete a key (prefer soft-delete via revoked_at).
create policy "api_keys: admin can delete"
  on public.api_keys
  for delete
  using ( public.is_org_admin_or_owner(org_id) );

-- ============================================================
--  checkout_sessions
-- ============================================================

create policy "checkout_sessions: members can select"
  on public.checkout_sessions
  for select
  using ( public.is_org_member(org_id) );

create policy "checkout_sessions: members can insert"
  on public.checkout_sessions
  for insert
  with check ( public.is_org_member(org_id) );

-- Only status transitions allowed — no delete.
create policy "checkout_sessions: members can update"
  on public.checkout_sessions
  for update
  using ( public.is_org_member(org_id) );

-- ============================================================
--  transactions
-- ============================================================

create policy "transactions: members can select"
  on public.transactions
  for select
  using ( public.is_org_member(org_id) );

-- Transactions are created by the backend service role, but we allow
-- member insert so the Rust backend (authenticated as the user) can write.
create policy "transactions: members can insert"
  on public.transactions
  for insert
  with check ( public.is_org_member(org_id) );

-- Refund flow needs status update.
create policy "transactions: admin can update"
  on public.transactions
  for update
  using ( public.is_org_admin_or_owner(org_id) );

-- ============================================================
--  compliance_scans
-- ============================================================

create policy "compliance_scans: members can select"
  on public.compliance_scans
  for select
  using ( public.is_org_member(org_id) );

create policy "compliance_scans: members can insert"
  on public.compliance_scans
  for insert
  with check ( public.is_org_member(org_id) );

-- Scan results are immutable — no update or delete policies.

-- ============================================================
--  Seed: auto-enroll org creator as 'owner' member
-- ============================================================
-- When a new organization is inserted, automatically add the owner
-- to organization_members with role 'owner'.
create or replace function public.auto_enroll_org_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.organization_members (org_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner');
  return new;
end;
$$;

create trigger on_organization_created
  after insert on public.organizations
  for each row
  execute function public.auto_enroll_org_owner();
