"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Supabase browser client automatically detects the auth tokens
        // in the URL hash fragment and exchanges them for a session.
        // We just need to listen for the session to appear.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === "SIGNED_IN" && session) {
                    router.replace("/dashboard");
                }
                if (event === "TOKEN_REFRESHED" && session) {
                    router.replace("/dashboard");
                }
            }
        );

        // Fallback: if session already exists (fast redirect), go to dashboard
        supabase.auth.getSession().then(({ data, error: sessionError }) => {
            if (sessionError) {
                setError(sessionError.message);
                return;
            }
            if (data.session) {
                router.replace("/dashboard");
            }
        });

        // Timeout fallback: if nothing happens after 10s, show error
        const timeout = setTimeout(() => {
            setError("Authentication timed out. Please try again.");
        }, 10000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
            <div className="text-center">
                {error ? (
                    <>
                        <p className="text-sm text-red-400 font-mono">{error}</p>
                        <button
                            onClick={() => router.replace("/login")}
                            className="mt-4 text-xs font-mono px-4 py-2 rounded-lg"
                            style={{ color: "#a855f7", border: "1px solid rgba(110,20,212,0.3)" }}
                        >
                            Back to login
                        </button>
                    </>
                ) : (
                    <>
                        <svg className="animate-spin h-6 w-6 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#6E14D4" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" strokeDashoffset="10" />
                        </svg>
                        <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Completing sign-in…
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
