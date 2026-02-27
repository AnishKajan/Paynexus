"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// ─── Google logo SVG ──────────────────────────────────────────────────────────
function GoogleLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48">
            <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
                fill="#FBBC05"
                d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"
            />
            <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
        </svg>
    );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            style={{ display: "inline-block" }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
                strokeDashoffset="10"
            />
        </svg>
    );
}

type Mode = "login" | "signup";
type Step = "email" | "otp";

interface AuthFormProps {
    initialMode: Mode;
}

export default function AuthForm({ initialMode }: AuthFormProps) {
    const router = useRouter();

    // State
    const [mode, setMode] = useState<Mode>(initialMode);
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Session check on mount ──────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                router.replace("/dashboard");
            } else {
                setSessionChecked(true);
            }
        });
    }, [router]);

    // ── Cooldown timer ──────────────────────────────────────────────────────────
    const startCooldown = useCallback((seconds: number) => {
        setResendCooldown(seconds);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownRef.current) clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
        };
    }, []);

    // ── Send OTP ────────────────────────────────────────────────────────────────
    const handleSendCode = async () => {
        setError("");

        // Requirements for Signup
        if (mode === "signup" && !agreedToTerms) {
            setError("You must agree to the Terms of Service and Privacy Policy.");
            return;
        }

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        const { error: authError } = await supabase.auth.signInWithOtp({
            email: email.trim(),
        });
        setLoading(false);

        if (authError) {
            setError(authError.message);
            return;
        }

        setStep("otp");
        startCooldown(60);
        // Focus first OTP box after transition
        setTimeout(() => otpRefs.current[0]?.focus(), 350);
    };

    // ── Resend code ─────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setError("");
        setOtp(["", "", "", "", "", ""]);
        setLoading(true);
        const { error: authError } = await supabase.auth.signInWithOtp({
            email: email.trim(),
        });
        setLoading(false);

        if (authError) {
            setError(authError.message);
            return;
        }
        startCooldown(60);
    };

    // ── Verify OTP ──────────────────────────────────────────────────────────────
    const verifyOtp = async (code: string) => {
        setError("");
        setLoading(true);
        const { error: authError } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: code,
            type: "email",
        });
        setLoading(false);

        if (authError) {
            setError(authError.message);
            return;
        }
        router.replace("/dashboard");
    };

    // ── OTP input change ───────────────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        // Handle paste of full code
        if (value.length > 1) {
            const digits = value.replace(/\D/g, "").slice(0, 6).split("");
            const newOtp = [...otp];
            digits.forEach((d, i) => {
                if (index + i < 6) newOtp[index + i] = d;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + digits.length, 5);
            otpRefs.current[nextIndex]?.focus();
            if (newOtp.every((d) => d !== "")) {
                verifyOtp(newOtp.join(""));
            }
            return;
        }

        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all 6 digits filled
        if (value && newOtp.every((d) => d !== "")) {
            verifyOtp(newOtp.join(""));
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // ── Google OAuth ────────────────────────────────────────────────────────────
    const handleGoogle = async () => {
        if (mode === "signup" && !agreedToTerms) {
            setError("You must agree to the Terms of Service and Privacy Policy.");
            return;
        }
        setError("");
        setGoogleLoading(true);
        const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (authError) {
            setError(authError.message);
            setGoogleLoading(false);
        }
    };

    // ── Back to email ───────────────────────────────────────────────────────────
    const handleBack = () => {
        setStep("email");
        setOtp(["", "", "", "", "", ""]);
        setError("");
    };

    // ── Toggle mode ─────────────────────────────────────────────────────────────
    const toggleMode = () => {
        const newMode = mode === "login" ? "signup" : "login";
        setMode(newMode);
        setError("");
        // Update URL without reload to reflect change
        window.history.pushState(null, "", `/${newMode}`);
    };

    // Don't render until session check completes
    if (!sessionChecked) {
        return (
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
        );
    }

    // ─── Shared styles ──────────────────────────────────────────────────────────
    const inputStyle: React.CSSProperties = {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(148,163,184,0.18)",
        color: "#fff",
        outline: "none",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
    };

    const inputFocusStyle: React.CSSProperties = {
        borderColor: "rgba(110,20,212,0.6)",
        boxShadow: "0 0 0 3px rgba(110,20,212,0.12)",
    };

    // ─── Content config based on mode ───────────────────────────────────────────
    const content = {
        login: {
            title: "Welcome back",
            subtitle: "Log in to your dashboard",
            buttonText: "Send Code →",
            togglePrompt: "Don't have an account?",
            toggleLink: "Sign up",
        },
        signup: {
            title: "Create your Paynexus account",
            subtitle: "Start building",
            buttonText: "Start Building →",
            togglePrompt: "Already have an account?",
            toggleLink: "Log in",
        },
    }[mode];

    return (
        <div className="relative">
            {/* ── STEP 1: Email ────────────────────────────────────────────────── */}
            <div
                className="transition-all duration-300"
                style={{
                    display: step === "email" ? "block" : "none",
                    animation: step === "email" ? "fadeUpIn 400ms ease-out" : "none",
                }}
            >
                <div className="flex flex-col items-center text-center mb-8">
                    {/* Logo */}
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
                    <h1 className="mt-4 text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                        {content.title}
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {content.subtitle}
                    </p>
                </div>

                {/* Email field */}
                <label
                    className="block text-xs font-mono uppercase tracking-widest mb-2"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    htmlFor="auth-email"
                >
                    Email address
                </label>
                <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendCode();
                    }}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-lg text-sm font-mono placeholder:text-white/20"
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(148,163,184,0.18)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                    autoComplete="email"
                    disabled={loading}
                />

                {/* Terms checkbox (only for signup) */}
                {mode === "signup" && (
                    <label className="flex items-start gap-3 mt-4 cursor-pointer select-none" htmlFor="terms-checkbox">
                        <div className="relative mt-0.5 flex-shrink-0">
                            <input
                                id="terms-checkbox"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => {
                                    setAgreedToTerms(e.target.checked);
                                    if (e.target.checked) setError("");
                                }}
                                className="sr-only peer"
                            />
                            <div
                                className="w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center"
                                style={{
                                    borderColor: agreedToTerms ? "#6E14D4" : "rgba(148,163,184,0.3)",
                                    background: agreedToTerms ? "rgba(110,20,212,0.15)" : "rgba(255,255,255,0.03)",
                                }}
                            >
                                {agreedToTerms && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5L4 7L8 3" stroke="#6E14D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                            I agree to the <span className="text-white font-semibold underline underline-offset-2 decoration-purple-500/30">Terms of Service</span> and <span className="text-white font-semibold underline underline-offset-2 decoration-purple-500/30">Privacy Policy</span>
                        </span>
                    </label>
                )}

                {/* Submit button */}
                <button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full mt-6 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                        background: loading ? "rgba(110,20,212,0.6)" : "#6E14D4",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(110,20,212,0.3)",
                        cursor: loading ? "wait" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.boxShadow = "0 0 36px rgba(110,20,212,0.6)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(110,20,212,0.3)";
                    }}
                >
                    {loading ? <><Spinner /> Sending…</> : content.buttonText}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>or</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                </div>

                {/* Google OAuth */}
                <button
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="w-full py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-3 hover:glow-purple"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(148,163,184,0.18)",
                        color: "rgba(255,255,255,0.75)",
                        cursor: googleLoading ? "wait" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(110,20,212,0.5)";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.background = "rgba(110,20,212,0.06)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(148,163,184,0.18)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }}
                >
                    {googleLoading ? <Spinner /> : <><GoogleLogo /> Continue with Google</>}
                </button>

                {/* Toggle Mode */}
                <p className="mt-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {content.togglePrompt}{" "}
                    <button
                        onClick={toggleMode}
                        className="font-semibold transition-colors duration-200 hover:text-purple-400"
                        style={{ color: "#6E14D4" }}
                    >
                        {content.toggleLink}
                    </button>
                </p>
            </div>

            {/* ── STEP 2: OTP ──────────────────────────────────────────────────── */}
            <div
                style={{
                    display: step === "otp" ? "block" : "none",
                    animation: step === "otp" ? "fadeUpIn 400ms ease-out" : "none",
                }}
            >
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-xs font-mono mb-5 transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                >
                    ← Back
                </button>

                <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Enter the 6-digit code sent to
                </p>
                <p className="text-sm font-mono font-semibold mb-6" style={{ color: "#6E14D4" }}>
                    {email}
                </p>

                {/* 6 digit boxes */}
                <div className="flex gap-2.5 justify-center mb-6">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { otpRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={i === 0 ? 6 : 1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            onFocus={(e) => {
                                e.currentTarget.select();
                                Object.assign(e.currentTarget.style, inputFocusStyle);
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "rgba(148,163,184,0.18)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                            className="w-12 h-14 rounded-lg text-center text-xl font-mono font-bold"
                            style={inputStyle}
                            disabled={loading}
                            autoComplete={i === 0 ? "one-time-code" : "off"}
                        />
                    ))}
                </div>

                {/* Verify button */}
                <button
                    onClick={() => verifyOtp(otp.join(""))}
                    disabled={loading || otp.some((d) => !d)}
                    className="w-full py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                        background: loading || otp.some((d) => !d) ? "rgba(110,20,212,0.4)" : "#6E14D4",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(110,20,212,0.3)",
                        cursor: loading || otp.some((d) => !d) ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                        if (!loading && otp.every((d) => d)) e.currentTarget.style.boxShadow = "0 0 36px rgba(110,20,212,0.6)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(110,20,212,0.3)";
                    }}
                >
                    {loading ? <><Spinner /> Verifying…</> : "Verify"}
                </button>

                {/* Resend */}
                <div className="mt-4 text-center">
                    {resendCooldown > 0 ? (
                        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                            Resend code in {resendCooldown}s
                        </span>
                    ) : (
                        <button
                            onClick={handleResend}
                            className="text-xs font-mono transition-colors duration-200 hover:text-purple-400"
                            style={{ color: "rgba(110,20,212,0.7)" }}
                        >
                            Resend code
                        </button>
                    )}
                </div>
            </div>

            {/* ── Error display ──────────────────────────────────────────────────── */}
            {error && (
                <div className="absolute left-0 right-0 -bottom-10 pointer-events-none">
                    <p
                        className="text-xs font-mono text-center px-2"
                        style={{
                            color: "#ef4444",
                            animation: "fadeUpIn 200ms ease-out",
                        }}
                    >
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}
