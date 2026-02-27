import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Environment validation ───────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// ─── Database types (matches 001_init.sql schema) ────────────────────────────

export type OrgRole = "owner" | "admin" | "developer" | "viewer";
export type Environment = "sandbox" | "production";
export type SessionStatus = "created" | "confirmed" | "failed" | "expired";
export type TransactionStatus = "succeeded" | "failed" | "refunded";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Organization {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
}

export interface OrganizationMember {
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface ApiKey {
  id: string;
  org_id: string;
  tag: string | null;
  key_prefix: string;
  environment: Environment;
  rate_limit_per_minute: number;
  is_test_key: boolean;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  // key_hash is never returned to the client
}

export interface CheckoutSession {
  id: string;
  org_id: string;
  api_key_id: string | null;
  environment: Environment;
  amount_cents: number;
  currency: string;
  status: SessionStatus;
  compliance_overall: number | null;
  hosted_url: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface Transaction {
  id: string;
  org_id: string;
  checkout_session_id: string | null;
  external_reference_id: string | null;
  amount_cents: number | null;
  fees_cents: number;
  tax_cents: number;
  net_cents: number;
  status: TransactionStatus;
  created_at: string;
}

export interface ComplianceScan {
  id: string;
  org_id: string;
  transaction_id: string | null;
  aml_risk: number;
  fraud_risk: number;
  pci_risk: number;
  sanctions_risk: number;
  tax_nexus_risk: number;
  overall_risk: number;
  risk_level: RiskLevel;
  model_name: string;
  model_meta: Record<string, unknown>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at">;
        Update: Partial<Omit<Organization, "id" | "created_at">>;
      };
      organization_members: {
        Row: OrganizationMember;
        Insert: Omit<OrganizationMember, "created_at">;
        Update: Pick<OrganizationMember, "role">;
      };
      api_keys: {
        Row: ApiKey;
        Insert: Omit<ApiKey, "id" | "created_at">;
        Update: Partial<Pick<ApiKey, "tag" | "rate_limit_per_minute" | "revoked_at" | "last_used_at">>;
      };
      checkout_sessions: {
        Row: CheckoutSession;
        Insert: Omit<CheckoutSession, "id" | "created_at">;
        Update: Partial<Pick<CheckoutSession, "status" | "confirmed_at" | "compliance_overall">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at">;
        Update: Pick<Transaction, "status">;
      };
      compliance_scans: {
        Row: ComplianceScan;
        Insert: Omit<ComplianceScan, "id" | "created_at">;
        Update: never;
      };
    };
  };
}

// ─── Singleton client ─────────────────────────────────────────────────────────
// Uses anon key. RLS ensures users only see their own org's data.
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Get the current session's raw JWT — pass this to the Rust backend. */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Get the current authenticated user ID (sub). */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// ─── Typed query helpers ──────────────────────────────────────────────────────

/** List all organizations the current user belongs to. */
export async function getUserOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** List all active (non-revoked) API keys for an org. */
export async function getOrgApiKeys(orgId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("org_id", orgId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** List recent checkout sessions for an org. */
export async function getCheckoutSessions(
  orgId: string,
  limit = 50
): Promise<CheckoutSession[]> {
  const { data, error } = await supabase
    .from("checkout_sessions")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** List recent transactions for an org. */
export async function getTransactions(
  orgId: string,
  limit = 50
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Get the latest compliance scan for a transaction. */
export async function getComplianceScan(
  transactionId: string
): Promise<ComplianceScan | null> {
  const { data, error } = await supabase
    .from("compliance_scans")
    .select("*")
    .eq("transaction_id", transactionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
