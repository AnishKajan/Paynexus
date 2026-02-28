"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import HulyButton from "../components/HulyButton";

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 4 }: { size?: number }) {
    return (
        <svg className={`animate-spin h-${size} w-${size}`} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block" }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" strokeDashoffset="10" />
        </svg>
    );
}

// ─── Step Icons ───────────────────────────────────────────────────────────────
function BuildingIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M9 22V12h6v10" />
            <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

function BankIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
    legalName: string;
    dbaName: string;
    country: string;
    stateProvince: string;
    taxId: string;
    routingNumber: string;
    accountNumber: string;
    certifyAccurate: boolean;
    agreeMerchant: boolean;
}

const STEPS = [
    { label: "Business Profile", icon: BuildingIcon },
    { label: "Identity", icon: ShieldIcon },
    { label: "Payout", icon: BankIcon },
    { label: "Review", icon: CheckCircleIcon },
];

const COUNTRIES = [
    "United States", "Canada", "United Kingdom", "Germany", "France",
    "Australia", "Japan", "Singapore", "India", "Brazil", "Mexico",
    "Netherlands", "Sweden", "Switzerland", "Ireland",
];

const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming", "District of Columbia",
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
    background: "rgba(15, 23, 42, 0.92)",
    border: "1px solid rgba(55, 65, 81, 0.9)",
    color: "#e2e8f0",
    outline: "none",
    transition: "border-color 250ms ease, box-shadow 250ms ease",
};

const inputFocusBorder = "rgba(110,20,212,0.7)";
const inputFocusShadow = "0 0 0 3px rgba(110,20,212,0.15), 0 0 20px rgba(110,20,212,0.08)";

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = inputFocusBorder;
    e.currentTarget.style.boxShadow = inputFocusShadow;
}
function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "rgba(55, 65, 81, 0.9)";
    e.currentTarget.style.boxShadow = "none";
}

// ─── Input component ──────────────────────────────────────────────────────────
function Field({
    label, id, placeholder, value, onChange, type = "text", disabled = false,
}: {
    label: string; id: string; placeholder: string; value: string;
    onChange: (v: string) => void; type?: string; disabled?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.45)" }} htmlFor={id}>
                {label}
            </label>
            <input
                id={id} type={type} value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-lg text-sm placeholder:text-white/15"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
            />
        </div>
    );
}

// ─── Checkbox component ───────────────────────────────────────────────────────
function Checkbox({
    id, checked, onChange, label,
}: {
    id: string; checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
    return (
        <label className="flex items-start gap-3 cursor-pointer select-none group" htmlFor={id}>
            <div className="relative mt-0.5 flex-shrink-0">
                <input
                    id={id} type="checkbox" checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <div
                    className="w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center"
                    style={{
                        borderColor: checked ? "#6E14D4" : "rgba(55, 65, 81, 0.9)",
                        background: checked ? "rgba(110,20,212,0.2)" : "rgba(15, 23, 42, 0.92)",
                        boxShadow: checked ? "0 0 12px rgba(110,20,212,0.3)" : "none",
                    }}
                >
                    {checked && (
                        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{ animation: "scaleIn 150ms ease-out" }}>
                            <path d="M2 5L4 7L8 3" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </div>
            <span className="text-sm leading-relaxed group-hover:text-white/80 transition-colors" style={{ color: "rgba(255,255,255,0.55)" }}>
                {label}
            </span>
        </label>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function OnboardingWizard() {
    const router = useRouter();
    const [sessionChecked, setSessionChecked] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState<"left" | "right">("left");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState<FormData>({
        legalName: "", dbaName: "", country: "", stateProvince: "",
        taxId: "", routingNumber: "", accountNumber: "",
        certifyAccurate: false, agreeMerchant: false,
    });

    const update = (key: keyof FormData, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError("");
    };

    // ── Session check ─────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
                router.replace("/login");
            } else {
                setSessionChecked(true);
            }
        });
    }, [router]);

    // ── Step validation ───────────────────────────────────────────────────────
    const validateStep = (): boolean => {
        switch (currentStep) {
            case 0: {
                if (!form.legalName.trim()) { setError("Legal Entity Name is required."); return false; }
                if (form.legalName.trim().length < 2) { setError("Legal Entity Name must be at least 2 characters."); return false; }
                if (!form.country) { setError("Please select a country."); return false; }
                if (form.country === "United States") {
                    if (!form.stateProvince) { setError("State is required for United States businesses."); return false; }
                    if (!US_STATES.includes(form.stateProvince)) { setError("Please select a valid US state."); return false; }
                } else {
                    if (!form.stateProvince.trim()) { setError("State / Province is required."); return false; }
                }
                return true;
            }
            case 1: {
                const digits = form.taxId.replace(/\D/g, "");
                if (!form.taxId.trim()) { setError("SSN or EIN is required."); return false; }
                if (digits.length !== 9) { setError("SSN must be 9 digits (XXX-XX-XXXX) or EIN must be 9 digits (XX-XXXXXXX)."); return false; }
                return true;
            }
            case 2: {
                const routingDigits = form.routingNumber.replace(/\D/g, "");
                const accountDigits = form.accountNumber.replace(/\D/g, "");
                if (!form.routingNumber.trim()) { setError("Routing number is required."); return false; }
                if (routingDigits.length !== 9) { setError("Routing number must be exactly 9 digits."); return false; }
                if (!form.accountNumber.trim()) { setError("Account number is required."); return false; }
                if (accountDigits.length < 4 || accountDigits.length > 17) { setError("Account number must be between 4 and 17 digits."); return false; }
                return true;
            }
            case 3:
                if (!form.certifyAccurate) { setError("You must certify that your information is accurate."); return false; }
                if (!form.agreeMerchant) { setError("You must agree to the Merchant Agreement."); return false; }
                return true;
            default: return true;
        }
    };

    // ── Navigation ────────────────────────────────────────────────────────────
    const goNext = () => {
        if (!validateStep()) return;
        setDirection("left");
        setCurrentStep((s) => Math.min(s + 1, 3));
    };

    const goBack = () => {
        setError("");
        setDirection("right");
        setCurrentStep((s) => Math.max(s - 1, 0));
    };

    // ── Submit (UI only — marks onboarding complete in localStorage) ─────────
    const handleSubmit = () => {
        if (!validateStep()) return;
        setLoading(true);
        setError("");
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                localStorage.setItem(`onboarded_${user.id}`, "true");
            }
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
                setTimeout(() => router.replace("/dashboard"), 2500);
            }, 800);
        });
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (!sessionChecked) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size={6} />
                <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Checking session…</p>
            </div>
        );
    }

    // ── Success state ─────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-6" style={{ animation: "fadeUpIn 500ms ease-out" }}>
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                        background: "rgba(34,197,94,0.12)",
                        border: "2px solid rgba(34,197,94,0.4)",
                        boxShadow: "0 0 40px rgba(34,197,94,0.2), 0 0 80px rgba(34,197,94,0.08)",
                        animation: "scaleIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Verification Complete</h2>
                    <p className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>Redirecting to dashboard…</p>
                </div>
                <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: "rgba(34,197,94,0.15)" }}>
                    <div className="h-full rounded-full" style={{ background: "#22c55e", animation: "progressFill 2s ease-out forwards" }} />
                </div>
            </div>
        );
    }

    // ── Slide animation ───────────────────────────────────────────────────────
    const slideAnim = direction === "left" ? "slideInFromRight 350ms ease-out" : "slideInFromLeft 350ms ease-out";

    return (
        <div>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col items-center text-center mb-8">
                <img
                    src="/Paynexus-logo.svg" alt="Paynexus" width={32} height={32}
                    style={{ borderRadius: 8, boxShadow: "0 0 18px rgba(110,20,212,0.55)" }}
                />
                <h1 className="mt-4 text-xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                    Complete Your <span style={{ color: "#6E14D4" }}>Verification</span>
                </h1>
                <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Step {currentStep + 1} of 4 — {STEPS[currentStep].label}
                </p>
            </div>

            {/* ── Step Indicator ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-center gap-0 mb-10 px-4">
                {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i === currentStep;
                    const isCompleted = i < currentStep;
                    return (
                        <div key={i} className="flex items-center">
                            {/* Node */}
                            <div className="flex flex-col items-center relative">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                                    style={{
                                        background: isCompleted ? "rgba(110,20,212,0.25)" : isActive ? "rgba(110,20,212,0.15)" : "rgba(15, 23, 42, 0.92)",
                                        border: `2px solid ${isCompleted ? "#6E14D4" : isActive ? "rgba(110,20,212,0.7)" : "rgba(55, 65, 81, 0.6)"}`,
                                        boxShadow: isActive ? "0 0 20px rgba(110,20,212,0.3), 0 0 40px rgba(110,20,212,0.1)" : isCompleted ? "0 0 12px rgba(110,20,212,0.2)" : "none",
                                        color: isCompleted || isActive ? "#a855f7" : "rgba(255,255,255,0.25)",
                                    }}
                                >
                                    {isCompleted ? (
                                        <svg width="16" height="16" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4 7L8 3" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <Icon />
                                    )}
                                </div>
                                <span
                                    className="absolute -bottom-5 text-[10px] font-mono whitespace-nowrap transition-colors duration-300"
                                    style={{ color: isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {/* Connector */}
                            {i < STEPS.length - 1 && (
                                <div className="w-16 md:w-24 h-0.5 mx-1 rounded-full overflow-hidden" style={{ background: "rgba(55, 65, 81, 0.5)" }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: i < currentStep ? "100%" : "0%",
                                            background: "linear-gradient(90deg, #6E14D4, #a855f7)",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Step Content ────────────────────────────────────────────────── */}
            <div className="min-h-[280px] relative overflow-hidden" key={currentStep} style={{ animation: slideAnim }}>

                {/* STEP 1: Business Profile */}
                {currentStep === 0 && (
                    <div className="space-y-5">
                        <Field label="Legal Entity Name" id="ob-legal" placeholder="Acme Corp, LLC" value={form.legalName} onChange={(v) => update("legalName", v)} />
                        <Field label="DBA (Doing Business As)" id="ob-dba" placeholder="Acme Payments" value={form.dbaName} onChange={(v) => update("dbaName", v)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.45)" }} htmlFor="ob-country">Country</label>
                                <select
                                    id="ob-country" value={form.country}
                                    onChange={(e) => update("country", e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg text-sm appearance-none cursor-pointer"
                                    style={{ ...inputStyle, color: form.country ? "#e2e8f0" : "rgba(255,255,255,0.15)" }}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                >
                                    <option value="" disabled>Select country</option>
                                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {form.country === "United States" ? (
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.45)" }} htmlFor="ob-state">State</label>
                                    <select
                                        id="ob-state" value={form.stateProvince}
                                        onChange={(e) => update("stateProvince", e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg text-sm appearance-none cursor-pointer"
                                        style={{ ...inputStyle, color: form.stateProvince ? "#e2e8f0" : "rgba(255,255,255,0.15)" }}
                                        onFocus={handleFocus} onBlur={handleBlur}
                                    >
                                        <option value="" disabled>Select state</option>
                                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <Field label="State / Province" id="ob-state" placeholder="e.g. Ontario, Bavaria" value={form.stateProvince} onChange={(v) => update("stateProvince", v)} />
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: Identity & Compliance */}
                {currentStep === 1 && (
                    <div className="space-y-5">
                        <div className="p-4 rounded-lg" style={{ background: "rgba(110,20,212,0.06)", border: "1px solid rgba(110,20,212,0.12)" }}>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                <span className="font-semibold text-purple-400">Format Required</span> — SSN must be 9 digits (e.g. 123-45-6789) or EIN 9 digits (e.g. 12-3456789).
                            </p>
                        </div>
                        <Field label="SSN / Employer Identification Number (Tax ID)" id="ob-taxid" placeholder="000-00-0000 or 12-3456789" value={form.taxId} onChange={(v) => update("taxId", v)} />
                    </div>
                )}

                {/* STEP 3: Payout Details */}
                {currentStep === 2 && (
                    <div className="space-y-5">
                        <div className="p-4 rounded-lg" style={{ background: "rgba(110,20,212,0.06)", border: "1px solid rgba(110,20,212,0.12)" }}>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                <span className="font-semibold text-purple-400">Format Required</span> — Routing: exactly 9 digits. Account: 4–17 digits.
                            </p>
                        </div>
                        <Field label="Bank Routing Number" id="ob-routing" placeholder="021000021" value={form.routingNumber} onChange={(v) => update("routingNumber", v)} />
                        <Field label="Bank Account Number" id="ob-account" placeholder="1234567890" value={form.accountNumber} onChange={(v) => update("accountNumber", v)} />
                    </div>
                )}

                {/* STEP 4: Review & Agreements */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(55, 65, 81, 0.5)" }}>
                            <div className="px-4 py-2.5" style={{ background: "rgba(110,20,212,0.08)" }}>
                                <p className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: "#a855f7" }}>Verification Summary</p>
                            </div>
                            <div className="p-4 space-y-3">
                                {[
                                    ["Business", form.legalName || "—", form.dbaName ? `DBA: ${form.dbaName}` : ""],
                                    ["Location", [form.stateProvince, form.country].filter(Boolean).join(", ") || "—"],
                                    ["Tax ID", form.taxId ? `••••${form.taxId.slice(-4)}` : "—"],
                                    ["Routing", form.routingNumber ? `••••${form.routingNumber.slice(-4)}` : "—"],
                                    ["Account", form.accountNumber ? `••••${form.accountNumber.slice(-4)}` : "—"],
                                ].map(([label, value, sub], i) => (
                                    <div key={i} className="flex items-start justify-between py-1.5" style={{ borderBottom: i < 4 ? "1px solid rgba(55,65,81,0.3)" : "none" }}>
                                        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-white/80">{value}</span>
                                            {sub && <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Agreements */}
                        <div className="space-y-4">
                            <Checkbox id="ob-certify" checked={form.certifyAccurate} onChange={(v) => update("certifyAccurate", v)}
                                label="I certify that all information provided is accurate and complete." />
                            <Checkbox id="ob-merchant" checked={form.agreeMerchant} onChange={(v) => update("agreeMerchant", v)}
                                label="I agree to the Paynexus Merchant Agreement and Payment Processing Terms." />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Error ──────────────────────────────────────────────────────── */}
            {error && (
                <div className="mt-4" style={{ animation: "fadeUpIn 200ms ease-out" }}>
                    <p className="text-xs font-mono text-center px-2" style={{ color: "#ef4444" }}>{error}</p>
                </div>
            )}

            {/* ── Navigation Buttons ─────────────────────────────────────────── */}
            <div className="flex justify-between mt-8 gap-4">
                {currentStep > 0 ? (
                    <HulyButton
                        onClick={goBack}
                        className="px-6 py-3 rounded-full"
                        style={{
                            border: "1px solid rgba(55, 65, 81, 0.6)",
                            color: "rgba(255,255,255,0.5)",
                        }}
                    >
                        ← Back
                    </HulyButton>
                ) : <div />}

                {currentStep < 3 ? (
                    <HulyButton
                        onClick={goNext}
                        className="px-8 py-3 rounded-full"
                        style={{
                            boxShadow: "0 0 20px rgba(110,20,212,0.3)",
                        }}
                    >
                        Continue →
                    </HulyButton>
                ) : (
                    <HulyButton
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 rounded-full"
                        style={{
                            boxShadow: "0 0 20px rgba(110,20,212,0.3)",
                        }}
                    >
                        {loading ? <><Spinner /> Verifying…</> : "Complete Verification ✓"}
                    </HulyButton>
                )}
            </div>
        </div>
    );
}
