"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TRANSACTIONS, Transaction } from "@/lib/mockData";

const statusColor: Record<string, string> = {
    succeeded: "#22c55e", pending: "#f59e0b", failed: "#ef4444", refunded: "#8b5cf6"
};
const statusBg: Record<string, string> = {
    succeeded: "rgba(34,197,94,0.08)", pending: "rgba(245,158,11,0.08)",
    failed: "rgba(239,68,68,0.08)", refunded: "rgba(139,92,246,0.08)"
};

function RiskBadge({ score }: { score: number }) {
    const label = score < 20 ? "Low" : score < 50 ? "Medium" : score < 75 ? "High" : "Critical";
    const color = score < 20 ? "#22c55e" : score < 50 ? "#f59e0b" : score < 75 ? "#f97316" : "#ef4444";
    return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap"
            style={{ color, background: `${color}14`, borderColor: `${color}30` }}>
            {label} {score}
        </span>
    );
}

// ─── Detail Panel ────────────────────────────────────────────────────────────
function TransactionDetail({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex"
            onClick={onClose}
        >
            <div className="flex-1 bg-black/60 backdrop-blur-sm" />
            <div
                className="w-full max-w-md h-full overflow-y-auto p-8 flex flex-col gap-6"
                style={{ background: "rgba(11,11,11,0.98)", borderLeft: "1px solid rgba(110,20,212,0.2)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">{tx.id}</p>
                        <h2 className="text-lg font-black">{tx.type}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Amount */}
                <div className="rounded-xl p-5 text-center" style={{ background: statusBg[tx.status], border: `1px solid ${statusColor[tx.status]}22` }}>
                    <div className="text-4xl font-black tracking-tight mb-2">{tx.amount}</div>
                    <span className="text-xs font-mono" style={{ color: statusColor[tx.status] }}>● {tx.status}</span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                    {[
                        { label: "Customer", value: tx.customer },
                        { label: "Country", value: tx.country },
                        { label: "Currency", value: tx.currency },
                        { label: "Payment Method", value: tx.paymentMethod },
                        { label: "Fee", value: tx.fee },
                        { label: "Date", value: tx.fullDate },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid rgba(55,65,81,0.2)" }}>
                            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
                            <span className="text-xs font-medium text-white/80">{value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between py-2.5 items-center" style={{ borderBottom: "1px solid rgba(55,65,81,0.2)" }}>
                        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Risk Score</span>
                        <RiskBadge score={tx.riskScore} />
                    </div>
                </div>

                {/* Description */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(55,65,81,0.3)" }}>
                    <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Description</p>
                    <p className="text-sm text-white/60">{tx.description}</p>
                </div>
            </div>
        </div>
    );
}

// ─── Inner component that reads search params ─────────────────────────────────
function TransactionsInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    // Sync selected tx from URL param
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            const found = TRANSACTIONS.find((t) => t.id === id);
            setSelectedTx(found ?? null);
        } else {
            setSelectedTx(null);
        }
    }, [searchParams]);

    const filtered = TRANSACTIONS.filter((tx) => {
        const matchSearch = tx.customer.toLowerCase().includes(search.toLowerCase()) || tx.type.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || tx.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openDetail = (tx: Transaction) => {
        router.push(`/dashboard/transactions?id=${tx.id}`);
    };

    const closeDetail = () => {
        router.push("/dashboard/transactions");
    };

    return (
        <main className="p-6 md:p-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>Transactions</h1>
                <p className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{TRANSACTIONS.length} records · Sandbox environment</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <input
                        type="text"
                        placeholder="Search customer or type…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(55,65,81,0.4)", color: "#fff" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(110,20,212,0.5)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(55,65,81,0.4)"; }}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono focus:outline-none appearance-none cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(55,65,81,0.4)", color: "rgba(255,255,255,0.6)" }}
                >
                    <option value="all">All Status</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(13,13,13,0.95)", border: "1px solid rgba(110,20,212,0.12)" }}>
                <table className="w-full text-left">
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(55,65,81,0.3)" }}>
                            {["ID", "Type", "Customer", "Amount", "Country", "Status", "Risk", "Date"].map((h) => (
                                <th key={h} className="px-5 py-4 text-[10px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((tx) => (
                            <tr
                                key={tx.id}
                                onClick={() => openDetail(tx)}
                                className="cursor-pointer transition-colors"
                                style={{ borderBottom: "1px solid rgba(55,65,81,0.15)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(110,20,212,0.05)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                            >
                                <td className="px-5 py-3.5 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{tx.id}</td>
                                <td className="px-5 py-3.5 text-sm font-medium text-white/80">{tx.type}</td>
                                <td className="px-5 py-3.5 text-sm text-white/60">{tx.customer}</td>
                                <td className="px-5 py-3.5 text-sm font-mono font-semibold text-white/90">{tx.amount}</td>
                                <td className="px-5 py-3.5 text-xs font-mono text-white/40">{tx.country}</td>
                                <td className="px-5 py-3.5">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border capitalize"
                                        style={{ color: statusColor[tx.status], background: statusBg[tx.status], borderColor: `${statusColor[tx.status]}30` }}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5"><RiskBadge score={tx.riskScore} /></td>
                                <td className="px-5 py-3.5 text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{tx.time}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-5 py-12 text-center text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                                    No transactions match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail drawer */}
            {selectedTx && <TransactionDetail tx={selectedTx} onClose={closeDetail} />}
        </main>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense>
            <TransactionsInner />
        </Suspense>
    );
}
