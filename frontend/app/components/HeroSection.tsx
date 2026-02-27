"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "!@#$%^&*<>?/|{}[]";
const HEADLINE_WORDS = [
  "Payment",
  "infrastructure",
  "for",
  "the",
  "AI",
  "era.",
];
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

  useEffect(() => {
    if (!visible) return;

    // Wait for the word's staggered entrance
    timerRef.current = setTimeout(() => {
      let cycleCount = 0;
      const totalCycles = 5; // 5 cycles * 40ms = 200ms total

      const cycle = () => {
        if (cycleCount < totalCycles) {
          // Rapidly cycle through random characters for each position
          let scrambled = "";
          for (let i = 0; i < word.length; i++) {
            scrambled += getRandomChar();
          }
          setDisplayText(scrambled);
          cycleCount++;
          timerRef.current = setTimeout(cycle, 40);
        } else {
          setDisplayText(word);
          setSettled(true);
        }
      };

      cycle();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, word, delay]);

  return (
    <span
      className="inline-block"
      style={{
        opacity: visible && displayText ? 1 : 0,
        transform:
          visible && displayText ? "translateY(0)" : "translateY(40px)",
        transition: "transform 400ms ease-out, opacity 200ms ease-out",
        fontFamily: "inherit",
        marginRight: "12px",
      }}
    >
      {displayText || word}
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

    // Start subline after headline words start appearing
    const headlineStartTime = HEADLINE_WORDS.length * 150 + 200;
    timerRef.current = setTimeout(() => {
      setSublineStarted(true);
    }, headlineStartTime);

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
  const isTyping = sublineStarted && sublineIndex < SUBHEADLINE.length;
  const isFinished = sublineIndex >= SUBHEADLINE.length;

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
        {isTyping && (
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
        <a
          href="https://paynexus-docs.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 border inline-block"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.8)",
            background: "transparent",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "rgba(110,20,212,0.6)";
            (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "rgba(255,255,255,0.15)";
            (e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(255,255,255,0.8)";
          }}
        >
          View Docs
        </a>
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
