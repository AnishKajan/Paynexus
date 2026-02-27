"use client";

import { useEffect, useRef, useState } from "react";

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
        <h2
          className="text-4xl md:text-5xl font-black tracking-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          The payment stack{" "}
          <span style={{ color: "#6E14D4" }}>wasn't built</span>
          <br />
          for the AI era.
        </h2>
        <p
          className="mt-4 text-base max-w-xl mx-auto"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Three fundamental gaps in every existing payment processor.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PROBLEMS.map((card) => (
          <div key={card.title} className="relative">
            {/* Ghost dashed outline — visible before animation */}
            {!visible && (
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  border: "1px dashed rgba(110,20,212,0.2)",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Actual card */}
            <div
              className="rounded-xl p-6 h-full flex flex-col gap-4 relative"
              style={{
                background: visible ? "#0D0D0D" : "transparent",
                border: visible
                  ? "1px solid rgba(110,20,212,0.2)"
                  : "1px solid transparent",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0) translateY(0)" : getInitialTransform(card.direction),
                transition: "opacity 300ms ease-out, transform 300ms ease-out, background 300ms ease-out, border-color 300ms ease-out",
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
