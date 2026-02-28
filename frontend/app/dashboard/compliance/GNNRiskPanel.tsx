"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RiskBar {
    label: string;
    target: number;
    color: string;
}

interface Jurisdiction {
    code: string;
    risk: "high" | "medium" | "low";
    tooltip: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const RISK_BARS: RiskBar[] = [
    { label: "AML Risk", target: 12, color: "#22C55E" },
    { label: "Fraud Risk", target: 8, color: "#22C55E" },
    { label: "PCI-DSS", target: 6, color: "#22C55E" },
    { label: "Sanctions Exposure", target: 3, color: "#22C55E" },
    { label: "Tax Nexus Risk", target: 27, color: "#F59E0B" },
];

const OVERALL_RISK = 11;

const FLAGGED_PATTERNS: string[] = [
    "> Unusual cross-border velocity detected",
    "> Round-amount structuring pattern in last 48h",
];

const JURISDICTIONS: Jurisdiction[] = [
    // High risk
    { code: "IR", risk: "high", tooltip: "High-risk jurisdiction · OFAC watchlist" },
    { code: "KP", risk: "high", tooltip: "High-risk jurisdiction · OFAC watchlist" },
    { code: "SY", risk: "high", tooltip: "High-risk jurisdiction · OFAC watchlist" },
    // Medium risk (tax nexus)
    { code: "US-CA", risk: "medium", tooltip: "Tax nexus detected" },
    { code: "US-NY", risk: "medium", tooltip: "Tax nexus detected" },
    { code: "US-TX", risk: "medium", tooltip: "Tax nexus detected" },
    // Low risk
    { code: "GB", risk: "low", tooltip: "Low risk" },
    { code: "DE", risk: "low", tooltip: "Low risk" },
    { code: "FR", risk: "low", tooltip: "Low risk" },
    { code: "JP", risk: "low", tooltip: "Low risk" },
    { code: "AU", risk: "low", tooltip: "Low risk" },
    { code: "SG", risk: "low", tooltip: "Low risk" },
    { code: "CA", risk: "low", tooltip: "Low risk" },
    { code: "BR", risk: "low", tooltip: "Low risk" },
    { code: "IN", risk: "low", tooltip: "Low risk" },
    { code: "AE", risk: "low", tooltip: "Low risk" },
    { code: "KR", risk: "low", tooltip: "Low risk" },
    { code: "MX", risk: "low", tooltip: "Low risk" },
    { code: "NL", risk: "low", tooltip: "Low risk" },
    { code: "CH", risk: "low", tooltip: "Low risk" },
    { code: "SE", risk: "low", tooltip: "Low risk" },
    { code: "IE", risk: "low", tooltip: "Low risk" },
    { code: "IT", risk: "low", tooltip: "Low risk" },
    { code: "ES", risk: "low", tooltip: "Low risk" },
    { code: "HK", risk: "low", tooltip: "Low risk" },
    { code: "NZ", risk: "low", tooltip: "Low risk" },
];

const RISK_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
    high: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", glow: "0 0 10px rgba(239,68,68,0.5)" },
    medium: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)", glow: "0 0 8px rgba(245,158,11,0.4)" },
    low: { bg: "rgba(255,255,255,0.03)", border: "rgba(55,65,81,0.4)", glow: "none" },
};

// ─── Stutter-fill hook ────────────────────────────────────────────────────────
function useStutterFill(target: number, duration: number, delay: number): number {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const steps = 10;
            const stepDuration = duration / steps;
            let step = 0;

            // Generate stutter values: random intermediate jumps before settling
            const stutterValues: number[] = [];
            for (let i = 0; i < steps - 1; i++) {
                const progress = (i + 1) / steps;
                const base = target * progress;
                const jitter = target * 0.15 * (Math.random() - 0.5);
                stutterValues.push(Math.max(0, Math.min(target * 1.1, base + jitter)));
            }
            stutterValues.push(target); // final value is exact

            const interval = setInterval(() => {
                if (step < stutterValues.length) {
                    setValue(stutterValues[step]);
                    step++;
                } else {
                    clearInterval(interval);
                }
            }, stepDuration);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [target, duration, delay]);

    return value;
}

// ─── Typing animation hook ───────────────────────────────────────────────────
function useTypewriter(text: string, speed: number, delay: number): string {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        let charIndex = 0;
        let interval: ReturnType<typeof setInterval>;

        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                if (charIndex < text.length) {
                    setDisplayed(text.slice(0, charIndex + 1));
                    charIndex++;
                } else {
                    clearInterval(interval);
                }
            }, speed);
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [text, speed, delay]);

    return displayed;
}

// ─── Risk Bar Component ──────────────────────────────────────────────────────
function AnimatedRiskBar({ bar, index }: { bar: RiskBar; index: number }) {
    const fillValue = useStutterFill(bar.target, 1200, 400 + index * 100);

    return (
        <div className="flex items-center gap-3">
            <span
                className="text-[11px] font-mono w-[140px] shrink-0 text-right"
                style={{ color: "rgba(255,255,255,0.5)" }}
            >
                {bar.label}
            </span>
            <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div
                    className="h-full rounded-full"
                    style={{
                        width: `${fillValue}%`,
                        background: bar.color,
                        boxShadow: `0 0 8px ${bar.color}40`,
                        transition: "width 100ms ease-out",
                    }}
                />
            </div>
            <span
                className="text-xs font-mono font-bold w-[44px] text-right"
                style={{ color: bar.color }}
            >
                {Math.round(fillValue)}%
            </span>
        </div>
    );
}

// ─── Flagged Pattern Line ────────────────────────────────────────────────────
function FlaggedLine({ text, delay }: { text: string; delay: number }) {
    const typed = useTypewriter(text, 20, delay);
    return (
        <div className="font-mono text-xs leading-relaxed" style={{ color: "#22C55E" }}>
            {typed}
            {typed.length < text.length && (
                <span className="inline-block w-[6px] h-[14px] ml-0.5 animate-pulse" style={{ background: "#22C55E" }} />
            )}
        </div>
    );
}

// ─── Jurisdiction Block ──────────────────────────────────────────────────────
function JurisdictionBlock({ j }: { j: Jurisdiction }) {
    const [hovered, setHovered] = useState(false);
    const style = RISK_COLORS[j.risk];

    return (
        <div className="relative">
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="flex items-center justify-center rounded-md text-[10px] font-mono font-bold cursor-default transition-all duration-200"
                style={{
                    width: 48,
                    height: 32,
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    boxShadow: style.glow,
                    color:
                        j.risk === "high"
                            ? "#EF4444"
                            : j.risk === "medium"
                                ? "#F59E0B"
                                : "rgba(255,255,255,0.3)",
                    animation: j.risk === "high" ? "gnnPulse 2s ease-in-out infinite" : "none",
                }}
            >
                {j.code}
            </div>
            {hovered && (
                <div
                    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap pointer-events-none"
                    style={{
                        background: "rgba(13,13,13,0.95)",
                        border: "1px solid rgba(110,20,212,0.3)",
                        color: "rgba(255,255,255,0.7)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                        animation: "fadeIn 150ms ease-out",
                    }}
                >
                    {j.tooltip}
                    <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: "5px solid rgba(110,20,212,0.3)",
                        }}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────
export default function GNNRiskPanel() {
    const [inferenceTime, setInferenceTime] = useState("just now");
    const mountRef = useRef(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = Math.floor((Date.now() - mountRef.current) / 1000);
            if (seconds < 60) {
                setInferenceTime(seconds < 5 ? "just now" : `${seconds}s ago`);
            } else {
                setInferenceTime(`${Math.floor(seconds / 60)}m ago`);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Group jurisdictions by risk for layout
    const highRisk = JURISDICTIONS.filter((j) => j.risk === "high");
    const mediumRisk = JURISDICTIONS.filter((j) => j.risk === "medium");
    const lowRisk = JURISDICTIONS.filter((j) => j.risk === "low");

    return (
        <>
            {/* Pulse animation keyframes */}
            <style jsx global>{`
        @keyframes gnnPulse {
          0%, 100% { box-shadow: 0 0 6px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 18px rgba(239,68,68,0.6), 0 0 4px rgba(239,68,68,0.3); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            <div
                className="rounded-xl overflow-hidden mb-8"
                style={{
                    background: "rgba(13,13,13,0.95)",
                    border: "1px solid rgba(110,20,212,0.12)",
                    borderLeft: "3px solid #6E14D4",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
                }}
            >
                {/* ── Header ──────────────────────────────────────────────────── */}
                <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(55,65,81,0.25)" }}>
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-black tracking-tight">GNN Risk Intelligence</h2>
                        <div className="flex items-center gap-1.5">
                            <span
                                className="inline-block w-[6px] h-[6px] rounded-full animate-pulse"
                                style={{ background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
                            />
                            <span className="text-[10px] font-mono" style={{ color: "#22C55E" }}>Live</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-mono mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                        GraphSAGE · Real-time inference · IBM AML Dataset
                    </p>
                </div>

                {/* ── Two-column body ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* Left: Risk Bars + Flagged Patterns */}
                    <div className="p-6" style={{ borderRight: "1px solid rgba(55,65,81,0.15)" }}>
                        {/* Overall risk badge */}
                        <div className="flex items-center gap-3 mb-5">
                            <span
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{
                                    background: "rgba(34,197,94,0.1)",
                                    color: "#22C55E",
                                    border: "1px solid rgba(34,197,94,0.25)",
                                    boxShadow: "0 0 12px rgba(34,197,94,0.15)",
                                }}
                            >
                                {OVERALL_RISK}% · LOW RISK
                            </span>
                            <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                                Composite Score
                            </span>
                        </div>

                        {/* Risk bars */}
                        <div className="space-y-3">
                            {RISK_BARS.map((bar, i) => (
                                <AnimatedRiskBar key={bar.label} bar={bar} index={i} />
                            ))}
                        </div>

                        {/* Flagged Patterns */}
                        <div className="mt-6">
                            <p
                                className="text-[10px] font-mono uppercase tracking-widest mb-3"
                                style={{ color: "rgba(255,255,255,0.25)" }}
                            >
                                Flagged Patterns
                            </p>
                            <div
                                className="rounded-lg p-4 space-y-1.5"
                                style={{
                                    background: "#0D0D0D",
                                    border: "1px solid rgba(55,65,81,0.3)",
                                }}
                            >
                                {FLAGGED_PATTERNS.map((line, i) => (
                                    <FlaggedLine key={i} text={line} delay={1600 + i * 800} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Jurisdictional Exposure Map */}
                    <div className="p-6">
                        <div className="mb-4">
                            <p className="text-xs font-black tracking-tight">Jurisdictional Exposure Map</p>
                            <p className="text-[10px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                                Hover for details
                            </p>
                        </div>

                        {/* Heatmap grid */}
                        <div
                            className="rounded-lg p-5"
                            style={{ background: "#0A0A0A", border: "1px solid rgba(55,65,81,0.25)" }}
                        >
                            {/* High Risk Row */}
                            <div className="mb-4">
                                <p
                                    className="text-[9px] font-mono uppercase tracking-widest mb-2"
                                    style={{ color: "rgba(239,68,68,0.6)" }}
                                >
                                    ● High Risk — OFAC
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {highRisk.map((j) => (
                                        <JurisdictionBlock key={j.code} j={j} />
                                    ))}
                                </div>
                            </div>

                            {/* Medium Risk Row */}
                            <div className="mb-4">
                                <p
                                    className="text-[9px] font-mono uppercase tracking-widest mb-2"
                                    style={{ color: "rgba(245,158,11,0.6)" }}
                                >
                                    ● Medium Risk — Tax Nexus
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {mediumRisk.map((j) => (
                                        <JurisdictionBlock key={j.code} j={j} />
                                    ))}
                                </div>
                            </div>

                            {/* Low Risk Row */}
                            <div>
                                <p
                                    className="text-[9px] font-mono uppercase tracking-widest mb-2"
                                    style={{ color: "rgba(255,255,255,0.15)" }}
                                >
                                    ● Low Risk
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {lowRisk.map((j) => (
                                        <JurisdictionBlock key={j.code} j={j} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-3">
                            {[
                                { label: "OFAC Watchlist", color: "#EF4444" },
                                { label: "Tax Nexus", color: "#F59E0B" },
                                { label: "Monitored", color: "rgba(255,255,255,0.25)" },
                            ].map((l) => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                                    <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                                        {l.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Bottom model info strip ─────────────────────────────────── */}
                <div
                    className="px-6 py-3 flex items-center justify-between flex-wrap gap-2"
                    style={{
                        background: "#080808",
                        borderTop: "1px solid rgba(55,65,81,0.25)",
                    }}
                >
                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                        GraphSAGE · 3 layers · 256→128→64 hidden dims · Multi-task BCE loss · IBM AML Dataset · AUC: 0.94
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                        Last inference: <span style={{ color: "rgba(34,197,94,0.6)" }}>{inferenceTime}</span>
                    </p>
                </div>
            </div>
        </>
    );
}
