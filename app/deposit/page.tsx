"use client"

import { useEffect, useRef, useState } from "react"
import { useAppState } from "@/components/app/AppState"
import { toBengaliDigits, parseBengaliNumber, money } from "@/lib/app-format"

export default function DepositPage() {
  const { showToast, changePage } = useAppState()
  const [method, setMethod] = useState<"BKASH" | "NAGAD" | "ROCKET" | "BKASH-C" | "NAGAD-C">("BKASH")
  const [amount, setAmount] = useState(300)
  const [busy, setBusy] = useState(false)

  const toastRef = useRef(showToast)
  toastRef.current = showToast

  useEffect(() => {
    const order = new URLSearchParams(window.location.search).get("order")
    if (!order) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    const checkStatus = async () => {
      if (cancelled) return
      try {
        const response = await fetch(`/api/deposits/status?order=${encodeURIComponent(order)}`, { credentials: "include" })
        const result = await response.json()
        if (result.status === "paid") {
          toastRef.current("পেমেন্ট সফল; ব্যালেন্সে যোগ হয়েছে")
          window.history.replaceState({}, "", "/deposit")
          return
        }
        if (result.status === "failed") {
          toastRef.current("পেমেন্ট ব্যর্থ হয়েছে; ব্যালেন্স পরিবর্তন হয়নি")
          window.history.replaceState({}, "", "/deposit")
          return
        }
      } catch { /* retry while the gateway callback is pending */ }
      if (cancelled) return
      if (++attempts < 30) timer = setTimeout(checkStatus, 2000)
      else toastRef.current("পেমেন্ট যাচাই চলছে; পরে ব্যালেন্স দেখুন")
    }
    void checkStatus()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  const startPayment = async () => {
    if (!Number.isSafeInteger(amount) || amount < 300) return showToast("ন্যূনতম ৳৩০০ জমা দিন")
    setBusy(true)
    try {
      const response = await fetch("/api/deposits/create", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ amount: amount * 100, method }),
      })
      const result = await response.json()
      if (!response.ok || !result.success || !result.paymentUrl) throw new Error(result.error || `HTTP ${response.status}: পেমেন্ট শুরু ব্যর্থ`)
      window.location.assign(result.paymentUrl)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "পেমেন্ট ব্যর্থ")
      setBusy(false)
    }
  }

  return <main className="home-page page-content" style={{ maxWidth: 560, margin: "0 auto", padding: 20 }}>
    <h1 style={{ fontSize: 24, marginBottom: 8 }}>টাকা জমা</h1>
    <p style={{ marginBottom: 20 }}>bKash, Nagad, Rocket বা কার্ড দিয়ে জমা দিন</p>
    <section className="ps-card" style={{ padding: 20, display: "grid", gap: 16 }}>
      <label className="ps-field"><span>পেমেন্ট পদ্ধতি</span><select value={method} onChange={e => setMethod(e.target.value as typeof method)}><option value="BKASH">bKash</option><option value="NAGAD">Nagad</option><option value="ROCKET">Rocket</option><option value="BKASH-C">bKash Card</option><option value="NAGAD-C">Nagad Card</option></select></label>
      <label className="ps-field"><span>পরিমাণ (BDT)</span><input type="text" inputMode="numeric" value={toBengaliDigits(amount)} onChange={e => setAmount(parseBengaliNumber(e.target.value))} /></label>
      <p>জমার পরিমাণ: {money(amount)} · পদ্ধতি: {method}</p>
      <button className="ps-save" disabled={busy} onClick={startPayment}>{busy ? "পেমেন্ট শুরু হচ্ছে…" : "পেমেন্ট করুন"}</button>
      <p role="note">পেমেন্ট সফল হলে যাচাইকৃত callback-এর পর ব্যালেন্স যোগ হবে।</p>
    </section>
      <button style={{ marginTop: 16 }} onClick={() => changePage("home")}>ফিরে যান</button>
  </main>
}
