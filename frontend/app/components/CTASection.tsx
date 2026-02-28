"use client";

import { useEffect, useRef, useState } from "react";
import LiveTerminal from "./LiveTerminal";
import MagneticWrapper from "./MagneticWrapper";

export default function CTASection() {
  const [visible, setVisible] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedKey, setRevealedKey] = useState("");
  const fullKey = "•••••••••••••6f2a"; // Simplified for the demo, or use actual
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isRevealing) {
      setRevealedKey("");
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setRevealedKey(fullKey.slice(0, i + 1));
      i++;
      if (i >= fullKey.length) clearInterval(interval);
    }, 25);

    return () => clearInterval(interval);
  }, [isRevealing]);

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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6 relative">
      {/* Purple glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(110,20,212,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-2xl p-10 md:p-16 relative overflow-hidden glow-breath-strong"
          style={{
            background: "#0D0D0D",
            border: "1px solid rgba(110,20,212,0.25)",
            boxShadow: "0 0 80px rgba(110,20,212,0.1)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out",
          }}
        >
          {/* Corner accent */}
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(110,20,212,0.15) 0%, transparent 70%)",
            }}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-12">
            {/* Left: copy */}
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-6"
                style={{
                  borderColor: "rgba(110,20,212,0.4)",
                  background: "rgba(110,20,212,0.08)",
                  color: "#a78bfa",
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
                Live demo · all systems operational
              </div>

              <h2
                className="text-3xl md:text-4xl font-black tracking-tight mb-4"
                style={{ letterSpacing: "-0.02em" }}
              >
                Payments that move{" "}
                <span style={{ color: "#6E14D4" }}>as fast as AI.</span>
              </h2>

              <p
                className="text-base leading-relaxed mb-8 max-w-md"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Start with the MCP integration. Your AI agents can process
                global payments, run compliance scans, and manage billing — all
                programmatically.
              </p>

              {/* Key reveal */}
              <div
                className="rounded-lg px-4 py-3 font-mono text-sm flex items-center gap-3 mb-6 min-h-[50px]"
                style={{
                  background: "#000",
                  border: "1px solid rgba(110,20,212,0.2)",
                  boxShadow: isRevealing
                    ? "0 0 15px rgba(34, 197, 94, 0.1)"
                    : "none",
                  transition: "box-shadow 300ms ease",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.3)" }}>sk_live</span>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>_</span>
                {isRevealing ? (
                  <span style={{ color: "#22C55E" }}>{revealedKey}</span>
                ) : (
                  <span style={{ color: "rgba(255,255,255,0.1)" }}>
                    •••••••••••••6f2a
                  </span>
                )}
                <button
                  onClick={() => setIsRevealing(!isRevealing)}
                  className="ml-auto text-xs px-2 py-1 rounded transition-all duration-200 uppercase tracking-tighter"
                  style={{
                    background: "rgba(110,20,212,0.12)",
                    color: "#6E14D4",
                    border: "1px solid rgba(110,20,212,0.25)",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(110,20,212,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(110,20,212,0.12)";
                  }}
                >
                  {isRevealing ? "Hide" : "Reveal"}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticWrapper strength={20}>
                  <button
                    className="px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 w-full sm:w-auto btn-glow-breath"
                    style={{
                      background: "#6E14D4",
                      color: "#fff",
                      boxShadow: "0 0 20px rgba(110,20,212,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 40px rgba(110,20,212,0.6)";
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 20px rgba(110,20,212,0.3)";
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    Create Free Account →
                  </button>
                </MagneticWrapper>
                <MagneticWrapper strength={15}>
                  <a
                    href="https://paynexus-docs.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-lg font-bold text-sm border transition-all duration-300 w-full sm:w-auto text-center btn-glow-breath-white"
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      background: "rgba(255,255,255,0.03)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "#fff";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "rgba(110,20,212,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "rgba(255,255,255,0.8)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "rgba(255,255,255,0.03)";
                    }}
                  >
                    Read MCP Docs
                  </a>
                </MagneticWrapper>
              </div>
            </div>

            {/* Right: live terminal */}
            <div
              className="flex-shrink-0"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 600ms ease-out 400ms",
              }}
            >
              <LiveTerminal />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
