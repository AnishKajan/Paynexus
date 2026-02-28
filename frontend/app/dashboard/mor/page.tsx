"use client";

import { useState, useEffect, useMemo } from "react";
import {
    MOR_SUMMARY,
    MOR_COMPLIANCE_ITEMS,
    SUPPORTED_COUNTRIES,
    BLOCKED_COUNTRIES_INITIAL,
    NEXUS_TRIGGERS,
    ComplianceItem,
    NexusTrigger
} from "@/lib/mockData";
import HulyButton from "@/app/components/HulyButton";
import { supabase } from "@/lib/supabaseClient";

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({ label, value, color = "#fff" }: { label: string; value: string; color?: string }) {
    return (
        <div className="rounded-xl p-5" style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
        </div>
    );
}

function ComplianceRow({ item, onView }: { item: ComplianceItem; onView: (item: ComplianceItem) => void }) {
    const statusColor = item.status === "Compliant" ? "#22c55e" : item.status === "Needs Review" ? "#f59e0b" : "#ef4444";
    const statusBg = item.status === "Compliant" ? "rgba(34,197,94,0.08)" : item.status === "Needs Review" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
    const statusBorder = item.status === "Compliant" ? "rgba(34,197,94,0.2)" : item.status === "Needs Review" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)";

    return (
        <div className="flex items-center justify-between px-5 py-4 transition-all duration-150 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
            <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                <div>
                    <p className="text-sm font-medium text-white/80">{item.name}</p>
                    <p className="text-[10px] font-mono text-white/30 truncate max-w-[200px]">{item.category}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border hidden sm:inline-block"
                    style={{ color: statusColor, background: statusBg, borderColor: statusBorder }}>
                    {item.status}
                </span>
                <button
                    onClick={() => onView(item)}
                    className="text-[10px] font-mono text-purple-400/60 hover:text-purple-400 transition-colors uppercase tracking-widest"
                >
                    View →
                </button>
            </div>
        </div>
    );
}

function NexusTriggersWidget({ triggers }: { triggers: NexusTrigger[] }) {
    return (
        <div className="rounded-xl p-6" style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
            <h2 className="text-sm font-black tracking-tight mb-4 uppercase">Nexus & Tax Triggers</h2>
            <div className="space-y-5">
                {triggers.map((trigger) => {
                    const statusColor = trigger.status === "Triggered" ? "#ef4444" : trigger.status === "Approaching" ? "#f59e0b" : "#22c55e";
                    return (
                        <div key={trigger.id}>
                            <div className="flex justify-between items-end mb-1.5">
                                <div>
                                    <p className="text-xs font-bold text-white/80">{trigger.jurisdiction}</p>
                                    <p className="text-[10px] font-mono text-white/30">Target: {trigger.threshold}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-mono font-bold" style={{ color: statusColor }}>{trigger.status}</p>
                                    <p className="text-[10px] font-mono text-white/60">{trigger.current}</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${trigger.progress}%`, background: statusColor }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MorPage() {
    const [env, setEnv] = useState<"sandbox" | "production">("sandbox");
    const [searchQuery, setSearchQuery] = useState("");
    const [blockedCountries, setBlockedCountries] = useState(BLOCKED_COUNTRIES_INITIAL);
    const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [countryToAdd, setCountryToAdd] = useState("");

    // Filtered supported countries (exclude blocked ones)
    const availableCountries = useMemo(() => {
        return SUPPORTED_COUNTRIES
            .filter(c => !blockedCountries.includes(c))
            .filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [blockedCountries, searchQuery]);

    const handleAddBlocked = () => {
        if (countryToAdd && !blockedCountries.includes(countryToAdd)) {
            setBlockedCountries([...blockedCountries, countryToAdd]);
            setCountryToAdd("");
            setShowAddModal(false);
        }
    };

    const handleUnblock = (country: string) => {
        setBlockedCountries(blockedCountries.filter(c => c !== country));
    };

    return (
        <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>Merchant of Record (MoR)</h1>
                    <p className="text-xs font-mono mt-1 text-white/30 max-w-xl">
                        Paynexus acts as your legal seller in 50+ jurisdictions. We handle sales tax registration, remittance, and compliance reporting automatically.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setEnv("sandbox")}
                            className={`px-3 py-1 rounded text-[10px] font-mono transition-all ${env === "sandbox" ? "bg-purple-600 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            Sandbox
                        </button>
                        <button
                            onClick={() => setEnv("production")}
                            className={`px-3 py-1 rounded text-[10px] font-mono transition-all ${env === "production" ? "bg-purple-600 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            Production
                        </button>
                    </div>
                    <HulyButton
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2.5 text-[10px]"
                    >
                        + Add blocked country
                    </HulyButton>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Active Regions" value={MOR_SUMMARY[env].activeRegions.toString()} />
                <StatCard label="VAT/GST Status" value={MOR_SUMMARY[env].vatStatus} color={env === "production" ? "#22c55e" : "#f59e0b"} />
                <StatCard label="Next Payout" value={MOR_SUMMARY[env].nextPayout} />
                <StatCard label="Open Disputes" value={MOR_SUMMARY[env].openDisputes.toString()} color={MOR_SUMMARY[env].openDisputes > 0 ? "#ef4444" : "#fff"} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Compliance Checklist */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-sm font-black tracking-tight uppercase">Compliance Checklist</h2>
                            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Sandbox Sync: Active</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {MOR_COMPLIANCE_ITEMS.map((item) => (
                                <ComplianceRow key={item.id} item={item} onView={setSelectedItem} />
                            ))}
                        </div>
                    </div>

                    {/* Countries Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Supported Countries */}
                        <div className="rounded-xl flex flex-col h-[400px]" style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                            <div className="px-5 py-4 border-b border-white/10">
                                <h3 className="text-xs font-black uppercase tracking-wider mb-3">Supported Countries</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                {availableCountries.map((country) => (
                                    <div key={country} className="px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-default flex justify-between group">
                                        {country}
                                        <button
                                            onClick={() => {
                                                setBlockedCountries([...blockedCountries, country]);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-[9px] font-mono text-white/20 hover:text-red-400 transition-all uppercase"
                                        >
                                            Block
                                        </button>
                                    </div>
                                ))}
                                {availableCountries.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-[10px] font-mono text-white/20">No matching countries</div>
                                )}
                            </div>
                        </div>

                        {/* Blocked Countries */}
                        <div className="rounded-xl flex flex-col h-[400px]" style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                            <div className="px-5 py-4 border-b border-white/10">
                                <h3 className="text-xs font-black uppercase tracking-wider mb-1">Blocked Countries</h3>
                                <p className="text-[10px] font-mono text-white/20">Transactions from these areas are rejected</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                {blockedCountries.map((country) => (
                                    <div key={country} className="px-3 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all flex justify-between items-center group">
                                        {country}
                                        <button
                                            onClick={() => handleUnblock(country)}
                                            className="opacity-0 group-hover:opacity-100 text-[9px] font-mono text-purple-400/60 hover:text-purple-400 transition-all uppercase"
                                        >
                                            Unblock
                                        </button>
                                    </div>
                                ))}
                                {blockedCountries.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-[10px] font-mono text-white/20 gap-2">
                                        <div className="w-8 h-8 rounded-full border border-dashed border-white/10 flex items-center justify-center opacity-30">✓</div>
                                        No blocked countries
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Nexus Triggers */}
                <div>
                    <NexusTriggersWidget triggers={NEXUS_TRIGGERS} />

                    <div className="mt-8 p-6 rounded-xl border border-purple-500/10 bg-purple-500/[0.02]">
                        <h3 className="text-xs font-black uppercase tracking-wider mb-3 text-purple-400">MoR Intelligence</h3>
                        <p className="text-[11px] font-mono leading-relaxed text-white/40">
                            Our compliance engine monitors 142 discrete data points across your transaction stream. When you approach a local economic nexus (e.g. EU OSS or California Sales Tax), we notify you and handle the registration workflow.
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Global Watchdog Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modals / Drawers ────────────────────────────────────────────── */}

            {/* Compliance Detail Drawer */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex"
                    onClick={() => setSelectedItem(null)}
                >
                    <div className="flex-1 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="w-full max-w-md h-full overflow-y-auto p-8 flex flex-col gap-6"
                        style={{ background: "rgba(11,11,11,0.98)", borderLeft: "1px solid rgba(110,20,212,0.2)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">{selectedItem.category}</p>
                                <h2 className="text-lg font-black">{selectedItem.name}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="rounded-xl p-5" style={{
                            background: selectedItem.status === "Compliant" ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
                            border: `1px solid ${selectedItem.status === "Compliant" ? "#22c55e" : "#f59e0b"}22`
                        }}>
                            <div className="text-xs font-mono mb-2 uppercase tracking-widest opacity-40">Status</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: selectedItem.status === "Compliant" ? "#22c55e" : "#f59e0b" }} />
                                <span className="text-sm font-bold uppercase tracking-tight" style={{ color: selectedItem.status === "Compliant" ? "#22c55e" : "#f59e0b" }}>
                                    {selectedItem.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Description</h3>
                                <p className="text-sm text-white/70 leading-relaxed">{selectedItem.detail}</p>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Last Audit</h3>
                                <p className="text-sm text-white/50">{selectedItem.lastChecked}</p>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs bg-white text-black hover:bg-white/90 transition-all"
                            >
                                {selectedItem.status === "Compliant" ? "Download Audit Trail" : "Submit Documentation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Blocked Country Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl p-6 overflow-hidden"
                        style={{ background: "#0D0D0D", border: "1px solid rgba(110,20,212,0.2)", boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-black mb-1">Block Country</h2>
                        <p className="text-xs font-mono text-white/30 mb-6 uppercase tracking-widest">Regulatory Override</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest mb-2 opacity-50">Select Country</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-purple-500/50 transition-colors appearance-none"
                                    value={countryToAdd}
                                    onChange={(e) => setCountryToAdd(e.target.value)}
                                >
                                    <option value="">Choose a region...</option>
                                    {SUPPORTED_COUNTRIES.filter(c => !blockedCountries.includes(c)).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <HulyButton
                                onClick={handleAddBlocked}
                                disabled={!countryToAdd}
                                className="w-full py-3.5 text-[10px]"
                            >
                                Confirm Block Execution
                            </HulyButton>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-full py-2 text-[10px] font-mono text-white/20 hover:text-white/40 transition-all uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(110,20,212,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(110,20,212,0.2);
                }
            `}</style>
        </main>
    );
}
