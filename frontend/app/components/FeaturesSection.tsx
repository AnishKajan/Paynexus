"use client";

import { useEffect, useRef, useState } from "react";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  tag: string;
  size: "large" | "small";
  accent?: string;
  isMcp?: boolean;
}

const FEATURES: Feature[] = [
  {
    id: "mcp",
    icon: "⬡",
    title: "MCP Integration",
    description:
      "Native Model Context Protocol support. Claude, GPT-4o, and any MCP-compatible agent can create checkout sessions, query compliance state, and manage API keys — no human required.",
    tag: "AI-Native",
    size: "large",
    isMcp: true,
    accent: "#6E14D4",
  },
  {
    id: "gnn",
    icon: "◈",
    title: "GNN Risk Engine",
    description:
      "GraphSAGE with 3-layer 256→128→64 architecture. Multi-task BCE on IBM AML dataset. AUC 0.94. Runs inference on every transaction graph.",
    tag: "IBM watsonx",
    size: "small",
    accent: "#3B82F6",
  },
  {
    id: "mor",
    icon: "⊕",
    title: "Merchant of Record",
    description:
      "We own every transaction. VAT, GST, sales tax, and remittance handled across 180+ countries. Zero tax liability for your business.",
    tag: "Global",
    size: "small",
    accent: "#22C55E",
  },
  {
    id: "aml",
    icon: "◎",
    title: "Real-time AML",
    description:
      "Anti-money laundering detection running at transaction time. Sanctions screening against OFAC, EU, UN lists. Sub-200ms response.",
    tag: "Compliance",
    size: "small",
    accent: "#F59E0B",
  },
  {
    id: "api",
    icon: "⌬",
    title: "Instant API Keys",
    description:
      "Programmatic key provisioning with scoped permissions. sk_live_* format. Agents create their own billing credentials.",
    tag: "Developer",
    size: "small",
    accent: "#6E14D4",
  },
];

// Electric arc SVG that sweeps around a card border
function ElectricArc({ active }: { active: boolean }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ borderRadius: 16 }}
    >
      <rect
        x="1"
        y="1"
        width="calc(100% - 2)"
        height="calc(100% - 2)"
        rx="15"
        fill="none"
        stroke="#6E14D4"
        strokeWidth="1.5"
        strokeDasharray="1000"
        strokeDashoffset={active ? "0" : "1000"}
        style={{
          transition: active ? "stroke-dashoffset 800ms linear" : "none",
          filter: active ? "drop-shadow(0 0 4px #6E14D4)" : "none",
        }}
      />
    </svg>
  );
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  visible: boolean;
}

function FeatureCard({ feature, index, visible }: FeatureCardProps) {
  const [arcActive, setArcActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible || !feature.isMcp) return;
    timerRef.current = setTimeout(() => {
      setArcActive(true);
    }, index * 120 + 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, feature.isMcp, index]);

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: "#0D0D0D",
        border: `1px solid ${feature.isMcp ? "rgba(110,20,212,0.3)" : "rgba(255,255,255,0.06)"}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.85)",
        transition: `opacity 400ms ease-out ${index * 120}ms, transform 400ms ease-out ${index * 120}ms`,
        padding: feature.size === "large" ? "32px" : "24px",
        gridColumn: feature.size === "large" ? "span 2" : undefined,
      }}
    >
      {feature.isMcp && <ElectricArc active={arcActive} />}

      {/* Icon */}
      <div
        className="text-2xl mb-4 w-10 h-10 flex items-center justify-center rounded-lg font-mono"
        style={{
          background: `${feature.accent}18`,
          color: feature.accent,
          fontSize: 20,
        }}
      >
        {feature.icon}
      </div>

      {/* Tag */}
      <span
        className="inline-block text-xs font-mono px-2 py-0.5 rounded mb-3"
        style={{
          background: `${feature.accent}15`,
          color: feature.accent,
          border: `1px solid ${feature.accent}30`,
        }}
      >
        {feature.tag}
      </span>

      {/* Title */}
      <h3
        className="font-bold text-lg mb-2"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {feature.description}
      </p>

      {/* MCP code snippet */}
      {feature.isMcp && (
        <div
          className="mt-6 rounded-lg p-4 font-mono text-xs"
          style={{
            background: "#000",
            border: "1px solid rgba(110,20,212,0.2)",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.3)" }}>
            {"// Claude Code → Paynexus MCP"}
          </div>
          <div className="mt-2">
            <span style={{ color: "#3B82F6" }}>mcp</span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>
              .createCheckoutSession(&#123;
            </span>
          </div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{"  "}</span>
            <span style={{ color: "#22C55E" }}>amount</span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>: </span>
            <span style={{ color: "#F59E0B" }}>4900</span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>,</span>
          </div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{"  "}</span>
            <span style={{ color: "#22C55E" }}>currency</span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>: </span>
            <span style={{ color: "#EF4444" }}>&quot;usd&quot;</span>
          </div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>&#125;)</span>
          </div>
          <div className="mt-2" style={{ color: "#22C55E" }}>
            ✓ cs_live_Kx9mNpQ7rT2...
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeaturesSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const largeFeature = FEATURES.find((f) => f.size === "large")!;
  const smallFeatures = FEATURES.filter((f) => f.size === "small");

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border mb-6"
            style={{
              borderColor: "rgba(110,20,212,0.3)",
              color: "rgba(110,20,212,0.9)",
              background: "rgba(110,20,212,0.06)",
            }}
          >
            Features
          </span>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Everything an AI agent needs{" "}
            <span style={{ color: "#6E14D4" }}>to transact.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="flex flex-col gap-4">
          {/* MCP card — full width */}
          <FeatureCard feature={largeFeature} index={0} visible={visible} />

          {/* 4 small cards in 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {smallFeatures.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i + 1} visible={visible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
