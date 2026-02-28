"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UserProfileMenu from "../components/UserProfileMenu";

function Spinner() {
    return (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" strokeDashoffset="10" />
        </svg>
    );
}

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: "◉" },
    { label: "Transactions", href: "/dashboard/transactions", icon: "⇄" },
    { label: "Compliance", href: "/dashboard/compliance", icon: "◈" },
    { label: "MoR", href: "/dashboard/mor", icon: "⚖" },
    { label: "Risk", href: "/dashboard/risk", icon: "⚠" },
    { label: "API Keys", href: "/dashboard/api-keys", icon: "⚿" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            if (!data.session) {
                router.replace("/login");
            } else {
                // Check if user has an organization
                const { data: orgs } = await supabase
                    .from("organizations")
                    .select("id")
                    .limit(1);

                if (!orgs || orgs.length === 0) {
                    router.replace("/onboarding");
                    return;
                }

                setUserEmail(data.session.user.email ?? "user");
                setLoading(false);
            }
        });
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#030303" }}>
                <div className="flex flex-col items-center gap-3">
                    <Spinner />
                    <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Loading…</p>
                </div>
            </div>
        );
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace("/login");
    };

    return (
        <div className="min-h-screen flex" style={{ background: "#030303" }}>
            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <aside
                className="hidden lg:flex flex-col w-64 min-h-screen p-5 shrink-0 fixed top-0 left-0 h-full z-10"
                style={{
                    background: "rgba(13,13,13,0.98)",
                    borderRight: "1px solid rgba(110,20,212,0.1)",
                }}
            >
                {/* Logo */}
                <a href="/" className="flex items-center gap-3 mb-10">
                    <img src="/Paynexus-logo.svg" alt="Paynexus" width={28} height={28}
                        style={{ borderRadius: 6, boxShadow: "0 0 14px rgba(110,20,212,0.5)" }} />
                    <span className="text-sm font-black tracking-tight">PAYNEXUS</span>
                </a>

                {/* Nav */}
                <nav className="flex flex-col gap-0.5">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left"
                                style={{
                                    background: active ? "rgba(110,20,212,0.12)" : "transparent",
                                    color: active ? "#a855f7" : "rgba(255,255,255,0.4)",
                                    border: active ? "1px solid rgba(110,20,212,0.2)" : "1px solid transparent",
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                                        e.currentTarget.style.background = "transparent";
                                    }
                                }}
                            >
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* User / Settings / Sign out */}
                <div className="mt-auto pt-6" style={{ borderTop: "1px solid rgba(55,65,81,0.3)" }}>
                    <UserProfileMenu email={userEmail} onSignOut={handleSignOut} />
                </div>
            </aside>

            {/* ── Page Content (offset for sidebar) ────────────────────────────── */}
            <div className="flex-1 lg:ml-64 min-h-screen">
                {children}
            </div>
        </div>
    );
}
