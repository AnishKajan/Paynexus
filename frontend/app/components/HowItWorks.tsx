"use client";

import { useEffect, useRef, useState } from "react";

interface PipelineStep {
  id: string;
  label: string;
  sublabel: string;
  color: string;
}

const STEPS: PipelineStep[] = [
  { id: "agent", label: "AI Agent", sublabel: "Claude / GPT-4o", color: "#6E14D4" },
  { id: "mcp", label: "MCP Tool", sublabel: "paynexus-mcp", color: "#3B82F6" },
  { id: "backend", label: "Rust Backend", sublabel: "Axum + Tokio", color: "#6E14D4" },
  { id: "payment", label: "PaymentEngine", sublabel: "Session & charge", color: "#22C55E" },
  { id: "mor", label: "MorEngine", sublabel: "Tax & fees", color: "#F59E0B" },
  { id: "compliance", label: "ComplianceScan", sublabel: "GNN inference", color: "#3B82F6" },
  { id: "response", label: "JSON Response", sublabel: "→ UI updates", color: "#22C55E" },
];

const STEP_WIDTH = 110;
const STEP_GAP = 60;
const NODE_R = 22;
const SVG_HEIGHT = 200;
const BASELINE_Y = 90;

export default function HowItWorks() {
  const [visible, setVisible] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);
  const [activeNode, setActiveNode] = useState(-1);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const totalWidth =
    STEPS.length * STEP_WIDTH + (STEPS.length - 1) * STEP_GAP;
  const pathLength = totalWidth - STEP_WIDTH;

  // x center of each step
  const stepX = (i: number) => i * (STEP_WIDTH + STEP_GAP) + STEP_WIDTH / 2;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const duration = 1000;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setLineProgress(progress);

      // Activate nodes as line reaches them
      const nodeProgress = progress * (STEPS.length - 1);
      const currentNode = Math.floor(nodeProgress);
      setActiveNode(currentNode);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setActiveNode(STEPS.length - 1);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  const drawnLength = lineProgress * pathLength;

  return (
    <section ref={sectionRef} className="py-32 px-6 relative">
      {/* Background subtle gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(110,20,212,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <span
            className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border mb-6"
            style={{
              borderColor: "rgba(110,20,212,0.3)",
              color: "rgba(110,20,212,0.9)",
              background: "rgba(110,20,212,0.06)",
            }}
          >
            Architecture
          </span>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            How a payment{" "}
            <span style={{ color: "#6E14D4" }}>flows through</span>
            <br />
            Paynexus.
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            From agent intent to settled transaction in under 120ms.
          </p>
        </div>

        {/* Pipeline SVG — horizontally scrollable on mobile */}
        <div
          className="overflow-x-auto pb-4"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 600ms ease-out",
          }}
        >
          <div style={{ minWidth: totalWidth + 40, margin: "0 auto" }}>
            <svg
              width={totalWidth + 40}
              height={SVG_HEIGHT + 80}
              style={{ display: "block", margin: "0 auto" }}
            >
              {/* Background connector path */}
              <line
                x1={stepX(0) + 20}
                y1={BASELINE_Y}
                x2={stepX(STEPS.length - 1) - 20}
                y2={BASELINE_Y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="2"
              />

              {/* Animated drawn path */}
              <line
                x1={stepX(0) + 20}
                y1={BASELINE_Y}
                x2={stepX(0) + 20 + drawnLength}
                y2={BASELINE_Y}
                stroke="#6E14D4"
                strokeWidth="2"
                style={{
                  filter: "drop-shadow(0 0 4px rgba(110,20,212,0.8))",
                }}
              />

              {/* Step nodes and labels */}
              {STEPS.map((step, i) => {
                const x = stepX(i);
                const isActive = i <= activeNode;
                const isAnimating = i === activeNode && lineProgress < 1;

                return (
                  <g key={step.id}>
                    {/* Node ring */}
                    <circle
                      cx={x}
                      cy={BASELINE_Y}
                      r={NODE_R + 6}
                      fill="none"
                      stroke={isActive ? `${step.color}30` : "transparent"}
                      strokeWidth="1"
                      style={{
                        transition: "stroke 200ms ease-out",
                      }}
                    />

                    {/* Node fill */}
                    <circle
                      cx={x}
                      cy={BASELINE_Y}
                      r={NODE_R}
                      fill={isActive ? "#0D0D0D" : "#000"}
                      stroke={isActive ? step.color : "rgba(255,255,255,0.1)"}
                      strokeWidth={isActive ? "1.5" : "1"}
                      style={{
                        filter: isActive
                          ? `drop-shadow(0 0 8px ${step.color}60)`
                          : "none",
                        transition: "all 200ms ease-out",
                        transform: isAnimating
                          ? "scale(1.15)"
                          : "scale(1)",
                        transformOrigin: `${x}px ${BASELINE_Y}px`,
                      }}
                    />

                    {/* Node number */}
                    <text
                      x={x}
                      y={BASELINE_Y + 5}
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                      fill={isActive ? step.color : "rgba(255,255,255,0.2)"}
                      style={{ transition: "fill 200ms ease-out" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </text>

                    {/* Label above odd, below even */}
                    <text
                      x={x}
                      y={i % 2 === 0 ? BASELINE_Y - NODE_R - 18 : BASELINE_Y + NODE_R + 22}
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                      fill={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)"}
                      style={{ transition: "fill 200ms ease-out" }}
                    >
                      {step.label}
                    </text>
                    <text
                      x={x}
                      y={i % 2 === 0 ? BASELINE_Y - NODE_R - 5 : BASELINE_Y + NODE_R + 38}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fill={isActive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}
                      style={{ transition: "fill 200ms ease-out" }}
                    >
                      {step.sublabel}
                    </text>

                    {/* Connector tick line for alternating labels */}
                    {i % 2 === 0 ? (
                      <line
                        x1={x}
                        y1={BASELINE_Y - NODE_R}
                        x2={x}
                        y2={BASELINE_Y - NODE_R - 4}
                        stroke={isActive ? step.color : "rgba(255,255,255,0.08)"}
                        strokeWidth="1"
                      />
                    ) : (
                      <line
                        x1={x}
                        y1={BASELINE_Y + NODE_R}
                        x2={x}
                        y2={BASELINE_Y + NODE_R + 4}
                        stroke={isActive ? step.color : "rgba(255,255,255,0.08)"}
                        strokeWidth="1"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Latency callout */}
        <div
          className="mt-12 flex justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 600ms ease-out 800ms",
          }}
        >
          <div
            className="inline-flex items-center gap-6 px-6 py-4 rounded-xl font-mono text-sm"
            style={{
              background: "#0D0D0D",
              border: "1px solid rgba(110,20,212,0.2)",
            }}
          >
            {[
              { label: "MCP → Backend", value: "< 8ms" },
              { label: "GNN Inference", value: "< 40ms" },
              { label: "Total P99", value: "< 120ms" },
            ].map(({ label, value }, i) => (
              <div key={label} className="flex items-center gap-6">
                {i > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                )}
                <div className="flex flex-col items-center gap-1">
                  <span style={{ color: "#6E14D4", fontWeight: 700 }}>{value}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
