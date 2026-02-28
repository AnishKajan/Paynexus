"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Environment = "sandbox" | "production";

interface ApiKeyEntry {
    id: string;
    maskedKey: string;
    rawKey?: string; // only set on creation / rotation — shown once
    tag: string;
    env: Environment;
    createdAt: string;
    lastUsed: string | null;
    status: "active" | "revoked";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateId() {
    return "key_" + Math.random().toString(36).slice(2, 14);
}

function generateRawKey(env: Environment) {
    const prefix = env === "sandbox" ? "pnx_sbx_" : "pnx_prd_";
    const chars = "abcdef0123456789";
    let key = prefix;
    for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
    return key;
}

function maskKey(raw: string) {
    if (raw.length < 12) return raw;
    const prefix = raw.slice(0, 8);
    const suffix = raw.slice(-4);
    return `${prefix}${"•".repeat(12)}${suffix}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string | null) {
    if (!iso) return "Never";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_KEYS: ApiKeyEntry[] = [
    {
        id: "key_a1b2c3d4e5f6",
        maskedKey: "pnx_sbx_••••••••••••4f2a",
        tag: "dev-testing",
        env: "sandbox",
        createdAt: "2026-02-10T14:30:00Z",
        lastUsed: "2026-02-27T20:58:00Z",
        status: "active",
    },
    {
        id: "key_g7h8i9j0k1l2",
        maskedKey: "pnx_sbx_••••••••••••9b1c",
        tag: "",
        env: "sandbox",
        createdAt: "2026-01-22T09:00:00Z",
        lastUsed: "2026-02-27T18:10:00Z",
        status: "active",
    },
    {
        id: "key_m3n4o5p6q7r8",
        maskedKey: "pnx_prd_••••••••••••c8d3",
        tag: "billing-service",
        env: "production",
        createdAt: "2026-02-15T11:20:00Z",
        lastUsed: "2026-02-27T21:00:00Z",
        status: "active",
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApiKeysPage() {
    const [env, setEnv] = useState<Environment>("sandbox");
    const [keys, setKeys] = useState<ApiKeyEntry[]>(SEED_KEYS);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [justCreatedKey, setJustCreatedKey] = useState<ApiKeyEntry | null>(null);
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
    const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
    const [confirmRotateId, setConfirmRotateId] = useState<string | null>(null);
    const [rotatedKey, setRotatedKey] = useState<ApiKeyEntry | null>(null);

    const filtered = keys.filter((k) => k.env === env && k.status === "active");

    // ── Copy to clipboard ───────────────────────────────────────────────────────
    const copyToClipboard = useCallback(async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKeyId(id);
            setTimeout(() => setCopiedKeyId(null), 2000);
        } catch {
            /* fallback: noop */
        }
    }, []);

    // ── Create Key ──────────────────────────────────────────────────────────────
    const handleCreate = useCallback(() => {
        const raw = generateRawKey(env);
        const entry: ApiKeyEntry = {
            id: generateId(),
            maskedKey: maskKey(raw),
            rawKey: raw,
            tag: newTag.trim(),
            env,
            createdAt: new Date().toISOString(),
            lastUsed: null,
            status: "active",
        };
        setKeys((prev) => [entry, ...prev]);
        setJustCreatedKey(entry);
        setShowCreateModal(false);
        setNewTag("");
    }, [env, newTag]);

    // ── Revoke Key ──────────────────────────────────────────────────────────────
    const handleRevoke = useCallback((id: string) => {
        setKeys((prev) =>
            prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
        );
        setConfirmRevokeId(null);
    }, []);

    // ── Rotate Key ──────────────────────────────────────────────────────────────
    const handleRotate = useCallback(
        (id: string) => {
            setKeys((prev) => {
                const old = prev.find((k) => k.id === id);
                if (!old) return prev;
                const raw = generateRawKey(old.env);
                const newEntry: ApiKeyEntry = {
                    id: generateId(),
                    maskedKey: maskKey(raw),
                    rawKey: raw,
                    tag: old.tag,
                    env: old.env,
                    createdAt: new Date().toISOString(),
                    lastUsed: null,
                    status: "active",
                };
                setRotatedKey(newEntry);
                return [
                    newEntry,
                    ...prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k)),
                ];
            });
            setConfirmRotateId(null);
        },
        []
    );

    // ── Dismiss "shown once" banners on env switch ──────────────────────────────
    useEffect(() => {
        setJustCreatedKey(null);
        setRotatedKey(null);
    }, [env]);

    // ── Styles ──────────────────────────────────────────────────────────────────
    const card = {
        background: "rgba(13,13,13,0.95)",
        border: "1px solid rgba(110,20,212,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    };

    const overlay: React.CSSProperties = {
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 150ms ease-out",
    };

    const modal: React.CSSProperties = {
        ...card,
        width: "100%",
        maxWidth: 460,
        borderRadius: 16,
        padding: 0,
        animation: "modalSlideUp 250ms ease-out",
    };

    return (
        <main className="p-6 md:p-10">
            {/* ── Header ──────────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1
                        className="text-2xl font-black tracking-tight"
                        style={{ letterSpacing: "-0.02em" }}
                    >
                        API Keys
                    </h1>
                    <p
                        className="text-xs font-mono mt-1"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                        Manage your sandbox and production API keys
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* ── Environment Toggle ──────────────────────────────────────────── */}
                    <div
                        className="flex items-center rounded-full p-0.5"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(55,65,81,0.4)",
                        }}
                    >
                        {(["sandbox", "production"] as Environment[]).map((e) => (
                            <button
                                id={`toggle-${e}`}
                                key={e}
                                onClick={() => setEnv(e)}
                                className="relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 capitalize"
                                style={{
                                    background: env === e
                                        ? e === "sandbox"
                                            ? "rgba(34,197,94,0.15)"
                                            : "rgba(110,20,212,0.2)"
                                        : "transparent",
                                    color: env === e
                                        ? e === "sandbox"
                                            ? "#22c55e"
                                            : "#a855f7"
                                        : "rgba(255,255,255,0.35)",
                                    boxShadow: env === e
                                        ? e === "sandbox"
                                            ? "0 0 12px rgba(34,197,94,0.2)"
                                            : "0 0 12px rgba(110,20,212,0.3)"
                                        : "none",
                                }}
                            >
                                {e === "sandbox" ? "● Sandbox" : "● Production"}
                            </button>
                        ))}
                    </div>

                    {/* ── Create Key Button ───────────────────────────────────────────── */}
                    <button
                        id="create-key-btn"
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{
                            background: "#6E14D4",
                            color: "#fff",
                            boxShadow: "0 0 16px rgba(110,20,212,0.3)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 0 28px rgba(110,20,212,0.6)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 0 16px rgba(110,20,212,0.3)";
                        }}
                    >
                        + Create Key
                    </button>
                </div>
            </div>

            {/* ── Just-Created Key Banner ─────────────────────────────────────────── */}
            {justCreatedKey && justCreatedKey.env === env && (
                <div
                    className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    style={{
                        background: "rgba(34,197,94,0.06)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        animation: "fadeIn 300ms ease-out",
                    }}
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: "#22c55e" }}>
                            ✓ Key created successfully — copy it now, it won't be shown again.
                        </p>
                        <code
                            className="mt-1 block text-xs font-mono truncate"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                            {justCreatedKey.rawKey}
                        </code>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => copyToClipboard(justCreatedKey.rawKey!, justCreatedKey.id + "_banner")}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200"
                            style={{
                                background: copiedKeyId === justCreatedKey.id + "_banner" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                                color: copiedKeyId === justCreatedKey.id + "_banner" ? "#22c55e" : "rgba(255,255,255,0.5)",
                                border: "1px solid rgba(55,65,81,0.4)",
                            }}
                        >
                            {copiedKeyId === justCreatedKey.id + "_banner" ? "Copied ✓" : "Copy"}
                        </button>
                        <button
                            onClick={() => setJustCreatedKey(null)}
                            className="px-2 py-1.5 rounded-lg text-xs transition-all duration-200"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* ── Rotated Key Banner ──────────────────────────────────────────────── */}
            {rotatedKey && rotatedKey.env === env && (
                <div
                    className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    style={{
                        background: "rgba(110,20,212,0.06)",
                        border: "1px solid rgba(110,20,212,0.2)",
                        animation: "fadeIn 300ms ease-out",
                    }}
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: "#a855f7" }}>
                            ↻ Key rotated — copy the new key now, it won't be shown again.
                        </p>
                        <code
                            className="mt-1 block text-xs font-mono truncate"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                            {rotatedKey.rawKey}
                        </code>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => copyToClipboard(rotatedKey.rawKey!, rotatedKey.id + "_rotate")}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200"
                            style={{
                                background: copiedKeyId === rotatedKey.id + "_rotate" ? "rgba(110,20,212,0.15)" : "rgba(255,255,255,0.06)",
                                color: copiedKeyId === rotatedKey.id + "_rotate" ? "#a855f7" : "rgba(255,255,255,0.5)",
                                border: "1px solid rgba(55,65,81,0.4)",
                            }}
                        >
                            {copiedKeyId === rotatedKey.id + "_rotate" ? "Copied ✓" : "Copy"}
                        </button>
                        <button
                            onClick={() => setRotatedKey(null)}
                            className="px-2 py-1.5 rounded-lg text-xs transition-all duration-200"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* ── Key List ────────────────────────────────────────────────────────── */}
            <div className="rounded-xl overflow-hidden" style={card}>
                {/* Table header */}
                <div
                    className="grid items-center px-5 py-3 text-[10px] font-mono uppercase tracking-widest"
                    style={{
                        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr)",
                        color: "rgba(255,255,255,0.25)",
                        borderBottom: "1px solid rgba(55,65,81,0.3)",
                    }}
                >
                    <span>Key</span>
                    <span>Tag</span>
                    <span>Created</span>
                    <span>Last Used</span>
                    <span className="text-right">Actions</span>
                </div>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "rgba(110,20,212,0.06)",
                                border: "1px solid rgba(110,20,212,0.12)",
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(110,20,212,0.4)" strokeWidth="1.5" strokeLinecap="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                                No {env} keys yet
                            </p>
                            <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                                Create your first {env} API key to get started.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                            style={{
                                background: "rgba(110,20,212,0.12)",
                                color: "#a855f7",
                                border: "1px solid rgba(110,20,212,0.2)",
                            }}
                        >
                            + Create Key
                        </button>
                    </div>
                ) : (
                    filtered.map((key) => (
                        <div
                            key={key.id}
                            className="grid items-center px-5 py-4 transition-all duration-150 group"
                            style={{
                                gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr)",
                                borderBottom: "1px solid rgba(55,65,81,0.15)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(110,20,212,0.04)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            {/* Key */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }}
                                />
                                <button
                                    onClick={() => copyToClipboard(key.maskedKey, key.id)}
                                    className="text-xs font-mono truncate transition-colors duration-200 text-left"
                                    style={{ color: "rgba(255,255,255,0.55)" }}
                                    title="Click to copy"
                                >
                                    {key.maskedKey}
                                </button>
                                {copiedKeyId === key.id && (
                                    <span className="text-[10px] font-mono shrink-0" style={{ color: "#22c55e" }}>
                                        ✓
                                    </span>
                                )}
                            </div>

                            {/* Tag */}
                            <div>
                                {key.tag ? (
                                    <span
                                        className="inline-block px-2 py-0.5 rounded text-[10px] font-mono truncate max-w-full"
                                        style={{
                                            background: "rgba(110,20,212,0.08)",
                                            color: "rgba(168,85,247,0.8)",
                                            border: "1px solid rgba(110,20,212,0.15)",
                                        }}
                                    >
                                        {key.tag}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                                        —
                                    </span>
                                )}
                            </div>

                            {/* Created */}
                            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {formatDate(key.createdAt)}
                            </span>

                            {/* Last Used */}
                            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {timeAgo(key.lastUsed)}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => setConfirmRotateId(key.id)}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-200"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        color: "rgba(255,255,255,0.4)",
                                        border: "1px solid rgba(55,65,81,0.3)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(110,20,212,0.4)";
                                        e.currentTarget.style.color = "#a855f7";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(55,65,81,0.3)";
                                        e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                                    }}
                                >
                                    ↻ Rotate
                                </button>
                                <button
                                    onClick={() => setConfirmRevokeId(key.id)}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-200"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        color: "rgba(255,255,255,0.35)",
                                        border: "1px solid rgba(55,65,81,0.3)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                                        e.currentTarget.style.color = "#ef4444";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(55,65,81,0.3)";
                                        e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                                    }}
                                >
                                    Revoke
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Info footer ─────────────────────────────────────────────────────── */}
            <div className="mt-6 flex items-start gap-3 px-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(110,20,212,0.4)" strokeWidth="2" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-[11px] font-mono leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>
                    <strong style={{ color: "rgba(255,255,255,0.4)" }}>Sandbox keys</strong> can only access sandbox sessions and transactions.{" "}
                    <strong style={{ color: "rgba(255,255,255,0.4)" }}>Production keys</strong> access live data. Store your raw key securely — it is only shown once at creation.
                </p>
            </div>

            {/* ═══ Create Key Modal ═══════════════════════════════════════════════════ */}
            {showCreateModal && (
                <div style={overlay} onClick={() => setShowCreateModal(false)}>
                    <div style={modal} onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 pb-4" style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                            <h2 className="text-base font-black tracking-tight">Create API Key</h2>
                            <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                                Environment: <span style={{ color: env === "sandbox" ? "#22c55e" : "#a855f7" }} className="capitalize">{env}</span>
                            </p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    Tag <span style={{ color: "rgba(255,255,255,0.15)" }}>(optional)</span>
                                </label>
                                <input
                                    id="tag-input"
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="e.g. billing-service, dev-testing"
                                    className="w-full px-4 py-2.5 rounded-lg text-sm font-mono outline-none transition-all duration-200"
                                    style={{
                                        background: "rgba(15,23,42,0.8)",
                                        border: "1px solid rgba(55,65,81,0.5)",
                                        color: "rgba(255,255,255,0.8)",
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(110,20,212,0.5)";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(110,20,212,0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(55,65,81,0.5)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                    autoFocus
                                />
                            </div>

                            <div
                                className="rounded-lg p-3"
                                style={{ background: "rgba(110,20,212,0.04)", border: "1px solid rgba(110,20,212,0.1)" }}
                            >
                                <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                                    The raw key will be shown <strong style={{ color: "rgba(255,255,255,0.5)" }}>exactly once</strong> after creation. Make sure to copy and store it securely.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 pt-0">
                            <button
                                onClick={() => { setShowCreateModal(false); setNewTag(""); }}
                                className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{
                                    color: "rgba(255,255,255,0.4)",
                                    border: "1px solid rgba(55,65,81,0.3)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                id="confirm-create-btn"
                                onClick={handleCreate}
                                className="px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                                style={{
                                    background: "#6E14D4",
                                    color: "#fff",
                                    boxShadow: "0 0 16px rgba(110,20,212,0.3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = "0 0 28px rgba(110,20,212,0.6)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = "0 0 16px rgba(110,20,212,0.3)";
                                }}
                            >
                                Create Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Confirm Revoke Modal ══════════════════════════════════════════════ */}
            {confirmRevokeId && (
                <div style={overlay} onClick={() => setConfirmRevokeId(null)}>
                    <div style={modal} onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 pb-4" style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                            <h2 className="text-base font-black tracking-tight" style={{ color: "#ef4444" }}>
                                Revoke API Key
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                                This action is <strong style={{ color: "#ef4444" }}>permanent</strong>. Any services using this key will immediately lose access.
                            </p>
                            <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                                <code className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    {keys.find((k) => k.id === confirmRevokeId)?.maskedKey}
                                </code>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 pt-0">
                            <button
                                onClick={() => setConfirmRevokeId(null)}
                                className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(55,65,81,0.3)" }}
                            >
                                Cancel
                            </button>
                            <button
                                id="confirm-revoke-btn"
                                onClick={() => handleRevoke(confirmRevokeId)}
                                className="px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                                style={{
                                    background: "rgba(239,68,68,0.15)",
                                    color: "#ef4444",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(239,68,68,0.25)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                                }}
                            >
                                Yes, Revoke Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Confirm Rotate Modal ══════════════════════════════════════════════ */}
            {confirmRotateId && (
                <div style={overlay} onClick={() => setConfirmRotateId(null)}>
                    <div style={modal} onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 pb-4" style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                            <h2 className="text-base font-black tracking-tight" style={{ color: "#a855f7" }}>
                                Rotate API Key
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                                This will <strong style={{ color: "#a855f7" }}>revoke the current key</strong> and generate a new one with the same tag and permissions.
                            </p>
                            <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(110,20,212,0.06)", border: "1px solid rgba(110,20,212,0.15)" }}>
                                <code className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    {keys.find((k) => k.id === confirmRotateId)?.maskedKey}
                                </code>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 pt-0">
                            <button
                                onClick={() => setConfirmRotateId(null)}
                                className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(55,65,81,0.3)" }}
                            >
                                Cancel
                            </button>
                            <button
                                id="confirm-rotate-btn"
                                onClick={() => handleRotate(confirmRotateId)}
                                className="px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                                style={{
                                    background: "rgba(110,20,212,0.15)",
                                    color: "#a855f7",
                                    border: "1px solid rgba(110,20,212,0.3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(110,20,212,0.25)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(110,20,212,0.15)";
                                }}
                            >
                                Yes, Rotate Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
