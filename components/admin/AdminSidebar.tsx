"use client"

import { usePathname, useRouter } from "next/navigation"

const items = [
  ["dashboard", "Dashboard", "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z"],
  ["users", "Users", "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0"],
  ["deposits", "Deposits", "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"],
  ["withdraws", "Withdraws", "M12 15V3m0 0L8 7m4-4l4 4M4 21h16"],
  ["packages", "Packages", "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"],
  ["referrals", "Referral Manage", "M17 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM7 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 21a5 5 0 0 0-8-4"],
  ["settings", "Settings", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"],
] as const

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const active = pathname === "/superadmin" ? "dashboard" : pathname.split("/").pop()
  const go = (key: string) => {
    router.push(key === "dashboard" ? "/superadmin" : `/superadmin/${key}`)
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

import React from "react"
