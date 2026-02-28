"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import HulyButton from "../components/HulyButton";
import UserProfileMenu from "../components/UserProfileMenu";

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" style={{ display: "inline-block" }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" strokeDashoffset="10" />
        </svg>
    );
}

// ─── Mini Stat Card ───────────────────────────────────────────────────────────
function StatCard({ label, value, change, icon }: { label: string; value: string; change: string; icon: React.ReactNode }) {
    const isPositive = change.startsWith("+");
    return (
        <div
            className="rounded-xl p-5 transition-all duration-300 group hover:scale-[1.02]"
            style={{
                background: "rgba(13,13,13,0.95)",
                border: "1px solid rgba(110,20,212,0.12)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.35)"; e.currentTarget.style.boxShadow = "0 4px 32px rgba(110,20,212,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.12)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)"; }}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                <div style={{ color: "rgba(110,20,212,0.6)" }}>{icon}</div>
            </div>
            <div className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>{value}</div>
            <div className="mt-1 text-xs font-mono" style={{ color: isPositive ? "#22c55e" : "#ef4444" }}>{change} vs last month</div>
        </div>
    );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ type, amount, currency, status, time }: {
    type: string; amount: string; currency: string; status: string; time: string;
}) {
    const statusColor: Record<string, string> = {
        succeeded: "#22c55e",
        pending: "#f59e0b",
        failed: "#ef4444",
    };
    return (
        <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(55,65,81,0.25)" }}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(110,20,212,0.1)", border: "1px solid rgba(110,20,212,0.15)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                </div>
                <div>
                    <p className="text-sm font-medium text-white/80">{type}</p>
                    <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{time}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-mono font-semibold text-white/90">{amount} {currency}</p>
                <p className="text-xs font-mono" style={{ color: statusColor[status] || "#fff" }}>{status}</p>
            </div>
        </div>
    );
}

// ─── Compliance Gauge ─────────────────────────────────────────────────────────
function ComplianceGauge({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-mono w-20 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(55,65,81,0.4)" }}>
                <div
                    className="h-full rounded-full"
                    style={{
                        width: `${value}%`,
                        background: color,
                        animation: "riskBarFill 1.5s ease-out",
                    }}
                />
            </div>
            <span className="text-xs font-mono w-10 text-right" style={{ color }}>{value}%</span>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [now, setNow] = useState<string>("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
                router.replace("/login");
            } else {
                setUserEmail(data.session.user.email ?? "user");
                setLoading(false);
            }
        });
    }, [router]);

    useEffect(() => {
        setNow(new Date().toLocaleString("en-US", {
            weekday: "short", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit",
        }));
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Spinner />
                    <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Loading dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "#030303" }}>
            {/* ── Sidebar + Top Bar ────────────────────────────────────────────── */}
            <div className="flex">
                {/* Sidebar */}
                <aside
                    className="hidden lg:flex flex-col w-64 min-h-screen p-5 shrink-0"
                    style={{
                        background: "rgba(13,13,13,0.98)",
                        borderRight: "1px solid rgba(110,20,212,0.1)",
                    }}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <img src="/Paynexus-logo.svg" alt="Paynexus" width={28} height={28} style={{ borderRadius: 6, boxShadow: "0 0 14px rgba(110,20,212,0.5)" }} />
                        <span className="text-sm font-black tracking-tight">PAYNEXUS</span>
                    </div>

                    {/* Nav Items */}
                    {[
                        { label: "Dashboard", active: true, icon: "◉" },
                        { label: "Transactions", active: false, icon: "⇄" },
                        { label: "Compliance", active: false, icon: "◈" },
                        { label: "API Keys", active: false, icon: "⚿" },
                        { label: "Webhooks", active: false, icon: "⊡" },
                        { label: "Settings", active: false, icon: "⚙" },
                    ].map((item) => (
                        <HulyButton
                            key={item.label}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-full mb-1 w-full ${item.active ? "opacity-100" : "opacity-60"}`}
                            style={{
                                background: item.active ? "rgba(110,20,212,0.12)" : "transparent",
                                color: item.active ? "#a855f7" : "rgba(255,255,255,0.4)",
                                border: item.active ? "1px solid rgba(110,20,212,0.2)" : "1px solid transparent",
                                justifyContent: "flex-start",
                            }}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </HulyButton>
                    ))}

                    <div className="mt-auto pt-6" style={{ borderTop: "1px solid rgba(55,65,81,0.3)" }}>
                        <UserProfileMenu email={userEmail} onSignOut={handleSignOut} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-10 overflow-auto">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                                Dashboard
                            </h1>
                            <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{now}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Environment badge */}
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
                                style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                                ● Sandbox
                            </span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Volume" value="$12,482.00" change="+18.2%"
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>}
                        />
                        <StatCard label="Transactions" value="142" change="+24%"
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
                        />
                        <StatCard label="Success Rate" value="99.3%" change="+0.2%"
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                        />
                        <StatCard label="Compliance Score" value="96.1" change="+1.4%"
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
                        />
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Recent Activity (2/3 width) */}
                        <div
                            className="xl:col-span-2 rounded-xl p-6"
                            style={{
                                background: "rgba(13,13,13,0.95)",
                                border: "1px solid rgba(110,20,212,0.12)",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-sm font-semibold tracking-wide">Recent Activity</h2>
                                <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>Last 7 days</span>
                            </div>
                            <ActivityRow type="Checkout Payment" amount="$249.99" currency="USD" status="succeeded" time="2 min ago" />
                            <ActivityRow type="Subscription Renewal" amount="€89.00" currency="EUR" status="succeeded" time="18 min ago" />
                            <ActivityRow type="Refund Issued" amount="$34.50" currency="USD" status="pending" time="1 hour ago" />
                            <ActivityRow type="Checkout Payment" amount="£149.00" currency="GBP" status="succeeded" time="3 hours ago" />
                            <ActivityRow type="API Charge" amount="$12.00" currency="USD" status="succeeded" time="5 hours ago" />
                            <ActivityRow type="Payout" amount="$3,200.00" currency="USD" status="succeeded" time="Yesterday" />
                        </div>

                        {/* Compliance Panel (1/3 width) */}
                        <div
                            className="rounded-xl p-6"
                            style={{
                                background: "rgba(13,13,13,0.95)",
                                border: "1px solid rgba(110,20,212,0.12)",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-sm font-semibold tracking-wide">Risk Overview</h2>
                                <span className="px-2 py-1 rounded text-[10px] font-mono font-bold uppercase" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>LOW</span>
                            </div>
                            <div className="space-y-4">
                                <ComplianceGauge label="AML" value={8} color="#22c55e" />
                                <ComplianceGauge label="Fraud" value={12} color="#22c55e" />
                                <ComplianceGauge label="PCI" value={5} color="#22c55e" />
                                <ComplianceGauge label="Sanctions" value={3} color="#22c55e" />
                                <ComplianceGauge label="Tax Nexus" value={18} color="#f59e0b" />
                            </div>
                            <div className="mt-6 p-3 rounded-lg" style={{ background: "rgba(110,20,212,0.06)", border: "1px solid rgba(110,20,212,0.1)" }}>
                                <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    <span style={{ color: "#a855f7" }}>GraphSAGE v2.1</span> · 3 layers · AUC 0.94<br />
                                    Last scan: 12 seconds ago · Inference: 42ms
                                </p>
                            </div>

                            {/* Quick API Key */}
                            <div className="mt-6">
                                <h3 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Sandbox Key</h3>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 rounded-lg text-xs font-mono truncate" style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(55,65,81,0.5)", color: "rgba(255,255,255,0.5)" }}>
                                        pnx_test_sk_••••••••••4f2a
                                    </code>
                                    <HulyButton
                                        className="px-3 py-2 rounded-full text-xs font-mono"
                                        style={{ border: "1px solid rgba(55, 65, 81, 0.5)", color: "rgba(255,255,255,0.4)" }}
                                    >
                                        Copy
                                    </HulyButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 text-center">
                        <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                            Built with IBM watsonx · GraphSAGE GNN · MCP Protocol · <span style={{ color: "rgba(110,20,212,0.5)" }}>IBM Hackathon 2026</span>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
