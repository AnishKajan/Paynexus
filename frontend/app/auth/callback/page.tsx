"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let redirected = false;

        const redirectToDashboard = async () => {
            if (!redirected) {
                redirected = true;

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.replace("/login");
                    return;
                }

                // Route based on whether the user has completed onboarding
                const onboarded = session.user.user_metadata?.onboarded;
                router.replace(onboarded ? "/dashboard" : "/onboarding");
            }
        };

        // 1. Listen for auth state changes (covers the implicit/hash flow).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
                    redirectToDashboard();
                }
            }
        );

        // 2. Handle the PKCE flow: Supabase redirects back with ?code=...
        //    Exchange the code for a session explicitly, then redirect.
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
            supabase.auth.exchangeCodeForSession(code)
                .then(({ error: exchangeError }) => {
                    if (exchangeError) {
                        setError(exchangeError.message);
                    } else {
                        redirectToDashboard();
                    }
                });
        } else {
            // 3. Fallback: check if there's already a valid session
            //    (covers fast redirects where auth state fires before listener attaches).
            supabase.auth.getSession().then(({ data, error: sessionError }) => {
                if (sessionError) {
                    setError(sessionError.message);
                    return;
                }
                if (data.session) {
                    redirectToDashboard();
                }
            });
        }

        // 4. Timeout: if nothing resolves after 12s, surface an error.
        const timeout = setTimeout(() => {
            if (!redirected) {
                setError("Authentication timed out. Please try again.");
            }
        }, 12000);

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
