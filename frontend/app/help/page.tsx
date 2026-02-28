"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HulyButton from "../components/HulyButton";

// ═════════════════════════════════════════════════════════════════════════════
// DATA
// ═════════════════════════════════════════════════════════════════════════════
const CATEGORIES = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
        ),
        title: "Account Settings",
        description: "Manage your profile, password, and notification preferences.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
        title: "Billing & Payments",
        description: "Invoices, subscriptions, payment methods, and refunds.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
        ),
        title: "Getting Started",
        description: "Step-by-step guides, tutorials, and best practices.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
        ),
        title: "API & Integrations",
        description: "Endpoints, SDKs, webhooks, and MCP protocol docs.",
    },
];

const FAQS: { q: string; a: string }[] = [
    {
        q: "How do I upgrade my plan?",
        a: "Navigate to Settings → Billing & Payments and click \"Upgrade Plan\". Choose from our Starter, Growth, or Enterprise tiers. Changes take effect immediately and your card will be prorated for the remainder of the billing cycle.",
    },
    {
        q: "How can I change my email address?",
        a: "Your email is managed by your authentication provider (Google, Magic Link). To change it, go to Settings → Profile and contact support to initiate an email migration. We'll verify ownership of both addresses before proceeding.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), bank transfers via ACH, and wire transfers for Enterprise plans. All payments are processed securely through our PCI-DSS Level 1 certified infrastructure.",
    },
    {
        q: "How does Paynexus handle compliance and fraud detection?",
        a: "Paynexus uses a proprietary GraphSAGE-based GNN model (AUC 0.94) for real-time fraud detection, combined with IBM watsonx for AML screening. Our system monitors every transaction for sanctions violations, suspicious patterns, and regulatory compliance across 180+ jurisdictions.",
    },
    {
        q: "Can I integrate Paynexus with my existing stack?",
        a: "Absolutely. We provide REST APIs, WebSocket streaming, official SDKs for Python, Node.js, Go, and Java, as well as pre-built integrations for Stripe migrations, Shopify, and WooCommerce. Our MCP protocol also enables seamless AI-agent orchestration.",
    },
];

// ═════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

/* ── Search Icon ──────────────────────────────────────────────────────────── */
function SearchIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

/* ── Accordion Item ───────────────────────────────────────────────────────── */
function AccordionItem({
    question,
    answer,
    isOpen,
    onToggle,
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
                background: isOpen ? "rgba(110,20,212,0.04)" : "rgba(13,13,13,0.6)",
                border: isOpen ? "1px solid rgba(110,20,212,0.2)" : "1px solid rgba(55,65,81,0.3)",
            }}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors duration-200"
                style={{ color: isOpen ? "#e2e8f0" : "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => {
                    if (!isOpen) e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
                aria-expanded={isOpen}
            >
                <span className="text-sm font-semibold pr-4">{question}</span>
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isOpen ? "#a855f7" : "currentColor"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            <div
                className="overflow-hidden transition-all duration-300"
                style={{
                    maxHeight: isOpen ? 200 : 0,
                    opacity: isOpen ? 1 : 0,
                }}
            >
                <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ── Contact Form Modal ───────────────────────────────────────────────────── */
function ContactModal({ onClose }: { onClose: () => void }) {
    const [sent, setSent] = useState(false);

    const inputStyle: React.CSSProperties = {
        background: "rgba(15,23,42,0.92)",
        border: "1px solid rgba(55,65,81,0.7)",
        color: "#e2e8f0",
        outline: "none",
        transition: "border-color 200ms, box-shadow 200ms",
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = "rgba(110,20,212,0.6)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(110,20,212,0.12)";
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = "rgba(55,65,81,0.7)";
        e.currentTarget.style.boxShadow = "none";
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease-out" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label="Contact form"
        >
            <div
                className="w-full max-w-lg rounded-2xl p-6"
                style={{
                    background: "rgba(13,13,13,0.98)",
                    border: "1px solid rgba(110,20,212,0.15)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(110,20,212,0.08)",
                    animation: "modalSlideUp 300ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
            >
                {sent ? (
                    <div className="flex flex-col items-center py-8 gap-4" style={{ animation: "fadeUpIn 400ms ease-out" }}>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.4)", boxShadow: "0 0 30px rgba(34,197,94,0.15)" }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold">Message Sent!</h3>
                        <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Our team will get back to you within 24 hours.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                            style={{ background: "rgba(110,20,212,0.12)", color: "#a855f7", border: "1px solid rgba(110,20,212,0.25)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(110,20,212,0.2)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(110,20,212,0.12)"; }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold">Send us a Message</h3>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg transition-colors duration-200"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                                aria-label="Close"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Name</label>
                                <input type="text" placeholder="John Doe" className="w-full px-3 py-2.5 rounded-lg text-sm" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Email</label>
                                <input type="email" placeholder="john@company.com" className="w-full px-3 py-2.5 rounded-lg text-sm" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Message</label>
                                <textarea rows={4} placeholder="Describe your issue…" className="w-full px-3 py-2.5 rounded-lg text-sm resize-none" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                            </div>
                            <HulyButton
                                onClick={() => setSent(true)}
                                className="w-full py-3 rounded-full text-sm"
                                style={{ boxShadow: "0 0 20px rgba(110,20,212,0.3)" }}
                            >
                                Send Message →
                            </HulyButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function HelpPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showContact, setShowContact] = useState(false);

    // Filter FAQs by search
    const filteredFaqs = search.trim()
        ? FAQS.filter(
            (f) =>
                f.q.toLowerCase().includes(search.toLowerCase()) ||
                f.a.toLowerCase().includes(search.toLowerCase())
        )
        : FAQS;

    return (
        <div className="min-h-screen" style={{ background: "#030303" }}>
            {/* ── Navbar ─────────────────────────────────────────────────────────── */}
            <nav
                className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
                style={{
                    background: "rgba(3,3,3,0.85)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(110,20,212,0.08)",
                }}
            >
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80"
                >
                    <img src="/Paynexus-logo.svg" alt="Paynexus" width={24} height={24} style={{ borderRadius: 5, boxShadow: "0 0 12px rgba(110,20,212,0.45)" }} />
                    <span className="text-sm font-black tracking-tight">PAYNEXUS</span>
                </button>
                <HulyButton
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-1.5 rounded-full text-xs"
                    style={{ border: "1px solid rgba(55,65,81,0.5)", color: "rgba(255,255,255,0.5)" }}
                >
                    ← Back to Dashboard
                </HulyButton>
            </nav>

            <div className="max-w-4xl mx-auto px-5 pb-20">
                {/* ════════════════════════════════════════════════════════════════ */}
                {/* HERO SECTION                                                   */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <section className="pt-16 pb-12 text-center" style={{ animation: "fadeUpIn 500ms ease-out" }}>
                    {/* Decorative badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: "rgba(110,20,212,0.08)", border: "1px solid rgba(110,20,212,0.15)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span className="text-xs font-mono font-semibold" style={{ color: "#a855f7" }}>Help Center</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3" style={{ letterSpacing: "-0.03em" }}>
                        How can we <span style={{ color: "#a855f7" }}>help</span> you today?
                    </h1>
                    <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Search our knowledge base, browse common topics, or reach out to our support team.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-8 max-w-xl mx-auto relative">
                        <div
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search for help articles, topics, or questions…"
                            className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm transition-all duration-300"
                            style={{
                                background: "rgba(15,23,42,0.8)",
                                border: "1px solid rgba(55,65,81,0.5)",
                                color: "#e2e8f0",
                                outline: "none",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "rgba(110,20,212,0.5)";
                                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(110,20,212,0.1), 0 4px 32px rgba(110,20,212,0.08)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "rgba(55,65,81,0.5)";
                                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                                style={{ color: "rgba(255,255,255,0.3)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                                aria-label="Clear search"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* SUPPORT CATEGORIES                                             */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <section className="mb-16" style={{ animation: "fadeUpIn 600ms ease-out 100ms both" }}>
                    <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Browse Topics
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {CATEGORIES.map((cat, i) => (
                            <div
                                key={i}
                                className="rounded-xl p-5 transition-all duration-300 cursor-pointer group"
                                style={{
                                    background: "rgba(13,13,13,0.8)",
                                    border: "1px solid rgba(55,65,81,0.3)",
                                    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(110,20,212,0.35)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(110,20,212,0.08), 0 2px 12px rgba(0,0,0,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(55,65,81,0.3)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.2)";
                                }}
                            >
                                <div className="mb-3" style={{ color: "#a855f7", opacity: 0.7 }}>{cat.icon}</div>
                                <h3 className="text-sm font-bold mb-1 text-white/85">{cat.title}</h3>
                                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    {cat.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* FAQ ACCORDION                                                  */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <section className="mb-16" style={{ animation: "fadeUpIn 600ms ease-out 200ms both" }}>
                    <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, i) => (
                                <AccordionItem
                                    key={faq.q}
                                    question={faq.q}
                                    answer={faq.a}
                                    isOpen={openFaq === i}
                                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    No results for &ldquo;<span className="font-semibold text-white/60">{search}</span>&rdquo;. Try a different search or contact support below.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* "STILL NEED HELP?" CONTACT SECTION                             */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <section style={{ animation: "fadeUpIn 600ms ease-out 300ms both" }}>
                    <div
                        className="rounded-2xl p-8 md:p-10 text-center"
                        style={{
                            background: "rgba(110,20,212,0.04)",
                            border: "1px solid rgba(110,20,212,0.12)",
                            boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
                        }}
                    >
                        <h2 className="text-xl font-black tracking-tight mb-2" style={{ letterSpacing: "-0.02em" }}>
                            Still need help?
                        </h2>
                        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Our support team typically responds within a few hours.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {/* Send Message */}
                            <button
                                onClick={() => setShowContact(true)}
                                className="flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto"
                                style={{
                                    background: "rgba(13,13,13,0.9)",
                                    border: "1px solid rgba(110,20,212,0.25)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(110,20,212,0.5)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(110,20,212,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(110,20,212,0.25)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(110,20,212,0.12)", border: "1px solid rgba(110,20,212,0.2)" }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white/85">Send us a Message</p>
                                    <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Get a reply within 24h</p>
                                </div>
                            </button>

                            {/* Live Chat */}
                            <button
                                className="flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto"
                                style={{
                                    background: "rgba(13,13,13,0.9)",
                                    border: "1px solid rgba(55,65,81,0.35)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(34,197,94,0.06)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(55,65,81,0.35)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white/85">Live Chat</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                                        <p className="text-[11px] font-mono" style={{ color: "rgba(34,197,94,0.7)" }}>Online now</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 text-center">
                        <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                            Built with IBM watsonx · GraphSAGE GNN · MCP Protocol · <span style={{ color: "rgba(110,20,212,0.5)" }}>IBM Hackathon 2026</span>
                        </p>
                    </div>
                </section>
            </div>

            {/* ── Contact Modal ─────────────────────────────────────────────────── */}
            {showContact && <ContactModal onClose={() => setShowContact(false)} />}
        </div>
    );
}
