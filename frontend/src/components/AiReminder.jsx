import React, { useState, useEffect } from "react";
import GeminiIcon from "./GeminiIcon";

const API_BASE = "http://localhost:4000";

/* ── tiny inline icons ─────────────────────────────────────────── */
const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);
const CopyIcon = ({ checked }) => checked ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);
const SparklesIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
);

/* ────────────────────────────────────────────────────────────────── */
export default function AiReminderModal({ open, onClose, invoice }) {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [generated, setGenerated] = useState(false);

    /* Reset every time the modal opens with a new invoice */
    useEffect(() => {
        if (open) {
            setSubject("");
            setBody("");
            setError("");
            setCopied(false);
            setGenerated(false);
        }
    }, [open, invoice?.id]);

    if (!open || !invoice) return null;

    /* pull client info */
    const clientName = invoice?.client?.name || invoice?.client || "";
    const clientEmail = invoice?.client?.email || invoice?.email || "";
    const amount = invoice?.amount ?? 0;
    const currency = invoice?.currency || "INR";
    const dueDate = invoice?.dueDate || "";
    const status = invoice?.status || "Unpaid";
    const notes = invoice?.notes || "";

    /* ── Generate via backend ─────────────────────────────────────── */
    async function handleGenerate() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/ai/reminder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoiceId: invoice.id,
                    clientName,
                    clientEmail,
                    amount,
                    currency,
                    dueDate,
                    notes,
                    status,
                }),
            });

            const json = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(json?.message || json?.detail || `Error ${res.status}`);
            }

            const data = json?.data || json;
            setSubject(data?.subject || "");
            setBody(data?.body || "");
            setGenerated(true);
        } catch (err) {
            setError(err?.message || "Failed to generate reminder. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    /* ── Copy both subject + body ─────────────────────────────────── */
    async function handleCopy() {
        const text = `Subject: ${subject}\n\n${body}`;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* fallback */
            const el = document.createElement("textarea");
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    /* ── Open in native mail client ────────────────────────────────── */
    function handleSendMail() {
        const to = encodeURIComponent(clientEmail);
        const sub = encodeURIComponent(subject || `Invoice Reminder – ${invoice.id}`);
        const bod = encodeURIComponent(body || "");
        window.location.href = `mailto:${to}?subject=${sub}&body=${bod}`;
    }

    /* ── Styles ────────────────────────────────────────────────────── */
    const S = {
        overlay: { position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
        backdrop: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" },
        modal: {
            position: "relative", width: "100%", maxWidth: 620, background: "#fff",
            borderRadius: 20, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
            zIndex: 10, maxHeight: "90vh", overflowY: "auto",
        },
        /* header */
        headerRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
        badge: {
            display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
            borderRadius: 20, background: "linear-gradient(135deg,#eff6ff,#eef2ff)",
            border: "1px solid #bfdbfe", fontSize: 12, fontWeight: 600, color: "#3730a3",
            marginBottom: 8,
        },
        title: { fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 },
        subtitle: { fontSize: 13, color: "#6b7280", marginTop: 4 },
        closeBtn: {
            border: "none", background: "none", cursor: "pointer", color: "#9ca3af",
            fontSize: 18, padding: 4, lineHeight: 1, borderRadius: 8,
            transition: "color 0.15s, background 0.15s",
        },
        /* invoice summary strip */
        strip: {
            display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20,
            padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0",
        },
        stripItem: { display: "flex", flexDirection: "column", gap: 2, minWidth: 100, flex: 1 },
        stripLabel: { fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
        stripValue: { fontSize: 13, fontWeight: 600, color: "#1e293b" },
        /* generate button */
        genBtn: {
            width: "100%", marginTop: 20, padding: "12px 20px", borderRadius: 12,
            border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            color: "#fff", boxShadow: "0 4px 15px rgba(99,102,241,0.35)",
            transition: "opacity 0.2s, transform 0.15s",
        },
        /* preview area */
        previewBox: {
            marginTop: 20, borderRadius: 12, border: "1px solid #e2e8f0",
            background: "#f8fafc", overflow: "hidden",
        },
        previewHeader: {
            padding: "10px 16px", background: "linear-gradient(135deg,#eff6ff,#eef2ff)",
            borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600,
            color: "#4f46e5", display: "flex", alignItems: "center", gap: 6,
        },
        subjectRow: {
            padding: "10px 16px", borderBottom: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", gap: 8,
        },
        subjectLabel: { fontSize: 12, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap" },
        subjectInput: {
            flex: 1, border: "none", background: "transparent", fontSize: 13,
            color: "#111827", fontWeight: 500, outline: "none",
        },
        bodyTextarea: {
            width: "100%", minHeight: 160, padding: "12px 16px", border: "none",
            background: "transparent", fontSize: 13, color: "#374151",
            lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box",
            fontFamily: "inherit",
        },
        /* error */
        errorBox: {
            marginTop: 12, padding: "10px 14px", borderRadius: 10,
            background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13,
        },
        /* footer actions */
        footer: { display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end", flexWrap: "wrap" },
        copyBtn: {
            display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px",
            borderRadius: 10, border: "1px solid #d1d5db", background: "#fff",
            color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer",
            transition: "background 0.15s",
        },
        sendBtn: {
            display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px",
            borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 3px 10px rgba(99,102,241,0.3)", transition: "opacity 0.15s",
        },
    };

    /* helper: format currency */
    function fmt(n, cur = "INR") {
        try { return new Intl.NumberFormat("en-IN", { style: "currency", currency: cur }).format(n); }
        catch { return `${cur} ${n}`; }
    }
    /* helper: format date */
    function fmtDate(d) {
        if (!d) return "—";
        const dt = new Date(d);
        if (isNaN(dt)) return d;
        return dt.toLocaleDateString("en-GB");
    }

    return (
        <div style={S.overlay}>
            {/* backdrop */}
            <div style={S.backdrop} onClick={onClose} />

            <div style={S.modal}>
                {/* ── Header ─────────────────────────────────────────── */}
                <div style={S.headerRow}>
                    <div>
                        <div style={S.badge}>
                            <GeminiIcon className="w-4 h-4" />
                            AI-Powered Reminder
                        </div>
                        <h3 style={S.title}>Send Payment Reminder</h3>
                        <p style={S.subtitle}>
                            Let AI craft a professional reminder for <strong>{clientName || invoice.id}</strong>
                        </p>
                    </div>
                    <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* ── Invoice summary strip ──────────────────────────── */}
                <div style={S.strip}>
                    <div style={S.stripItem}>
                        <span style={S.stripLabel}>Invoice</span>
                        <span style={S.stripValue}>{invoice.id}</span>
                    </div>
                    <div style={S.stripItem}>
                        <span style={S.stripLabel}>Client</span>
                        <span style={S.stripValue}>{clientName || "—"}</span>
                    </div>
                    <div style={S.stripItem}>
                        <span style={S.stripLabel}>Amount Due</span>
                        <span style={S.stripValue}>{fmt(amount, currency)}</span>
                    </div>
                    <div style={S.stripItem}>
                        <span style={S.stripLabel}>Due Date</span>
                        <span style={S.stripValue}>{fmtDate(dueDate)}</span>
                    </div>
                    <div style={S.stripItem}>
                        <span style={S.stripLabel}>Status</span>
                        <span style={{
                            ...S.stripValue,
                            color: status.toLowerCase() === "overdue" ? "#dc2626"
                                : status.toLowerCase() === "paid" ? "#16a34a"
                                    : "#d97706"
                        }}>{status}</span>
                    </div>
                </div>

                {/* ── Generate button ────────────────────────────────── */}
                <button
                    style={{ ...S.genBtn, opacity: loading ? 0.75 : 1 }}
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ animation: "spin 1s linear infinite" }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Generating with AI…
                        </>
                    ) : (
                        <>
                            <SparklesIcon />
                            {generated ? "Re-generate Email" : "Generate Reminder Email"}
                            <GeminiIcon className="w-4 h-4" />
                        </>
                    )}
                </button>

                {/* ── Error ─────────────────────────────────────────── */}
                {error && <div style={S.errorBox}>⚠ {error}</div>}

                {/* ── Preview / Edit area ────────────────────────────── */}
                {generated && !loading && (
                    <div style={S.previewBox}>
                        <div style={S.previewHeader}>
                            <MailIcon />
                            AI-Generated Email &nbsp;·&nbsp; You can edit before sending
                        </div>

                        {/* Subject */}
                        <div style={S.subjectRow}>
                            <span style={S.subjectLabel}>Subject:</span>
                            <input
                                style={S.subjectInput}
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Email subject…"
                            />
                        </div>

                        {/* Body */}
                        <textarea
                            style={S.bodyTextarea}
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="Email body…"
                        />
                    </div>
                )}

                {/* ── Footer actions ─────────────────────────────────── */}
                {generated && !loading && (
                    <div style={S.footer}>
                        <button style={S.copyBtn} onClick={handleCopy}>
                            <CopyIcon checked={copied} />
                            {copied ? "Copied!" : "Copy Email"}
                        </button>

                        <button
                            style={{ ...S.sendBtn, opacity: clientEmail ? 1 : 0.6 }}
                            onClick={handleSendMail}
                            title={clientEmail ? `Send to ${clientEmail}` : "No client email on record"}
                        >
                            <MailIcon />
                            Open in Mail App
                        </button>
                    </div>
                )}
            </div>

            {/* spin keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
