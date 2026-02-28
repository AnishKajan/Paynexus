"use client";

import { useState } from "react";
import { COMPLIANCE_ITEMS, ComplianceItem } from "@/lib/mockData";

const statusConfig = {
    "Compliant": { color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", dot: "●" },
    "Needs Review": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", dot: "◐" },
    "Missing": { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", dot: "○" },
};

const categories = Array.from(new Set(COMPLIANCE_ITEMS.map((i) => i.category)));

function ComplianceRow({ item, expanded, onToggle }: { item: ComplianceItem; expanded: boolean; onToggle: () => void }) {
    const { color, bg, border, dot } = statusConfig[item.status];
    return (
        <div>
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
                style={{ borderBottom: "1px solid rgba(55,65,81,0.2)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(110,20,212,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
                <span className="text-base" style={{ color }}>{dot}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80">{item.name}</p>
                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Last checked: {item.lastChecked}
                    </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0"
                    style={{ color, background: bg, borderColor: border }}>
                    {item.status}
                </span>
                <span className="text-white/20 text-xs ml-2">{expanded ? "▲" : "▼"}</span>
            </button>
            {expanded && (
                <div className="px-5 py-4 text-sm" style={{ background: bg, borderBottom: "1px solid rgba(55,65,81,0.2)" }}>
                    <p className="text-white/60 leading-relaxed">{item.detail}</p>
                    {item.status !== "Compliant" && (
                        <button
                            className="mt-3 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all"
                            style={{ color, borderColor: border, background: "transparent" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = bg; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                            {item.status === "Missing" ? "Create Policy →" : "Start Review →"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CompliancePage() {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("All");

    const compliant = COMPLIANCE_ITEMS.filter((i) => i.status === "Compliant").length;
    const needsReview = COMPLIANCE_ITEMS.filter((i) => i.status === "Needs Review").length;
    const missing = COMPLIANCE_ITEMS.filter((i) => i.status === "Missing").length;
    const score = Math.round((compliant / COMPLIANCE_ITEMS.length) * 100);

    const filtered = activeCategory === "All"
        ? COMPLIANCE_ITEMS
        : COMPLIANCE_ITEMS.filter((i) => i.category === activeCategory);

    return (
        <main className="p-6 md:p-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>Compliance</h1>
                <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Merchant of Record · KYC/AML · Tax · Data · Security
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Overall Score", value: `${score}%`, color: score > 80 ? "#22c55e" : "#f59e0b" },
                    { label: "Compliant", value: compliant.toString(), color: "#22c55e" },
                    { label: "Needs Review", value: needsReview.toString(), color: "#f59e0b" },
                    { label: "Missing", value: missing.toString(), color: "#ef4444" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-5"
                        style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                        <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                        <p className="text-3xl font-black" style={{ color }}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {["All", ...categories].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200"
                        style={{
                            background: activeCategory === cat ? "rgba(110,20,212,0.15)" : "rgba(255,255,255,0.04)",
                            color: activeCategory === cat ? "#a855f7" : "rgba(255,255,255,0.4)",
                            border: activeCategory === cat ? "1px solid rgba(110,20,212,0.3)" : "1px solid rgba(55,65,81,0.3)",
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Checklist */}
            <div className="rounded-xl overflow-hidden"
                style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                    <p className="text-xs font-mono text-white/30">
                        Showing {filtered.length} of {COMPLIANCE_ITEMS.length} items
                    </p>
                </div>
                {filtered.map((item) => (
                    <ComplianceRow
                        key={item.id}
                        item={item}
                        expanded={expanded === item.id}
                        onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                    />
                ))}
            </div>

            {/* Documentation link */}
            <div className="mt-6 p-5 rounded-xl"
                style={{ background: "rgba(110,20,212,0.06)", border: "1px solid rgba(110,20,212,0.12)" }}>
                <p className="text-xs font-mono text-white/40">
                    <span style={{ color: "#a855f7" }}>Paynexus MOR</span> handles tax registration, remittance, and compliance reporting for 50+ countries.
                    All compliance data is updated in real-time from your transaction stream.
                </p>
            </div>
        </main>
    );
}
