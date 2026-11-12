import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database; PAYMENT_API_URL?: string; PAYMENT_API_SECRET?: string }
const PAYMENT_API_URL = 'https://imcagro.top'
const PAYMENT_API_SECRET = '9gX3wQa8Fn5rjR5uCeMVLV7uXuvN7POuJXWcEucF0gY='

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
    const base = (env.PAYMENT_API_URL || PAYMENT_API_URL).replace(/\/$/, '')
    const endpoint = `${base}/api/create-payment`
    const returnUrl = `${new URL('/deposit', request.url).toString()}?order=${encodeURIComponent(outTradeNo)}`
    await env.DB.prepare(
      "INSERT INTO deposits (id,user_id,out_trade_no,method,amount,status,created_at) VALUES (?,?,?,?,?,'pending',?)"
    ).bind(depositId, session.user_id, outTradeNo, body.method, body.amount, Date.now()).run()

    const markFailed = () => env.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'")
      .bind(outTradeNo).run()

    let result: { success?: boolean; paymentUrl?: string; transactionId?: string; message?: string; error?: string }
    try {
      const gatewayResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Proxy-Secret': PAYMENT_API_SECRET },
        body: JSON.stringify({ amount: Math.round(body.amount! / 100), orderId: outTradeNo, payType: body.method, attach: depositId, returnUrl }),
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
      const host = paymentUrl.hostname.toLowerCase()
      if (paymentUrl.protocol !== 'https:' || !['wpay.life', 'wpay.one', 'okexpay.dev'].some((domain) => host === domain || host.endsWith(`.${domain}`))) {
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
