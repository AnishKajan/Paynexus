"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════
interface UserProfileMenuProps {
    email: string | null;
    onSignOut: () => void;
}

type SettingsTab = "profile" | "appearance" | "security";

// ═════════════════════════════════════════════════════════════════════════════
// SVG ICON COMPONENTS  (inline to avoid external deps)
// ═════════════════════════════════════════════════════════════════════════════
const ChevronUp = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);

const HelpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
);

const LogOutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const PaletteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5" /><circle cx="19" cy="13" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="10" cy="18.5" r="2.5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.4 2-1.5 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.3c3 0 5.7-2.5 5.7-5.5C23 6.5 18.1 2 12 2z" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// ═════════════════════════════════════════════════════════════════════════════
// SETTINGS MODAL
// ═════════════════════════════════════════════════════════════════════════════
function SettingsModal({ email, onClose }: { email: string | null; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [saved, setSaved] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { key: "profile", label: "Profile", icon: <UserIcon /> },
        { key: "appearance", label: "Appearance", icon: <PaletteIcon /> },
        { key: "security", label: "Security", icon: <ShieldIcon /> },
    ];

    const inputStyle: React.CSSProperties = {
        background: "rgba(15,23,42,0.92)",
        border: "1px solid rgba(55,65,81,0.7)",
        color: "#e2e8f0",
        outline: "none",
        transition: "border-color 200ms, box-shadow 200ms",
    };

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                animation: "fadeIn 200ms ease-out",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
        >
            <div
                className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
                style={{
                    background: "rgba(13,13,13,0.98)",
                    border: "1px solid rgba(110,20,212,0.15)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(110,20,212,0.08)",
                    animation: "modalSlideUp 300ms cubic-bezier(0.34,1.56,0.64,1)",
                    maxHeight: "85vh",
                }}
            >
                {/* ── Header ──────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                    <h2 className="text-base font-bold tracking-tight">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors duration-200"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                        aria-label="Close settings"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* ── Body (sidebar + content) ──── */}
                <div className="flex flex-1 overflow-hidden" style={{ minHeight: 380 }}>
                    {/* Sidebar Tabs */}
                    <nav className="w-48 shrink-0 p-3 space-y-1" style={{ borderRight: "1px solid rgba(55,65,81,0.25)" }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left"
                                style={{
                                    background: activeTab === tab.key ? "rgba(110,20,212,0.12)" : "transparent",
                                    color: activeTab === tab.key ? "#a855f7" : "rgba(255,255,255,0.45)",
                                    border: activeTab === tab.key ? "1px solid rgba(110,20,212,0.2)" : "1px solid transparent",
                                }}
                                onMouseEnter={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                                onMouseLeave={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = "transparent"; }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Tab Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="space-y-6" style={{ animation: "fadeIn 200ms ease-out" }}>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Personal Information</h3>
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Manage your profile details and avatar.</p>
                                </div>

                                {/* Avatar */}
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                                        style={{ background: "rgba(110,20,212,0.2)", color: "#a855f7", border: "2px solid rgba(110,20,212,0.35)", boxShadow: "0 0 20px rgba(110,20,212,0.15)" }}
                                    >
                                        {(email?.[0] || "U").toUpperCase()}
                                    </div>
                                    <div>
                                        <button
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                                            style={{ background: "rgba(110,20,212,0.1)", color: "#a855f7", border: "1px solid rgba(110,20,212,0.25)" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(110,20,212,0.2)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(110,20,212,0.1)"; }}
                                        >
                                            Upload Photo
                                        </button>
                                        <p className="text-[10px] mt-1.5 font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>JPG, PNG · max 2MB</p>
                                    </div>
                                </div>

                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>First Name</label>
                                        <input
                                            type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="John" className="w-full px-3 py-2.5 rounded-lg text-sm" style={inputStyle}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(110,20,212,0.12)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(55,65,81,0.7)"; e.currentTarget.style.boxShadow = "none"; }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Last Name</label>
                                        <input
                                            type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Doe" className="w-full px-3 py-2.5 rounded-lg text-sm" style={inputStyle}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(110,20,212,0.12)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(55,65,81,0.7)"; e.currentTarget.style.boxShadow = "none"; }}
                                        />
                                    </div>
                                </div>

                                {/* Email (read-only) */}
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Email Address</label>
                                    <input
                                        type="email" value={email ?? ""} readOnly
                                        className="w-full px-3 py-2.5 rounded-lg text-sm cursor-not-allowed"
                                        style={{ ...inputStyle, opacity: 0.5 }}
                                    />
                                    <p className="text-[10px] mt-1 font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>Managed by your authentication provider.</p>
                                </div>

                                {/* Save */}
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                                    style={{
                                        background: saved ? "rgba(34,197,94,0.15)" : "rgba(110,20,212,0.15)",
                                        color: saved ? "#22c55e" : "#a855f7",
                                        border: saved ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(110,20,212,0.3)",
                                    }}
                                    onMouseEnter={(e) => { if (!saved) e.currentTarget.style.background = "rgba(110,20,212,0.25)"; }}
                                    onMouseLeave={(e) => { if (!saved) e.currentTarget.style.background = "rgba(110,20,212,0.15)"; }}
                                >
                                    {saved ? "✓ Saved" : "Save Changes"}
                                </button>
                            </div>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === "appearance" && (
                            <div className="space-y-6" style={{ animation: "fadeIn 200ms ease-out" }}>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Appearance</h3>
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Customize the look and feel of Paynexus.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {(["dark", "light", "system"] as const).map((theme) => {
                                        const isActive = theme === "dark"; // dark mode is always active
                                        return (
                                            <button
                                                key={theme}
                                                className="rounded-xl p-4 text-center transition-all duration-200"
                                                style={{
                                                    background: isActive ? "rgba(110,20,212,0.1)" : "rgba(15,23,42,0.6)",
                                                    border: isActive ? "2px solid rgba(110,20,212,0.45)" : "2px solid rgba(55,65,81,0.4)",
                                                    boxShadow: isActive ? "0 0 16px rgba(110,20,212,0.12)" : "none",
                                                }}
                                                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = "rgba(110,20,212,0.3)"; }}
                                                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = "rgba(55,65,81,0.4)"; }}
                                            >
                                                <div className="text-2xl mb-2">{theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💻"}</div>
                                                <span className="text-xs font-medium capitalize" style={{ color: isActive ? "#a855f7" : "rgba(255,255,255,0.5)" }}>
                                                    {theme}
                                                </span>
                                                {isActive && <p className="text-[9px] mt-1 font-mono" style={{ color: "rgba(110,20,212,0.7)" }}>Active</p>}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="p-3 rounded-lg" style={{ background: "rgba(110,20,212,0.04)", border: "1px solid rgba(110,20,212,0.1)" }}>
                                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                                        <span className="font-semibold" style={{ color: "#a855f7" }}>Note:</span> Light and System themes are coming soon. Paynexus currently uses a premium dark interface.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="space-y-6" style={{ animation: "fadeIn 200ms ease-out" }}>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Account & Security</h3>
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Manage your account security and access.</p>
                                </div>

                                {/* Password section */}
                                <div className="rounded-xl p-5" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(55,65,81,0.35)" }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium">Password</h4>
                                            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Authenticated via magic link / OAuth.</p>
                                        </div>
                                        <button
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                                            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(55,65,81,0.5)" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>

                                {/* Sessions */}
                                <div className="rounded-xl p-5" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(55,65,81,0.35)" }}>
                                    <h4 className="text-sm font-medium mb-2">Active Sessions</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                                        <div>
                                            <p className="text-xs font-medium text-white/70">Current Browser</p>
                                            <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>Last active: Just now</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="rounded-xl p-5" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
                                    <h4 className="text-sm font-semibold mb-1" style={{ color: "#ef4444" }}>Danger Zone</h4>
                                    <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                    <button
                                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN: USER PROFILE MENU
// ═════════════════════════════════════════════════════════════════════════════
export default function UserProfileMenu({ email, onSignOut }: UserProfileMenuProps) {
    const router = useRouter();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close popover when clicking outside
    useEffect(() => {
        if (!popoverOpen) return;
        const onClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setPopoverOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPopoverOpen(false); };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
    }, [popoverOpen]);

    const openSettings = useCallback(() => {
        setPopoverOpen(false);
        setTimeout(() => setSettingsOpen(true), 100); // slight delay for clean transition
    }, []);

    const initial = (email?.[0] || "U").toUpperCase();
    const displayName = email ? email.split("@")[0] : "User";

    return (
        <>
            <div ref={containerRef} className="relative">
                {/* ── Trigger Button ──────────────────────────── */}
                <button
                    onClick={() => setPopoverOpen((v) => !v)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                    style={{
                        background: popoverOpen ? "rgba(110,20,212,0.08)" : "transparent",
                        border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => { if (!popoverOpen) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={(e) => { if (!popoverOpen) e.currentTarget.style.background = "transparent"; }}
                    aria-haspopup="true"
                    aria-expanded={popoverOpen}
                    aria-label="User menu"
                >
                    {/* Avatar */}
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                            background: "rgba(110,20,212,0.2)",
                            color: "#a855f7",
                            border: "1px solid rgba(110,20,212,0.35)",
                        }}
                    >
                        {initial}
                    </div>
                    {/* Name + Plan */}
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-medium text-white/75 truncate">{displayName}</p>
                        <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>Sandbox</p>
                    </div>
                    {/* Chevron */}
                    <div
                        className="transition-transform duration-200"
                        style={{
                            color: "rgba(255,255,255,0.3)",
                            transform: popoverOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                    >
                        <ChevronUp />
                    </div>
                </button>

                {/* ── Popover ──────────────────────────────── */}
                {popoverOpen && (
                    <div
                        className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden z-50"
                        style={{
                            background: "rgba(18,18,22,0.98)",
                            border: "1px solid rgba(110,20,212,0.15)",
                            boxShadow: "0 -8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(110,20,212,0.06)",
                            animation: "popoverSlideUp 200ms cubic-bezier(0.16,1,0.3,1)",
                        }}
                        role="menu"
                        aria-label="User actions"
                    >
                        {/* Header */}
                        <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(55,65,81,0.25)" }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{
                                        background: "rgba(110,20,212,0.2)",
                                        color: "#a855f7",
                                        border: "1.5px solid rgba(110,20,212,0.4)",
                                        boxShadow: "0 0 12px rgba(110,20,212,0.15)",
                                    }}
                                >
                                    {initial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white/85 truncate">{displayName}</p>
                                    <p className="text-[11px] font-mono truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{email}</p>
                                </div>
                                <span
                                    className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0"
                                    style={{ background: "rgba(110,20,212,0.12)", color: "#a855f7", border: "1px solid rgba(110,20,212,0.2)" }}
                                >
                                    Free
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="py-1.5 px-1.5">
                            {[
                                { label: "Settings", icon: <SettingsIcon />, action: openSettings },
                                { label: "Theme", icon: <MoonIcon />, action: openSettings, badge: "Dark" },
                                { label: "Help & Support", icon: <HelpIcon />, action: () => { setPopoverOpen(false); router.push("/help"); } },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    onClick={item.action}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left"
                                    style={{ color: "rgba(255,255,255,0.6)" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                                    role="menuitem"
                                >
                                    <span style={{ opacity: 0.6 }}>{item.icon}</span>
                                    <span className="flex-1">{item.label}</span>
                                    {item.badge && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Sign Out */}
                        <div className="px-1.5 pb-1.5" style={{ borderTop: "1px solid rgba(55,65,81,0.25)" }}>
                            <button
                                onClick={() => { setPopoverOpen(false); onSignOut(); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mt-1.5 text-left"
                                style={{ color: "rgba(239,68,68,0.7)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(239,68,68,0.7)"; }}
                                role="menuitem"
                            >
                                <LogOutIcon />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Settings Modal Portal ───────────────── */}
            {settingsOpen && <SettingsModal email={email} onClose={() => setSettingsOpen(false)} />}
        </>
    );
}
