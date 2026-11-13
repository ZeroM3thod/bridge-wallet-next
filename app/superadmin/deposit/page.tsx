"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type Deposit = { id: string; out_trade_no: string; gateway_transaction_id: string | null; method: string; amount: number; status: string; created_at: number; paid_at: number | null; user_id: string; name: string; phone: string; email: string; balance: number }
type DepositEvent = { id: string; deposit_id: string; actor_id: string | null; event: string; previous_status: string | null; new_status: string; note: string | null; created_at: number; actor_name: string | null }
const money = (amount: number) => `৳${(amount / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`

export default function AdminDepositsPage() {
  const [rows, setRows] = useState<Deposit[]>([])
  const [events, setEvents] = useState<DepositEvent[]>([])
  const [filter, setFilter] = useState("all")
  const [minimumAmount, setMinimumAmount] = useState(300)
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/deposits", { credentials: "include", cache: "no-store" })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Could not load deposits")
    setRows(data.deposits)
    setEvents(data.events)
    setMinimumAmount(data.settings?.minimum_amount ?? 300)
  }, [])
  useEffect(() => { load().catch((e) => setError(e.message)) }, [load])
  const review = async (id: string, action: "approve" | "reject") => {
    setBusy(id); setError("")
    try {
      const response = await fetch("/api/admin/deposits", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Review failed")
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : "Review failed") }
    finally { setBusy("") }
  }
  const saveMinimum = async () => {
    setBusy("settings"); setError("")
    try {
      const response = await fetch("/api/admin/deposits", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "settings", minimumAmount }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save minimum deposit")
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save minimum deposit") }
    finally { setBusy("") }
  }
  const visible = rows.filter((row) => filter === "all" || row.status === filter)
  const pendingCount = rows.filter((row) => row.status === "pending" || row.status === "failed").length
  const eventLabels: Record<string, string> = { created: "Request created", paid: "Gateway payment confirmed", failed: "Payment failed", cancelled: "Payment cancelled", approved: "Admin approved", rejected: "Admin rejected / reversed" }
  return <div className="ad deposit-admin"><AdminSidebar active="deposits" /><main className="ad-main">
    <header className="ad-top"><div><p className="deposit-eyebrow">PAYMENT MANAGEMENT</p><h1>Deposit history</h1><p className="deposit-subtitle">Review requests and manage wallet credits.</p></div></header>
    <section className="ad-grid" aria-label="Deposit summary">
      <article className="ad-card"><p className="ad-card-label">Total requests</p><p className="ad-card-value">{rows.length}</p><p className="ad-card-note">All recorded deposits</p></article>
      <article className="ad-card"><p className="ad-card-label">Awaiting review</p><p className="ad-card-value">{pendingCount}</p><p className="ad-card-note">Pending or failed payments</p></article>
      <article className="ad-card"><p className="ad-card-label">Approved deposits</p><p className="ad-card-value">{rows.filter((row) => row.status === "paid").length}</p><p className="ad-card-note">Wallet credited</p></article>
    </section>
    <section className="ad-panel deposit-panel"><div className="deposit-panel-head"><div><h2>Minimum deposit</h2><p className="ad-muted">Set the lowest amount users can deposit.</p></div><label className="deposit-filter">Amount (৳) <input type="number" min="1" step="1" value={minimumAmount} onChange={(e) => setMinimumAmount(Number(e.target.value))} /></label><button className="deposit-action" disabled={busy === "settings"} onClick={saveMinimum}>{busy === "settings" ? "Saving…" : "Save minimum"}</button></div></section>
    <section className="ad-panel deposit-panel"><div className="deposit-panel-head"><div><h2>All deposits</h2><p className="ad-muted">Full request details, gateway outcomes, admin actions, and wallet history.</p></div><label className="deposit-filter">Status <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All</option><option value="pending">Pending</option><option value="paid">Paid / approved</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected / reversed</option></select></label></div>
      {error && <p className="deposit-error" role="alert">{error}</p>}
      <div className="ad-table-wrap"><table className="deposit-table"><thead><tr><th>User</th><th>Deposit details</th><th>Method</th><th>Amount</th><th>Status / dates</th><th>Date</th><th>Action</th><th>Audit history</th></tr></thead><tbody>
        {visible.map((row) => <tr key={row.id}><td><strong>{row.name}</strong><span className="deposit-secondary">User ID: {row.user_id}</span><span className="deposit-secondary">{row.phone}</span><span className="deposit-secondary">{row.email}</span></td><td><strong>{row.out_trade_no}</strong><span className="deposit-secondary">Deposit ID: {row.id}</span><span className="deposit-secondary">Gateway TX: {row.gateway_transaction_id || "—"}</span><span className="deposit-secondary">Wallet now: {money(row.balance)}</span></td><td>{row.method}</td><td className="deposit-amount">{money(row.amount)}</td><td><span className={`ad-pill ${row.status === "paid" ? "ad-completed" : row.status === "pending" ? "ad-pending" : "ad-rejected"}`}>{row.status === "paid" ? "Paid / approved" : row.status === "pending" ? "Pending" : row.status === "cancelled" ? "Cancelled" : row.status === "rejected" ? "Rejected / reversed" : "Failed"}</span><span className="deposit-secondary">Created: {new Date(row.created_at).toLocaleString()}</span>{row.paid_at && <span className="deposit-secondary">Paid: {new Date(row.paid_at).toLocaleString()}</span>}</td><td className="ad-muted">{new Date(row.created_at).toLocaleString()}</td><td>{row.status === "paid" ? <button className="deposit-action is-reject" disabled={busy === row.id} onClick={() => review(row.id, "reject")}>{busy === row.id ? "Saving…" : "Reject"}</button> : row.status === "failed" ? <button className="deposit-action" disabled={busy === row.id} onClick={() => review(row.id, "approve")}>{busy === row.id ? "Saving…" : "Approve"}</button> : <span className="deposit-secondary">—</span>}</td><td><details className="deposit-events"><summary>History ({events.filter((event) => event.deposit_id === row.id).length})</summary>{events.filter((event) => event.deposit_id === row.id).map((event) => <div className="deposit-event" key={event.id}><strong>{eventLabels[event.event] || event.event}</strong><span>{event.previous_status ? `${event.previous_status} → ${event.new_status}` : `Status: ${event.new_status}`}</span><span>{event.note || "—"}</span><span>{event.actor_name ? `By ${event.actor_name}` : event.actor_id ? `Admin ID ${event.actor_id}` : "System / gateway"} · {new Date(event.created_at).toLocaleString()}</span></div>)}</details></td></tr>)}
        {!visible.length && <tr><td colSpan={7} className="deposit-empty">No deposit records found.</td></tr>}
      </tbody></table></div>
    </section>
  </main><style>{styles}</style></div>
}

const styles = `
.deposit-events summary{cursor:pointer;color:#0369a1;font-weight:600;white-space:nowrap}.deposit-event{padding:9px 0;border-bottom:1px solid #e3eef5;font-size:12px;min-width:230px}.deposit-event span{display:block;color:#5b7488}
.deposit-admin{--sky-50:#f0f9ff;--sky-100:#e0f2fe;--sky-200:#bae6fd;--sky-500:#0ea5e9;--sky-600:#0284c7;--sky-700:#0369a1;--ink:#0c2a3d;--muted:#5b7488;--line:#e3eef5;--bg:#f7fbfe;--card:#fff;display:flex;min-height:100vh;background:var(--bg);color:var(--ink);font:15px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.deposit-admin *{box-sizing:border-box}.deposit-admin h1,.deposit-admin h2,.deposit-admin p{margin:0}.deposit-admin .ad-side{width:240px;flex:none;background:#fff;border-right:1px solid var(--line);padding:20px 14px;display:flex;flex-direction:column;gap:20px;position:sticky;top:0;height:100vh}.deposit-admin .ad-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;padding:4px 10px}.deposit-admin .ad-logo{width:22px;height:22px;border-radius:7px;background:var(--sky-500)}.deposit-admin .ad-nav{display:flex;flex-direction:column;gap:2px}.deposit-admin .ad-link{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;background:transparent;color:var(--muted);font:inherit;font-weight:500;padding:10px 12px;border-radius:10px;cursor:pointer}.deposit-admin .ad-link:hover,.deposit-admin .ad-link.is-active{background:var(--sky-100);color:var(--sky-700)}.deposit-admin .ad-burger{display:none}.deposit-admin .ad-main{flex:1;min-width:0;padding:32px}.deposit-eyebrow{color:var(--sky-600);font-size:11px;font-weight:700;letter-spacing:.12em;margin-bottom:5px!important}.deposit-admin .ad-top{margin-bottom:24px}.deposit-admin .ad-top h1{font-size:26px;letter-spacing:-.03em}.deposit-subtitle{color:var(--muted);margin-top:4px!important}.deposit-admin .ad-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.deposit-admin .ad-card,.deposit-panel{background:#fff;border:1px solid var(--line);border-radius:14px}.deposit-admin .ad-card{padding:18px 20px}.deposit-admin .ad-card-label,.deposit-admin .ad-card-note{color:var(--muted);font-size:13px}.deposit-admin .ad-card-value{font-size:28px;font-weight:700;color:var(--sky-700);margin-top:5px!important}.deposit-admin .ad-card-note{margin-top:3px!important}.deposit-panel{margin-top:18px;padding:20px}.deposit-panel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}.deposit-panel h2{font-size:17px}.deposit-panel-head .ad-muted{font-size:13px;margin-top:3px}.deposit-filter{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px}.deposit-filter select{border:1px solid var(--line);border-radius:9px;padding:8px 10px;color:var(--ink);background:#fff;font:inherit}.deposit-admin .ad-table-wrap{overflow-x:auto}.deposit-admin table{width:100%;border-collapse:collapse;min-width:900px}.deposit-admin th{text-align:left;color:var(--muted);font-size:12px;font-weight:600;padding:10px 12px;border-bottom:1px solid var(--line)}.deposit-admin td{padding:13px 12px;border-bottom:1px solid var(--line);vertical-align:middle}.deposit-admin tr:last-child td{border-bottom:0}.deposit-secondary{display:block;color:var(--muted);font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis}.deposit-amount{font-weight:700;white-space:nowrap}.deposit-admin .ad-pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}.deposit-admin .ad-completed{background:#dcfce7;color:#166534}.deposit-admin .ad-pending{background:#fff4d6;color:#8a5a00}.deposit-admin .ad-rejected{background:#fee2e2;color:#a12525}.deposit-action{border:0;border-radius:8px;background:var(--sky-600);color:white;padding:8px 13px;font:600 13px inherit;cursor:pointer}.deposit-action.is-reject{background:#fff;color:#b42318;border:1px solid #fecaca}.deposit-action:disabled{opacity:.55;cursor:not-allowed}.deposit-error{margin-bottom:12px!important;padding:10px 12px;border-radius:8px;background:#fff1f0;color:#a12525}.deposit-empty{text-align:center;color:var(--muted);padding:32px!important}
@media(max-width:900px){.deposit-admin .ad-main{padding:24px 18px}.deposit-admin .ad-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.deposit-admin .ad-side{position:fixed;left:0;top:0;z-index:30;transform:translateX(-100%);transition:transform .2s}.deposit-admin .ad-side.is-open{transform:none}.deposit-admin .ad-scrim{position:fixed;inset:0;z-index:20;background:#0c2a3d55}.deposit-admin .ad-burger{display:inline-flex;position:fixed;z-index:10;top:14px;left:14px;border:1px solid var(--line);background:#fff;border-radius:9px;padding:8px}.deposit-admin .ad-main{padding:68px 14px 32px}.deposit-admin .ad-grid{grid-template-columns:1fr}.deposit-panel{padding:15px}.deposit-panel-head{align-items:flex-start;flex-direction:column}}@media(prefers-reduced-motion:reduce){.deposit-admin .ad-side{transition:none}}
`
