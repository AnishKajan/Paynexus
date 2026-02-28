"use client";

export default function SettingsPage() {
    return (
        <main className="p-6 md:p-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>Settings</h1>
                <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Organization and account preferences</p>
            </div>
            <div className="space-y-4 max-w-xl">
                {[
                    { label: "Organization Name", value: "My Org", type: "text" },
                    { label: "Contact Email", value: "admin@myorg.com", type: "email" },
                ].map((field) => (
                    <div key={field.label} className="rounded-xl p-5" style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                        <label className="block text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{field.label}</label>
                        <input
                            type={field.type}
                            defaultValue={field.value}
                            className="w-full bg-transparent text-sm font-mono text-white/80 focus:outline-none"
                            style={{ borderBottom: "1px solid rgba(55,65,81,0.4)" }}
                        />
                    </div>
                ))}
                <button className="px-6 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: "#6E14D4", color: "#fff", boxShadow: "0 0 16px rgba(110,20,212,0.3)" }}>
                    Save Changes
                </button>
            </div>
        </main>
    );
}
