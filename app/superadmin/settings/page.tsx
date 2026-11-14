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
  const field = (key: keyof Settings, label: string) => <label className="site-setting-field">{label}<input type="url" value={settings[key]} placeholder="https://…" onChange={e => setSettings(value => ({ ...value, [key]: e.target.value }))} /></label>
  return <div className="ad"><AdminSidebar active="settings" /><main className="ad-main"><header className="ad-top"><h1>Site settings</h1></header><form className="site-settings-card" onSubmit={save}><p>Profile links and Android APK download URL.</p>{field("telegramChannelUrl", "Telegram channel URL")}{field("telegramSupportUrl", "Telegram support URL")}{field("whatsappSupportUrl", "WhatsApp support URL")}{field("apkDownloadUrl", "APK file URL")}{error && <p role="alert" className="site-settings-error">{error}</p>}<button className="site-settings-save" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button></form></main><style>{`.site-settings-card{max-width:680px;padding:24px;background:#fff;border:1px solid #e3eef5;border-radius:14px;display:grid;gap:16px}.site-settings-card>p{color:#5b7488}.site-setting-field{display:grid;gap:6px;font-weight:600}.site-setting-field input{padding:11px;border:1px solid #cbdde8;border-radius:8px;font:inherit}.site-settings-save{padding:11px 16px;border:0;border-radius:8px;background:#0284c7;color:white;font:inherit;font-weight:700;cursor:pointer}.site-settings-error{color:#b91c1c}`}</style></div>
}
