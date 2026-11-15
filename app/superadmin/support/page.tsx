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
  return <div className="ad"><AdminSidebar active="support"/><main className="ad-main"><header className="ad-top"><h1>Support contacts</h1></header><form className="support-manage" onSubmit={save}><p>Add named support contacts and their Telegram or WhatsApp profile links.</p>{contacts.map((contact, i) => <fieldset className="support-row" key={i}><legend>Support contact {i + 1}</legend><label>Name<input required maxLength={80} value={contact.name} placeholder="Manager" onChange={e => update(i, "name", e.target.value)}/></label><label>Telegram / WhatsApp link<input required type="url" value={contact.url} placeholder="https://t.me/username or https://wa.me/number" onChange={e => update(i, "url", e.target.value)}/></label><button type="button" className="support-remove" onClick={() => setContacts(rows => rows.filter((_, n) => n !== i))}>Remove contact</button></fieldset>)}<button type="button" className="support-add" disabled={contacts.length >= 50} onClick={() => setContacts(rows => [...rows, { name: "", url: "" }])}>+ Add contact</button>{error && <p role="alert" className="support-error">{error}</p>}{saved && <p role="status" className="support-saved">Changes saved.</p>}<button className="support-save" disabled={busy}>{busy ? "Saving…" : "Save contacts"}</button></form></main><style>{`.support-manage{max-width:680px;padding:24px;background:#fff;border:1px solid #e3eef5;border-radius:14px;display:grid;gap:16px}.support-manage>p{margin:0;color:#5b7488}.support-row{min-width:0;margin:0;padding:16px;border:1px solid #dce8ef;border-radius:10px;display:grid;gap:12px}.support-row legend{padding:0 6px;color:#527087;font-size:13px}.support-row label{display:grid;gap:6px;font-weight:600}.support-row input{min-width:0;padding:11px;border:1px solid #cbdde8;border-radius:8px;font:inherit}.support-remove,.support-add{justify-self:start;padding:7px 0;border:0;background:none;color:#b91c1c;font:inherit;cursor:pointer}.support-add{color:#0879c5;font-weight:700}.support-save{padding:11px 16px;border:0;border-radius:8px;background:#0284c7;color:#fff;font:inherit;font-weight:700;cursor:pointer}.support-save:disabled,.support-add:disabled{opacity:.6}.support-error{color:#b91c1c!important}.support-saved{color:#15803d!important}`}</style></div>
}
