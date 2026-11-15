# Admin panel files

## `app/superadmin/layout.tsx`

```tsx
import "./admin.css"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

```

## `components/admin/AdminSidebar.tsx`

```tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

const items = [
  ["dashboard", "Dashboard", "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z"],
  ["users", "Users", "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0"],
  ["deposits", "Deposits", "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"],
  ["withdraws", "Withdraws", "M12 15V3m0 0L8 7m4-4l4 4M4 21h16"],
  ["withdrawal", "Withdrawal requests", "M4 6h16M4 12h16M4 18h16"],
  ["packages", "Packages", "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"],
  ["referrals", "Referral Manage", "M17 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM7 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 21a5 5 0 0 0-8-4"],
  ["support", "Support Manage", "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"],
  ["settings", "Settings", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"],
] as const
const routes: Record<string, string> = { dashboard: "/superadmin", users: "/superadmin/users", deposits: "/superadmin/deposit", withdrawal: "/superadmin/withdrawal", referrals: "/superadmin/reffer", settings: "/superadmin/settings", support: "/superadmin/support" }

export function AdminSidebar({ active: activeOverride, onNavigate }: { active?: string; onNavigate?: (key: string) => void } = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const active = activeOverride ?? (pathname === "/superadmin" ? "dashboard" : pathname.split("/").pop())
  const go = (key: string) => {
    onNavigate?.(key)
    router.push(routes[key] ?? `/superadmin/${key}`)
    setOpen(false)
  }
  return <>
    {open && <button className="ad-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <button className="ad-burger" aria-label="Open menu" onClick={() => setOpen(true)}><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
    <aside className={`ad-side ${open ? "is-open" : ""}`}><div className="ad-brand"><span className="ad-logo" />Admin</div><nav className="ad-nav" aria-label="Admin">
      {items.map(([key, label, d]) => <button key={key} className={`ad-link ${active === key ? "is-active" : ""}`} aria-current={active === key ? "page" : undefined} onClick={() => go(key)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>{label}</button>)}
    </nav></aside>
  </>
}

```

## `app/superadmin/admin.css`

```css
.ad{--sky-50:#f0f9ff;--sky-100:#e0f2fe;--sky-200:#bae6fd;--sky-500:#0ea5e9;--sky-600:#0284c7;--sky-700:#0369a1;--ink:#0c2a3d;--muted:#5b7488;--line:#e3eef5;--bg:#f7fbfe;--card:#fff;display:flex;min-height:100vh;background:var(--bg);color:var(--ink);font:15px/1.5 ui-sans-serif,system-ui,"Segoe UI",sans-serif}
.ad *{box-sizing:border-box}.ad h1,.ad h2,.ad p{margin:0}.ad-side{width:240px;flex:none;background:var(--card);border-right:1px solid var(--line);padding:20px 14px;display:flex;flex-direction:column;gap:20px;position:sticky;top:0;height:100vh}.ad-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;padding:4px 10px}.ad-logo{width:22px;height:22px;border-radius:7px;background:var(--sky-500)}.ad-nav{display:flex;flex-direction:column;gap:2px}.ad-link{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;background:transparent;color:var(--muted);font:inherit;font-weight:500;padding:10px 12px;border-radius:10px;cursor:pointer}.ad-link:hover,.ad-link.is-active{background:var(--sky-100);color:var(--sky-700)}.ad-link:focus-visible,.ad-burger:focus-visible{outline:2px solid var(--sky-500);outline-offset:2px}.ad-main{flex:1;min-width:0;padding:28px 32px 48px}.ad-top{display:flex;align-items:center;gap:12px;margin-bottom:24px}.ad-top h1{font-size:24px}.ad-burger{display:none;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:10px;padding:8px;cursor:pointer}.ad-scrim{display:none}
@media(max-width:760px){.ad-side{position:fixed;left:0;top:0;z-index:30;transform:translateX(-100%);transition:transform .2s ease}.ad-side.is-open{transform:none}.ad-scrim{display:block;position:fixed;inset:0;background:rgba(12,42,61,.35);z-index:20;border:0}.ad-burger{display:inline-flex;margin:16px 0 0 16px}.ad-main{padding:20px 16px 40px}}
@media(prefers-reduced-motion:reduce){.ad-side{transition:none}}

```

## `app/superadmin/page.tsx`

```tsx
"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

/* ------------------------------------------------------------------ */
/*  Types + data                                                       */
/* ------------------------------------------------------------------ */

export type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdraws: number;
  totalStake: number;
  pendingWithdraws: number;
  referralPaid: number;
  activePackages: number;
};

type Activity = {
  id: string;
  user: string;
  type: "Deposit" | "Withdraw" | "Stake";
  amount: number;
  status: "Completed" | "Pending" | "Rejected";
  date: string;
};

const DEFAULT_STATS: DashboardStats = {
  totalUsers: 1248,
  activeUsers: 612,
  totalDeposits: 184250,
  totalWithdraws: 96480,
  totalStake: 73900,
  pendingWithdraws: 14,
  referralPaid: 8320,
  activePackages: 389,
};

const RECENT: Activity[] = [
  { id: "1", user: "rakib_h", type: "Deposit", amount: 500, status: "Completed", date: "Today, 10:42" },
  { id: "2", user: "nusrat22", type: "Withdraw", amount: 120, status: "Pending", date: "Today, 09:15" },
  { id: "3", user: "sajid.bd", type: "Stake", amount: 300, status: "Completed", date: "Yesterday, 21:03" },
  { id: "4", user: "tanvir_x", type: "Withdraw", amount: 75, status: "Rejected", date: "Yesterday, 18:27" },
  { id: "5", user: "mim_k", type: "Deposit", amount: 1000, status: "Completed", date: "Yesterday, 14:50" },
];

const money = (n: number) =>
  "à§³" + n.toLocaleString("en-BD", { maximumFractionDigits: 0 });
const num = (n: number) => n.toLocaleString("en-US");

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminDashboard({
  stats = DEFAULT_STATS,
  recent = RECENT,
}: {
  stats?: DashboardStats;
  recent?: Activity[];
}) {
  const cards = [
    { label: "Total users", value: num(stats.totalUsers), note: `${num(stats.activeUsers)} active now` },
    { label: "Active users", value: num(stats.activeUsers), note: `${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% of all users` },
    { label: "Total deposits", value: money(stats.totalDeposits), note: "All time" },
    { label: "Total withdraws", value: money(stats.totalWithdraws), note: `${stats.pendingWithdraws} waiting for approval` },
    { label: "Total stake", value: money(stats.totalStake), note: `${num(stats.activePackages)} active packages` },
    { label: "Referral paid", value: money(stats.referralPaid), note: "Bonus paid out" },
  ];

  return (
    <div className="ad">
      <style>{css}</style>

      <AdminSidebar active="dashboard" />

      <main className="ad-main">
        <header className="ad-top">
          <h1>Dashboard</h1>
        </header>

        <section className="ad-grid" aria-label="Overview">
          {cards.map((c) => (
            <article key={c.label} className="ad-card">
              <p className="ad-card-label">{c.label}</p>
              <p className="ad-card-value">{c.value}</p>
              <p className="ad-card-note">{c.note}</p>
            </article>
          ))}
        </section>

        <section className="ad-panel">
          <h2>Recent activity</h2>
          <div className="ad-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.user}</td>
                    <td>{r.type}</td>
                    <td>{money(r.amount)}</td>
                    <td>
                      <span className={`ad-pill ad-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="ad-muted">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const css = `
.ad{
  --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd; --sky-500:#0ea5e9; --sky-600:#0284c7; --sky-700:#0369a1;
  --ink:#0c2a3d; --muted:#5b7488; --line:#e3eef5; --bg:#f7fbfe; --card:#ffffff;
  display:flex; min-height:100vh; background:var(--bg); color:var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size:15px; line-height:1.5;
}
.ad *{box-sizing:border-box}
.ad h1,.ad h2,.ad p{margin:0}

.ad-side{
  width:240px; flex:none; background:var(--card); border-right:1px solid var(--line);
  padding:20px 14px; display:flex; flex-direction:column; gap:20px;
  position:sticky; top:0; height:100vh;
}
.ad-brand{display:flex; align-items:center; gap:10px; font-weight:700; font-size:17px; padding:4px 10px}
.ad-logo{width:22px; height:22px; border-radius:7px; background:var(--sky-500); display:inline-block}
.ad-nav{display:flex; flex-direction:column; gap:2px}
.ad-link{
  display:flex; align-items:center; gap:12px; width:100%; text-align:left;
  border:0; background:transparent; color:var(--muted); font:inherit; font-weight:500;
  padding:10px 12px; border-radius:10px; cursor:pointer;
  transition:background .15s, color .15s;
}
.ad-link:hover{background:var(--sky-50); color:var(--sky-700)}
.ad-link.is-active{background:var(--sky-100); color:var(--sky-700)}
.ad-link:focus-visible,.ad-burger:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}

.ad-main{flex:1; min-width:0; padding:28px 32px 48px}
.ad-top{display:flex; align-items:center; gap:12px; margin-bottom:24px}
.ad-top h1{font-size:24px; font-weight:700; letter-spacing:-.01em}
.ad-burger{display:none; border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:10px; padding:8px; cursor:pointer}

.ad-grid{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px}
.ad-card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px 20px}
.ad-card-label{color:var(--muted); font-size:14px}
.ad-card-value{font-size:30px; font-weight:700; letter-spacing:-.02em; margin-top:6px; color:var(--sky-700)}
.ad-card-note{color:var(--muted); font-size:13px; margin-top:4px}

.ad-panel{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px; margin-top:16px}
.ad-panel h2{font-size:17px; font-weight:600; margin-bottom:12px}
.ad-table-wrap{overflow-x:auto}
.ad table{width:100%; border-collapse:collapse; min-width:520px}
.ad th{text-align:left; font-weight:500; color:var(--muted); font-size:13px; padding:8px 12px; border-bottom:1px solid var(--line)}
.ad td{padding:12px; border-bottom:1px solid var(--line)}
.ad tr:last-child td{border-bottom:0}
.ad-muted{color:var(--muted)}
.ad-pill{display:inline-block; padding:2px 10px; border-radius:999px; font-size:12.5px; font-weight:500}
.ad-completed{background:var(--sky-100); color:var(--sky-700)}
.ad-pending{background:#fff4d6; color:#8a5a00}
.ad-rejected{background:#fde4e4; color:#a12525}

.ad-scrim{display:none}

@media (max-width:1024px){ .ad-grid{grid-template-columns:repeat(2,minmax(0,1fr))} }
@media (max-width:760px){
  .ad-side{position:fixed; left:0; top:0; z-index:30; transform:translateX(-100%); transition:transform .2s ease}
  .ad-side.is-open{transform:none}
  .ad-scrim{display:block; position:fixed; inset:0; background:rgba(12,42,61,.35); z-index:20}
  .ad-burger{display:inline-flex}
  .ad-main{padding:20px 16px 40px}
  .ad-grid{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){ .ad-side,.ad-link{transition:none} }
`;

```

## `app/superadmin/users/page.tsx`

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type User = { id: string; name: string; email: string; phone: string; balance: number | null; role: string; referral_code: string | null; referred_by: string | null; created_at: number }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/users", { credentials: "include", cache: "no-store" }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error || "Users load failed"); setUsers(data.users) }).catch(e => setError(e.message || "Users load failed")).finally(() => setLoading(false)) }, [])
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return users.filter(u => !needle || [u.id, u.name, u.email, u.phone, u.role, u.referral_code].some(value => value?.toLowerCase().includes(needle))) }, [users, query])
  const money = (value: number | null) => `à§³${(value ?? 0).toLocaleString("en-BD")}`

  return <div className="ad"><AdminSidebar active="users" /><main className="ad-main"><header className="ad-top"><div><h1>User management</h1><p className="users-subtitle">{users.length.toLocaleString()} registered users</p></div></header>
    <section className="ad-panel users-panel"><div className="users-toolbar"><h2>All users</h2><input aria-label="Search users" placeholder="Search name, email, phone, IDâ€¦" value={query} onChange={e => setQuery(e.target.value)} /></div>
      {error ? <p role="alert" className="users-error">{error}</p> : <div className="ad-table-wrap"><table className="users-table"><thead><tr>{["User", "Contact", "Balance", "Role", "Referral code", "Referred by", "Joined", "User ID"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
        {loading ? <tr><td colSpan={8}>Loading usersâ€¦</td></tr> : filtered.map(user => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}<br /><span className="ad-muted">{user.phone}</span></td><td>{money(user.balance)}</td><td><span className="users-role">{user.role}</span></td><td>{user.referral_code || "â€”"}</td><td>{user.referred_by || "â€”"}</td><td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "â€”"}</td><td className="users-id" title={user.id}>{user.id}</td></tr>)}
        {!loading && !error && filtered.length === 0 && <tr><td colSpan={8}>No matching users.</td></tr>}
      </tbody></table></div>}
      <p className="users-count">Showing {filtered.length.toLocaleString()} of {users.length.toLocaleString()} users</p>
    </section></main><style>{`.users-subtitle{color:#5b7488;margin-top:3px!important}.users-panel{margin-top:0}.users-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.users-toolbar h2{margin:0}.users-toolbar input{width:min(360px,100%);padding:10px 12px;border:1px solid #d5e4ed;border-radius:9px;font:inherit}.users-table{min-width:1050px}.users-table td{vertical-align:top}.users-id{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:#5b7488}.users-role{padding:3px 9px;border-radius:999px;background:#e0f2fe;color:#0369a1;text-transform:capitalize}.users-count{margin-top:12px!important;font-size:13px;color:#5b7488}.users-error{color:#b91c1c}@media(max-width:600px){.users-toolbar{align-items:stretch;flex-direction:column}}`}</style></div>
}

```

## `app/superadmin/deposit/page.tsx`

```tsx
"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type Deposit = { id: string; out_trade_no: string; gateway_transaction_id: string | null; method: string; amount: number; status: string; created_at: number; paid_at: number | null; user_id: string; name: string; phone: string; email: string; balance: number }
type DepositEvent = { id: string; deposit_id: string; actor_id: string | null; event: string; previous_status: string | null; new_status: string; note: string | null; created_at: number; actor_name: string | null }
const money = (amount: number) => `à§³${(amount / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`

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
    <section className="ad-panel deposit-panel"><div className="deposit-panel-head"><div><h2>Minimum deposit</h2><p className="ad-muted">Set the lowest amount users can deposit.</p></div><label className="deposit-filter">Amount (à§³) <input type="number" min="1" step="1" value={minimumAmount} onChange={(e) => setMinimumAmount(Number(e.target.value))} /></label><button className="deposit-action" disabled={busy === "settings"} onClick={saveMinimum}>{busy === "settings" ? "Savingâ€¦" : "Save minimum"}</button></div></section>
    <section className="ad-panel deposit-panel"><div className="deposit-panel-head"><div><h2>All deposits</h2><p className="ad-muted">Full request details, gateway outcomes, admin actions, and wallet history.</p></div><label className="deposit-filter">Status <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All</option><option value="pending">Pending</option><option value="paid">Paid / approved</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected / reversed</option></select></label></div>
      {error && <p className="deposit-error" role="alert">{error}</p>}
      <div className="ad-table-wrap"><table className="deposit-table"><thead><tr><th>User</th><th>Deposit details</th><th>Method</th><th>Amount</th><th>Status / dates</th><th>Date</th><th>Action</th><th>Audit history</th></tr></thead><tbody>
        {visible.map((row) => <tr key={row.id}><td><strong>{row.name}</strong><span className="deposit-secondary">User ID: {row.user_id}</span><span className="deposit-secondary">{row.phone}</span><span className="deposit-secondary">{row.email}</span></td><td><strong>{row.out_trade_no}</strong><span className="deposit-secondary">Deposit ID: {row.id}</span><span className="deposit-secondary">Gateway TX: {row.gateway_transaction_id || "â€”"}</span><span className="deposit-secondary">Wallet now: {money(row.balance)}</span></td><td>{row.method}</td><td className="deposit-amount">{money(row.amount)}</td><td><span className={`ad-pill ${row.status === "paid" ? "ad-completed" : row.status === "pending" ? "ad-pending" : "ad-rejected"}`}>{row.status === "paid" ? "Paid / approved" : row.status === "pending" ? "Pending" : row.status === "cancelled" ? "Cancelled" : row.status === "rejected" ? "Rejected / reversed" : "Failed"}</span><span className="deposit-secondary">Created: {new Date(row.created_at).toLocaleString()}</span>{row.paid_at && <span className="deposit-secondary">Paid: {new Date(row.paid_at).toLocaleString()}</span>}</td><td className="ad-muted">{new Date(row.created_at).toLocaleString()}</td><td>{row.status === "paid" ? <button className="deposit-action is-reject" disabled={busy === row.id} onClick={() => review(row.id, "reject")}>{busy === row.id ? "Savingâ€¦" : "Reject"}</button> : row.status === "failed" ? <button className="deposit-action" disabled={busy === row.id} onClick={() => review(row.id, "approve")}>{busy === row.id ? "Savingâ€¦" : "Approve"}</button> : <span className="deposit-secondary">â€”</span>}</td><td><details className="deposit-events"><summary>History ({events.filter((event) => event.deposit_id === row.id).length})</summary>{events.filter((event) => event.deposit_id === row.id).map((event) => <div className="deposit-event" key={event.id}><strong>{eventLabels[event.event] || event.event}</strong><span>{event.previous_status ? `${event.previous_status} â†’ ${event.new_status}` : `Status: ${event.new_status}`}</span><span>{event.note || "â€”"}</span><span>{event.actor_name ? `By ${event.actor_name}` : event.actor_id ? `Admin ID ${event.actor_id}` : "System / gateway"} Â· {new Date(event.created_at).toLocaleString()}</span></div>)}</details></td></tr>)}
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

```

## `app/superadmin/withdrawal/page.tsx`

```tsx
"use client"
import {useCallback,useEffect,useState} from "react"
import {AdminSidebar} from "@/components/admin/AdminSidebar"
type Row={id:string;amount:number;fee:number;net:number;status:string;created_at:number;user_id:string;name:string;phone:string;email:string;balance:number;provider:string;account:string}
const money=(n:number)=>`à§³${Number(n).toLocaleString("en-BD")}`
export default function AdminWithdrawals(){
 const [rows,setRows]=useState<Row[]>([]),[min,setMin]=useState(1000),[fee,setFee]=useState(2),[busy,setBusy]=useState(""),[error,setError]=useState("")
 const load=useCallback(async()=>{const r=await fetch('/api/admin/withdrawals',{credentials:'include',cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error);setRows(d.withdrawals);setMin(d.settings.minimum_amount);setFee(d.settings.fee_percent)},[])
 useEffect(()=>{load().catch(e=>setError(e.message))},[load])
 const post=async(body:object)=>{const r=await fetch('/api/admin/withdrawals',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),d=await r.json();if(!r.ok)throw Error(d.error);return d}
 const review=async(id:string,action:'approve'|'reject')=>{setBusy(id);setError('');try{await post({id,action});await load()}catch(e){setError(e instanceof Error?e.message:'Request failed')}finally{setBusy('')}}
 const save=async()=>{setError('');try{await post({action:'settings',minimumAmount:min,feePercent:fee});await load()}catch(e){setError(e instanceof Error?e.message:'Settings save failed')}}
 return <div className="ad"><AdminSidebar active="withdrawal"/><main className="ad-main"><header className="ad-top"><div><p>PAYMENT MANAGEMENT</p><h1>Withdrawal requests</h1></div></header>
 <section className="ad-panel" style={{background:'white',padding:20,borderRadius:14,marginBottom:20}}><h2>Withdrawal settings</h2><div style={{display:'flex',gap:12,marginTop:12,flexWrap:'wrap'}}><label>Minimum amount à§³ <input type="number" min="1" value={min} onChange={e=>setMin(Number(e.target.value))}/></label><label>Fee % <input type="number" min="0" max="100" step="0.1" value={fee} onChange={e=>setFee(Number(e.target.value))}/></label><button onClick={save}>Save settings</button></div></section>
 {error&&<p role="alert">{error}</p>}<section className="ad-panel" style={{background:'white',padding:20,borderRadius:14,overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:950}}><thead><tr>{['User details','Wallet','Amount / fee / net','Status','Requested','Actions'].map(x=><th style={{textAlign:'left',padding:10}} key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id} style={{borderTop:'1px solid #e3eef5'}}><td style={{padding:10}}>{r.name}<br/>{r.phone}<br/>{r.email}<br/>ID: {r.user_id}</td><td>{r.provider} Â· {r.account}</td><td>{money(r.amount)} Â· fee {money(r.fee)} Â· net {money(r.net)}</td><td>{r.status}</td><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.status==='pending'?<><button disabled={busy===r.id} onClick={()=>review(r.id,'approve')}>Approve</button> <button disabled={busy===r.id} onClick={()=>review(r.id,'reject')}>Reject</button></>:'â€”'}</td></tr>)}{!rows.length&&<tr><td colSpan={6} style={{padding:16}}>No withdrawals</td></tr>}</tbody></table></section></main></div>
}

```

## `app/superadmin/withdrawl/page.tsx`

```tsx
export { default } from "../withdrawal/page"

```

## `app/superadmin/packages/page.tsx`

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import "../admin.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Pkg = {
  id: string;
  name: string;
  shortDescription?: string;
  modelNo?: string;
  tankOverview?: string;
  profitMechanism?: string;
  price: number;
  dailyProfit: number;
  durationDays: number;
  maxPerUser: number;
  minVipLevel: number;
  stockLimit: number;
  minActiveReferrals: number;
  requiresPackageId: string;
  allowWhileActive: boolean;
  visible: boolean;
  imageUrl?: string;
};

export type PackageConfig = {
  packages: Pkg[];
};

/* ------------------------------------------------------------------ */
/*  Placeholder data                                                   */
/* ------------------------------------------------------------------ */

const bdt = (n: number) => "à§³" + n.toLocaleString("en-BD", { maximumFractionDigits: 2 });
function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Package form draft                                                 */
/* ------------------------------------------------------------------ */

type Draft = {
  id: string;
  name: string;
  shortDescription: string;
  modelNo: string;
  tankOverview: string;
  profitMechanism: string;
  price: string;
  dailyProfit: string;
  durationDays: string;
  maxPerUser: string;
  minVipLevel: string;
  stockLimit: string;
  minActiveReferrals: string;
  requiresPackageId: string;
  allowWhileActive: boolean;
  visible: boolean;
  imageUrl?: string;
};

const toDraft = (p: Pkg): Draft => ({
  ...p,
  shortDescription: p.shortDescription ?? "",
  modelNo: p.modelNo ?? "",
  tankOverview: p.tankOverview ?? "",
  profitMechanism: p.profitMechanism ?? "",
  price: String(p.price),
  dailyProfit: String(p.dailyProfit),
  durationDays: String(p.durationDays),
  maxPerUser: String(p.maxPerUser),
  minVipLevel: String(p.minVipLevel ?? 0),
  stockLimit: String(p.stockLimit),
  minActiveReferrals: String(p.minActiveReferrals),
});

const emptyDraft = (): Draft => ({
  id: "",
  name: "",
  shortDescription: "",
  modelNo: "",
  tankOverview: "",
  profitMechanism: "",
  price: "",
  dailyProfit: "300",
  durationDays: "",
  maxPerUser: "1",
  minVipLevel: "0",
  stockLimit: "0",
  minActiveReferrals: "0",
  requiresPackageId: "",
  allowWhileActive: false,
  visible: true,
  imageUrl: "",
});

const fromDraft = (d: Draft): Pkg => ({
  id: d.id,
  name: d.name.trim(),
  price: Number(d.price),
  dailyProfit: Number(d.dailyProfit),
  durationDays: Number(d.durationDays),
  maxPerUser: Number(d.maxPerUser),
  minVipLevel: Number(d.minVipLevel),
  stockLimit: Number(d.stockLimit),
  minActiveReferrals: Number(d.minActiveReferrals),
  requiresPackageId: d.requiresPackageId,
  allowWhileActive: d.allowWhileActive,
  visible: d.visible,
  imageUrl: d.imageUrl,
});

type Errors = Partial<Record<keyof Draft, string>>;

function validate(d: Draft, others: Pkg[]): Errors {
  const e: Errors = {};
  const n = (v: string) => (v.trim() === "" ? NaN : Number(v));
  if (!d.name.trim()) e.name = "Enter a package name.";
  else if (others.some((p) => p.name.toLowerCase() === d.name.trim().toLowerCase()))
    e.name = "Another package already uses this name.";
  if (!(n(d.price) > 0)) e.price = "Price must be more than 0.";
  if (!(Number.isSafeInteger(n(d.dailyProfit)) && n(d.dailyProfit) > 0)) e.dailyProfit = "Enter daily profit in BDT, greater than 0.";
  if (!(Number.isInteger(n(d.durationDays)) && n(d.durationDays) >= 1)) e.durationDays = "Enter a whole number of days, 1 or more.";
  (["maxPerUser", "minVipLevel"] as const).forEach((k) => {
    if (!(Number.isInteger(n(d[k])) && n(d[k]) >= 0)) e[k] = "Enter a whole number, 0 or more.";
  });
  return e;
}

/* ------------------------------------------------------------------ */
/*  Form pieces                                                        */
/* ------------------------------------------------------------------ */

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="ad-field">
      <span className="ad-field-label">{label}</span>
      {children}
      {error ? <span className="ad-field-error">{error}</span> : hint ? <span className="ad-field-hint">{hint}</span> : null}
    </label>
  );
}

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="ad-switch-row">
      <div>
        <p className="ad-switch-label">{label}</p>
        {hint && <p className="ad-field-hint">{hint}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`ad-switch ${checked ? "is-on" : ""}`} onClick={() => onChange(!checked)}>
        <span />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PackageManagement({
}: {}) {
  const [active, setActive] = useState("packages");
  const [saved, setSaved] = useState<PackageConfig>({ packages: [] });
  const [config, setConfig] = useState<PackageConfig>({ packages: [] });
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(config), [saved, config]);

  const say = (text: string, bad?: boolean) => {
    setToast({ text, bad });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.packages)) throw new Error(data.error || "Load failed");
      const cfg = { packages: data.packages.map((p: Pkg) => ({ ...p, minVipLevel: p.minVipLevel ?? 0, allowWhileActive: Boolean(p.allowWhileActive), visible: Boolean(p.visible) })) };
      setSaved(cfg);
      setConfig(cfg);
    } catch (error) { say(error instanceof Error ? error.message : "Failed to load packages", true); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadPackages(); }, []);

  const openEdit = (p: Pkg) => {
    setDraft(toDraft(p));
    setIsNew(false);
    setErrors({});
    setConfirmDelete(false);
  };
  const openNew = () => {
    setDraft(emptyDraft());
    setIsNew(true);
    setErrors({});
    setConfirmDelete(false);
  };
  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const uploadImage = async (file?: File) => {
    if (!file || !draft?.id) return;
    setImageUploading(true);
    try {
      const body = new FormData(); body.set("packageId", draft.id); body.set("image", file);
      const res = await fetch("/api/admin/package-image", { method: "POST", credentials: "include", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setDraft(d => d ? { ...d, imageUrl: data.imageUrl } : d);
      setConfig(c => ({ ...c, packages: c.packages.map(p => p.id === draft.id ? { ...p, imageUrl: data.imageUrl } : p) }));
      setSaved(c => ({ ...c, packages: c.packages.map(p => p.id === draft.id ? { ...p, imageUrl: data.imageUrl } : p) }));
      say("Package photo updated");
    } catch (error) { say(error instanceof Error ? error.message : "Upload failed", true); }
    finally { setImageUploading(false); }
  };
  const removeImage = async () => {
    if (!draft?.id || imageUploading) return;
    setImageUploading(true);
    try {
      const res = await fetch("/api/admin/package-image", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId: draft.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remove failed");
      setDraft(d => d ? { ...d, imageUrl: "" } : d);
      setConfig(c => ({ ...c, packages: c.packages.map(p => p.id === draft.id ? { ...p, imageUrl: "" } : p) }));
      setSaved(c => ({ ...c, packages: c.packages.map(p => p.id === draft.id ? { ...p, imageUrl: "" } : p) }));
      say("Package photo removed");
    } catch (error) { say(error instanceof Error ? error.message : "Remove failed", true); }
    finally { setImageUploading(false); }
  };

  const applyDraft = () => {
    if (!draft) return;
    const others = config.packages.filter((p) => p.id !== draft.id);
    const e = validate(draft, others);
    setErrors(e);
    if (Object.keys(e).length) return;
    const pkg = fromDraft(draft);
    if (isNew) {
      pkg.id = pkg.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `pkg-${Date.now()}`;
      setConfig((c) => ({ ...c, packages: [...c.packages, pkg] }));
    } else {
      setConfig((c) => ({ ...c, packages: c.packages.map((p) => (p.id === pkg.id ? pkg : p)) }));
    }
    setDraft(null);
  };

  const deleteDraft = () => {
    if (!draft) return;
    setConfig((c) => ({
      ...c,
      packages: c.packages
        .filter((p) => p.id !== draft.id)
        .map((p) => (p.requiresPackageId === draft.id ? { ...p, requiresPackageId: "" } : p)),
    }));
    setDraft(null);
  };

  const toggleVisible = (id: string) =>
    setConfig((c) => ({ ...c, packages: c.packages.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)) }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/packages", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      await loadPackages();
      say("Changes saved");
    } catch (error) {
      say(error instanceof Error ? error.message : "Could not save changes", true);
    } finally {
      setSaving(false);
    }
  };
  const discard = () => setConfig(saved);

  const preview = useMemo(() => {
    if (!draft) return null;
    const price = Number(draft.price);
    const daily = Number(draft.dailyProfit);
    const days = Number(draft.durationDays);
    if (!(price > 0 && daily > 0 && days >= 1) || !Number.isFinite(days)) return null;
    const rows = Array.from({ length: Math.min(days, 365) }, (_, i) => {
      const open = price + daily * i;
      return { day: i + 1, open, profit: daily, close: open + daily };
    });
    const total = daily * days;
    return { first: daily, total, end: price + total, rows };
  }, [draft]);


  if (loading) return <div className="ad"><AdminSidebar active={active} onNavigate={setActive} /><main className="ad-main">Loading packagesâ€¦</main></div>;

  return (
    <div className="ad">
      <style>{css}</style>

      <AdminSidebar active={active} onNavigate={setActive} />

      <main className="ad-main">
        <header className="ad-top">
          <div className="ad-top-title">
            <h1>Package management</h1>
            <p className="ad-muted">Prices, profit, limits and rules. Changes apply to new purchases only.</p>
          </div>
          <div className="ad-top-actions">
            {dirty && <button type="button" className="ad-btn ad-btn-ghost" onClick={discard} disabled={saving}>Discard</button>}
            <button type="button" className="ad-btn ad-btn-primary" onClick={save} disabled={!dirty || saving}>
              {saving ? "Savingâ€¦" : "Save changes"}
            </button>
          </div>
        </header>

        <section className="ad-panel">
            <div className="ad-panel-head">
              <h2>All packages <span className="ad-muted">({config.packages.length})</span></h2>
              <button type="button" className="ad-btn ad-btn-primary" onClick={openNew}>Add package</button>
            </div>
            <div className="ad-pkg-grid">
              {config.packages.map((p) => {
                const total = p.dailyProfit * p.durationDays;
                const first = p.dailyProfit;
                return (
                  <article key={p.id} className={`ad-pkg ${p.visible ? "" : "is-hidden"}`}>
                    <div className="ad-pkg-head">
                      <span className="ad-pkg-icon"><Icon d="M5 12l5 5L20 7" size={21} /></span>
                      <div>
                        <h3>{p.name}</h3>
                        <small>{p.shortDescription || `${p.durationDays} days duration`}</small>
                      </div>
                      <b className={`ad-badge ${p.visible ? "" : "is-off"}`}>{p.visible ? "Active" : "Hidden"}</b>
                    </div>

                    <div className="ad-pkg-metrics">
                      {[
                        ["Package price", bdt(p.price)],
                        ["Daily fixed profit", bdt(p.dailyProfit)],
                        ["Daily profit", bdt(first)],
                        ["Total profit", bdt(total)],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <small>{label}</small>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="ad-pkg-rules"><div><small>à¦…à¦­à¦¿à¦œà¦¾à¦¤ à¦§à¦¾à¦ª</small><strong>{p.minVipLevel === 0 ? "à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦§à¦¾à¦ª" : p.minVipLevel}</strong></div><div><small>Buy limit per user</small><strong>{p.maxPerUser === 0 ? "Unlimited" : `${p.maxPerUser} time${p.maxPerUser > 1 ? "s" : ""}`}</strong></div></div>

                    <div className="ad-pkg-actions">
                      <label className="ad-pkg-toggle">
                        <button type="button" role="switch" aria-checked={p.visible} aria-label={`Show ${p.name} to users`} className={`ad-switch ${p.visible ? "is-on" : ""}`} onClick={() => toggleVisible(p.id)}>
                          <span />
                        </button>
                        Show to users
                      </label>
                      <button type="button" className="ad-btn ad-btn-ghost" onClick={() => openEdit(p)}>Edit package</button>
                    </div>
                  </article>
                );
              })}
              {config.packages.length === 0 && (
                <div className="ad-empty ad-grid-empty">No packages yet. Add your first package.</div>
              )}
            </div>
        </section>
      </main>

      {draft && (
        <div className="ad-modal-back" onClick={() => setDraft(null)}>
          <section className="ad-modal" role="dialog" aria-modal="true" aria-label={isNew ? "Add package" : `Edit ${draft.name}`} onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head">
              <h2>{isNew ? "Add package" : `Edit ${draft.name || "package"}`}</h2>
              <button type="button" className="ad-x" aria-label="Close" onClick={() => setDraft(null)}><Icon d="M6 6l12 12M18 6L6 18" /></button>
            </div>

            <div className="ad-modal-body">
              <Field label="Package photo" hint="JPG, PNG or WebP; max 5 MB.">
                {draft.id ? <><input type="file" accept="image/jpeg,image/png,image/webp" disabled={imageUploading} onChange={e => { void uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }} />{imageUploading && <small>Updating photoâ€¦</small>}{draft.imageUrl && <><img src={draft.imageUrl} alt="Package preview" style={{ display: "block", width: 120, height: 80, objectFit: "cover", marginTop: 8 }} /><button type="button" className="ad-btn ad-btn-danger-ghost" onClick={() => void removeImage()} disabled={imageUploading}>Remove photo</button></>}</> : <small>Add package first, then edit to upload photo.</small>}
              </Field>
              <div className="ad-form-grid">
                <Field label="Package name" error={errors.name}><input value={draft.name} onChange={(e) => setField("name", e.target.value)} placeholder="VIP 4" /></Field>
                <Field label="Short description"><input value={draft.shortDescription} onChange={(e) => setField("shortDescription", e.target.value)} /></Field>
                <Field label="Tank model"><input value={draft.modelNo} onChange={(e) => setField("modelNo", e.target.value)} /></Field>
                <Field label="Price (BDT)" error={errors.price}><input type="number" min={0} value={draft.price} onChange={(e) => setField("price", e.target.value)} /></Field>
                <Field label="Daily profit (BDT)" error={errors.dailyProfit} hint="Fixed amount; no percentage or compounding. Defaults to à§³300."><input type="number" min={1} step="1" value={draft.dailyProfit} onChange={(e) => setField("dailyProfit", e.target.value)} /></Field>
                <Field label="Duration (days)" error={errors.durationDays}><input type="number" min={1} value={draft.durationDays} onChange={(e) => setField("durationDays", e.target.value)} /></Field>
              </div>
              <Field label="Tank overview"><textarea rows={3} value={draft.tankOverview} onChange={(e) => setField("tankOverview", e.target.value)} /></Field>
              <Field label="Profit mechanism / purchase details"><textarea rows={3} value={draft.profitMechanism} onChange={(e) => setField("profitMechanism", e.target.value)} /></Field>

              {preview && (
                <div className="ad-preview">
                  <div><small>First day profit</small><strong>{bdt(preview.first)}</strong></div>
                  <div><small>Total profit</small><strong>{bdt(preview.total)}</strong></div>
                  <div><small>Total at the end</small><strong>{bdt(preview.end)}</strong></div>
                </div>
              )}

              {preview && (
                <details className="ad-ledger">
                  <summary>Daily profit schedule ({preview.rows.length} days)</summary>
                  <div className="ad-ledger-list">
                    {preview.rows.map((r) => (
                      <article key={r.day}>
                        <span>{r.day}</span>
                        <div>
                          <strong>Day {r.day} profit</strong>
                          <small>{bdt(r.open)} â†’ {bdt(r.close)}</small>
                        </div>
                        <b>+ {bdt(r.profit)}</b>
                      </article>
                    ))}
                  </div>
                </details>
              )}

              <h3>à¦•à§à¦°à§Ÿ à¦¸à§€à¦®à¦¾</h3>
              <div className="ad-form-grid">
                <Field label="Times one user can buy" error={errors.maxPerUser} hint="0 means unlimited. Example: VIP 0 = 1, VIP 2 = 3."><input type="number" min={0} value={draft.maxPerUser} onChange={(e) => setField("maxPerUser", e.target.value)} /></Field>
                <Field label="à¦…à¦­à¦¿à¦œà¦¾à¦¤ à¦§à¦¾à¦ª (à¦¸à¦°à§à¦¬à¦¨à¦¿à¦®à§à¦¨)" error={errors.minVipLevel} hint="0 à¦®à¦¾à¦¨à§‡ à¦•à§‹à¦¨à§‹ à¦§à¦¾à¦ªà§‡à¦° à¦¶à¦°à§à¦¤ à¦¨à§‡à¦‡à¥¤"><input type="number" min={0} value={draft.minVipLevel} onChange={(e) => setField("minVipLevel", e.target.value)} /></Field>
              </div>
              <Switch checked={draft.visible} onChange={(v) => setField("visible", v)} label="Show to users" hint="Hidden packages cannot be bought. Running ones continue." />
            </div>

            <div className="ad-modal-foot">
              {!isNew && (
                confirmDelete ? (
                  <span className="ad-confirm">
                    Delete this package? Running investments are not affected.
                    <button type="button" className="ad-btn ad-btn-danger" onClick={deleteDraft}>Yes, delete</button>
                    <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
                  </span>
                ) : (
                  <button type="button" className="ad-btn ad-btn-danger-ghost" onClick={() => setConfirmDelete(true)}>Delete package</button>
                )
              )}
              <span className="ad-spacer" />
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setDraft(null)}>Cancel</button>
              <button type="button" className="ad-btn ad-btn-primary" onClick={applyDraft}>{isNew ? "Add package" : "Apply changes"}</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className={`ad-toast ${toast.bad ? "is-bad" : ""}`} role="status">{toast.text}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const css = `
.ad-muted{color:var(--muted)}
.ad-spacer{flex:1}
.ad-top-title{flex:1; min-width:220px}
.ad-top-actions{display:flex; gap:8px}
.ad-btn{border:1px solid transparent; border-radius:10px; padding:8px 16px; font-weight:600; cursor:pointer; transition:background .15s,border-color .15s; font:inherit}
.ad-btn:disabled{opacity:.5; cursor:not-allowed}
.ad-btn-primary{background:var(--sky-500); color:#fff}
.ad-btn-primary:hover:not(:disabled){background:var(--sky-600)}
.ad-btn-ghost{background:transparent; color:var(--sky-700); border-color:var(--line)}
.ad-btn-ghost:hover:not(:disabled){background:var(--sky-50); border-color:var(--sky-200)}
.ad-btn-danger{background:#c23030; color:#fff}
.ad-btn-danger-ghost{background:transparent; color:#c23030; border-color:#f3d4d4}
.ad-btn-danger-ghost:hover{background:#fdf1f1}
.ad-btn:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}

.ad-panel-head{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px}
.ad-panel-head h2{font-size:17px; font-weight:600; margin:0}
.ad-empty{text-align:center; color:var(--muted); padding:28px 12px !important}

.ad-form-grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px 16px; margin:14px 0}
.ad-field{display:flex; flex-direction:column; gap:5px}
.ad-field-label{font-size:14px; font-weight:600}
.ad-field-hint{font-size:12.5px; color:var(--muted)}
.ad-field-error{font-size:12.5px; color:#c23030}
.ad input,.ad select,.ad textarea{width:100%; border:1px solid var(--line); background:#fff; color:var(--ink); border-radius:10px; padding:9px 12px; font:inherit}
.ad input:focus,.ad select:focus,.ad textarea:focus{outline:2px solid var(--sky-200); border-color:var(--sky-500)}
.ad-modal-body h3{font-size:15px; font-weight:600; margin-top:20px}

.ad-switch-row{display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 0; border-top:1px solid var(--line)}
.ad-switch-label{font-weight:600}
.ad-switch{flex:none; width:40px; height:24px; border-radius:999px; border:0; background:#cfe0ea; position:relative; cursor:pointer; transition:background .15s; padding:0}
.ad-switch span{position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:transform .15s}
.ad-switch.is-on{background:var(--sky-500)}
.ad-switch.is-on span{transform:translateX(16px)}
.ad-switch:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}

.ad-preview{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; background:var(--sky-50); border:1px solid var(--sky-100); border-radius:12px; padding:12px 14px; margin-top:4px}
.ad-preview small{display:block; color:var(--muted); font-size:12.5px}
.ad-preview strong{color:var(--sky-700); font-size:16px}

.ad-pkg-grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px}
.ad-pkg{border:1px solid var(--line); border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:14px; background:var(--card)}
.ad-pkg.is-hidden{background:var(--bg)}
.ad-pkg-head{display:flex; align-items:center; gap:12px}
.ad-pkg-head > div{flex:1; min-width:0}
.ad-pkg-head h3{font-size:17px; font-weight:700; margin:0}
.ad-pkg-head small{color:var(--muted)}
.ad-pkg-icon{width:40px; height:40px; border-radius:12px; background:var(--sky-100); color:var(--sky-700); display:inline-flex; align-items:center; justify-content:center; flex:none}
.ad-badge{font-size:12.5px; font-weight:600; padding:3px 12px; border-radius:999px; background:var(--sky-100); color:var(--sky-700)}
.ad-badge.is-off{background:#eef2f5; color:var(--muted)}
.ad-pkg-metrics{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px}
.ad-pkg-metrics > div{background:var(--sky-50); border:1px solid var(--sky-100); border-radius:12px; padding:10px 12px}
.ad-pkg-metrics small,.ad-pkg-rules small{display:block; color:var(--muted); font-size:12.5px}
.ad-pkg-metrics strong{color:var(--sky-700); font-size:17px}
.ad-pkg-rules{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px}
.ad-pkg-rules > div{border:1px solid var(--line); border-radius:12px; padding:10px 12px}
.ad-pkg-rules strong{font-size:14.5px}
.ad-pkg-actions{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:auto}
.ad-pkg-toggle{display:flex; align-items:center; gap:10px; font-weight:500; font-size:14px}
.ad-grid-empty{grid-column:1/-1}

.ad-ledger{margin-top:12px; border:1px solid var(--line); border-radius:12px}
.ad-ledger summary{cursor:pointer; padding:10px 14px; font-weight:600; color:var(--sky-700)}
.ad-ledger-list{max-height:240px; overflow-y:auto; border-top:1px solid var(--line)}
.ad-ledger-list article{display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid var(--line)}
.ad-ledger-list article:last-child{border-bottom:0}
.ad-ledger-list article > span{width:30px; height:30px; border-radius:50%; background:var(--sky-100); color:var(--sky-700); display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; flex:none}
.ad-ledger-list article > div{flex:1; min-width:0}
.ad-ledger-list small{display:block; color:var(--muted); font-size:12.5px}
.ad-ledger-list b{color:var(--sky-700); white-space:nowrap}

.ad-modal-back{position:fixed; inset:0; background:rgba(12,42,61,.4); display:flex; align-items:center; justify-content:center; padding:16px; z-index:50}
.ad-modal{background:var(--card); border-radius:16px; width:100%; max-width:640px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(12,42,61,.2)}
.ad-modal-head{display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid var(--line)}
.ad-modal-head h2{font-size:18px; font-weight:700; margin:0}
.ad-x{border:0; background:transparent; color:var(--muted); cursor:pointer; border-radius:8px; padding:6px}
.ad-x:hover{background:var(--sky-50); color:var(--ink)}
.ad-x:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}
.ad-modal-body{padding:6px 20px 14px; overflow-y:auto}
.ad-modal-foot{display:flex; align-items:center; gap:8px; padding:14px 20px; border-top:1px solid var(--line); flex-wrap:wrap}
.ad-confirm{display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:13.5px}

.ad-toast{position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff; padding:10px 18px; border-radius:10px; z-index:60; font-weight:500}
.ad-toast.is-bad{background:#c23030}

@media (max-width:760px){
  .ad-form-grid,.ad-pkg-grid{grid-template-columns:1fr}
  .ad-preview{grid-template-columns:1fr}
  .ad-top-actions{width:100%}
  .ad-top-actions .ad-btn{flex:1}
}
@media (prefers-reduced-motion:reduce){ .ad-switch,.ad-switch span{transition:none} }
`;

```

## `app/superadmin/reffer/page.tsx`

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Icon from "@/components/app/Icon";
import "../admin.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type GeneralSettings = {
  enabled: boolean;
  requireCodeAtSignup: boolean;
  blockSelfReferral: boolean;
  activeWhen: "min_vip" | "min_deposit" | "any_package";
  activeMinVip: number;
  activeMinDeposit: number; // BDT
  maxBonusPerUser: number; // BDT, 0 = no cap
};

export type LevelSettings = {
  level: 1 | 2 | 3;
  enabled: boolean;
  title: string;
  depositBonus: number; // %
  profitCommission: number; // %
};

export type CommissionSettings = {
  levels: LevelSettings[];
  depositBonusOn: "first" | "every";
  minDepositForBonus: number; // BDT
  payout: "instant" | "approval";
  maxCommissionPerMember: number; // BDT, 0 = no cap
};

export type SalaryTier = {
  id: string;
  icon: string;
  rank: string;
  amount: number; // BDT per cycle
  reqL1: number;
  reqL2: number;
  reqL3: number;
  enabled: boolean;
};

export type SalarySettings = {
  enabled: boolean;
  minVip: number; // lowest VIP level that counts toward salary
  cycle: "monthly" | "weekly";
  onePerCycle: boolean;
  needsApproval: boolean;
  tiers: SalaryTier[];
};

export type RequestStatus = "pending" | "approved" | "rejected";

export type SalaryRequest = {
  id: string;
  userId: string;
  mobile: string;
  memberId: string;
  vipLevel: number;
  tierIcon: string;
  tierRank: string;
  amount: number; // BDT
  teamL1: number; // active members at the time of the request
  teamL2: number;
  teamL3: number;
  reqL1: number; // what the tier needs
  reqL2: number;
  reqL3: number;
  requestedAt: string; // ISO date
  status: RequestStatus;
  reviewedAt?: string;
  reviewNote?: string;
};

export type ReferralConfig = {
  general: GeneralSettings;
  commissions: CommissionSettings;
  salary: SalarySettings;
};

/* ------------------------------------------------------------------ */
/*  Placeholder data - replace with data from your API / Supabase      */
/* ------------------------------------------------------------------ */

const DEFAULT_CONFIG: ReferralConfig = {
  general: {
    enabled: true,
    requireCodeAtSignup: false,
    blockSelfReferral: true,
    activeWhen: "min_vip",
    activeMinVip: 1,
    activeMinDeposit: 500,
    maxBonusPerUser: 0,
  },
  commissions: {
    levels: [
      { level: 1, enabled: true, title: "à§§à¦® à¦²à§‡à¦­à§‡à¦²", depositBonus: 8, profitCommission: 8 },
      { level: 2, enabled: true, title: "à§¨à¦¯à¦¼ à¦²à§‡à¦­à§‡à¦²", depositBonus: 3, profitCommission: 3 },
      { level: 3, enabled: true, title: "à§©à¦¯à¦¼ à¦²à§‡à¦­à§‡à¦²", depositBonus: 1, profitCommission: 1 },
    ],
    depositBonusOn: "every",
    minDepositForBonus: 0,
    payout: "instant",
    maxCommissionPerMember: 0,
  },
  salary: {
    enabled: true,
    minVip: 1,
    cycle: "monthly",
    onePerCycle: true,
    needsApproval: true,
    tiers: [
      { id: "t1", icon: "ðŸ¥‰", rank: "à¦¬à§à¦°à§‹à¦žà§à¦œ à¦²à¦¿à¦¡à¦¾à¦°", amount: 300, reqL1: 3, reqL2: 0, reqL3: 0, enabled: true },
      { id: "t2", icon: "ðŸ¥ˆ", rank: "à¦¸à¦¿à¦²à¦­à¦¾à¦° à¦²à¦¿à¦¡à¦¾à¦°", amount: 700, reqL1: 5, reqL2: 0, reqL3: 0, enabled: true },
      { id: "t3", icon: "ðŸ¥‡", rank: "à¦—à§‹à¦²à§à¦¡ à¦²à¦¿à¦¡à¦¾à¦°", amount: 1200, reqL1: 7, reqL2: 3, reqL3: 0, enabled: true },
      { id: "t4", icon: "ðŸ’Ž", rank: "à¦ªà§à¦²à¦¾à¦Ÿà¦¿à¦¨à¦¾à¦® à¦²à¦¿à¦¡à¦¾à¦°", amount: 2500, reqL1: 10, reqL2: 5, reqL3: 0, enabled: true },
      { id: "t5", icon: "ðŸ‘‘", rank: "à¦¡à¦¾à¦¯à¦¼à¦®à¦¨à§à¦¡ à¦²à¦¿à¦¡à¦¾à¦°", amount: 5000, reqL1: 15, reqL2: 10, reqL3: 5, enabled: true },
      { id: "t6", icon: "â­", rank: "à¦•à§à¦°à¦¾à¦‰à¦¨ à¦¡à¦¿à¦°à§‡à¦•à§à¦Ÿà¦°", amount: 10000, reqL1: 30, reqL2: 20, reqL3: 10, enabled: true },
      { id: "t7", icon: "ðŸš€", rank: "à¦à¦®à§à¦¬à¦¾à¦¸à§‡à¦¡à¦°", amount: 25000, reqL1: 60, reqL2: 40, reqL3: 20, enabled: true },
      { id: "t8", icon: "ðŸ›ï¸", rank: "à¦ªà§à¦°à§‡à¦¸à¦¿à¦¡à§‡à¦¨à§à¦¸à¦¿à¦¯à¦¼à¦¾à¦² à¦²à¦¿à¦¡à¦¾à¦°", amount: 50000, reqL1: 120, reqL2: 80, reqL3: 50, enabled: true },
    ],
  },
};

const DEFAULT_REQUESTS: SalaryRequest[] = [
  { id: "r1", userId: "u1", mobile: "01711-000101", memberId: "100421", vipLevel: 2, tierIcon: "ðŸ¥ˆ", tierRank: "à¦¸à¦¿à¦²à¦­à¦¾à¦° à¦²à¦¿à¦¡à¦¾à¦°", amount: 700, teamL1: 8, teamL2: 1, teamL3: 0, reqL1: 5, reqL2: 0, reqL3: 0, requestedAt: "2026-11-11T09:12:00+06:00", status: "pending" },
  { id: "r2", userId: "u2", mobile: "01822-000202", memberId: "100388", vipLevel: 3, tierIcon: "ðŸ¥‡", tierRank: "à¦—à§‹à¦²à§à¦¡ à¦²à¦¿à¦¡à¦¾à¦°", amount: 1200, teamL1: 9, teamL2: 4, teamL3: 0, reqL1: 7, reqL2: 3, reqL3: 0, requestedAt: "2026-11-11T08:40:00+06:00", status: "pending" },
  { id: "r3", userId: "u3", mobile: "01933-000303", memberId: "100267", vipLevel: 4, tierIcon: "ðŸ’Ž", tierRank: "à¦ªà§à¦²à¦¾à¦Ÿà¦¿à¦¨à¦¾à¦® à¦²à¦¿à¦¡à¦¾à¦°", amount: 2500, teamL1: 12, teamL2: 6, teamL3: 1, reqL1: 10, reqL2: 5, reqL3: 0, requestedAt: "2026-11-10T21:05:00+06:00", status: "pending" },
  { id: "r4", userId: "u3", mobile: "01933-000303", memberId: "100267", vipLevel: 4, tierIcon: "ðŸ¥‰", tierRank: "à¦¬à§à¦°à§‹à¦žà§à¦œ à¦²à¦¿à¦¡à¦¾à¦°", amount: 300, teamL1: 12, teamL2: 6, teamL3: 1, reqL1: 3, reqL2: 0, reqL3: 0, requestedAt: "2026-11-03T10:20:00+06:00", status: "approved", reviewedAt: "2026-11-03T15:00:00+06:00" },
  { id: "r5", userId: "u4", mobile: "01644-000404", memberId: "100199", vipLevel: 5, tierIcon: "ðŸ‘‘", tierRank: "à¦¡à¦¾à¦¯à¦¼à¦®à¦¨à§à¦¡ à¦²à¦¿à¦¡à¦¾à¦°", amount: 5000, teamL1: 16, teamL2: 11, teamL3: 5, reqL1: 15, reqL2: 10, reqL3: 5, requestedAt: "2026-11-09T18:30:00+06:00", status: "pending" },
  { id: "r6", userId: "u5", mobile: "01555-000505", memberId: "100150", vipLevel: 1, tierIcon: "ðŸ¥‰", tierRank: "à¦¬à§à¦°à§‹à¦žà§à¦œ à¦²à¦¿à¦¡à¦¾à¦°", amount: 300, teamL1: 4, teamL2: 0, teamL3: 0, reqL1: 3, reqL2: 0, reqL3: 0, requestedAt: "2026-11-05T12:00:00+06:00", status: "approved", reviewedAt: "2026-11-05T17:45:00+06:00" },
  { id: "r7", userId: "u6", mobile: "01766-000606", memberId: "100098", vipLevel: 0, tierIcon: "ðŸ¥ˆ", tierRank: "à¦¸à¦¿à¦²à¦­à¦¾à¦° à¦²à¦¿à¦¡à¦¾à¦°", amount: 700, teamL1: 5, teamL2: 0, teamL3: 0, reqL1: 5, reqL2: 0, reqL3: 0, requestedAt: "2026-11-04T14:10:00+06:00", status: "rejected", reviewedAt: "2026-11-04T19:00:00+06:00", reviewNote: "Suspicious / fake referrals" },
];

const REJECT_REASONS = [
  "Requirements not met",
  "Already claimed this month",
  "Suspicious / fake referrals",
  "Other",
] as const;

const bdt = (n: number) => "à§³" + n.toLocaleString("en-BD", { maximumFractionDigits: 2 });
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const monthOf = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }).slice(0, 7);

/** One tier per user per month: true if this user already has an approved request in the same month. */
const hasApprovedThatMonth = (r: SalaryRequest, all: SalaryRequest[]) =>
  all.some((x) => x.id !== r.id && x.userId === r.userId && x.status === "approved" && monthOf(x.requestedAt) === monthOf(r.requestedAt));
const hasOtherPendingThatMonth = (r: SalaryRequest, all: SalaryRequest[]) =>
  all.some((x) => x.id !== r.id && x.userId === r.userId && x.status === "pending" && monthOf(x.requestedAt) === monthOf(r.requestedAt));


/* ------------------------------------------------------------------ */
/*  Small form pieces                                                  */
/* ------------------------------------------------------------------ */

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="ad-field">
      <span className="ad-field-label">{label}</span>
      {children}
      {error ? <span className="ad-field-error">{error}</span> : hint ? <span className="ad-field-hint">{hint}</span> : null}
    </label>
  );
}

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="ad-switch-row">
      <div>
        <p className="ad-switch-label">{label}</p>
        {hint && <p className="ad-field-hint">{hint}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`ad-switch ${checked ? "is-on" : ""}`} onClick={() => onChange(!checked)}>
        <span />
      </button>
    </div>
  );
}

/** Number input that lets you clear and retype; only valid values are committed. */
function NumInput({ value, onChange, min = 0, max, step, int, disabled, ariaLabel }: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: string;
  int?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText((t) => (Number(t) === value ? t : String(value)));
  }, [value]);
  return (
    <input
      type="number"
      inputMode={int ? "numeric" : "decimal"}
      value={text}
      min={min}
      max={max}
      step={step ?? (int ? "1" : "any")}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        const n = Number(t);
        const ok = t.trim() !== "" && Number.isFinite(n) && n >= min && (max === undefined || n <= max) && (!int || Number.isInteger(n));
        if (ok) onChange(n);
      }}
      onBlur={() => setText(String(value))}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Salary tier form                                                   */
/* ------------------------------------------------------------------ */

type TierDraft = { id: string; icon: string; rank: string; amount: string; reqL1: string; reqL2: string; reqL3: string; enabled: boolean };
type TierErrors = Partial<Record<keyof TierDraft, string>>;

const tierToDraft = (t: SalaryTier): TierDraft => ({ ...t, amount: String(t.amount), reqL1: String(t.reqL1), reqL2: String(t.reqL2), reqL3: String(t.reqL3) });
const emptyTier = (): TierDraft => ({ id: "", icon: "â­", rank: "", amount: "", reqL1: "1", reqL2: "0", reqL3: "0", enabled: true });

function validateTier(d: TierDraft, others: SalaryTier[]): TierErrors {
  const e: TierErrors = {};
  const n = (v: string) => (v.trim() === "" ? NaN : Number(v));
  if (!d.rank.trim()) e.rank = "Enter a rank name.";
  else if (others.some((t) => t.rank.trim().toLowerCase() === d.rank.trim().toLowerCase())) e.rank = "Another tier already uses this name.";
  if (!(n(d.amount) > 0)) e.amount = "Amount must be more than 0.";
  (["reqL1", "reqL2", "reqL3"] as const).forEach((k) => {
    if (!(Number.isInteger(n(d[k])) && n(d[k]) >= 0)) e[k] = "Whole number, 0 or more.";
  });
  if (!e.reqL1 && n(d.reqL1) < 1) e.reqL1 = "Level 1 needs at least 1 active member.";
  return e;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type Tab = "general" | "commissions" | "salary" | "requests";
type RequestTab = RequestStatus | "all";

export default function ReferralManagement() {
  const initial = DEFAULT_CONFIG;
  const [saved, setSaved] = useState<ReferralConfig>(initial);
  const [config, setConfig] = useState<ReferralConfig>(initial);
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);

  const [tier, setTier] = useState<TierDraft | null>(null);
  const [tierNew, setTierNew] = useState(false);
  const [tierErrors, setTierErrors] = useState<TierErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [requests, setRequests] = useState<SalaryRequest[]>([]);
  const [rTab, setRTab] = useState<RequestTab>("pending");
  const [rq, setRq] = useState("");
  const [rTier, setRTier] = useState("");
  const [rSel, setRSel] = useState<string[]>([]);
  const [rBusy, setRBusy] = useState(false);
  const [review, setReview] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState<(typeof REJECT_REASONS)[number]>(REJECT_REASONS[0]);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [confirmBulk, setConfirmBulk] = useState(false);

  const [exDeposit, setExDeposit] = useState(1000);
  const [exProfit, setExProfit] = useState(20);

  const { general: g, commissions: cm, salary: sl } = config;

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(config), [saved, config]);

  const say = (text: string, bad?: boolean) => {
    setToast({ text, bad });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/referrals", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Load failed");
        setConfig(data.config);
        setSaved(data.config);
        setRequests(data.requests ?? []);
      })
      .catch((error) => say(error.message || "Load failed", true))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/referrals", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      setSaved(config);
      say("Changes saved");
    } catch {
      say("Could not save changes. Try again.", true);
    } finally {
      setSaving(false);
    }
  };

  /* ---- updaters ---- */
  function upd<S extends keyof ReferralConfig>(section: S, patch: Partial<ReferralConfig[S]>) {
    setConfig((c) => ({ ...c, [section]: { ...c[section], ...patch } }) as ReferralConfig);
  }
  const updLevel = (level: 1 | 2 | 3, patch: Partial<LevelSettings>) =>
    upd("commissions", { levels: cm.levels.map((l) => (l.level === level ? { ...l, ...patch } : l)) });

  /* ---- salary tier modal ---- */
  const openTier = (t: SalaryTier) => { setTier(tierToDraft(t)); setTierNew(false); setTierErrors({}); setConfirmDelete(false); };
  const openNewTier = () => { setTier(emptyTier()); setTierNew(true); setTierErrors({}); setConfirmDelete(false); };
  const setTierField = <K extends keyof TierDraft>(k: K, v: TierDraft[K]) => setTier((d) => (d ? { ...d, [k]: v } : d));

  const applyTier = () => {
    if (!tier) return;
    const e = validateTier(tier, sl.tiers.filter((t) => t.id !== tier.id));
    setTierErrors(e);
    if (Object.keys(e).length) return;
    const next: SalaryTier = {
      id: tierNew ? `tier-${Date.now()}` : tier.id,
      icon: tier.icon.trim() || "â­",
      rank: tier.rank.trim(),
      amount: Number(tier.amount),
      reqL1: Number(tier.reqL1),
      reqL2: Number(tier.reqL2),
      reqL3: Number(tier.reqL3),
      enabled: tier.enabled,
    };
    const list = tierNew ? [...sl.tiers, next] : sl.tiers.map((t) => (t.id === next.id ? next : t));
    // The user page picks the best tier assuming lowest -> highest, so keep them sorted by amount.
    upd("salary", { tiers: list.sort((a, b) => a.amount - b.amount) });
    setTier(null);
  };
  const deleteTier = () => {
    if (!tier) return;
    upd("salary", { tiers: sl.tiers.filter((t) => t.id !== tier.id) });
    setTier(null);
  };
  const toggleTier = (id: string) => upd("salary", { tiers: sl.tiers.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)) });

  /* ---- previews ---- */
  /* ---- salary requests ---- */
  const reqCounts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, pendingAmount: 0 };
    requests.forEach((r) => {
      c[r.status] += 1;
      if (r.status === "pending") c.pendingAmount += r.amount;
    });
    return c;
  }, [requests]);

  const reqTiers = useMemo(() => Array.from(new Set(requests.map((r) => r.tierRank))), [requests]);

  const shownReqs = useMemo(() => {
    const term = rq.trim().toLowerCase();
    return requests
      .filter((r) => (rTab === "all" ? true : r.status === rTab))
      .filter((r) => (rTier ? r.tierRank === rTier : true))
      .filter((r) => (term ? r.mobile.toLowerCase().includes(term) || r.memberId.toLowerCase().includes(term) : true))
      .sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt));
  }, [requests, rTab, rq, rTier]);

  const selectablePending = shownReqs.filter((r) => r.status === "pending");
  const allSelected = selectablePending.length > 0 && selectablePending.every((r) => rSel.includes(r.id));
  const current = review ? requests.find((r) => r.id === review) ?? null : null;
  const selectedAmount = requests.filter((r) => rSel.includes(r.id)).reduce((sum, r) => sum + r.amount, 0);

  const closeReview = () => {
    setReview(null);
    setRejecting(false);
    setReason(REJECT_REASONS[0]);
    setNote("");
    setNoteError("");
  };

  const approveOne = async (r: SalaryRequest) => {
    if (hasApprovedThatMonth(r, requests)) return;
    setRBusy(true);
    try {
      
      const response = await fetch("/api/admin/referrals", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, status: "approved" }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Approve failed");
      setRequests((list) => list.map((x) => (x.id === r.id ? { ...x, status: "approved", reviewedAt: new Date().toISOString() } : x)));
      setRSel((sel) => sel.filter((id) => id !== r.id));
      closeReview();
      say(`Approved ${bdt(r.amount)} for ${r.mobile}`);
    } catch {
      say("Could not approve. Try again.", true);
    } finally {
      setRBusy(false);
    }
  };

  const rejectOne = async (r: SalaryRequest) => {
    if (reason === "Other" && !note.trim()) {
      setNoteError("Write a short reason.");
      return;
    }
    const text = reason === "Other" ? note.trim() : note.trim() ? `${reason}: ${note.trim()}` : reason;
    setRBusy(true);
    try {
      
      const response = await fetch("/api/admin/referrals", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, status: "rejected", note: text }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Reject failed");
      setRequests((list) => list.map((x) => (x.id === r.id ? { ...x, status: "rejected", reviewedAt: new Date().toISOString(), reviewNote: text } : x)));
      setRSel((sel) => sel.filter((id) => id !== r.id));
      closeReview();
      say(`Rejected request from ${r.mobile}`);
    } catch {
      say("Could not reject. Try again.", true);
    } finally {
      setRBusy(false);
    }
  };

  const approveSelected = async () => {
    // Walk through the selection so two requests from one user in one month cannot both pass.
    let working = [...requests];
    const okIds: string[] = [];
    let skipped = 0;
    for (const id of rSel) {
      const r = working.find((x) => x.id === id);
      if (!r || r.status !== "pending") continue;
      if (hasApprovedThatMonth(r, working)) {
        skipped += 1;
        continue;
      }
      working = working.map((x) => (x.id === id ? { ...x, status: "approved" as const, reviewedAt: new Date().toISOString() } : x));
      okIds.push(id);
    }
    setConfirmBulk(false);
    if (okIds.length === 0) {
      say("Nothing to approve. Those users already have a salary this month.", true);
      return;
    }
    setRBusy(true);
    try {
      for (const id of okIds) {
        const response = await fetch("/api/admin/referrals", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "approved" }) });
        if (!response.ok) skipped++;
      }
      setRequests(working);
      setRSel([]);
      say(skipped ? `Approved ${okIds.length}. Skipped ${skipped} (one tier per user per month).` : `Approved ${okIds.length} request${okIds.length > 1 ? "s" : ""}`);
    } catch {
      say("Could not approve. Try again.", true);
    } finally {
      setRBusy(false);
    }
  };

  const toggleRow = (id: string) => setRSel((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));
  const toggleAll = () => setRSel(allSelected ? [] : selectablePending.map((r) => r.id));

  const REQ_TABS: [RequestTab, string, number][] = [
    ["pending", "Pending", reqCounts.pending],
    ["approved", "Approved", reqCounts.approved],
    ["rejected", "Rejected", reqCounts.rejected],
    ["all", "All", requests.length],
  ];

  const TABS: [Tab, string][] = [["general", "General"], ["commissions", "Commissions"], ["salary", "Monthly salary"], ["requests", "Salary requests"]];

  return (
    <div className="ad">
      <style>{css}</style>

      <AdminSidebar active="referrals" />

      <main className="ad-main">
        <header className="ad-top">
          <div className="ad-top-title">
            <h1>Referral management</h1>
            <p className="ad-muted">Rules, commissions and salary for the Team pages. Changes apply from the next transaction.</p>
          </div>
          {(tab !== "requests" || dirty) && <div className="ad-top-actions">
            {dirty && <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setConfig(saved)} disabled={saving}>Discard</button>}
            <button type="button" className="ad-btn ad-btn-primary" onClick={save} disabled={!dirty || saving}>{saving ? "Savingâ€¦" : "Save changes"}</button>
          </div>}
        </header>

        {loading ? <div className="ad-panel">Loading referral settingsâ€¦</div> : <>
        <div className="ad-tabs" role="tablist">
          {TABS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={`ad-tab ${tab === k ? "is-active" : ""}`} onClick={() => setTab(k)}>{l}{k === "requests" && reqCounts.pending > 0 && <span className="ad-count">{reqCounts.pending}</span>}</button>
          ))}
        </div>

        {/* ================= GENERAL ================= */}
        {tab === "general" && (
          <>
            <section className="ad-panel">
              <h2>Referral program</h2>
              <Switch checked={g.enabled} onChange={(v) => upd("general", { enabled: v })} label="Referral system" hint="Turn off to stop all referral bonuses, commissions and salary claims." />
              <Switch checked={g.requireCodeAtSignup} onChange={(v) => upd("general", { requireCodeAtSignup: v })} label="Require an invite code to sign up" hint="Off: new members can join without a code." />
              <Switch checked={g.blockSelfReferral} onChange={(v) => upd("general", { blockSelfReferral: v })} label="Block self-referral" hint="Stops a member using their own code or the same device/number." />
            </section>

            <section className="ad-panel">
              <h2>Active member rules</h2>
              <p className="ad-muted">Decides who counts as an active referral in the member list and salary conditions.</p>
              <div className="ad-form-grid">
                <Field label="A member is active when">
                  <select value={g.activeWhen} onChange={(e) => upd("general", { activeWhen: e.target.value as GeneralSettings["activeWhen"] })}>
                    <option value="min_vip">They reach a minimum VIP level</option>
                    <option value="min_deposit">They deposited at least an amount</option>
                    <option value="any_package">They bought any package</option>
                  </select>
                </Field>
                {g.activeWhen === "min_vip" && (
                  <Field label="Minimum VIP level" hint="1 means VIP 1 or higher.">
                    <NumInput int min={0} max={20} value={g.activeMinVip} onChange={(n) => upd("general", { activeMinVip: n })} />
                  </Field>
                )}
                {g.activeWhen === "min_deposit" && (
                  <Field label="Minimum total deposit (BDT)">
                    <NumInput min={0} value={g.activeMinDeposit} onChange={(n) => upd("general", { activeMinDeposit: n })} />
                  </Field>
                )}
                <Field label="Max referral earnings per user (BDT)" hint="0 means no cap.">
                  <NumInput min={0} value={g.maxBonusPerUser} onChange={(n) => upd("general", { maxBonusPerUser: n })} />
                </Field>
              </div>
            </section>
          </>
        )}

        {/* ================= COMMISSIONS ================= */}
        {tab === "commissions" && (
          <>
            <section className="ad-panel">
              <h2>Level rates</h2>
              <p className="ad-muted">Deposit bonus and profit commission can be different for each level.</p>
              <div className="ad-lvl-grid">
                {cm.levels.map((l) => (
                  <article key={l.level} className={`ad-pkg ${l.enabled ? "" : "is-hidden"}`}>
                    <div className="ad-pkg-head">
                      <span className="ad-pkg-icon">{l.level}</span>
                      <div><h3>Level {l.level}</h3><small>{l.enabled ? "Paying commission" : "Turned off"}</small></div>
                      <button type="button" role="switch" aria-checked={l.enabled} aria-label={`Level ${l.level} on or off`} className={`ad-switch ${l.enabled ? "is-on" : ""}`} onClick={() => updLevel(l.level, { enabled: !l.enabled })}><span /></button>
                    </div>
                    <div className="ad-stack">
                      <Field label="Level name (shown to users)"><input value={l.title} onChange={(e) => updLevel(l.level, { title: e.target.value })} /></Field>
                      <Field label="Deposit bonus (%)"><NumInput min={0} max={100} step="0.1" value={l.depositBonus} onChange={(n) => updLevel(l.level, { depositBonus: n })} /></Field>
                      <Field label="Profit commission (%)"><NumInput min={0} max={100} step="0.1" value={l.profitCommission} onChange={(n) => updLevel(l.level, { profitCommission: n })} /></Field>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="ad-panel">
              <h2>How commissions are paid</h2>
              <div className="ad-form-grid">
                <Field label="Deposit bonus is paid on">
                  <select value={cm.depositBonusOn} onChange={(e) => upd("commissions", { depositBonusOn: e.target.value as CommissionSettings["depositBonusOn"] })}>
                    <option value="every">Every deposit</option>
                    <option value="first">First deposit only</option>
                  </select>
                </Field>
                <Field label="Minimum deposit to earn a bonus (BDT)" hint="0 means any amount.">
                  <NumInput min={0} value={cm.minDepositForBonus} onChange={(n) => upd("commissions", { minDepositForBonus: n })} />
                </Field>
                <Field label="Payout">
                  <select value={cm.payout} onChange={(e) => upd("commissions", { payout: e.target.value as CommissionSettings["payout"] })}>
                    <option value="instant">Instantly to the wallet</option>
                    <option value="approval">After admin approval</option>
                  </select>
                </Field>
                <Field label="Max earnings from one member (BDT)" hint="0 means no cap.">
                  <NumInput min={0} value={cm.maxCommissionPerMember} onChange={(n) => upd("commissions", { maxCommissionPerMember: n })} />
                </Field>
              </div>
            </section>

            <section className="ad-panel">
              <h2>Try it</h2>
              <div className="ad-form-grid">
                <Field label="Example deposit (BDT)"><NumInput min={0} value={exDeposit} onChange={setExDeposit} /></Field>
                <Field label="Example daily profit of that member (BDT)"><NumInput min={0} value={exProfit} onChange={setExProfit} /></Field>
              </div>
              <div className="ad-table-wrap">
                <table>
                  <thead><tr><th>Level</th><th>Deposit bonus</th><th>Daily commission</th></tr></thead>
                  <tbody>
                    {cm.levels.map((l) => (
                      <tr key={l.level}>
                        <td>{l.title || `Level ${l.level}`}</td>
                        <td>{l.enabled ? `${bdt((exDeposit * l.depositBonus) / 100)} (${l.depositBonus}%)` : <span className="ad-muted">Off</span>}</td>
                        <td>{l.enabled ? `${bdt((exProfit * l.profitCommission) / 100)} (${l.profitCommission}%)` : <span className="ad-muted">Off</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ================= SALARY ================= */}
        {tab === "salary" && (
          <>
            <section className="ad-panel">
              <h2>Salary rules</h2>
              <Switch checked={sl.enabled} onChange={(v) => upd("salary", { enabled: v })} label="Team salary" hint="Turn off to hide claims on the salary page." />
              <div className={`ad-form-grid ${sl.enabled ? "" : "is-off"}`}>
                <Field label="Lowest VIP level that counts" hint="Members below this are not counted for salary.">
                  <NumInput int min={0} max={20} value={sl.minVip} onChange={(n) => upd("salary", { minVip: n })} />
                </Field>
                <Field label="Salary cycle">
                  <select value={sl.cycle} onChange={(e) => upd("salary", { cycle: e.target.value as SalarySettings["cycle"] })}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </Field>
              </div>
              <Switch checked={sl.onePerCycle} onChange={(v) => upd("salary", { onePerCycle: v })} label="One tier per user per cycle" hint="On: once a user claims any tier this month, every other tier stays locked until the next month." />
              <Switch checked={sl.needsApproval} onChange={(v) => upd("salary", { needsApproval: v })} label="Admin approval before payment" hint="On: claims wait for the admin, then go to the wallet." />
            </section>

            <section className="ad-panel">
              <div className="ad-panel-head">
                <div>
                  <h2>Salary tiers <span className="ad-muted">({sl.tiers.length})</span></h2>
                  <p className="ad-muted">Members need this many active referrals at each level. Tiers are kept in order of amount.</p>
                </div>
                <button type="button" className="ad-btn ad-btn-primary" onClick={openNewTier}>Add tier</button>
              </div>
              <div className="ad-pkg-grid">
                {sl.tiers.map((t) => (
                  <article key={t.id} className={`ad-pkg ${t.enabled ? "" : "is-hidden"}`}>
                    <div className="ad-pkg-head">
                      <span className="ad-pkg-icon ad-emoji">{t.icon}</span>
                      <div><h3>{t.rank}</h3><small>{bdt(t.amount)} / {sl.cycle === "monthly" ? "month" : "week"}</small></div>
                      <b className={`ad-badge ${t.enabled ? "" : "is-off"}`}>{t.enabled ? "Active" : "Hidden"}</b>
                    </div>
                    <div className="ad-reqs">
                      <span className="ad-req">Level 1: {t.reqL1} active</span>
                      {t.reqL2 > 0 && <span className="ad-req">Level 2: {t.reqL2} active</span>}
                      {t.reqL3 > 0 && <span className="ad-req">Level 3: {t.reqL3} active</span>}
                    </div>
                    <div className="ad-pkg-actions">
                      <label className="ad-pkg-toggle">
                        <button type="button" role="switch" aria-checked={t.enabled} aria-label={`Show ${t.rank} to users`} className={`ad-switch ${t.enabled ? "is-on" : ""}`} onClick={() => toggleTier(t.id)}><span /></button>
                        Show to users
                      </label>
                      <button type="button" className="ad-btn ad-btn-ghost" onClick={() => openTier(t)}>Edit tier</button>
                    </div>
                  </article>
                ))}
                {sl.tiers.length === 0 && <div className="ad-empty ad-grid-empty">No tiers yet. Add your first tier.</div>}
              </div>
            </section>
          </>
        )}
        {tab === "requests" && (
          <>
        <section className="ad-stats" aria-label="Overview">
          <article className="ad-card"><p className="ad-card-label">Pending requests</p><p className="ad-card-value">{reqCounts.pending}</p><p className="ad-card-note">{bdt(reqCounts.pendingAmount)} waiting</p></article>
          <article className="ad-card"><p className="ad-card-label">Approved</p><p className="ad-card-value">{reqCounts.approved}</p><p className="ad-card-note">Paid out</p></article>
          <article className="ad-card"><p className="ad-card-label">Rejected</p><p className="ad-card-value">{reqCounts.rejected}</p><p className="ad-card-note">Not paid</p></article>
        </section>

        <section className="ad-panel">
          <div className="ad-tabs" role="tablist">
            {REQ_TABS.map(([k, l, n]) => (
              <button key={k} role="tab" aria-selected={rTab === k} className={`ad-tab ${rTab === k ? "is-active" : ""}`} onClick={() => { setRTab(k); setRSel([]); }}>
                {l} <span className="ad-count">{n}</span>
              </button>
            ))}
          </div>

          <div className="ad-toolbar">
            <input type="search" placeholder="Search mobile number or member ID" aria-label="Search requests" value={rq} onChange={(e) => setRq(e.target.value)} />
            <select aria-label="Filter by tier" value={rTier} onChange={(e) => setRTier(e.target.value)}>
              <option value="">All tiers</option>
              {reqTiers.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {rSel.length > 0 && (
            <div className="ad-bulk">
              <span><strong>{rSel.length}</strong> selected Â· {bdt(selectedAmount)}</span>
              <span className="ad-spacer" />
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setRSel([])}>Clear</button>
              <button type="button" className="ad-btn ad-btn-primary" onClick={() => setConfirmBulk(true)} disabled={rBusy}>Approve selected</button>
            </div>
          )}

          <div className="ad-table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="ad-check">
                    {selectablePending.length > 0 && <input type="checkbox" aria-label="Select all pending" checked={allSelected} onChange={toggleAll} />}
                  </th>
                  <th>Member</th>
                  <th>Tier</th>
                  <th>Amount</th>
                  <th>Active team</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shownReqs.map((r) => {
                  const dup = r.status === "pending" && hasApprovedThatMonth(r, requests);
                  return (
                    <tr key={r.id}>
                      <td className="ad-check">
                        {r.status === "pending" && <input type="checkbox" aria-label={`Select ${r.mobile}`} checked={rSel.includes(r.id)} onChange={() => toggleRow(r.id)} />}
                      </td>
                      <td>
                        <strong>{r.mobile}</strong>
                        <div className="ad-hint">ID {r.memberId} Â· VIP {r.vipLevel}</div>
                      </td>
                      <td>{r.tierIcon} {r.tierRank}</td>
                      <td><strong>{bdt(r.amount)}</strong></td>
                      <td className="ad-muted">L1 {r.teamL1} Â· L2 {r.teamL2} Â· L3 {r.teamL3}</td>
                      <td className="ad-muted">{when(r.requestedAt)}</td>
                      <td>
                        <span className={`ad-pill ad-${r.status}`}>{r.status[0].toUpperCase() + r.status.slice(1)}</span>
                        {dup && <div className="ad-hint ad-warn">Already paid this month</div>}
                        {r.status === "rejected" && r.reviewNote && <div className="ad-hint">{r.reviewNote}</div>}
                      </td>
                      <td className="ad-right">
                        <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setReview(r.id)}>{r.status === "pending" ? "Review" : "Details"}</button>
                      </td>
                    </tr>
                  );
                })}
                {shownReqs.length === 0 && (
                  <tr><td colSpan={8} className="ad-empty">{rTab === "pending" ? "No pending requests." : "No requests match."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
          </>
        )}
        </>}
      </main>

      {/* ---------------- Salary tier modal ---------------- */}
      {tier && (
        <div className="ad-modal-back" onClick={() => setTier(null)}>
          <section className="ad-modal" role="dialog" aria-modal="true" aria-label={tierNew ? "Add tier" : `Edit ${tier.rank}`} onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head">
              <h2>{tierNew ? "Add salary tier" : `Edit ${tier.rank || "tier"}`}</h2>
              <button type="button" className="ad-x" aria-label="Close" onClick={() => setTier(null)}><Icon d="M6 6l12 12M18 6L6 18" /></button>
            </div>
            <div className="ad-modal-body">
              <div className="ad-form-grid">
                <Field label="Icon (emoji)" hint="Shown before the rank name."><input value={tier.icon} maxLength={4} onChange={(e) => setTierField("icon", e.target.value)} /></Field>
                <Field label="Rank name" error={tierErrors.rank}><input value={tier.rank} onChange={(e) => setTierField("rank", e.target.value)} /></Field>
                <Field label={`Salary per ${sl.cycle === "monthly" ? "month" : "week"} (BDT)`} error={tierErrors.amount}><input type="number" min={0} value={tier.amount} onChange={(e) => setTierField("amount", e.target.value)} /></Field>
              </div>
              <h3>Conditions (active referrals needed)</h3>
              <div className="ad-form-grid three">
                <Field label="Level 1" error={tierErrors.reqL1}><input type="number" min={1} value={tier.reqL1} onChange={(e) => setTierField("reqL1", e.target.value)} /></Field>
                <Field label="Level 2" error={tierErrors.reqL2} hint="0 means not needed."><input type="number" min={0} value={tier.reqL2} onChange={(e) => setTierField("reqL2", e.target.value)} /></Field>
                <Field label="Level 3" error={tierErrors.reqL3} hint="0 means not needed."><input type="number" min={0} value={tier.reqL3} onChange={(e) => setTierField("reqL3", e.target.value)} /></Field>
              </div>
              <Switch checked={tier.enabled} onChange={(v) => setTierField("enabled", v)} label="Show to users" hint="Hidden tiers cannot be claimed." />
            </div>
            <div className="ad-modal-foot">
              {!tierNew && (
                confirmDelete ? (
                  <span className="ad-confirm">
                    Delete this tier?
                    <button type="button" className="ad-btn ad-btn-danger" onClick={deleteTier}>Yes, delete</button>
                    <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
                  </span>
                ) : (
                  <button type="button" className="ad-btn ad-btn-danger-ghost" onClick={() => setConfirmDelete(true)}>Delete tier</button>
                )
              )}
              <span className="ad-spacer" />
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setTier(null)}>Cancel</button>
              <button type="button" className="ad-btn ad-btn-primary" onClick={applyTier}>{tierNew ? "Add tier" : "Apply changes"}</button>
            </div>
          </section>
        </div>
      )}

      {/* ---------------- Review modal ---------------- */}
      {current && (() => {
        const r = current;
        const pass1 = r.teamL1 >= r.reqL1;
        const pass2 = r.teamL2 >= r.reqL2;
        const pass3 = r.teamL3 >= r.reqL3;
        const meets = pass1 && pass2 && pass3;
        const paidThisMonth = hasApprovedThatMonth(r, requests);
        const otherPending = hasOtherPendingThatMonth(r, requests);
        const isPending = r.status === "pending";
        return (
          <div className="ad-modal-back" onClick={closeReview}>
            <section className="ad-modal" role="dialog" aria-modal="true" aria-label="Salary request" onClick={(e) => e.stopPropagation()}>
              <div className="ad-modal-head">
                <h2>{isPending ? "Review salary request" : "Salary request"}</h2>
                <button type="button" className="ad-x" aria-label="Close" onClick={closeReview}><Icon d="M6 6l12 12M18 6L6 18" /></button>
              </div>

              <div className="ad-modal-body ad-col">
                <div className="ad-pkg-head">
                  <span className="ad-pkg-icon ad-emoji">{r.tierIcon}</span>
                  <div><h3>{r.tierRank}</h3><small>{bdt(r.amount)} / month</small></div>
                  <span className={`ad-pill ad-${r.status}`}>{r.status[0].toUpperCase() + r.status.slice(1)}</span>
                </div>

                <dl className="ad-dl">
                  <div><dt>Mobile</dt><dd>{r.mobile}</dd></div>
                  <div><dt>Member ID</dt><dd>{r.memberId}</dd></div>
                  <div><dt>VIP level</dt><dd>VIP {r.vipLevel}</dd></div>
                  <div><dt>Requested</dt><dd>{when(r.requestedAt)}</dd></div>
                  {r.reviewedAt && <div><dt>Reviewed</dt><dd>{when(r.reviewedAt)}</dd></div>}
                  {r.reviewNote && <div><dt>Reason</dt><dd>{r.reviewNote}</dd></div>}
                </dl>

                <h3>Conditions</h3>
                <div className="ad-reqs">
                  <span className={`ad-req ${pass1 ? "pass" : "fail"}`}>Level 1: {r.teamL1}/{r.reqL1} {pass1 ? "âœ“" : "âœ—"}</span>
                  {r.reqL2 > 0 && <span className={`ad-req ${pass2 ? "pass" : "fail"}`}>Level 2: {r.teamL2}/{r.reqL2} {pass2 ? "âœ“" : "âœ—"}</span>}
                  {r.reqL3 > 0 && <span className={`ad-req ${pass3 ? "pass" : "fail"}`}>Level 3: {r.teamL3}/{r.reqL3} {pass3 ? "âœ“" : "âœ—"}</span>}
                </div>

                {isPending && !meets && <p className="ad-note ad-note-warn">The member does not meet every condition right now. Check the team before approving.</p>}
                {isPending && paidThisMonth && <p className="ad-note ad-note-bad">This member already has an approved salary this month. Only one tier per month is allowed, so this request can only be rejected.</p>}
                {isPending && !paidThisMonth && otherPending && <p className="ad-note ad-note-warn">This member has another pending request this month. Approve only one.</p>}

                {isPending && rejecting && (
                  <div className="ad-reject">
                    <label className="ad-field">
                      <span className="ad-field-label">Reason for rejecting</span>
                      <select value={reason} onChange={(e) => { setReason(e.target.value as (typeof REJECT_REASONS)[number]); setNoteError(""); }}>
                        {REJECT_REASONS.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </label>
                    <label className="ad-field">
                      <span className="ad-field-label">Note {reason === "Other" ? "" : "(optional)"}</span>
                      <textarea rows={2} value={note} onChange={(e) => { setNote(e.target.value); setNoteError(""); }} />
                      {noteError && <span className="ad-field-error">{noteError}</span>}
                    </label>
                  </div>
                )}
              </div>

              <div className="ad-modal-foot">
                {isPending ? (
                  rejecting ? (
                    <>
                      <button type="button" className="ad-btn ad-btn-ghost" onClick={() => { setRejecting(false); setNoteError(""); }} disabled={rBusy}>Back</button>
                      <span className="ad-spacer" />
                      <button type="button" className="ad-btn ad-btn-danger" onClick={() => rejectOne(r)} disabled={rBusy}>{rBusy ? "Rejectingâ€¦" : "Confirm reject"}</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="ad-btn ad-btn-danger-ghost" onClick={() => setRejecting(true)} disabled={rBusy}>Reject</button>
                      <span className="ad-spacer" />
                      <button type="button" className="ad-btn ad-btn-ghost" onClick={closeReview} disabled={rBusy}>Close</button>
                      <button type="button" className="ad-btn ad-btn-primary" onClick={() => approveOne(r)} disabled={rBusy || paidThisMonth}>{rBusy ? "Approvingâ€¦" : `Approve ${bdt(r.amount)}`}</button>
                    </>
                  )
                ) : (
                  <>
                    <span className="ad-spacer" />
                    <button type="button" className="ad-btn ad-btn-ghost" onClick={closeReview}>Close</button>
                  </>
                )}
              </div>
            </section>
          </div>
        );
      })()}

      {/* ---------------- Bulk approve confirm ---------------- */}
      {confirmBulk && (
        <div className="ad-modal-back" onClick={() => setConfirmBulk(false)}>
          <section className="ad-modal ad-modal-sm" role="dialog" aria-modal="true" aria-label="Approve selected" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head"><h2>Approve {rSel.length} request{rSel.length > 1 ? "s" : ""}?</h2></div>
            <div className="ad-modal-body ad-col">
              <p>{bdt(selectedAmount)} will be paid to the selected membersâ€™ wallets. A member who already has a salary this month is skipped.</p>
            </div>
            <div className="ad-modal-foot">
              <span className="ad-spacer" />
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setConfirmBulk(false)}>Cancel</button>
              <button type="button" className="ad-btn ad-btn-primary" onClick={approveSelected}>Yes, approve</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className={`ad-toast ${toast.bad ? "is-bad" : ""}`} role="status">{toast.text}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles (self-contained)                                            */
/* ------------------------------------------------------------------ */

const css = `
.ad{
  --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd; --sky-500:#0ea5e9; --sky-600:#0284c7; --sky-700:#0369a1;
  --ink:#0c2a3d; --muted:#5b7488; --line:#e3eef5; --bg:#f7fbfe; --card:#fff; --red:#c23030;
  display:flex; min-height:100vh; background:var(--bg); color:var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size:15px; line-height:1.5;
}
.ad *{box-sizing:border-box}
.ad h1,.ad h2,.ad h3,.ad p{margin:0}
.ad button{font:inherit}
.ad-muted{color:var(--muted)}
.ad-spacer{flex:1}

/* sidebar */
.ad-side{width:240px; flex:none; background:var(--card); border-right:1px solid var(--line); padding:20px 14px; display:flex; flex-direction:column; gap:20px; position:sticky; top:0; height:100vh}
.ad-brand{display:flex; align-items:center; gap:10px; font-weight:700; font-size:17px; padding:4px 10px}
.ad-logo{width:22px; height:22px; border-radius:7px; background:var(--sky-500); display:inline-block}
.ad-nav{display:flex; flex-direction:column; gap:2px}
.ad-link{display:flex; align-items:center; gap:12px; width:100%; text-align:left; border:0; background:transparent; color:var(--muted); font-weight:500; padding:10px 12px; border-radius:10px; cursor:pointer; transition:background .15s,color .15s}
.ad-link:hover{background:var(--sky-50); color:var(--sky-700)}
.ad-link.is-active{background:var(--sky-100); color:var(--sky-700)}
.ad-link:focus-visible,.ad-burger:focus-visible,.ad-btn:focus-visible,.ad-tab:focus-visible,.ad-switch:focus-visible,.ad-x:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}

/* layout */
.ad-main{flex:1; min-width:0; padding:28px 32px 56px}
.ad-top{display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap}
.ad-top-title{flex:1; min-width:220px}
.ad-top h1{font-size:24px; font-weight:700; letter-spacing:-.01em}
.ad-top-actions{display:flex; gap:8px}
.ad-burger{display:none; border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:10px; padding:8px; cursor:pointer}

/* buttons */
.ad-btn{border:1px solid transparent; border-radius:10px; padding:8px 16px; font-weight:600; cursor:pointer; transition:background .15s,border-color .15s; white-space:nowrap}
.ad-btn:disabled{opacity:.5; cursor:not-allowed}
.ad-btn-primary{background:var(--sky-500); color:#fff}
.ad-btn-primary:hover:not(:disabled){background:var(--sky-600)}
.ad-btn-ghost{background:transparent; color:var(--sky-700); border-color:var(--line)}
.ad-btn-ghost:hover:not(:disabled){background:var(--sky-50); border-color:var(--sky-200)}
.ad-btn-danger{background:var(--red); color:#fff}
.ad-btn-danger-ghost{background:transparent; color:var(--red); border-color:#f3d4d4}
.ad-btn-danger-ghost:hover{background:#fdf1f1}

/* tabs */
.ad-tabs{display:flex; gap:4px; border-bottom:1px solid var(--line); margin-bottom:16px; overflow-x:auto}
.ad-tab{border:0; background:transparent; color:var(--muted); font-weight:600; padding:10px 14px; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; white-space:nowrap}
.ad-tab:hover{color:var(--sky-700)}
.ad-tab.is-active{color:var(--sky-700); border-bottom-color:var(--sky-500)}

/* panels */
.ad-panel{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px}
.ad-panel + .ad-panel{margin-top:16px}
.ad-panel h2{font-size:17px; font-weight:600; margin-bottom:6px}
.ad-panel-head{display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px}
.ad-empty{text-align:center; color:var(--muted); padding:24px 12px}
.ad-table-wrap{overflow-x:auto; margin-top:8px}
.ad table{width:100%; border-collapse:collapse; min-width:420px}
.ad th{text-align:left; font-weight:500; color:var(--muted); font-size:13px; padding:8px 12px; border-bottom:1px solid var(--line); white-space:nowrap}
.ad td{padding:12px; border-bottom:1px solid var(--line)}
.ad tr:last-child td{border-bottom:0}

/* forms */
.ad-form-grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px 16px; margin:14px 0}
.ad-form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}
.ad-form-grid.is-off{opacity:.45; pointer-events:none}
.ad-stack{display:flex; flex-direction:column; gap:12px}
.ad-field{display:flex; flex-direction:column; gap:5px}
.ad-field-label{font-size:14px; font-weight:600}
.ad-field-hint{font-size:12.5px; color:var(--muted)}
.ad-field-error{font-size:12.5px; color:var(--red)}
.ad input,.ad select,.ad textarea{width:100%; border:1px solid var(--line); background:#fff; color:var(--ink); border-radius:10px; padding:9px 12px; font:inherit}
.ad textarea{resize:vertical}
.ad input:focus,.ad select:focus,.ad textarea:focus{outline:2px solid var(--sky-200); border-color:var(--sky-500)}
.ad input:disabled{background:var(--bg); color:var(--muted)}
.ad-modal-body h3{font-size:15px; font-weight:600; margin-top:20px}

/* switch */
.ad-switch-row{display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 0; border-top:1px solid var(--line)}
.ad-panel > h2 + .ad-switch-row{border-top:0}
.ad-switch-label{font-weight:600}
.ad-switch{flex:none; width:40px; height:24px; border-radius:999px; border:0; background:#cfe0ea; position:relative; cursor:pointer; transition:background .15s; padding:0}
.ad-switch span{position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:transform .15s}
.ad-switch.is-on{background:var(--sky-500)}
.ad-switch.is-on span{transform:translateX(16px)}

/* cards (levels, tiers) */
.ad-lvl-grid{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-top:12px}
.ad-pkg-grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px}
.ad-pkg{border:1px solid var(--line); border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:14px; background:var(--card)}
.ad-pkg.is-hidden{background:var(--bg)}
.ad-pkg-head{display:flex; align-items:center; gap:12px}
.ad-pkg-head > div{flex:1; min-width:0}
.ad-pkg-head h3{font-size:17px; font-weight:700}
.ad-pkg-head small{color:var(--muted)}
.ad-pkg-icon{width:40px; height:40px; border-radius:12px; background:var(--sky-100); color:var(--sky-700); display:inline-flex; align-items:center; justify-content:center; flex:none; font-weight:700}
.ad-emoji{font-size:20px}
.ad-badge{font-size:12.5px; font-weight:600; padding:3px 12px; border-radius:999px; background:var(--sky-100); color:var(--sky-700)}
.ad-badge.is-off{background:#eef2f5; color:var(--muted)}
.ad-reqs{display:flex; flex-wrap:wrap; gap:8px}
.ad-req{background:var(--sky-50); border:1px solid var(--sky-100); color:var(--sky-700); border-radius:999px; padding:3px 12px; font-size:13px; font-weight:500}
.ad-pkg-actions{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:auto}
.ad-pkg-toggle{display:flex; align-items:center; gap:10px; font-weight:500; font-size:14px}
.ad-grid-empty{grid-column:1/-1}

/* modal */
.ad-modal-back{position:fixed; inset:0; background:rgba(12,42,61,.4); display:flex; align-items:center; justify-content:center; padding:16px; z-index:50}
.ad-modal{background:var(--card); border-radius:16px; width:100%; max-width:600px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(12,42,61,.2)}
.ad-modal-head{display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid var(--line)}
.ad-modal-head h2{font-size:18px; font-weight:700; margin:0}
.ad-x{border:0; background:transparent; color:var(--muted); cursor:pointer; border-radius:8px; padding:6px}
.ad-x:hover{background:var(--sky-50); color:var(--ink)}
.ad-modal-body{padding:6px 20px 14px; overflow-y:auto}
.ad-modal-foot{display:flex; align-items:center; gap:8px; padding:14px 20px; border-top:1px solid var(--line); flex-wrap:wrap}
.ad-confirm{display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:13.5px}

.ad-toast{position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff; padding:10px 18px; border-radius:10px; z-index:60; font-weight:500}
.ad-toast.is-bad{background:var(--red)}
.ad-scrim{display:none}


/* salary requests */
.ad input[type=checkbox]{width:16px; height:16px; padding:0; accent-color:var(--sky-500)}
.ad-stats{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-bottom:16px}
.ad-card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px 20px}
.ad-card-label{color:var(--muted); font-size:14px}
.ad-card-value{font-size:30px; font-weight:700; letter-spacing:-.02em; margin-top:6px; color:var(--sky-700)}
.ad-card-note{color:var(--muted); font-size:13px; margin-top:4px}
.ad-count{display:inline-block; min-width:22px; text-align:center; background:var(--sky-100); color:var(--sky-700); border-radius:999px; font-size:12.5px; padding:0 7px; margin-left:6px}
.ad-toolbar{display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap}
.ad-toolbar input{flex:1; min-width:200px}
.ad-toolbar select{width:200px}
.ad-bulk{display:flex; align-items:center; gap:10px; background:var(--sky-50); border:1px solid var(--sky-100); border-radius:12px; padding:10px 14px; margin-bottom:12px; flex-wrap:wrap}
.ad-check{width:36px}
.ad-right{text-align:right}
.ad-hint{font-size:12.5px; color:var(--muted)}
.ad-warn{color:var(--red)}
.ad-pill{display:inline-block; padding:2px 10px; border-radius:999px; font-size:12.5px; font-weight:600}
.ad-approved{background:var(--sky-100); color:var(--sky-700)}
.ad-pending{background:#fff4d6; color:#8a5a00}
.ad-rejected{background:#fde4e4; color:#a12525}
.ad-col{display:flex; flex-direction:column; gap:14px; padding-top:16px}
.ad-col h3{margin-top:0 !important}
.ad-modal-sm{max-width:440px}
.ad-dl{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin:0}
.ad-dl > div{border:1px solid var(--line); border-radius:12px; padding:10px 12px}
.ad-dl dt{color:var(--muted); font-size:12.5px}
.ad-dl dd{font-weight:600; margin:0}
.ad-req.pass{background:var(--sky-50); border-color:var(--sky-100); color:var(--sky-700)}
.ad-req.fail{background:#fdf1f1; border-color:#f3d4d4; color:var(--red)}
.ad-note{border-radius:12px; padding:10px 14px; font-size:14px}
.ad-note-warn{background:#fff8e1; color:#8a5a00}
.ad-note-bad{background:#fdf1f1; color:#a12525}
.ad-reject{display:flex; flex-direction:column; gap:12px}

@media (max-width:1024px){ .ad-lvl-grid{grid-template-columns:1fr} }
@media (max-width:760px){
  .ad-side{position:fixed; left:0; top:0; z-index:30; transform:translateX(-100%); transition:transform .2s ease}
  .ad-side.is-open{transform:none}
  .ad-scrim{display:block; position:fixed; inset:0; background:rgba(12,42,61,.35); z-index:20}
  .ad-burger{display:inline-flex}
  .ad-main{padding:20px 16px 40px}
  .ad-form-grid,.ad-form-grid.three,.ad-pkg-grid,.ad-stats,.ad-dl{grid-template-columns:1fr}
  .ad-toolbar select{width:100%}
  .ad-top-actions{width:100%}
  .ad-top-actions .ad-btn{flex:1}
  .ad-panel-head{flex-direction:column}
}
@media (prefers-reduced-motion:reduce){ .ad-side,.ad-link,.ad-switch,.ad-switch span{transition:none} }
`;

```

## `app/superadmin/support/page.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type Contact = { name: string; url: string }
export default function AdminSupportPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetch("/api/admin/support", { credentials: "include", cache: "no-store" }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Load failed"); setContacts(d.contacts || []) }).catch(e => setError(e.message || "Load failed")) }, [])
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setSaved(false)
    try {
      const r = await fetch("/api/admin/support", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contacts }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Save failed"); setSaved(true)
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed") } finally { setBusy(false) }
  }
  const update = (index: number, field: keyof Contact, value: string) => setContacts(rows => rows.map((row, i) => i === index ? { ...row, [field]: value } : row))
  return <div className="ad"><AdminSidebar active="support"/><main className="ad-main"><header className="ad-top"><h1>Support contacts</h1></header><form className="support-manage" onSubmit={save}><p>Add named support contacts and their Telegram or WhatsApp profile links.</p>{contacts.map((contact, i) => <fieldset className="support-row" key={i}><legend>Support contact {i + 1}</legend><label>Name<input required maxLength={80} value={contact.name} placeholder="Manager" onChange={e => update(i, "name", e.target.value)}/></label><label>Telegram / WhatsApp link<input required type="url" value={contact.url} placeholder="https://t.me/username or https://wa.me/number" onChange={e => update(i, "url", e.target.value)}/></label><button type="button" className="support-remove" onClick={() => setContacts(rows => rows.filter((_, n) => n !== i))}>Remove contact</button></fieldset>)}<button type="button" className="support-add" disabled={contacts.length >= 50} onClick={() => setContacts(rows => [...rows, { name: "", url: "" }])}>+ Add contact</button>{error && <p role="alert" className="support-error">{error}</p>}{saved && <p role="status" className="support-saved">Changes saved.</p>}<button className="support-save" disabled={busy}>{busy ? "Savingâ€¦" : "Save contacts"}</button></form></main><style>{`.support-manage{max-width:680px;padding:24px;background:#fff;border:1px solid #e3eef5;border-radius:14px;display:grid;gap:16px}.support-manage>p{margin:0;color:#5b7488}.support-row{min-width:0;margin:0;padding:16px;border:1px solid #dce8ef;border-radius:10px;display:grid;gap:12px}.support-row legend{padding:0 6px;color:#527087;font-size:13px}.support-row label{display:grid;gap:6px;font-weight:600}.support-row input{min-width:0;padding:11px;border:1px solid #cbdde8;border-radius:8px;font:inherit}.support-remove,.support-add{justify-self:start;padding:7px 0;border:0;background:none;color:#b91c1c;font:inherit;cursor:pointer}.support-add{color:#0879c5;font-weight:700}.support-save{padding:11px 16px;border:0;border-radius:8px;background:#0284c7;color:#fff;font:inherit;font-weight:700;cursor:pointer}.support-save:disabled,.support-add:disabled{opacity:.6}.support-error{color:#b91c1c!important}.support-saved{color:#15803d!important}`}</style></div>
}

```

## `app/superadmin/settings/page.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type Settings = { telegramChannelUrl: string; telegramSupportUrl: string; whatsappSupportUrl: string; apkDownloadUrl: string }
const empty: Settings = { telegramChannelUrl: "", telegramSupportUrl: "", whatsappSupportUrl: "", apkDownloadUrl: "" }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(empty)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetch("/api/site-settings", { credentials: "include", cache: "no-store" }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setSettings({ ...empty, ...data }) }).catch(e => setError(e.message || "Settings load failed")) }, [])
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("")
    try {
      const response = await fetch("/api/site-settings", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Save failed")
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed") }
    finally { setBusy(false) }
  }
  const field = (key: keyof Settings, label: string) => <label className="site-setting-field">{label}<input type="url" value={settings[key]} placeholder="https://â€¦" onChange={e => setSettings(value => ({ ...value, [key]: e.target.value }))} /></label>
  return <div className="ad"><AdminSidebar active="settings" /><main className="ad-main"><header className="ad-top"><h1>Site settings</h1></header><form className="site-settings-card" onSubmit={save}><p>Profile links and Android APK download URL.</p>{field("telegramChannelUrl", "Telegram channel URL")}{field("telegramSupportUrl", "Telegram support URL")}{field("whatsappSupportUrl", "WhatsApp support URL")}{field("apkDownloadUrl", "APK file URL")}{error && <p role="alert" className="site-settings-error">{error}</p>}<button className="site-settings-save" disabled={busy}>{busy ? "Savingâ€¦" : "Save settings"}</button></form></main><style>{`.site-settings-card{max-width:680px;padding:24px;background:#fff;border:1px solid #e3eef5;border-radius:14px;display:grid;gap:16px}.site-settings-card>p{color:#5b7488}.site-setting-field{display:grid;gap:6px;font-weight:600}.site-setting-field input{padding:11px;border:1px solid #cbdde8;border-radius:8px;font:inherit}.site-settings-save{padding:11px 16px;border:0;border-radius:8px;background:#0284c7;color:white;font:inherit;font-weight:700;cursor:pointer}.site-settings-error{color:#b91c1c}`}</style></div>
}

```


