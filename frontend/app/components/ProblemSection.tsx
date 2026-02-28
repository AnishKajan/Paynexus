"use client";

import { useEffect, useRef, useState } from "react";
import GlitchText from "./GlitchText";

interface ProblemCard {
  icon: string;
  title: string;
  body: string;
  direction: "left" | "bottom" | "right";
}

const PROBLEMS: ProblemCard[] = [
  {
    icon: "⚡",
    title: "Legacy Payment Rails",
    body:
      "Stripe and Braintree were built for humans clicking buttons. AI agents need programmatic, compliance-aware payment APIs that don't require a human in the loop.",
    direction: "left",
  },
  {
    icon: "🔍",
    title: "Blind Compliance",
    body:
      "Existing processors run static rules. Paynexus runs GraphSAGE GNN inference on every transaction — catching AML patterns, sanctions exposure, and fraud in real time.",
    direction: "bottom",
  },
  {
    icon: "🌐",
    title: "Tax & MOR Complexity",
    body:
      "Going global means managing tax nexus across 180+ jurisdictions. Our Merchant of Record layer absorbs all liability, VAT, GST, and remittance automatically.",
    direction: "right",
  },
];

function getInitialTransform(direction: ProblemCard["direction"]): string {
  switch (direction) {
    case "left":
      return "translateX(-60px)";
    case "right":
      return "translateX(60px)";
    case "bottom":
      return "translateY(60px)";
  }
}

export default function ProblemSection() {
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-32 px-6 relative"
    >
      {/* Section label */}
      <div className="text-center mb-20">
        <span
          className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border mb-6"
          style={{
            borderColor: "rgba(110,20,212,0.3)",
            color: "rgba(110,20,212,0.9)",
            background: "rgba(110,20,212,0.06)",
          }}
        >
          The Problem
        </span>
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            <GlitchText text="The problem with" />
            <br />
            <span className="text-red-500">
              <GlitchText text="legacy payments." />
            </span>
          </h2>
          <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto font-medium">
            Fragmented stacks, opaque fees, and slow settlements are killing your agent's velocity.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PROBLEMS.map((card) => (
          <div key={card.title} className="relative">
            {/* Ghost dashed outline — always exists as a target */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                border: "1px dashed rgba(30, 58, 138, 0.4)", // blue-900ish ghost
                pointerEvents: "none",
                background: "rgba(30, 58, 138, 0.02)",
              }}
            />

            {/* Actual card */}
            <div
              className="rounded-xl p-6 h-full flex flex-col gap-4 relative glow-breath"
              style={{
                background: "#0D0D0D",
                border: "1px solid rgba(110,20,212,0.2)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0) translateY(0)" : getInitialTransform(card.direction),
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
                boxShadow: visible ? "0 4px 24px -1px rgba(0, 0, 0, 0.5)" : "none",
              }}
            >
              <div
                className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
                style={{ background: "rgba(110,20,212,0.12)" }}
              >
                {card.icon}
              </div>
              <h3
                className="text-lg font-bold"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
