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

  return <div className="ad"><AdminSidebar active="users" /><main className="ad-main">
    <header className="ad-top"><div className="ad-top-title"><h1>User management</h1><p className="users-subtitle">{users.length.toLocaleString()} registered users</p></div></header>
    <section className="ad-panel users-panel">
      <div className="users-toolbar"><h2>All users</h2><input aria-label="Search users" placeholder="Search name, email, phone, ID…" value={query} onChange={e => setQuery(e.target.value)} /></div>
      {error ? <p role="alert" className="users-error">{error}</p> : <div className="ad-table-wrap"><table className="users-table ad-cards">
        <thead><tr>{["User", "Contact", "Balance", "Role", "Referral code", "Referred by", "Joined", "User ID"].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={8}>Loading users…</td></tr> : filtered.map(user => <tr key={user.id}>
            <td data-label="User"><div className="ad-cell"><strong>{user.name}</strong></div></td>
            <td data-label="Contact"><div className="ad-cell">{user.email}<br /><span className="ad-muted">{user.phone}</span></div></td>
            <td data-label="Balance"><div className="ad-cell ad-amount">{money(user.balance)}</div></td>
            <td data-label="Role"><div className="ad-cell"><span className="users-role">{user.role}</span></div></td>
            <td data-label="Referral code"><div className="ad-cell">{user.referral_code || "—"}</div></td>
            <td data-label="Referred by"><div className="ad-cell">{user.referred_by || "—"}</div></td>
            <td data-label="Joined"><div className="ad-cell">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</div></td>
            <td data-label="User ID" className="users-id" title={user.id}><div className="ad-cell">{user.id}</div></td>
          </tr>)}
          {!loading && !error && filtered.length === 0 && <tr><td colSpan={8} className="ad-empty">No matching users.</td></tr>}
        </tbody></table></div>}
      <p className="users-count">Showing {filtered.length.toLocaleString()} of {users.length.toLocaleString()} users</p>
    </section></main></div>
}
