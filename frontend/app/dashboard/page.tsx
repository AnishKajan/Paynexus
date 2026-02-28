"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TRANSACTIONS } from "@/lib/mockData";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, icon }: { label: string; value: string; change: string; icon: React.ReactNode }) {
    const isPositive = change.startsWith("+");
    return (
        <div
            className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-default"
            style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
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

// ─── Compliance Gauge ─────────────────────────────────────────────────────────
function ComplianceGauge({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-mono w-20 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(55,65,81,0.4)" }}>
                <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
            </div>
            <span className="text-xs font-mono w-10 text-right" style={{ color }}>{value}%</span>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
    const router = useRouter();
    const [now, setNow] = useState<string>("");

    useEffect(() => {
        setNow(new Date().toLocaleString("en-US", {
            weekday: "short", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit",
        }));
    }, []);

    const statusColor: Record<string, string> = { succeeded: "#22c55e", pending: "#f59e0b", failed: "#ef4444", refunded: "#8b5cf6" };

    return (
        <main className="p-6 md:p-10 overflow-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>Dashboard</h1>
                    <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{now}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                        ● Sandbox
                    </span>
                    <button
                        onClick={() => router.push("/onboarding")}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{ background: "#6E14D4", color: "#fff", boxShadow: "0 0 16px rgba(110,20,212,0.3)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 28px rgba(110,20,212,0.6)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px rgba(110,20,212,0.3)"; }}
                    >
                        Complete Onboarding →
                    </button>
                </div>
            </div>

            {/* Stats */}
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
                {/* Recent Activity */}
                <div className="xl:col-span-2 rounded-xl overflow-hidden"
                    style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 className="text-sm font-semibold tracking-wide">Recent Activity</h2>
                        <button
                            onClick={() => router.push("/dashboard/transactions")}
                            className="text-xs font-mono transition-colors"
                            style={{ color: "rgba(168,85,247,0.7)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#a855f7"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(168,85,247,0.7)"; }}
                        >
                            View all →
                        </button>
                    </div>
                    <div className="px-4 pb-4">
                        {TRANSACTIONS.slice(0, 6).map((tx) => (
                            <button
                                key={tx.id}
                                onClick={() => router.push(`/dashboard/transactions?id=${tx.id}`)}
                                className="flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-150 group"
                                style={{ borderBottom: "1px solid rgba(55,65,81,0.2)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(110,20,212,0.06)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(110,20,212,0.1)", border: "1px solid rgba(110,20,212,0.15)" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{tx.type}</p>
                                        <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{tx.customer} · {tx.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono font-semibold text-white/90">{tx.amount} {tx.currency}</p>
                                    <p className="text-xs font-mono" style={{ color: statusColor[tx.status] || "#fff" }}>{tx.status}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Risk + Compliance side panel */}
                <div className="flex flex-col gap-6">
                    {/* Risk Overview — click to go to /dashboard/risk */}
                    <button
                        onClick={() => router.push("/dashboard/risk")}
                        className="rounded-xl p-6 text-left w-full transition-all duration-200 group"
                        style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.35)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.12)"; }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-semibold tracking-wide">Risk Overview</h2>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded text-[10px] font-mono font-bold uppercase" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>LOW</span>
                                <span className="text-xs group-hover:text-purple-400 transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}>→</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <ComplianceGauge label="AML" value={8} color="#22c55e" />
                            <ComplianceGauge label="Fraud" value={12} color="#22c55e" />
                            <ComplianceGauge label="PCI" value={5} color="#22c55e" />
                            <ComplianceGauge label="Sanctions" value={3} color="#22c55e" />
                            <ComplianceGauge label="Tax Nexus" value={18} color="#f59e0b" />
                        </div>
                        <p className="mt-4 text-[10px] font-mono text-purple-400/60 group-hover:text-purple-400 transition-colors">View full risk analysis →</p>
                    </button>

                    {/* Compliance Quick Status — click to go to /dashboard/compliance */}
                    <button
                        onClick={() => router.push("/dashboard/compliance")}
                        className="rounded-xl p-6 text-left w-full transition-all duration-200 group"
                        style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.35)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.12)"; }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold tracking-wide">Compliance</h2>
                            <span className="text-xs group-hover:text-purple-400 transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}>→</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: "7 / 10 Compliant", color: "#22c55e" },
                                { label: "2 Needs Review", color: "#f59e0b" },
                                { label: "1 Missing", color: "#ef4444" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                                    <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[10px] font-mono text-purple-400/60 group-hover:text-purple-400 transition-colors">View full compliance checklist →</p>
                    </button>
                </div>
            </div>

            <div className="mt-10 text-center">
                <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                    Built with IBM watsonx · GraphSAGE GNN · MCP Protocol · <span style={{ color: "rgba(110,20,212,0.5)" }}>IBM Hackathon 2026</span>
                </p>
            </div>
        </main>
    );
}
