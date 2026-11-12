"use client"

import { useState } from "react"
import { useAppState } from "@/components/app/AppState"

const methods = ["BKASH", "NAGAD", "ROCKET", "BKASH-C", "NAGAD-C"] as const

export default function QuickDepositPage() {
  const { showToast } = useAppState()
  const [amount, setAmount] = useState("300")
  const [method, setMethod] = useState<(typeof methods)[number]>("BKASH")
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const taka = Number(amount)
    if (!Number.isSafeInteger(taka) || taka < 300 || taka % 100 !== 0) {
      showToast("Enter a whole amount of at least ৳300")
      return
    }
    setBusy(true)
    try {
      const response = await fetch("/api/deposits/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: taka * 100, method }),
      })
      const result = await response.json()
      if (!response.ok || !result.success || !result.paymentUrl) throw new Error(result.error || `Payment failed (${response.status})`)
      window.location.assign(result.paymentUrl)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not start payment")
      setBusy(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b1020", color: "#f5f7ff", padding: "48px 20px", fontFamily: "system-ui, sans-serif" }}>
      <section style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 28, alignItems: "stretch" }}>
        <div style={{ padding: "32px 12px" }}>
          <a href="/deposit" style={{ color: "#9aa8c7", textDecoration: "none" }}>← Back to deposits</a>
          <p style={{ marginTop: 48, color: "#91e5c1", letterSpacing: 3, fontSize: 12, fontWeight: 700 }}>SECURE CHECKOUT</p>
          <h1 style={{ fontSize: "clamp(36px,7vw,64px)", lineHeight: 1.05, margin: "12px 0" }}>Add funds<br />to your wallet.</h1>
          <p style={{ color: "#aab4cc", lineHeight: 1.7, maxWidth: 420 }}>Choose a supported mobile payment method. You’ll continue to the payment provider to complete checkout.</p>
          <div style={{ marginTop: 32, padding: 18, border: "1px solid #25314d", borderRadius: 16, color: "#aab4cc" }}>Funds are credited only after the payment callback is verified.</div>
        </div>

        <form onSubmit={submit} style={{ background: "#151d31", border: "1px solid #293653", borderRadius: 24, padding: "clamp(22px,5vw,36px)", boxShadow: "0 24px 80px #0005" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 23 }}>Create a deposit</h2>
          <p style={{ margin: "0 0 26px", color: "#9aa8c7", fontSize: 14 }}>Minimum deposit: ৳300</p>

          <label htmlFor="quick-amount" style={{ display: "block", color: "#c9d2e7", fontSize: 14 }}>Amount (BDT)</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, background: "#0e1527", border: "1px solid #34415e", borderRadius: 12, padding: "12px 16px" }}>
            <span style={{ color: "#91e5c1", fontSize: 22 }}>৳</span>
            <input id="quick-amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} required style={{ width: "100%", color: "white", background: "transparent", border: 0, outline: 0, fontSize: 24 }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 26px" }}>
            {[300, 500, 1000, 2500].map((value) => <button key={value} type="button" onClick={() => setAmount(String(value))} style={{ border: "1px solid #34415e", borderRadius: 999, background: "#202b43", color: "#dce5f7", padding: "8px 14px", cursor: "pointer" }}>৳{value}</button>)}
          </div>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ color: "#c9d2e7", fontSize: 14, marginBottom: 10 }}>Payment method</legend>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 9 }}>
              {methods.map((item) => <button key={item} type="button" aria-pressed={method === item} onClick={() => setMethod(item)} style={{ padding: 13, borderRadius: 11, border: `1px solid ${method === item ? "#66dca9" : "#34415e"}`, background: method === item ? "#18352f" : "#0e1527", color: "white", cursor: "pointer", textAlign: "left" }}>{item.replace("-C", " Cashout")}</button>)}
            </div>
          </fieldset>

          <button disabled={busy} type="submit" style={{ width: "100%", marginTop: 26, padding: 15, border: 0, borderRadius: 12, background: busy ? "#567466" : "#72e0af", color: "#08130f", fontWeight: 800, fontSize: 16, cursor: busy ? "wait" : "pointer" }}>{busy ? "Connecting to payment…" : `Continue · ৳${amount || "0"}`}</button>
          <p style={{ color: "#8693ad", fontSize: 12, textAlign: "center", margin: "14px 0 0" }}>Payment handled securely by the configured gateway.</p>
        </form>
      </section>
    </main>
  )
}
