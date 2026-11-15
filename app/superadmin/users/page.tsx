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
  const money = (value: number | null) => `৳${(value ?? 0).toLocaleString("en-BD")}`

  return <div className="ad"><AdminSidebar active="users" /><main className="ad-main"><header className="ad-top"><div><h1>User management</h1><p className="users-subtitle">{users.length.toLocaleString()} registered users</p></div></header>
    <section className="ad-panel users-panel"><div className="users-toolbar"><h2>All users</h2><input aria-label="Search users" placeholder="Search name, email, phone, ID…" value={query} onChange={e => setQuery(e.target.value)} /></div>
      {error ? <p role="alert" className="users-error">{error}</p> : <div className="ad-table-wrap"><table className="users-table"><thead><tr>{["User", "Contact", "Balance", "Role", "Referral code", "Referred by", "Joined", "User ID"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
        {loading ? <tr><td colSpan={8}>Loading users…</td></tr> : filtered.map(user => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}<br /><span className="ad-muted">{user.phone}</span></td><td>{money(user.balance)}</td><td><span className="users-role">{user.role}</span></td><td>{user.referral_code || "—"}</td><td>{user.referred_by || "—"}</td><td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td><td className="users-id" title={user.id}>{user.id}</td></tr>)}
        {!loading && !error && filtered.length === 0 && <tr><td colSpan={8}>No matching users.</td></tr>}
      </tbody></table></div>}
      <p className="users-count">Showing {filtered.length.toLocaleString()} of {users.length.toLocaleString()} users</p>
    </section></main><style>{`.users-subtitle{color:#5b7488;margin-top:3px!important}.users-panel{margin-top:0}.users-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.users-toolbar h2{margin:0}.users-toolbar input{width:min(360px,100%);padding:10px 12px;border:1px solid #d5e4ed;border-radius:9px;font:inherit}.users-table{min-width:1050px}.users-table td{vertical-align:top}.users-id{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:#5b7488}.users-role{padding:3px 9px;border-radius:999px;background:#e0f2fe;color:#0369a1;text-transform:capitalize}.users-count{margin-top:12px!important;font-size:13px;color:#5b7488}.users-error{color:#b91c1c}@media(max-width:600px){.users-toolbar{align-items:stretch;flex-direction:column}}`}</style></div>
}
