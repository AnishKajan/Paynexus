import type { Metadata } from "next";
import OnboardingWizard from "./OnboardingWizard";

export const metadata: Metadata = {
    title: "Onboarding — Paynexus",
    description:
        "Complete your business verification to start accepting payments with Paynexus.",
};

export default function OnboardingPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
            {/* ── Background layers ─────────────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(110,20,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(110,20,212,0.04) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(110,20,212,0.12) 0%, transparent 70%)",
                }}
            />

            {/* ── Card ──────────────────────────────────────────────── */}
            <div
                className="relative z-10 w-full max-w-2xl rounded-2xl p-8 md:p-10"
                style={{
                    background: "#0d0d0d",
                    border: "1px solid rgba(110,20,212,0.15)",
                    boxShadow:
                        "0 0 100px rgba(110,20,212,0.06), 0 32px 80px rgba(0,0,0,0.5)",
                }}
            >
                <OnboardingWizard />
            </div>

            {/* ── Footer strip ──────────────────────────────────────── */}
            <p
                className="absolute bottom-6 text-xs font-mono"
                style={{ color: "rgba(255,255,255,0.18)" }}
            >
                Built with IBM watsonx · GraphSAGE GNN · MCP Protocol ·{" "}
                <span style={{ color: "rgba(110,20,212,0.6)" }}>IBM Hackathon 2026</span>
            </p>
        </div>
    );
}
