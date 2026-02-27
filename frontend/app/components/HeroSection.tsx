"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "!@#$%^&*<>?/|{}[]";
const HEADLINE_WORDS = ["Payment", "infrastructure", "for", "the", "AI", "era."];
const SUBHEADLINE =
  "Compliance-first. AI-native. Built for agents, developers, and the next generation of global commerce.";

function getRandomChar(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

interface ScrambleWordProps {
  word: string;
  delay: number;
  visible: boolean;
}

function ScrambleWord({ word, delay, visible }: ScrambleWordProps) {
  const [displayText, setDisplayText] = useState("");
  const [settled, setSettled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!visible) return;

    const scrambleDuration = 200;
    const totalDuration = scrambleDuration;

    timerRef.current = setTimeout(() => {
      startRef.current = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startRef.current;
        const progress = Math.min(elapsed / totalDuration, 1);
        const settledChars = Math.floor(progress * word.length);

        let result = "";
        for (let i = 0; i < word.length; i++) {
          if (i < settledChars) {
            result += word[i];
          } else {
            result += getRandomChar();
          }
        }
        setDisplayText(result);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayText(word);
          setSettled(true);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, word, delay]);

  return (
    <span
      className="inline-block"
      style={{
        opacity: visible ? (settled || displayText ? 1 : 0) : 0,
        transform: visible && displayText ? "translateY(0)" : "translateY(40px)",
        transition: "transform 400ms ease-out, opacity 200ms ease-out",
        color: settled ? "#ffffff" : "rgba(255,255,255,0.9)",
        fontFamily: "'JetBrains Mono', monospace",
        marginRight: "0.25em",
      }}
    >
      {displayText || "\u00A0"}
    </span>
  );
}

interface HeroSectionProps {
  visible: boolean;
}

export default function HeroSection({ visible }: HeroSectionProps) {
  const [sublineIndex, setSublineIndex] = useState(0);
  const [sublineStarted, setSublineStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;

    // Start subline after headline words settle
    const headlineSettleTime = HEADLINE_WORDS.length * 150 + 400;
    timerRef.current = setTimeout(() => {
      setSublineStarted(true);
    }, headlineSettleTime);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (!sublineStarted) return;
    if (sublineIndex >= SUBHEADLINE.length) return;

    timerRef.current = setTimeout(() => {
      setSublineIndex((i) => i + 1);
    }, 25);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sublineStarted, sublineIndex]);

  const sublineText = SUBHEADLINE.slice(0, sublineIndex);
  const showSublineCursor = sublineStarted && sublineIndex < SUBHEADLINE.length;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center grid-bg"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
      }}
    >
      {/* Purple gradient background orb */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(110,20,212,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-8"
        style={{
          borderColor: "rgba(110,20,212,0.5)",
          background: "rgba(110,20,212,0.08)",
          color: "#a78bfa",
          opacity: visible ? 1 : 0,
          transition: "opacity 600ms ease-out 200ms",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: "#22C55E",
            boxShadow: "0 0 6px #22C55E",
            animation: "glowPulse 2s ease-in-out infinite",
          }}
        />
        IBM watsonx · GraphSAGE GNN · MCP Integration
      </div>

      {/* Headline */}
      <h1
        className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6"
        style={{ letterSpacing: "-0.02em" }}
      >
        {HEADLINE_WORDS.map((word, i) => (
          <ScrambleWord
            key={word + i}
            word={word}
            delay={i * 150}
            visible={visible}
          />
        ))}
      </h1>

      {/* Subheadline */}
      <p
        className="text-lg md:text-xl max-w-2xl font-mono leading-relaxed"
        style={{
          color: "rgba(255,255,255,0.6)",
          minHeight: "3rem",
          opacity: sublineStarted ? 1 : 0,
          transition: "opacity 300ms ease-out",
        }}
      >
        {sublineText}
        {showSublineCursor && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: "1em",
              background: "#6E14D4",
              marginLeft: 2,
              verticalAlign: "middle",
              animation: "cursorBlink 500ms step-end infinite",
            }}
          />
        )}
      </p>

      {/* CTA Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-4 mt-10"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 600ms ease-out 1000ms",
        }}
      >
        <button
          className="px-8 py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200"
          style={{
            background: "#6E14D4",
            color: "#fff",
            boxShadow: "0 0 20px rgba(110,20,212,0.4)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 32px rgba(110,20,212,0.7), 0 0 60px rgba(110,20,212,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 20px rgba(110,20,212,0.4)";
          }}
        >
          Start Building →
        </button>
        <button
          className="px-8 py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 border"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.8)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(110,20,212,0.6)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(255,255,255,0.15)";
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(255,255,255,0.8)";
          }}
        >
          View Docs
        </button>
      </div>

      {/* Stats strip */}
      <div
        className="flex gap-10 mt-16 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 600ms ease-out 1400ms",
        }}
      >
        {[
          { value: "99.97%", label: "Uptime SLA" },
          { value: "< 120ms", label: "Latency P99" },
          { value: "AUC 0.94", label: "GNN Accuracy" },
          { value: "180+", label: "Countries" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-1">
            <span
              className="text-2xl font-black font-mono"
              style={{ color: "#6E14D4" }}
            >
              {value}
            </span>
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{
          opacity: visible ? 0.4 : 0,
          transition: "opacity 600ms ease-out 2000ms",
        }}
      >
        <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 40,
            background:
              "linear-gradient(to bottom, rgba(110,20,212,0.8), transparent)",
          }}
        />
      </div>
    </section>
  );
}
