# Deposit implementation reference

Historical implementation snapshot. Current code includes live/development changes; consult `app/deposit/page.tsx`, `functions/api/deposits/*`, and `payment-api/*/app.js`. Never credit funds based on the browser redirect.

## Configuration

Cloudflare Pages production secrets/variables:

```dotenv
OKEXPAY_MCH_ID=1000
OKEXPAY_KEY=<sandbox key from payment.md>
OKEXPAY_HOST=https://sandbox.okexpay.dev
```

## Files

### `app/deposit/page.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import { useAppState } from "@/components/app/AppState"
import { toBengaliDigits, parseBengaliNumber, money } from "@/lib/app-format"

export default function DepositPage() {
  const { showToast, changePage } = useAppState()
  const [method, setMethod] = useState<"BKASH" | "NAGAD">("BKASH")
  const [amount, setAmount] = useState(100)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const order = new URLSearchParams(window.location.search).get("order")
    if (!order) return
    let timer: ReturnType<typeof setTimeout>
    let attempts = 0
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/deposits/status?order=${encodeURIComponent(order)}`, { credentials: "include" })
        const result = await response.json()
        if (result.status === "paid") { showToast("পেমেন্ট সফল; ব্যালেন্সে যোগ হয়েছে"); window.history.replaceState({}, "", "/deposit"); return }
        if (result.status === "failed") { showToast("পেমেন্ট ব্যর্থ হয়েছে"); window.history.replaceState({}, "", "/deposit"); return }
      } catch { /* retry while the gateway callback is pending */ }
      if (++attempts < 30) timer = setTimeout(checkStatus, 2000)
      else showToast("পেমেন্ট যাচাই চলছে; পরে ব্যালেন্স দেখুন")
    }
    void checkStatus()
    return () => clearTimeout(timer)
  }, [showToast])

  const startPayment = async () => {
    if (!Number.isSafeInteger(amount) || amount < 1) return showToast("সঠিক জমার পরিমাণ লিখুন")
    setBusy(true)
    try {
      const response = await fetch("/api/deposits/create", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ amount: amount * 100, method }),
      })
      const result = await response.json()
      if (!response.ok || !result.success || !result.paymentUrl) throw new Error(result.error || "পেমেন্ট শুরু ব্যর্থ")
      window.location.assign(result.paymentUrl)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "পেমেন্ট ব্যর্থ")
      setBusy(false)
    }
  }

  return <main className="home-page page-content" style={{ maxWidth: 560, margin: "0 auto", padding: 20 }}>
    <h1 style={{ fontSize: 24, marginBottom: 8 }}>টাকা জমা</h1>
    <p style={{ marginBottom: 20 }}>পরীক্ষামূলক পেমেন্ট — bKash বা Nagad</p>
    <section className="ps-card" style={{ padding: 20, display: "grid", gap: 16 }}>
      <label className="ps-field"><span>পেমেন্ট পদ্ধতি</span><select value={method} onChange={e => setMethod(e.target.value as typeof method)}><option value="BKASH">bKash</option><option value="NAGAD">Nagad</option></select></label>
      <label className="ps-field"><span>পরিমাণ (BDT)</span><input type="text" inputMode="numeric" value={toBengaliDigits(amount)} onChange={e => setAmount(parseBengaliNumber(e.target.value))} /></label>
      <p>জমার পরিমাণ: {money(amount)} · পদ্ধতি: {method}</p>
      <button className="ps-save" disabled={busy} onClick={startPayment}>{busy ? "পেমেন্ট শুরু হচ্ছে…" : "পেমেন্ট করুন"}</button>
      <p role="note">টেস্ট গেটওয়ে। পেমেন্ট সফল হলে যাচাইকৃত webhook-এ ব্যালেন্স যোগ হবে।</p>
    </section>
    <button style={{ marginTop: 16 }} onClick={() => changePage("home")}>ফিরে যান</button>
  </main>
}
```

### `functions/api/deposits/create.ts`

```ts
import type { EventContext } from '@cloudflare/workers-types'
import { md5 } from '../../lib/md5'

type Env = { DB: D1Database; OKEXPAY_MCH_ID?: string; OKEXPAY_KEY?: string; OKEXPAY_HOST?: string }

const json = (body: unknown, status = 200) => Response.json(body, { status })
export async function onRequestPost({ request, env }: EventContext<Env, any, any>) {
  try {
    const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    if (!sessionId) return json({ error: 'অনুমোদিত নয়' }, 401)
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?').bind(sessionId, Date.now()).first<{ user_id: string }>()
    if (!session) return json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, 401)

    const body = await request.json() as { amount?: number; method?: string }
    if (!Number.isSafeInteger(body.amount) || (body.amount ?? 0) < 10_000 || !['BKASH', 'NAGAD'].includes(body.method ?? '')) return json({ error: 'সঠিক পেমেন্ট পদ্ধতি ও ন্যূনতম ৳১০০ পরিমাণ দিন' }, 400)
    if (!env.OKEXPAY_KEY) return json({ error: 'পেমেন্ট গেটওয়ে কনফিগার করা নেই' }, 503)

    const outTradeNo = `${Date.now()}${crypto.getRandomValues(new Uint8Array(1))[0] % 10}`
    const mchId = env.OKEXPAY_MCH_ID || '1000'
    const host = (env.OKEXPAY_HOST || 'https://sandbox.okexpay.dev').replace(/\/$/, '')
    const fields: Record<string, string> = {
      mchId, currency: 'BDT', out_trade_no: outTradeNo, pay_type: body.method!,
      money: String((body.amount! / 100).toFixed(0)), attach: session.user_id,
      notify_url: new URL('/api/notify', request.url).toString(),
      returnUrl: `${new URL('/deposit', request.url).toString()}?order=${encodeURIComponent(outTradeNo)}`,
    }
    // Assumption: docs say MD5 but omit canonicalization. Signs sorted non-empty fields + key.
    const signText = Object.keys(fields).sort().filter(key => fields[key] !== '').map(key => `${key}=${fields[key]}`).join('&') + `&key=${env.OKEXPAY_KEY}`
    fields.sign = md5(signText)

    await env.DB.prepare('INSERT INTO deposits (id,user_id,out_trade_no,method,amount,status,created_at) VALUES (?,?,?,?,?,\'pending\',?)')
      .bind(crypto.randomUUID(), session.user_id, outTradeNo, body.method, body.amount, Date.now()).run()
    const gatewayResponse = await fetch(`${host}/v1/Collect`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fields) })
    const result = await gatewayResponse.json() as { code?: number; msg?: string; data?: { url?: string; transaction_Id?: string } }
    if (!gatewayResponse.ok || result.code !== 0 || !result.data?.url) {
      await env.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'").bind(outTradeNo).run()
      return json({ error: result.msg || 'পেমেন্ট অর্ডার তৈরি ব্যর্থ' }, 502)
    }
    const paymentUrl = new URL(result.data.url)
    if (paymentUrl.protocol !== 'https:' || ![new URL(host).hostname, 'sandbox.wpay.one'].includes(paymentUrl.hostname)) {
      await env.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'").bind(outTradeNo).run()
      return json({ error: 'গেটওয়ের পেমেন্ট URL গ্রহণযোগ্য নয়' }, 502)
    }
    await env.DB.prepare('UPDATE deposits SET gateway_transaction_id=? WHERE out_trade_no=?').bind(result.data.transaction_Id || null, outTradeNo).run()
    return json({ success: true, paymentUrl: paymentUrl.toString() })
  } catch (error) {
    console.error('Create deposit error:', error)
    return json({ error: 'সার্ভার সমস্যা হয়েছে' }, 500)
  }
}
```

### `functions/api/notify.ts`

```ts
export { onRequestPost } from './deposits/webhook'
```

### `functions/api/deposits/webhook.ts`

```ts
import type { EventContext } from '@cloudflare/workers-types'
import { md5 } from '../../lib/md5'

type Env = { DB: D1Database; OKEXPAY_KEY?: string }

export async function onRequestPost({ request, env }: EventContext<Env, any, any>) {
  try {
    const form = await request.formData()
    const data = Object.fromEntries(form.entries()) as Record<string, string>
    const order = data.out_trade_no
    const amount = Number(data.money)
    const signature = data.sign?.toLowerCase()
    if (!order || !signature || !env.OKEXPAY_KEY) return new Response('fail', { status: 400 })
    const signedFields = Object.fromEntries(Object.entries(data).filter(([key, value]) => key !== 'sign' && key !== 'Sign' && value !== '').sort(([a], [b]) => a.localeCompare(b)))
    const signText = Object.entries(signedFields).map(([key, value]) => `${key}=${value}`).join('&') + `&key=${env.OKEXPAY_KEY}`
    const expected = md5(signText)
    if (expected !== signature) return new Response('fail', { status: 400 })

    const deposit = await env.DB.prepare("SELECT user_id, amount, status FROM deposits WHERE out_trade_no=?").bind(order).first<{ user_id: string; amount: number; status: string }>()
    if (!deposit) return new Response('fail', { status: 404 })
    if (deposit.status === 'paid') return new Response('success')
    const paid = ['1', 'success', 'SUCCESS', 'paid', 'PAID'].includes(data.status || data.trade_status || '')
    if (!paid || !Number.isFinite(amount) || Math.round(amount * 100) !== deposit.amount) {
      if (!paid) await env.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'").bind(order).run()
      return new Response('fail', { status: 400 })
    }
    const now = Date.now()
    const result = await env.DB.batch([
      env.DB.prepare("UPDATE deposits SET status='paid', paid_at=? WHERE out_trade_no=? AND status='pending'").bind(now, order),
      env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=? AND changes() > 0').bind(deposit.amount, deposit.user_id),
      env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'ওয়ালেটে টাকা জমা',? WHERE changes() > 0").bind(crypto.randomUUID(), deposit.user_id, deposit.amount, now),
    ])
    return result[0].meta.changes ? new Response('success') : new Response('success')
  } catch (error) {
    console.error('Deposit webhook error:', error)
    return new Response('fail', { status: 500 })
  }
}
```

### `functions/api/deposits/status.ts`

```ts
import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export async function onRequestGet({ request, env }: EventContext<Env, any, any>) {
  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\\s*)session=([^;]+)/)?.[1]
  if (!sessionId) return Response.json({ error: 'অনুমোদিত নয়' }, { status: 401 })
  const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sessionId, Date.now()).first<{ user_id: string }>()
  if (!session) return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, { status: 401 })
  const order = new URL(request.url).searchParams.get('order')
  if (!order) return Response.json({ error: 'অর্ডার নম্বর নেই' }, { status: 400 })
  const deposit = await env.DB.prepare('SELECT status FROM deposits WHERE out_trade_no=? AND user_id=?').bind(order, session.user_id).first<{ status: string }>()
  return deposit ? Response.json({ status: deposit.status }) : Response.json({ error: 'অর্ডার পাওয়া যায়নি' }, { status: 404 })
}
```

### `functions/lib/md5.ts`

```ts
const shifts = [7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21]
const constants = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0)

export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const length = bytes.length
  const paddedLength = Math.ceil((length + 9) / 64) * 64
  const data = new Uint8Array(paddedLength)
  data.set(bytes)
  data[length] = 0x80
  const view = new DataView(data.buffer)
  view.setUint32(paddedLength - 8, (length * 8) >>> 0, true)
  view.setUint32(paddedLength - 4, Math.floor(length / 0x20000000), true)
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476
  for (let offset = 0; offset < paddedLength; offset += 64) {
    let a = a0, b = b0, c = c0, d = d0
    for (let i = 0; i < 64; i++) {
      let f: number, g: number, shift: number
      if (i < 16) { f = (b & c) | (~b & d); g = i; shift = shifts[i % 4] }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; shift = shifts[4 + i % 4] }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; shift = shifts[8 + i % 4] }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; shift = shifts[12 + i % 4] }
      const word = view.getUint32(offset + g * 4, true)
      const sum = (a + f + constants[i] + word) >>> 0
      const rotated = (sum << shift) | (sum >>> (32 - shift))
      ;[a, d, c, b] = [d, c, b, (b + rotated) >>> 0]
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0
  }
  return [a0, b0, c0, d0].map(n => [0,1,2,3].map(i => ((n >>> (i * 8)) & 255).toString(16).padStart(2, '0')).join('')).join('')
}
```

### `migrations/008_deposits.sql`

```sql
CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  out_trade_no TEXT NOT NULL UNIQUE,
  gateway_transaction_id TEXT,
  method TEXT NOT NULL CHECK (method IN ('BKASH', 'NAGAD')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at INTEGER NOT NULL,
  paid_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_deposits_user_created ON deposits(user_id, created_at DESC);
```

## Unresolved gateway assumptions

- MD5 signature format is guessed as sorted non-empty `key=value` pairs plus `&key=<secret>`.
- Callback field names/status values/signature verification are guessed; docs supplied so far don’t define them.
- The gateway sample’s returned cashier URL points to `sandbox.wpay.one`, while real responses observed use `sandbox.okexpay.dev`; both have failed (522/404).
- Do not enable live money or rely on this callback until gateway supplies canonical signing and callback specifications and sandbox checkout works.
