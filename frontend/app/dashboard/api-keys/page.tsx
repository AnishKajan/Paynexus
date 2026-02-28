"use client";

export default function ApiKeysPage() {
    return (
        <main className="p-6 md:p-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>API Keys</h1>
                <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Manage your sandbox and production API keys</p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(55,65,81,0.3)" }}>
                    <h2 className="text-sm font-semibold text-white/70">Sandbox Keys</h2>
                    <button className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{ background: "#6E14D4", color: "#fff", boxShadow: "0 0 16px rgba(110,20,212,0.3)" }}>
                        + Create Key
                    </button>
                </div>
                {[
                    { prefix: "pnx_test_sk_", suffix: "••••••••••4f2a", created: "Feb 10, 2026", lastUsed: "2 min ago", status: "active" },
                    { prefix: "pnx_test_sk_", suffix: "••••••••••9b1c", created: "Jan 22, 2026", lastUsed: "3 hours ago", status: "active" },
                ].map((key, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(55,65,81,0.2)" }}>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                            <code className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
                                {key.prefix}{key.suffix}
                            </code>
                        </div>
                        <div className="flex items-center gap-8 text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                            <span>Created: {key.created}</span>
                            <span>Used: {key.lastUsed}</span>
                            <button className="text-red-400/60 hover:text-red-400 transition-colors">Revoke</button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
