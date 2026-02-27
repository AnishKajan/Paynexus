"use client";

import { useCallback, useEffect, useState } from "react";
import BootSequence from "./components/BootSequence";
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import FeaturesSection from "./components/FeaturesSection";
import ComplianceRiskDashboard from "./components/ComplianceRiskDashboard";
import HowItWorks from "./components/HowItWorks";
import CTASection from "./components/CTASection";
import CountUp from "./components/CountUp";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";

const BOOT_SESSION_KEY = "paynexus_boot_played";

export default function HomePage() {
  const [bootDone, setBootDone] = useState(false);
  const [showBoot, setShowBoot] = useState(false);

  useEffect(() => {
    // Check if boot has already played this session
    const played = sessionStorage.getItem(BOOT_SESSION_KEY);
    if (played) {
      setBootDone(true);
    } else {
      setShowBoot(true);
    }
  }, []);

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");
    setBootDone(true);
    setShowBoot(false);
  }, []);

  return (
    <>
      {/* Boot sequence — plays once per session */}
      {showBoot && <BootSequence onComplete={handleBootComplete} />}

      {/* Main content — shown after boot or if boot already played */}
      <div
        style={{
          opacity: bootDone ? 1 : 0,
          transition: "opacity 600ms ease-out",
          pointerEvents: bootDone ? "auto" : "none",
        }}
      >
        <Navbar />

        <main>
          {/* Hero */}
          <HeroSection visible={bootDone} />

          {/* Stats Bar */}
          <section className="py-12 border-y border-[rgba(255,255,255,0.06)] bg-[rgba(110,20,212,0.02)]">
            <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-between gap-8 text-center">
              {[
                { target: 10, suffix: " min", label: "to first payment" },
                { target: 94, suffix: "%", label: "GNN accuracy" },
                { target: 5, suffix: "x", label: "faster than Stripe setup" },
                { target: 3, label: "IBM AI models integrated" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-3xl font-black font-mono text-[#6E14D4]">
                    <CountUp target={stat.target} suffix={stat.suffix} />
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[rgba(255,255,255,0.4)]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Features bento */}
          <FeaturesSection />

          {/* Compliance GNN Dashboard */}
          <section className="py-32 px-6 relative">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(110,20,212,0.06) 0%, transparent 70%)",
              }}
            />
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border mb-6"
                  style={{
                    borderColor: "rgba(110,20,212,0.3)",
                    color: "rgba(110,20,212,0.9)",
                    background: "rgba(110,20,212,0.06)",
                  }}
                >
                  Compliance Intelligence
                </span>
                <h2
                  className="text-4xl md:text-5xl font-black tracking-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  GNN-powered risk{" "}
                  <span style={{ color: "#6E14D4" }}>on every transaction.</span>
                </h2>
                <p
                  className="mt-4 text-base max-w-xl mx-auto"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  GraphSAGE trained on IBM AML dataset. Runs at inference time.
                  Not post-hoc.
                </p>
              </div>
              <ComplianceRiskDashboard />
            </div>
          </section>

          {/* How It Works */}
          <HowItWorks />

          {/* CTA */}
          <CTASection />
        </main>

        {/* Footer */}
        <footer
          className="py-10 px-6 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Paynexus-logo.svg"
                alt="Paynexus"
                width={20}
                height={20}
                style={{ borderRadius: 4 }}
              />
              <span className="font-black text-xs tracking-widest uppercase">
                Paynexus
              </span>
            </div>
            <p
              className="text-xs font-mono"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Built with IBM watsonx · GraphSAGE GNN · MCP Protocol ·{" "}
              <span style={{ color: "rgba(110,20,212,0.7)" }}>
                IBM Hackathon 2026
              </span>
            </p>
            <div className="flex gap-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {["Privacy", "Terms", "Security", "Status"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="transition-colors duration-200 hover:text-white"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
