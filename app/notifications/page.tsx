"use client"

import { useEffect, useState } from "react"

type Notification = { id: string; title: string; detail: string; createdAt: number; kind: string }
export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [error, setError] = useState("")
  useEffect(() => { fetch("/api/notifications", { credentials: "include", cache: "no-store" }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "লোড করা যায়নি"); setItems(d.notifications || []) }).catch(e => setError(e.message?.match(/[\u0980-\u09FF]/) ? e.message : "নোটিফিকেশন লোড করা যায়নি")) }, [])
  return <main className="home-page page-content"><section className="notifications-card"><h2>নোটিফিকেশন</h2>{error && <p role="alert">{error}</p>}{!error && !items.length && <p>এখনও কোনো নোটিফিকেশন নেই।</p>}<ul>{items.map(item => <li key={item.id}><span className="notification-mark" aria-hidden="true">{item.kind === "profit" ? "৳" : item.kind === "deposit" ? "+" : item.kind === "withdrawal" ? "↗" : item.kind === "package" ? "▣" : "•"}</span><div><strong>{item.title}</strong><p>{item.detail}</p><time dateTime={new Date(item.createdAt).toISOString()}>{new Date(item.createdAt).toLocaleString("bn-BD")}</time></div></li>)}</ul></section><style>{`.notifications-card{max-width:680px;margin:0 auto;padding:20px;background:#fff;border:1px solid #deedf7;border-radius:16px}.notifications-card h2{margin:0 0 16px;color:#0b2b5c;font-size:20px}.notifications-card ul{list-style:none;margin:0;padding:0;display:grid;gap:9px}.notifications-card li{display:flex;align-items:flex-start;gap:12px;padding:12px;border:1px solid #e3eef5;border-radius:11px}.notification-mark{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:50%;background:#e5f3ff;color:#0879c5;font-weight:800}.notifications-card li strong{color:#173b59}.notifications-card li p{margin:3px 0;color:#547087;font-size:14px}.notifications-card time{color:#8496a5;font-size:12px}`}</style></main>
}
