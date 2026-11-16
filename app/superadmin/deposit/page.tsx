"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type Deposit = { id: string; out_trade_no: string; gateway_transaction_id: string | null; method: string; amount: number; status: string; created_at: number; paid_at: number | null; user_id: string; name: string; phone: string; email: string; balance: number }
type DepositEvent = { id: string; deposit_id: string; actor_id: string | null; event: string; previous_status: string | null; new_status: string; note: string | null; created_at: number; actor_name: string | null }
const money = (amount: number) => `৳${amount.toLocaleString("en-BD")}`

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
    <header className="ad-top"><div className="ad-top-title"><p className="deposit-eyebrow">PAYMENT MANAGEMENT</p><h1>Deposit history</h1><p className="ad-subtitle">Review requests and manage wallet credits.</p></div></header>
    <section className="ad-grid" aria-label="Deposit summary">
      <article className="ad-card"><p className="ad-card-label">Total requests</p><p className="ad-card-value">{rows.length}</p><p className="ad-card-note">All recorded deposits</p></article>
      <article className="ad-card"><p className="ad-card-label">Awaiting review</p><p className="ad-card-value">{pendingCount}</p><p className="ad-card-note">Pending or failed payments</p></article>
      <article className="ad-card"><p className="ad-card-label">Approved deposits</p><p className="ad-card-value">{rows.filter((row) => row.status === "paid").length}</p><p className="ad-card-note">Wallet credited</p></article>
    </section>
    <section className="ad-panel deposit-panel">
      <div className="ad-panel-head"><div><h2>Minimum deposit</h2><p className="ad-muted">Set the lowest amount users can deposit.</p></div>
        <div className="ad-inline-form">
          <label className="deposit-filter">Amount (৳) <input type="number" min="1" step="1" value={minimumAmount} onChange={(e) => setMinimumAmount(Number(e.target.value))} /></label>
          <button className="ad-btn ad-btn-primary deposit-action" disabled={busy === "settings"} onClick={saveMinimum}>{busy === "settings" ? "Saving…" : "Save minimum"}</button>
        </div>
      </div>
    </section>
    <section className="ad-panel deposit-panel">
      <div className="ad-panel-head"><div><h2>All deposits</h2><p className="ad-muted">Full request details, gateway outcomes, admin actions, and wallet history.</p></div>
        <label className="deposit-filter">Status <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All</option><option value="pending">Pending</option><option value="paid">Paid / approved</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected / reversed</option></select></label>
      </div>
      {error && <p className="ad-alert" role="alert">{error}</p>}
      <div className="ad-table-wrap"><table className="deposit-table ad-cards"><thead><tr><th>User</th><th>Deposit details</th><th>Method</th><th>Amount</th><th>Status / dates</th><th>Date</th><th>Action</th><th>Audit history</th></tr></thead><tbody>
        {visible.map((row) => <tr key={row.id}>
          <td data-label="User"><div className="ad-cell"><strong>{row.name}</strong><span className="ad-secondary">User ID: {row.user_id}</span><span className="ad-secondary">{row.phone}</span><span className="ad-secondary">{row.email}</span></div></td>
          <td data-label="Deposit"><div className="ad-cell"><strong>{row.out_trade_no}</strong><span className="ad-secondary">Deposit ID: {row.id}</span><span className="ad-secondary">Gateway TX: {row.gateway_transaction_id || "—"}</span><span className="ad-secondary">Wallet now: {money(row.balance)}</span></div></td>
          <td data-label="Method"><div className="ad-cell">{row.method}</div></td>
          <td data-label="Amount"><div className="ad-cell ad-amount">{money(row.amount)}</div></td>
          <td data-label="Status"><div className="ad-cell"><span className={`ad-pill ${row.status === "paid" ? "ad-completed" : row.status === "pending" ? "ad-pending" : "ad-rejected"}`}>{row.status === "paid" ? "Paid / approved" : row.status === "pending" ? "Pending" : row.status === "cancelled" ? "Cancelled" : row.status === "rejected" ? "Rejected / reversed" : "Failed"}</span><span className="ad-secondary">Created: {new Date(row.created_at).toLocaleString()}</span>{row.paid_at && <span className="ad-secondary">Paid: {new Date(row.paid_at).toLocaleString()}</span>}</div></td>
          <td data-label="Date"><div className="ad-cell ad-muted">{new Date(row.created_at).toLocaleString()}</div></td>
          <td data-label="Action"><div className="ad-cell">{row.status !== "rejected" && <><button className="ad-btn ad-btn-primary ad-btn-sm deposit-action" disabled={busy === row.id} onClick={() => review(row.id, "approve")}>{busy === row.id ? "Saving…" : "Approve / credit"}</button><button className="ad-btn ad-btn-danger-ghost ad-btn-sm deposit-action is-reject" disabled={busy === row.id} onClick={() => review(row.id, "reject")}>{busy === row.id ? "Saving…" : "Reject"}</button></>}</div></td>
          <td data-label="History"><div className="ad-cell"><details className="deposit-events"><summary>History ({events.filter((event) => event.deposit_id === row.id).length})</summary>{events.filter((event) => event.deposit_id === row.id).map((event) => <div className="deposit-event" key={event.id}><strong>{eventLabels[event.event] || event.event}</strong><span>{event.previous_status ? `${event.previous_status} → ${event.new_status}` : `Status: ${event.new_status}`}</span><span>{event.note || "—"}</span><span>{event.actor_name ? `By ${event.actor_name}` : event.actor_id ? `Admin ID ${event.actor_id}` : "System / gateway"} · {new Date(event.created_at).toLocaleString()}</span></div>)}</details></div></td>
        </tr>)}
        {!visible.length && <tr><td colSpan={8} className="ad-empty">No deposit records found.</td></tr>}
      </tbody></table></div>
    </section>
  </main></div>
}
