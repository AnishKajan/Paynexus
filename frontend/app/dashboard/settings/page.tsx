"use client";

import { useCallback, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "developer" | "viewer";
    avatarLetter: string;
    joinedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
    background: "rgba(13,13,13,0.95)",
    border: "1px solid rgba(110,20,212,0.12)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

const sectionTitle = "text-sm font-black tracking-tight";
const sectionDesc = "text-[11px] font-mono mt-0.5";
const labelClass = "block text-[10px] font-mono uppercase tracking-widest mb-2";
const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm font-mono outline-none transition-all duration-200";

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) {
    return (
        <button
            id={id}
            onClick={onChange}
            className="relative w-10 h-[22px] rounded-full transition-all duration-300 shrink-0"
            style={{
                background: checked ? "rgba(110,20,212,0.4)" : "rgba(255,255,255,0.08)",
                border: `1px solid ${checked ? "rgba(110,20,212,0.5)" : "rgba(55,65,81,0.4)"}`,
                boxShadow: checked ? "0 0 10px rgba(110,20,212,0.2)" : "none",
            }}
        >
            <div
                className="absolute top-[2px] w-4 h-4 rounded-full transition-all duration-300"
                style={{
                    left: checked ? 20 : 2,
                    background: checked ? "#a855f7" : "rgba(255,255,255,0.25)",
                    boxShadow: checked ? "0 0 6px rgba(168,85,247,0.5)" : "none",
                }}
            />
        </button>
    );
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_MEMBERS: TeamMember[] = [
    { id: "1", name: "Anish Kajan", email: "anish@paynexus.dev", role: "owner", avatarLetter: "A", joinedAt: "2026-01-10" },
    { id: "2", name: "Nithin Seelan", email: "nithin@paynexus.dev", role: "admin", avatarLetter: "N", joinedAt: "2026-01-15" },
];

const ROLE_COLORS: Record<string, string> = {
    owner: "#f59e0b",
    admin: "#a855f7",
    developer: "#22c55e",
    viewer: "rgba(255,255,255,0.35)",
};

const TABS = [
    { id: "general", label: "General", icon: "⚙" },
    { id: "team", label: "Team", icon: "👥" },
    { id: "billing", label: "Billing", icon: "💳" },
    { id: "webhooks", label: "Webhooks", icon: "🔗" },
    { id: "compliance", label: "Compliance", icon: "🛡" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("general");
    const [saved, setSaved] = useState(false);

    // General
    const [orgName, setOrgName] = useState("Paynexus Labs");
    const [orgSlug, setOrgSlug] = useState("paynexus-labs");
    const [contactEmail, setContactEmail] = useState("admin@paynexus.dev");
    const [timezone, setTimezone] = useState("America/New_York");
    const [defaultCurrency, setDefaultCurrency] = useState("USD");
    const [defaultEnv, setDefaultEnv] = useState<"sandbox" | "production">("sandbox");

    // Webhooks
    const [webhookUrl, setWebhookUrl] = useState("https://api.myapp.com/webhooks/paynexus");
    const [webhookSecret, setWebhookSecret] = useState("whsec_••••••••••••••••k9f2");
    const [webhookEvents, setWebhookEvents] = useState({
        "checkout.completed": true,
        "checkout.failed": false,
        "payment.succeeded": true,
        "payment.refunded": true,
        "compliance.flagged": true,
        "api_key.rotated": false,
    });

    // Notifications
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [slackNotifs, setSlackNotifs] = useState(false);
    const [failedPaymentAlerts, setFailedPaymentAlerts] = useState(true);
    const [complianceAlerts, setComplianceAlerts] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(true);
    const [riskThreshold, setRiskThreshold] = useState("medium");

    // Billing
    const [plan] = useState("Growth");

    // Compliance
    const [autoScan, setAutoScan] = useState(true);
    const [gnnModel, setGnnModel] = useState("graphsage-v2");
    const [riskEngineMode, setRiskEngineMode] = useState<"conservative" | "balanced" | "aggressive">("balanced");
    const [pciCompliance] = useState(true);
    const [gdprMode, setGdprMode] = useState(true);

    // Team
    const [members, setMembers] = useState<TeamMember[]>(SEED_MEMBERS);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"admin" | "developer" | "viewer">("developer");

    const handleSave = useCallback(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, []);

    const handleInvite = useCallback(() => {
        if (!inviteEmail.trim()) return;
        const newMember: TeamMember = {
            id: "m_" + Math.random().toString(36).slice(2, 8),
            name: inviteEmail.split("@")[0],
            email: inviteEmail.trim(),
            role: inviteRole,
            avatarLetter: inviteEmail[0].toUpperCase(),
            joinedAt: new Date().toISOString().split("T")[0],
        };
        setMembers((prev) => [...prev, newMember]);
        setInviteEmail("");
        setShowInvite(false);
    }, [inviteEmail, inviteRole]);

    const removeMember = useCallback((id: string) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    }, []);

    const inputStyle: React.CSSProperties = {
        background: "rgba(15,23,42,0.8)",
        border: "1px solid rgba(55,65,81,0.5)",
        color: "rgba(255,255,255,0.8)",
    };

    return (
        <main className="p-6 md:p-10">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                        Settings
                    </h1>
                    <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Organization and account preferences
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                        background: saved ? "rgba(34,197,94,0.15)" : "#6E14D4",
                        color: saved ? "#22c55e" : "#fff",
                        boxShadow: saved ? "0 0 12px rgba(34,197,94,0.2)" : "0 0 16px rgba(110,20,212,0.3)",
                        border: saved ? "1px solid rgba(34,197,94,0.3)" : "none",
                    }}
                >
                    {saved ? "✓ Saved" : "Save Changes"}
                </button>
            </div>

            {/* ── Tab Bar ─────────────────────────────────────────────────── */}
            <div
                className="flex gap-1 mb-8 p-1 rounded-xl overflow-x-auto"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(55,65,81,0.25)" }}
            >
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200"
                        style={{
                            background: activeTab === tab.id ? "rgba(110,20,212,0.12)" : "transparent",
                            color: activeTab === tab.id ? "#a855f7" : "rgba(255,255,255,0.35)",
                            border: activeTab === tab.id ? "1px solid rgba(110,20,212,0.2)" : "1px solid transparent",
                        }}
                    >
                        <span className="text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══════════════ GENERAL TAB ═══════════════════════════════════ */}
            {activeTab === "general" && (
                <div className="space-y-6 max-w-2xl" style={{ animation: "fadeIn 200ms ease-out" }}>
                    {/* Organization Info */}
                    <div className="rounded-xl p-6" style={card}>
                        <h2 className={sectionTitle}>Organization</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            Basic information about your organization
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                            <div>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Organization Name</label>
                                <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputClass} style={inputStyle} />
                            </div>
                            <div>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Slug</label>
                                <input type="text" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} className={inputClass} style={inputStyle} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Contact Email</label>
                                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Defaults */}
                    <div className="rounded-xl p-6" style={card}>
                        <h2 className={sectionTitle}>Defaults</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            Default settings for new sessions and transactions
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                            <div>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Timezone</label>
                                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass} style={inputStyle}>
                                    <option value="America/New_York">America/New_York</option>
                                    <option value="America/Chicago">America/Chicago</option>
                                    <option value="America/Denver">America/Denver</option>
                                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                                    <option value="Europe/London">Europe/London</option>
                                    <option value="Europe/Berlin">Europe/Berlin</option>
                                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                                    <option value="Asia/Singapore">Asia/Singapore</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Default Currency</label>
                                <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} className={inputClass} style={inputStyle}>
                                    <option value="USD">USD — US Dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                    <option value="GBP">GBP — British Pound</option>
                                    <option value="CAD">CAD — Canadian Dollar</option>
                                    <option value="AUD">AUD — Australian Dollar</option>
                                    <option value="JPY">JPY — Japanese Yen</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Default Environment</label>
                                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(55,65,81,0.5)" }}>
                                    {(["sandbox", "production"] as const).map((env) => (
                                        <button
                                            key={env}
                                            onClick={() => setDefaultEnv(env)}
                                            className="flex-1 py-2.5 text-xs font-semibold capitalize transition-all duration-200"
                                            style={{
                                                background: defaultEnv === env
                                                    ? env === "sandbox" ? "rgba(34,197,94,0.12)" : "rgba(110,20,212,0.12)"
                                                    : "rgba(15,23,42,0.8)",
                                                color: defaultEnv === env
                                                    ? env === "sandbox" ? "#22c55e" : "#a855f7"
                                                    : "rgba(255,255,255,0.3)",
                                            }}
                                        >
                                            {env}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-xl p-6" style={{ ...card, borderColor: "rgba(239,68,68,0.15)" }}>
                        <h2 className={sectionTitle} style={{ color: "#ef4444" }}>Danger Zone</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            Irreversible actions — proceed with caution
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5 pt-4" style={{ borderTop: "1px solid rgba(239,68,68,0.1)" }}>
                            <div>
                                <p className="text-xs font-semibold">Delete Organization</p>
                                <p className="text-[11px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                                    Permanently delete this organization and all associated data
                                </p>
                            </div>
                            <button
                                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0"
                                style={{
                                    background: "rgba(239,68,68,0.08)",
                                    color: "#ef4444",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                }}
                            >
                                Delete Organization
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ TEAM TAB ══════════════════════════════════════ */}
            {activeTab === "team" && (
                <div className="space-y-6 max-w-2xl" style={{ animation: "fadeIn 200ms ease-out" }}>
                    <div className="rounded-xl overflow-hidden" style={card}>
                        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                            <div>
                                <h2 className={sectionTitle}>Team Members</h2>
                                <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                                    {members.length} member{members.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInvite(!showInvite)}
                                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                                style={{ background: "#6E14D4", color: "#fff", boxShadow: "0 0 16px rgba(110,20,212,0.3)" }}
                            >
                                + Invite
                            </button>
                        </div>

                        {/* Invite Row */}
                        {showInvite && (
                            <div className="flex items-center gap-3 p-5" style={{ borderBottom: "1px solid rgba(55,65,81,0.2)", background: "rgba(110,20,212,0.03)", animation: "fadeIn 200ms" }}>
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
                                    className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
                                    style={inputStyle}
                                    autoFocus
                                />
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                                    className="px-3 py-2 rounded-lg text-xs font-mono outline-none"
                                    style={inputStyle}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="developer">Developer</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                                <button
                                    onClick={handleInvite}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold shrink-0"
                                    style={{ background: "rgba(110,20,212,0.15)", color: "#a855f7", border: "1px solid rgba(110,20,212,0.3)" }}
                                >
                                    Send
                                </button>
                            </div>
                        )}

                        {/* Member Rows */}
                        {members.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center justify-between px-5 py-4 transition-all duration-150"
                                style={{ borderBottom: "1px solid rgba(55,65,81,0.15)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(110,20,212,0.03)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{ background: "rgba(110,20,212,0.12)", color: "#a855f7", border: "1px solid rgba(110,20,212,0.2)" }}
                                    >
                                        {m.avatarLetter}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold">{m.name}</p>
                                        <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{m.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="px-2 py-0.5 rounded text-[10px] font-mono capitalize"
                                        style={{ background: `${ROLE_COLORS[m.role]}15`, color: ROLE_COLORS[m.role], border: `1px solid ${ROLE_COLORS[m.role]}30` }}
                                    >
                                        {m.role}
                                    </span>
                                    {m.role !== "owner" && (
                                        <button
                                            onClick={() => removeMember(m.id)}
                                            className="text-[10px] font-mono transition-colors duration-200"
                                            style={{ color: "rgba(255,255,255,0.2)" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════ BILLING TAB ═══════════════════════════════════ */}
            {activeTab === "billing" && (
                <div className="space-y-6 max-w-2xl" style={{ animation: "fadeIn 200ms ease-out" }}>
                    {/* Current Plan */}
                    <div className="rounded-xl p-6" style={card}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className={sectionTitle}>Current Plan</h2>
                                <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>Manage your subscription</p>
                            </div>
                            <span
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{ background: "rgba(110,20,212,0.12)", color: "#a855f7", border: "1px solid rgba(110,20,212,0.2)" }}
                            >
                                {plan}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-5" style={{ borderTop: "1px solid rgba(55,65,81,0.2)" }}>
                            {[
                                { label: "Monthly Volume", value: "$24,850", sub: "of $50,000" },
                                { label: "Transactions", value: "1,247", sub: "this month" },
                                { label: "Platform Fee", value: "2.9%", sub: "+ $0.30/txn" },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-lg font-black tracking-tight">{stat.value}</p>
                                    <p className="text-[10px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{stat.sub}</p>
                                    <p className="text-[9px] font-mono uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.15)" }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Plans Comparison */}
                    <div className="rounded-xl overflow-hidden" style={card}>
                        <div className="p-5" style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                            <h2 className={sectionTitle}>Available Plans</h2>
                        </div>
                        {[
                            { name: "Starter", price: "$0", features: "1K txns/mo · 1 team member · Sandbox only", current: false },
                            { name: "Growth", price: "$49", features: "10K txns/mo · 5 team members · Live + Sandbox", current: true },
                            { name: "Scale", price: "$249", features: "Unlimited txns · Unlimited team · Priority support", current: false },
                            { name: "Enterprise", price: "Custom", features: "Dedicated infra · SLA · Custom compliance rules", current: false },
                        ].map((p) => (
                            <div
                                key={p.name}
                                className="flex items-center justify-between px-5 py-4"
                                style={{
                                    borderBottom: "1px solid rgba(55,65,81,0.15)",
                                    background: p.current ? "rgba(110,20,212,0.04)" : "transparent",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-xs font-semibold flex items-center gap-2">
                                            {p.name}
                                            {p.current && (
                                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                                                    Current
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[10px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{p.features}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black">{p.price}</span>
                                    {!p.current && (
                                        <button
                                            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200"
                                            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(55,65,81,0.3)" }}
                                        >
                                            {p.price === "Custom" ? "Contact Sales" : "Upgrade"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════ WEBHOOKS TAB ══════════════════════════════════ */}
            {activeTab === "webhooks" && (
                <div className="space-y-6 max-w-2xl" style={{ animation: "fadeIn 200ms ease-out" }}>
                    {/* Endpoint */}
                    <div className="rounded-xl p-6" style={card}>
                        <h2 className={sectionTitle}>Webhook Endpoint</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            We'll send POST requests to this URL for selected events
                        </p>
                        <div className="mt-5 space-y-4">
                            <div>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Endpoint URL</label>
                                <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className={inputClass} style={inputStyle} />
                            </div>
                            <div>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Signing Secret</label>
                                <div className="flex gap-2">
                                    <input type="text" value={webhookSecret} readOnly className={`${inputClass} flex-1`} style={{ ...inputStyle, color: "rgba(255,255,255,0.4)" }} />
                                    <button
                                        className="px-3 py-2 rounded-lg text-[10px] font-mono shrink-0 transition-all duration-200"
                                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(55,65,81,0.3)" }}
                                    >
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="rounded-xl overflow-hidden" style={card}>
                        <div className="p-5" style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                            <h2 className={sectionTitle}>Event Subscriptions</h2>
                            <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                                Choose which events trigger webhooks
                            </p>
                        </div>
                        {Object.entries(webhookEvents).map(([event, active]) => (
                            <div
                                key={event}
                                className="flex items-center justify-between px-5 py-3.5"
                                style={{ borderBottom: "1px solid rgba(55,65,81,0.15)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <code className="text-xs font-mono" style={{ color: active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>
                                        {event}
                                    </code>
                                </div>
                                <Toggle
                                    id={`webhook-${event}`}
                                    checked={active}
                                    onChange={() =>
                                        setWebhookEvents((prev) => ({ ...prev, [event]: !prev[event as keyof typeof prev] }))
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════ COMPLIANCE TAB ════════════════════════════════ */}
            {activeTab === "compliance" && (
                <div className="space-y-6 max-w-2xl" style={{ animation: "fadeIn 200ms ease-out" }}>
                    {/* GNN Risk Engine */}
                    <div className="rounded-xl p-6" style={card}>
                        <h2 className={sectionTitle}>GNN Risk Engine</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            Configure the GraphSAGE-powered risk assessment engine
                        </p>
                        <div className="space-y-5 mt-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold">Auto-scan Transactions</p>
                                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                                        Automatically run compliance scan on every transaction
                                    </p>
                                </div>
                                <Toggle id="auto-scan" checked={autoScan} onChange={() => setAutoScan(!autoScan)} />
                            </div>

                            <div style={{ borderTop: "1px solid rgba(55,65,81,0.2)", paddingTop: 16 }}>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>GNN Model</label>
                                <select value={gnnModel} onChange={(e) => setGnnModel(e.target.value)} className={inputClass} style={inputStyle}>
                                    <option value="graphsage-v2">GraphSAGE v2 (Recommended)</option>
                                    <option value="graphsage-v1">GraphSAGE v1 (Legacy)</option>
                                    <option value="gat-v1">GAT v1 (Experimental)</option>
                                </select>
                            </div>

                            <div style={{ borderTop: "1px solid rgba(55,65,81,0.2)", paddingTop: 16 }}>
                                <label className={labelClass} style={{ color: "rgba(255,255,255,0.35)" }}>Risk Sensitivity</label>
                                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(55,65,81,0.5)" }}>
                                    {(["conservative", "balanced", "aggressive"] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setRiskEngineMode(mode)}
                                            className="flex-1 py-2.5 text-xs font-semibold capitalize transition-all duration-200"
                                            style={{
                                                background: riskEngineMode === mode ? "rgba(110,20,212,0.12)" : "rgba(15,23,42,0.8)",
                                                color: riskEngineMode === mode ? "#a855f7" : "rgba(255,255,255,0.3)",
                                            }}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] font-mono mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
                                    {riskEngineMode === "conservative" && "Flags more transactions for review — lower false-negative rate"}
                                    {riskEngineMode === "balanced" && "Balanced trade-off between precision and recall"}
                                    {riskEngineMode === "aggressive" && "Only flags high-confidence risks — fewer alerts, higher threshold"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Regulatory */}
                    <div className="rounded-xl p-6" style={card}>
                        <h2 className={sectionTitle}>Regulatory Compliance</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            Data privacy and regulatory settings
                        </p>
                        <div className="space-y-4 mt-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold flex items-center gap-2">
                                        PCI DSS
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                                            Compliant
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                                        Level 1 PCI DSS compliance via tokenization
                                    </p>
                                </div>
                                <Toggle id="pci" checked={pciCompliance} onChange={() => { }} />
                            </div>
                            <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(55,65,81,0.2)", paddingTop: 16 }}>
                                <div>
                                    <p className="text-xs font-semibold">GDPR Mode</p>
                                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                                        Enforce EU data residency and right-to-erasure
                                    </p>
                                </div>
                                <Toggle id="gdpr" checked={gdprMode} onChange={() => setGdprMode(!gdprMode)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ NOTIFICATIONS TAB ═════════════════════════════ */}
            {activeTab === "notifications" && (
                <div className="space-y-6 max-w-2xl" style={{ animation: "fadeIn 200ms ease-out" }}>
                    {/* Channels */}
                    <div className="rounded-xl p-6" style={card}>
                        <h2 className={sectionTitle}>Notification Channels</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            Where to send alerts and updates
                        </p>
                        <div className="space-y-4 mt-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold">Email Notifications</p>
                                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>Send alerts to your contact email</p>
                                </div>
                                <Toggle id="email-notifs" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                            </div>
                            <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(55,65,81,0.2)", paddingTop: 16 }}>
                                <div>
                                    <p className="text-xs font-semibold">Slack Integration</p>
                                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>Post alerts to a Slack channel</p>
                                </div>
                                <Toggle id="slack-notifs" checked={slackNotifs} onChange={() => setSlackNotifs(!slackNotifs)} />
                            </div>
                        </div>
                    </div>

                    {/* Alert Types */}
                    <div className="rounded-xl p-6" style={card}>
                        <h2 className={sectionTitle}>Alert Preferences</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            Choose which events trigger notifications
                        </p>
                        <div className="space-y-4 mt-5">
                            {[
                                { label: "Failed Payment Alerts", desc: "Notify when a payment fails or is declined", checked: failedPaymentAlerts, toggle: () => setFailedPaymentAlerts(!failedPaymentAlerts), id: "failed-alerts" },
                                { label: "Compliance Flags", desc: "Notify when GNN flags a transaction for review", checked: complianceAlerts, toggle: () => setComplianceAlerts(!complianceAlerts), id: "compliance-alerts" },
                                { label: "Weekly Digest", desc: "Summary of activity, volume, and risk metrics", checked: weeklyDigest, toggle: () => setWeeklyDigest(!weeklyDigest), id: "weekly-digest" },
                            ].map((item, i) => (
                                <div key={item.id} className="flex items-center justify-between" style={i > 0 ? { borderTop: "1px solid rgba(55,65,81,0.2)", paddingTop: 16 } : {}}>
                                    <div>
                                        <p className="text-xs font-semibold">{item.label}</p>
                                        <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{item.desc}</p>
                                    </div>
                                    <Toggle id={item.id} checked={item.checked} onChange={item.toggle} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Threshold */}
                    <div className="rounded-xl p-6" style={card}>
                        <h2 className={sectionTitle}>Risk Alert Threshold</h2>
                        <p className={sectionDesc} style={{ color: "rgba(255,255,255,0.25)" }}>
                            Minimum risk level that triggers a notification
                        </p>
                        <div className="mt-5">
                            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(55,65,81,0.5)" }}>
                                {["low", "medium", "high", "critical"].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setRiskThreshold(level)}
                                        className="flex-1 py-2.5 text-xs font-semibold capitalize transition-all duration-200"
                                        style={{
                                            background: riskThreshold === level ? "rgba(110,20,212,0.12)" : "rgba(15,23,42,0.8)",
                                            color: riskThreshold === level ? "#a855f7" : "rgba(255,255,255,0.3)",
                                        }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
