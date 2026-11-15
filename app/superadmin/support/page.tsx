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
  return <div className="ad"><AdminSidebar active="support"/><main className="ad-main"><header className="ad-top"><div className="ad-top-title"><h1>Support contacts</h1></div></header>
    <form className="support-manage" onSubmit={save}>
      <p>Add named support contacts and their Telegram or WhatsApp profile links.</p>
      {contacts.map((contact, i) => <fieldset className="support-row" key={i}><legend>Support contact {i + 1}</legend>
        <label>Name<input required maxLength={80} value={contact.name} placeholder="Manager" onChange={e => update(i, "name", e.target.value)}/></label>
        <label>Telegram / WhatsApp link<input required type="url" value={contact.url} placeholder="https://t.me/username or https://wa.me/number" onChange={e => update(i, "url", e.target.value)}/></label>
        <button type="button" className="support-remove" onClick={() => setContacts(rows => rows.filter((_, n) => n !== i))}>Remove contact</button>
      </fieldset>)}
      <button type="button" className="support-add" disabled={contacts.length >= 50} onClick={() => setContacts(rows => [...rows, { name: "", url: "" }])}>+ Add contact</button>
      {error && <p role="alert" className="support-error">{error}</p>}
      {saved && <p role="status" className="support-saved">Changes saved.</p>}
      <button className="support-save" disabled={busy}>{busy ? "Saving…" : "Save contacts"}</button>
    </form></main></div>
}
