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
  return <div className="ad"><AdminSidebar active="settings" /><main className="ad-main"><header className="ad-top"><div className="ad-top-title"><h1>Site settings</h1></div></header>
    <form className="site-settings-card" onSubmit={save}>
      <p>Profile links and Android APK download URL.</p>
      {field("telegramChannelUrl", "Telegram channel URL")}
      {field("telegramSupportUrl", "Telegram support URL")}
      {field("whatsappSupportUrl", "WhatsApp support URL")}
      {field("apkDownloadUrl", "APK file URL")}
      {error && <p role="alert" className="site-settings-error">{error}</p>}
      <button className="site-settings-save" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
    </form></main></div>
}
