"use client";

import { useEffect, useRef, useState } from "react";

interface ComplianceData {
  aml_risk: number;
  fraud_risk: number;
  pci_risk: number;
  sanctions_risk: number;
  tax_nexus_risk: number;
  overall_risk: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  high_risk_countries: string[];
  high_risk_states: string[];
  flagged_patterns: string[];
}

const DEFAULT_DATA: ComplianceData = {
  aml_risk: 0.12,
  fraud_risk: 0.08,
  pci_risk: 0.06,
  sanctions_risk: 0.03,
  tax_nexus_risk: 0.27,
  overall_risk: 0.11,
  risk_level: "LOW",
  high_risk_countries: ["IR", "KP", "SY"],
  high_risk_states: ["CA", "NY", "TX"],
  flagged_patterns: [
    "Unusual cross-border velocity detected",
    "Round-amount structuring pattern in last 48h",
  ],
};

function getRiskColor(value: number): string {
  if (value < 0.2) return "#22C55E";
  if (value < 0.5) return "#F59E0B";
  return "#EF4444";
}

function getRiskLevelColor(level: string): string {
  switch (level) {
    case "LOW":
      return "#22C55E";
    case "MEDIUM":
      return "#F59E0B";
    case "HIGH":
      return "#EF4444";
    case "CRITICAL":
      return "#EF4444";
    default:
      return "#22C55E";
  }
}

interface RiskBarProps {
  label: string;
  value: number;
  animate: boolean;
}

function RiskBar({ label, value, animate }: RiskBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [displayWidth, setDisplayWidth] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!animate) return;

    // Stutter jumps simulation (8–10 random incremental jumps over 1200ms)
    const jumps = 9;
    const totalDuration = 1200;
    const jumpInterval = totalDuration / jumps;
    let jumpCount = 0;

    const doJump = () => {
      jumpCount++;
      const progress = jumpCount / jumps;
      const jitter = (Math.random() - 0.5) * 0.04;
      const currentVal = Math.max(0, Math.min(value, value * progress + jitter));

      setDisplayValue(currentVal);
      setDisplayWidth(currentVal * 100);

      if (jumpCount < jumps) {
        setTimeout(doJump, jumpInterval + (Math.random() - 0.5) * 60);
      } else {
        setDisplayValue(value);
        setDisplayWidth(value * 100);
      }
    };

    const initialDelay = Math.random() * 200;
    const timer = setTimeout(doJump, initialDelay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, value]);

  const color = getRiskColor(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span
          className="text-xs font-mono uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {label}
        </span>
        <span
          className="text-xs font-mono font-bold"
          style={{ color }}
        >
          {(displayValue * 100).toFixed(1)}%
        </span>
      </div>
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          height: 6,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${displayWidth}%`,
            background: color,
            boxShadow: `0 0 8px ${color}60`,
            transition: "box-shadow 200ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

// Simplified SVG world map (outline only, key regions highlighted)
function WorldMap({
  highRiskCountries,
}: {
  highRiskCountries: string[];
}) {
  return (
    <div
      className="relative w-full"
      style={{ height: 140 }}
    >
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full"
        style={{ opacity: 0.7 }}
      >
        {/* Simplified continent outlines */}
        {/* North America */}
        <path
          d="M 120 80 L 200 60 L 230 80 L 220 120 L 200 150 L 180 170 L 160 160 L 130 140 L 110 120 Z"
          fill="none"
          stroke="rgba(110,20,212,0.4)"
          strokeWidth="1"
        />
        {/* South America */}
        <path
          d="M 170 200 L 210 190 L 230 220 L 220 280 L 190 310 L 165 290 L 155 250 L 160 220 Z"
          fill="none"
          stroke="rgba(110,20,212,0.4)"
          strokeWidth="1"
        />
        {/* Europe */}
        <path
          d="M 380 70 L 430 60 L 450 80 L 440 110 L 410 120 L 385 105 Z"
          fill="none"
          stroke="rgba(110,20,212,0.4)"
          strokeWidth="1"
        />
        {/* Africa */}
        <path
          d="M 380 130 L 440 120 L 460 170 L 450 240 L 420 270 L 385 250 L 370 200 L 375 160 Z"
          fill="none"
          stroke="rgba(110,20,212,0.4)"
          strokeWidth="1"
        />
        {/* Asia */}
        <path
          d="M 455 60 L 620 50 L 660 90 L 640 140 L 580 160 L 520 150 L 480 130 L 460 100 Z"
          fill="none"
          stroke="rgba(110,20,212,0.4)"
          strokeWidth="1"
        />
        {/* Middle East (IR/SY region) — highlighted */}
        <path
          d="M 490 120 L 540 110 L 555 140 L 535 155 L 495 150 Z"
          fill="rgba(239,68,68,0.15)"
          stroke="#EF4444"
          strokeWidth="1"
        />
        {/* Korea region (KP) */}
        <circle cx="625" cy="105" r="8" fill="rgba(239,68,68,0.2)" stroke="#EF4444" strokeWidth="1" />

        {/* Australia */}
        <path
          d="M 590 240 L 660 230 L 680 270 L 650 300 L 600 295 L 575 270 Z"
          fill="none"
          stroke="rgba(110,20,212,0.4)"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {[-1, 0, 1].map((i) => (
          <line
            key={`h${i}`}
            x1="80"
            y1={200 + i * 80}
            x2="720"
            y2={200 + i * 80}
            stroke="rgba(110,20,212,0.1)"
            strokeWidth="0.5"
            strokeDasharray="4 8"
          />
        ))}
        {[-2, -1, 0, 1, 2].map((i) => (
          <line
            key={`v${i}`}
            x1={400 + i * 120}
            y1="40"
            x2={400 + i * 120}
            y2="360"
            stroke="rgba(110,20,212,0.1)"
            strokeWidth="0.5"
            strokeDasharray="4 8"
          />
        ))}

        {/* High risk country labels */}
        {highRiskCountries.includes("IR") && (
          <text x="510" y="138" fontSize="9" fill="#EF4444" fontFamily="monospace">
            IR
          </text>
        )}
        {highRiskCountries.includes("KP") && (
          <text x="619" y="108" fontSize="9" fill="#EF4444" fontFamily="monospace">
            KP
          </text>
        )}
        {highRiskCountries.includes("SY") && (
          <circle cx="488" cy="130" r="5" fill="rgba(239,68,68,0.2)" stroke="#EF4444" strokeWidth="0.8" />
        )}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 right-0 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "rgba(239,68,68,0.5)", border: "1px solid #EF4444" }} />
        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
          High-risk jurisdiction
        </span>
      </div>
    </div>
  );
}

interface ComplianceRiskDashboardProps {
  data?: Partial<ComplianceData>;
  animate?: boolean;
}

export default function ComplianceRiskDashboard({
  data,
  animate = true,
}: ComplianceRiskDashboardProps) {
  const merged: ComplianceData = { ...DEFAULT_DATA, ...data };
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const riskBars = [
    { label: "AML Risk", value: merged.aml_risk },
    { label: "Fraud Risk", value: merged.fraud_risk },
    { label: "PCI Risk", value: merged.pci_risk },
    { label: "Sanctions Risk", value: merged.sanctions_risk },
    { label: "Tax Nexus Risk", value: merged.tax_nexus_risk },
  ];

  const levelColor = getRiskLevelColor(merged.risk_level);
  const isCritical = merged.risk_level === "CRITICAL";

  return (
    <div
      ref={ref}
      className="w-full max-w-4xl mx-auto"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-lg font-bold tracking-wide uppercase"
            style={{ letterSpacing: "0.08em", color: "rgba(255,255,255,0.9)" }}
          >
            Compliance Risk Dashboard
          </h3>
          <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Real-time GNN inference · GraphSAGE
          </p>
        </div>

        {/* Risk badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            background: `${levelColor}15`,
            border: `1px solid ${levelColor}40`,
            animation: isCritical ? "criticalPulse 1.5s ease-in-out infinite" : undefined,
          }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              background: levelColor,
              boxShadow: `0 0 8px ${levelColor}`,
              animation: "glowPulse 2s ease-in-out infinite",
            }}
          />
          <span
            className="text-sm font-mono font-bold tracking-widest uppercase"
            style={{ color: levelColor }}
          >
            {merged.risk_level}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk bars */}
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{
            background: "#0D0D0D",
            border: "1px solid rgba(110,20,212,0.15)",
          }}
        >
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Risk Vectors
          </div>
          {riskBars.map((bar) => (
            <RiskBar key={bar.label} label={bar.label} value={bar.value} animate={visible && animate} />
          ))}

          {/* Overall */}
          <div
            className="mt-2 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                Overall Risk
              </span>
              <span
                className="text-base font-mono font-black"
                style={{ color: levelColor }}
              >
                {(merged.overall_risk * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right column: world map + flagged patterns */}
        <div className="flex flex-col gap-4">
          {/* World map */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "#0D0D0D",
              border: "1px solid rgba(110,20,212,0.15)",
              opacity: visible ? 1 : 0,
              transition: "opacity 800ms ease-out 300ms",
            }}
          >
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Jurisdictional Risk Map
            </div>
            <WorldMap highRiskCountries={merged.high_risk_countries} />
            <div className="flex gap-2 flex-wrap mt-3">
              {merged.high_risk_countries.map((c) => (
                <span
                  key={c}
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {c}
                </span>
              ))}
              {merged.high_risk_states.map((s) => (
                <span
                  key={s}
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  US-{s}
                </span>
              ))}
            </div>
          </div>

          {/* Flagged patterns */}
          <div
            className="rounded-xl p-4 font-mono text-xs"
            style={{
              background: "#0D0D0D",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Flagged Patterns
            </div>
            {merged.flagged_patterns.map((pattern, i) => (
              <div
                key={i}
                className="flex items-start gap-2 mb-2 last:mb-0"
                style={{ color: "#F59E0B" }}
              >
                <span style={{ color: "#EF4444", marginTop: 1 }}>⚠</span>
                <span>{pattern}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GNN metadata strip */}
      <div
        className="mt-4 px-4 py-2 rounded-lg font-mono text-xs flex items-center gap-3 flex-wrap"
        style={{
          background: "rgba(110,20,212,0.06)",
          border: "1px solid rgba(110,20,212,0.12)",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <span style={{ color: "#6E14D4" }}>GraphSAGE</span>
        <span>·</span>
        <span>3 layers</span>
        <span>·</span>
        <span>256→128→64</span>
        <span>·</span>
        <span>Multi-task BCE</span>
        <span>·</span>
        <span>IBM AML Dataset</span>
        <span>·</span>
        <span style={{ color: "#22C55E" }}>AUC: 0.94</span>
      </div>
    </div>
  );
}
