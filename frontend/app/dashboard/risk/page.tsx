"use client";

import { useState } from "react";
import { RISK_FACTORS, RiskFactor } from "@/lib/mockData";

const severityColors: Record<string, { text: string; bg: string; border: string }> = {
    Critical: { text: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" },
    High: { text: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)" },
    Medium: { text: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
    Low: { text: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)" },
};

// Composite risk score: weighted average of factor scores
const compositeScore = Math.round(
    RISK_FACTORS.reduce((acc, f) => acc + f.score, 0) / RISK_FACTORS.length
);

function ScoreRing({ score }: { score: number }) {
    const circumference = 2 * Math.PI * 70;
    const offset = circumference - (circumference * score) / 100;
    const color = score < 30 ? "#22c55e" : score < 55 ? "#f59e0b" : score < 75 ? "#f97316" : "#ef4444";
    const label = score < 30 ? "Low" : score < 55 ? "Medium" : score < 75 ? "High" : "Critical";
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(55,65,81,0.25)" strokeWidth="12" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke={color} strokeWidth="12"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">{score}</span>
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">/ 100</span>
                </div>
            </div>
            <span className="mt-3 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                style={{ color, background: `${color}14`, borderColor: `${color}30` }}>
                {label} Risk
            </span>
        </div>
    );
}

function RiskCard({ factor, onSelect, selected }: { factor: RiskFactor; onSelect: () => void; selected: boolean }) {
    const c = severityColors[factor.severity];
    return (
        <button
            onClick={onSelect}
            className="w-full text-left p-5 rounded-xl transition-all duration-200"
            style={{
                background: selected ? c.bg : "rgba(13,13,13,0.95)",
                border: `1px solid ${selected ? c.border : "rgba(110,20,212,0.12)"}`,
            }}
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border mr-2"
                        style={{ color: c.text, background: c.bg, borderColor: c.border }}>
                        {factor.severity}
                    </span>
                    <span className="text-sm font-bold text-white/90">{factor.name}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs font-mono" style={{ color: c.text }}>{factor.score}</span>
                    <span className="text-xs" style={{
                        color: factor.trend === "up" ? "#ef4444" : factor.trend === "down" ? "#22c55e" : "rgba(255,255,255,0.3)"
                    }}>
                        {factor.trend === "up" ? "↗" : factor.trend === "down" ? "↘" : "→"}
                    </span>
                </div>
            </div>
            <p className="text-xs text-white/40 line-clamp-2">{factor.description}</p>
        </button>
    );
}

export default function RiskPage() {
    const [selected, setSelected] = useState<RiskFactor | null>(RISK_FACTORS[0]);

    return (
        <main className="p-6 md:p-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>Risk Analysis</h1>
                <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Real-time GNN-powered · GraphSAGE v2.1 · AUC 0.94 · Last scan: 12s ago
                </p>
            </div>

            {/* Top Band: Score + Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Score Ring */}
                <div className="lg:col-span-1 rounded-xl p-8 flex flex-col items-center justify-center"
                    style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                    <ScoreRing score={compositeScore} />
                    <p className="mt-4 text-xs text-white/30 text-center max-w-[180px] font-mono leading-relaxed">
                        Weighted aggregate of {RISK_FACTORS.length} active risk vectors
                    </p>
                </div>

                {/* Risk Sub-gauges */}
                <div className="lg:col-span-2 rounded-xl p-6"
                    style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                    <h2 className="text-sm font-semibold mb-5 text-white/70">Risk Breakdown</h2>
                    <div className="space-y-4">
                        {RISK_FACTORS.map((f) => {
                            const c = severityColors[f.severity];
                            return (
                                <div key={f.id} className="flex items-center gap-4">
                                    <span className="text-xs font-mono w-36 shrink-0 text-white/40 truncate">{f.name}</span>
                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(55,65,81,0.3)" }}>
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${f.score}%`, background: c.text }} />
                                    </div>
                                    <span className="text-xs font-mono w-8 text-right" style={{ color: c.text }}>{f.score}</span>
                                    <span className="text-xs" style={{
                                        color: f.trend === "up" ? "#ef4444" : f.trend === "down" ? "#22c55e" : "rgba(255,255,255,0.2)"
                                    }}>
                                        {f.trend === "up" ? "↗" : f.trend === "down" ? "↘" : "→"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 p-3 rounded-lg" style={{ background: "rgba(110,20,212,0.06)", border: "1px solid rgba(110,20,212,0.12)" }}>
                        <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
                            ◉ <span style={{ color: "#a855f7" }}>IBM watsonx</span> · GraphSAGE GNN · 3 message-passing layers ·
                            embedding dim 256 · trained on 1.2M global payment events
                        </p>
                    </div>
                </div>
            </div>

            {/* Risk Factors: list + detail side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* List */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-white/70 mb-4">Active Risk Vectors</h2>
                    {RISK_FACTORS.map((f) => (
                        <RiskCard
                            key={f.id}
                            factor={f}
                            selected={selected?.id === f.id}
                            onSelect={() => setSelected(f === selected ? null : f)}
                        />
                    ))}
                </div>

                {/* Detail */}
                {selected && (
                    <div className="rounded-xl p-6 h-fit sticky top-6"
                        style={{ background: "rgba(13,13,13,0.98)", border: `1px solid ${severityColors[selected.severity].border}` }}>
                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                                style={{
                                    color: severityColors[selected.severity].text,
                                    background: severityColors[selected.severity].bg,
                                    borderColor: severityColors[selected.severity].border
                                }}>
                                {selected.severity}
                            </span>
                            <h3 className="text-base font-black">{selected.name}</h3>
                        </div>

                        <p className="text-sm text-white/60 mb-6 leading-relaxed">{selected.description}</p>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-mono mb-2">
                                <span style={{ color: "rgba(255,255,255,0.3)" }}>Risk Score</span>
                                <span style={{ color: severityColors[selected.severity].text }}>{selected.score} / 100</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(55,65,81,0.3)" }}>
                                <div className="h-full rounded-full" style={{
                                    width: `${selected.score}%`,
                                    background: severityColors[selected.severity].text,
                                    transition: "width 0.5s ease",
                                }} />
                            </div>
                        </div>

                        {selected.affectedCountries && (
                            <div className="mb-5">
                                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Affected Countries</p>
                                <div className="flex flex-wrap gap-2">
                                    {selected.affectedCountries.map((c) => (
                                        <span key={c} className="px-2 py-1 rounded text-xs font-mono text-white/50"
                                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(55,65,81,0.4)" }}>
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-4 rounded-lg" style={{ background: "rgba(110,20,212,0.06)", border: "1px solid rgba(110,20,212,0.15)" }}>
                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Suggested Action</p>
                            <p className="text-sm text-white/70">{selected.suggestedAction}</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
