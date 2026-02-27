import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
    title: "Sign in — Paynexus",
    description:
        "Sign in to the Paynexus Console. Manage payments, compliance, and API keys.",
};

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            {/* ── Background layers ─────────────────────────────────── */}
            {/* Grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(110,20,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(110,20,212,0.06) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
            {/* Radial glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(110,20,212,0.14) 0%, transparent 70%)",
                }}
            />

            {/* ── Card ──────────────────────────────────────────────── */}
            <div
                className="relative z-10 w-full max-w-[420px] rounded-2xl p-8 md:p-10"
                style={{
                    background: "#0d0d0d",
                    border: "1px solid rgba(110,20,212,0.2)",
                    boxShadow:
                        "0 0 80px rgba(110,20,212,0.08), 0 24px 64px rgba(0,0,0,0.6)",
                }}
            >
                {/* Logo + heading */}
                <div className="flex flex-col items-center text-center mb-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/Paynexus-logo.svg"
                        alt="Paynexus"
                        width={36}
                        height={36}
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 0 18px rgba(110,20,212,0.55)",
                        }}
                    />
                    <h1
                        className="mt-4 text-2xl font-black tracking-tight"
                        style={{ letterSpacing: "-0.02em" }}
                    >
                        Sign in to{" "}
                        <span style={{ color: "#6E14D4" }}>Paynexus</span>
                    </h1>
                    <p
                        className="mt-2 text-sm"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                        Enter your email to receive a magic code.
                    </p>
                </div>

                {/* Client form */}
                <LoginForm />
            </div>

            {/* ── Footer strip ──────────────────────────────────────── */}
            <p
                className="absolute bottom-6 text-xs font-mono"
                style={{ color: "rgba(255,255,255,0.18)" }}
            >
                Built with IBM watsonx · GraphSAGE GNN · MCP Protocol ·{" "}
                <span style={{ color: "rgba(110,20,212,0.6)" }}>
                    IBM Hackathon 2026
                </span>
            </p>
        </div>
    );
}
