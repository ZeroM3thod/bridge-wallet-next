"use client"

import { useEffect, useRef, useState } from "react"
import Icon from "@/components/app/Icon"
import { useAppState } from "@/components/app/AppState"
import { walletLogos } from "@/lib/wallet-logos"
import type { WalletProvider } from "@/lib/withdrawal"
import { toBengaliDigits, parseBengaliNumber, money } from "@/lib/app-format"

type DepositMethod = "BKASH" | "NAGAD" | "ROCKET" | "BKASH-C" | "NAGAD-C"

const depositMethods: { id: DepositMethod; name: string; english: string; logo: WalletProvider; note: string }[] = [
  { id: "BKASH", name: "বিকাশ", english: "bKash", logo: "bkash", note: "bKash" },
  { id: "NAGAD", name: "নগদ", english: "Nagad", logo: "nagad", note: "Nagad" },
  { id: "ROCKET", name: "রকেট", english: "Rocket", logo: "rocket", note: "Rocket" },
  { id: "BKASH-C", name: "বিকাশ ক্যাশআউট", english: "bKash Cashout", logo: "bkash", note: "bKash Cashout" },
  { id: "NAGAD-C", name: "নগদ ক্যাশআউট", english: "Nagad Cashout", logo: "nagad", note: "Nagad Cashout" },
]

export default function DepositPage() {
  const { showToast, changePage, balance, setBalance } = useAppState()
  const [method, setMethod] = useState<DepositMethod>("BKASH")
  const [amount, setAmount] = useState(300)
  const [minimumAmount, setMinimumAmount] = useState(300)
  const [busy, setBusy] = useState(false)

  const toastRef = useRef(showToast)
  toastRef.current = showToast

  const selected = depositMethods.find((item) => item.id === method) ?? depositMethods[0]

  useEffect(() => {
    let active = true
    fetch("/api/deposits/create", { credentials: "include", cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((result) => { if (active && Number.isSafeInteger(result?.minimumAmount)) { setMinimumAmount(result.minimumAmount); setAmount(result.minimumAmount) } }).catch(() => {})
    fetch("/api/profile", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load wallet balance")
        return response.json()
      })
      .then((result) => { if (active && result.success && Number.isFinite(result.user?.balance)) setBalance(result.user.balance) })
      .catch(() => { if (active) toastRef.current("ব্যালেন্স লোড করা যায়নি; আবার চেষ্টা করুন") })
    return () => { active = false }
  }, [setBalance])

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
          const profile = await fetch("/api/profile", { credentials: "include", cache: "no-store" }).then((response) => response.ok ? response.json() : null)
          if (profile?.success && Number.isFinite(profile.user?.balance)) setBalance(profile.user.balance)
          toastRef.current("পেমেন্ট সফল; ব্যালেন্সে যোগ হয়েছে")
          window.history.replaceState({}, "", "/deposit")
          return
        }
        if (result.status === "failed" || result.status === "cancelled") {
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
  }, [setBalance])

  const startPayment = async () => {
    if (!Number.isSafeInteger(amount) || amount < minimumAmount) return showToast(`ন্যূনতম ৳${minimumAmount} জমা দিন`)
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

  return (
    <main className="home-page office-page page-content withdraw-page">
      <section className="office-hero withdraw-hero">
        <div className="office-welcome">
          <span>টাকা জমা</span>
          <h1>আপনার অ্যাকাউন্টে টাকা জমা করুন</h1>
          <p>বিকাশ, নগদ, রকেট ও ক্যাশআউটের মাধ্যমে জমা দিন</p>
        </div>
        <div className="office-balance">
          <span>
            <Icon name="wallet" size={26} />
          </span>
          <div>
            <small>ব্যবহারযোগ্য সঞ্চয়</small>
            <strong>{money(balance)}</strong>
          </div>
        </div>
      </section>

      <section className="withdraw-wallets">
        <div className="withdraw-section-head">
          <h2>পেমেন্ট পদ্ধতি</h2>
        </div>
        <div className="withdraw-wallet-list">
          {depositMethods.map((item) => {
            const active = method === item.id
            return (
              <button
                className={active ? "withdraw-wallet active" : "withdraw-wallet"}
                key={item.id}
                aria-pressed={active}
                onClick={() => setMethod(item.id)}
              >
                <span className={`wallet-provider ${item.logo}`}>
                  <img src={walletLogos[item.logo]} alt={`${item.english} লোগো`} />
                </span>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.english}</small>
                </div>
                {active && (
                  <span className="wallet-check">
                    <Icon name="check" size={15} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="withdraw-form">
        <label className="office-amount-field">
          <span>জমার পরিমাণ</span>
          <div>
            <b>৳</b>
            <input
              inputMode="numeric"
              onChange={(event) => setAmount(parseBengaliNumber(event.target.value))}
              type="text"
              value={toBengaliDigits(amount)}
            />
          </div>
        </label>
        <div className="office-amount-presets">
          {[minimumAmount, 500, 1000, 2500].filter((preset, index, items) => preset >= minimumAmount && items.indexOf(preset) === index).map((preset) => (
            <button key={preset} onClick={() => setAmount(preset)}>
              {money(preset)}
            </button>
          ))}
        </div>
        <div className="withdraw-totals">
          <div>
            <span>জমার পরিমাণ</span>
            <b>{money(amount)}</b>
          </div>
          <div className="net">
            <span>পেমেন্ট পদ্ধতি</span>
            <b>{selected.name}</b>
          </div>
        </div>
        <button className="withdraw-submit" disabled={busy} onClick={startPayment}>
          {busy ? "পেমেন্ট শুরু হচ্ছে…" : "পেমেন্ট করুন"}
        </button>
        <small className="withdraw-note" role="note">
          পেমেন্ট সফল হলে যাচাইকৃত callback-এর পর ব্যালেন্স যোগ হবে।
        </small>
        <div className="withdraw-rules">
          <h3>
            <Icon name="clock" size={13} />
            <span>জমার নিয়ম</span>
          </h3>
          <ul>
            <li>
              <span>ন্যূনতম জমা</span>
              <b>{money(minimumAmount)}</b>
            </li>
            <li>
              <span>পেমেন্ট পদ্ধতি</span>
              <b>বিকাশ, নগদ, রকেট, ক্যাশআউট</b>
            </li>
            <li>
              <span>ব্যালেন্স যোগ</span>
              <b>পেমেন্ট যাচাইয়ের পর</b>
            </li>
          </ul>
        </div>
      </section>

      <button className="withdraw-note" onClick={() => changePage("home")}>ফিরে যান</button>
    </main>
  )
}
