import { useEffect, useState } from "react"
import type { Page } from "@/lib/app-navigation"
import SubPageShell from "./SubPageShell"
export default function PasswordForm({ title, withdrawal, action, onNavigate }: { title: string; withdrawal?: boolean; action: (m: string) => void; onNavigate: (page: Page) => void }) {
  const [oldPw, setOldPw] = useState("")
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")
  const [hasWithdrawalPassword, setHasWithdrawalPassword] = useState(false)
  const [loading, setLoading] = useState(Boolean(withdrawal))
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (!withdrawal) return
    fetch("/api/withdrawal-password", { credentials: "include", cache: "no-store" })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setHasWithdrawalPassword(data.hasPassword) })
      .catch((error) => action(error instanceof Error ? error.message : "তথ্য লোড হয়নি"))
      .finally(() => setLoading(false))
  }, [withdrawal, action])
  const submit = async () => {
    if ((withdrawal && hasWithdrawalPassword && !oldPw) || !pw || !pw2) return action("সব ঘর পূরণ করুন")
    if (pw.length < 6) return action("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
    if (pw !== pw2) return action("নতুন পাসওয়ার্ড মিলছে না")
    if (withdrawal) {
      setSaving(true)
      try {
        const response = await fetch("/api/withdrawal-password", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: oldPw, password: pw, confirmPassword: pw2 }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "পাসওয়ার্ড সংরক্ষণ হয়নি")
        setHasWithdrawalPassword(true)
        setOldPw(""); setPw(""); setPw2("")
        action("উত্তোলন পাসওয়ার্ড সংরক্ষিত হয়েছে")
      } catch (error) { action(error instanceof Error ? error.message : "সার্ভার সমস্যা হয়েছে") }
      finally { setSaving(false) }
      return
    }
    if (!oldPw) return action("সব ঘর পূরণ করুন")
    setOldPw(""); setPw(""); setPw2("")
    action(`${title} সফলভাবে পরিবর্তন হয়েছে`)
  }
  return (
    <SubPageShell title={title} onNavigate={onNavigate}>
      {loading ? <p style={{ textAlign: "center", padding: "2rem" }}>লোড হচ্ছে...</p> : <>
      <section className="ps-card">
        {(!withdrawal || hasWithdrawalPassword) && <label className="ps-field"><span>{withdrawal ? "বর্তমান উত্তোলন পাসওয়ার্ড" : "বর্তমান পাসওয়ার্ড"}</span>
          <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="বর্তমান পাসওয়ার্ড লিখুন" /></label>
        }
        <label className="ps-field"><span>নতুন পাসওয়ার্ড</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" /></label>
        <label className="ps-field"><span>নতুন পাসওয়ার্ড নিশ্চিত করুন</span>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="আবার লিখুন" /></label>
        <p className="ps-note">{withdrawal ? "উত্তোলনের সময় এই পাসওয়ার্ড প্রয়োজন হবে। কারো সাথে শেয়ার করবেন না।" : "নিরাপত্তার জন্য শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।"}</p>
      </section>
      <button className="ps-save" onClick={submit} disabled={saving}>{saving ? "সংরক্ষণ হচ্ছে…" : withdrawal && !hasWithdrawalPassword ? "সেট করুন" : "পরিবর্তন করুন"}</button>
      </>}
    </SubPageShell>
  )
}

