## `app/deposit/page.tsx`

```tsx
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
  const { showToast, changePage, balance } = useAppState()
  const [method, setMethod] = useState<DepositMethod>("BKASH")
  const [amount, setAmount] = useState(300)
  const [busy, setBusy] = useState(false)

  const toastRef = useRef(showToast)
  toastRef.current = showToast

  const selected = depositMethods.find((item) => item.id === method) ?? depositMethods[0]

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
          {[300, 500, 1000, 2500].map((preset) => (
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
              <b>৳ ৩০০.০০</b>
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
```

## `functions/api/deposits/create.ts`

```ts
import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database; PAYMENT_API_URL?: string }
const PAYMENT_API_URL = 'https://imcagro.top'

const json = (body: unknown, status = 200) => Response.json(body, { status })

const makeOutTradeNo = () => {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0] % 10000
  return `${Date.now()}${String(rand).padStart(4, '0')}`
}

export async function onRequestPost({ request, env }: EventContext<Env, any, any>) {
  try {
    const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    if (!sessionId) return json({ error: 'অনুমোদিত নয়' }, 401)
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?').bind(sessionId, Date.now()).first<{ user_id: string }>()
    if (!session) return json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, 401)

    const body = await request.json() as { amount?: number; method?: string }
    if (
      !Number.isSafeInteger(body.amount) ||
      (body.amount ?? 0) < 30_000 ||
      (body.amount as number) % 100 !== 0 ||
      !['BKASH', 'NAGAD', 'ROCKET', 'BKASH-C', 'NAGAD-C'].includes(body.method ?? '')
    ) return json({ error: 'সঠিক পেমেন্ট পদ্ধতি ও ন্যূনতম ৳৩০০ পরিমাণ দিন' }, 400)

    const depositId = crypto.randomUUID()
    const outTradeNo = makeOutTradeNo()
    await env.DB.prepare(
      "INSERT INTO deposits (id,user_id,out_trade_no,method,amount,status,created_at) VALUES (?,?,?,?,?,'pending',?)"
    ).bind(depositId, session.user_id, outTradeNo, body.method!.startsWith('NAGAD') ? 'NAGAD' : 'BKASH', body.amount, Date.now()).run()

    const markFailed = () => env.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'")
      .bind(outTradeNo).run()

    let result: { success?: boolean; paymentUrl?: string; transactionId?: string; message?: string; error?: string }
    try {
      const gatewayResponse = await fetch(`${(env.PAYMENT_API_URL || PAYMENT_API_URL).replace(/\/$/, '')}/api/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(body.amount! / 100), orderId: outTradeNo, payType: body.method, attach: depositId, returnUrl: `${new URL('/deposit', request.url).toString()}?order=${encodeURIComponent(outTradeNo)}` }),
      })
      const raw = await gatewayResponse.text()
      try {
        result = JSON.parse(raw) as typeof result
      } catch {
        throw new Error(`Payment API HTTP ${gatewayResponse.status}; non-JSON response: ${raw.replace(/\s+/g, ' ').slice(0, 500) || '(empty)'}`)
      }
      if (!gatewayResponse.ok) throw new Error(`Payment API HTTP ${gatewayResponse.status}: ${result.error || result.message || JSON.stringify(result).slice(0, 500)}`)
    } catch (err) {
      console.error('Gateway request/parse failed:', err)
      await markFailed()
      return json({ error: err instanceof Error ? err.message : String(err) }, 502)
    }

    if (!result.success || !result.paymentUrl) {
      await markFailed()
      return json({ error: `Payment API rejected order: ${result.error || result.message || JSON.stringify(result).slice(0, 500)}` }, 502)
    }

    let paymentUrl: URL
    try {
      paymentUrl = new URL(result.paymentUrl)
    } catch {
      await markFailed()
      return json({ error: 'গেটওয়ের পেমেন্ট URL গ্রহণযোগ্য নয়' }, 502)
    }
    if (paymentUrl.protocol !== 'https:') {
      await markFailed()
      return json({ error: 'গেটওয়ের পেমেন্ট URL গ্রহণযোগ্য নয়' }, 502)
    }

    await env.DB.prepare('UPDATE deposits SET gateway_transaction_id=? WHERE out_trade_no=?').bind(result.transactionId || null, outTradeNo).run()
    return json({ success: true, paymentUrl: paymentUrl.toString() })
  } catch (error) {
    console.error('Create deposit error:', error)
    return json({ error: 'সার্ভার সমস্যা হয়েছে' }, 500)
  }
}
```

## `functions/api/deposits/status.ts`

```ts
import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export async function onRequestGet({ request, env }: EventContext<Env, any, any>) {
  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sessionId) return Response.json({ error: 'অনুমোদিত নয়' }, { status: 401 })
  const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sessionId, Date.now()).first<{ user_id: string }>()
  if (!session) return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, { status: 401 })
  const order = new URL(request.url).searchParams.get('order')
  if (!order) return Response.json({ error: 'অর্ডার নম্বর নেই' }, { status: 400 })
  const deposit = await env.DB.prepare('SELECT status FROM deposits WHERE out_trade_no=? AND user_id=?').bind(order, session.user_id).first<{ status: string }>()
  return deposit ? Response.json({ status: deposit.status }) : Response.json({ error: 'অর্ডার পাওয়া যায়নি' }, { status: 404 })
}
```

## `functions/api/deposits/webhook.ts`

```ts
import type { EventContext } from '@cloudflare/workers-types'
import { md5 } from '../../lib/md5'

type Env = { DB: D1Database; OKEXPAY_MCH_ID?: string; OKEXPAY_KEY?: string }

// GUESSED status values. Confirm against real sandbox callbacks.
const PAID_STATUSES = ['1', 'success', 'SUCCESS', 'paid', 'PAID']
const FAILED_STATUSES = ['2', 'fail', 'FAIL', 'failed', 'FAILED']
const byCodeUnit = ([a]: [string, string], [b]: [string, string]) => (a < b ? -1 : a > b ? 1 : 0)

export async function onRequestPost({ request, env }: EventContext<Env, any, any>) {
  try {
    if (!env.OKEXPAY_KEY) return new Response('fail', { status: 400 })

    const contentType = request.headers.get('content-type') || ''
    let data: Record<string, string>
    if (contentType.includes('json')) {
      const raw = await request.json() as Record<string, unknown>
      data = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v == null ? '' : String(v)]))
    } else {
      data = Object.fromEntries((await request.formData()).entries()) as Record<string, string>
    }

    // Temporary: inspect real callbacks to confirm field names and status values.
    console.log('Deposit webhook payload:', contentType, JSON.stringify(data))

    const order = data.out_trade_no
    const signature = (data.sign || data.Sign || '').toLowerCase()
    const amount = Number(data.money)
    if (!order || !signature) return new Response('fail', { status: 400 })

    const expectedMch = env.OKEXPAY_MCH_ID || '5393'
    if (data.mchId && data.mchId !== expectedMch) return new Response('fail', { status: 400 })

    const signedFields = Object.fromEntries(Object.entries(data)
      .filter(([key, value]) => key !== 'sign' && key !== 'Sign' && value !== '')
      .sort(byCodeUnit))
    const signText = Object.entries(signedFields).map(([k, v]) => `${k}=${v}`).join('&') + `&key=${env.OKEXPAY_KEY}`
    if (md5(signText) !== signature) return new Response('fail', { status: 400 })

    const deposit = await env.DB.prepare('SELECT user_id, amount, status FROM deposits WHERE out_trade_no=?')
      .bind(order).first<{ user_id: string; amount: number; status: string }>()
    if (!deposit) return new Response('fail', { status: 404 })
    if (deposit.status === 'paid') return new Response('success')

    const status = String(data.status || data.trade_status || '').trim().toLowerCase()
    if (FAILED_STATUSES.includes(status)) {
      await env.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'").bind(order).run()
      return new Response('success')
    }
    if (!PAID_STATUSES.includes(status)) return new Response('fail', { status: 400 })
    if (!Number.isFinite(amount) || Math.round(amount * 100) !== deposit.amount) {
      console.error('Deposit amount mismatch', { order, got: data.money, expected: deposit.amount })
      return new Response('fail', { status: 400 })
    }

    const now = Date.now()
    await env.DB.batch([
      env.DB.prepare("UPDATE deposits SET status='paid', paid_at=? WHERE out_trade_no=? AND status='pending'").bind(now, order),
      env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=? AND changes() > 0').bind(deposit.amount, deposit.user_id),
      env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'ওয়ালেটে টাকা জমা',? WHERE changes() > 0")
        .bind(crypto.randomUUID(), deposit.user_id, deposit.amount, now),
    ])
    return new Response('success')
  } catch (error) {
    console.error('Deposit webhook error:', error)
    return new Response('fail', { status: 500 })
  }
}
```

## `functions/api/notify.ts`

```ts
export { onRequestPost } from './deposits/webhook'
```

## `functions/lib/md5.ts`

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

## `migrations/008_deposits.sql`

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
