import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database; PAYMENT_API_URL?: string }
const PAYMENT_API_URL = 'https://imcagro.top'

const json = (body: unknown, status = 200) => Response.json(body, { status })

const makeOutTradeNo = () => {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0] % 10000
  return `${Date.now()}${String(rand).padStart(4, '0')}`
}

export async function onRequestGet({ env }: EventContext<Env, any, any>) {
  const settings = await env.DB.prepare('SELECT minimum_amount FROM deposit_settings WHERE id=1').first<{ minimum_amount: number }>()
  return json({ minimumAmount: settings?.minimum_amount ?? 300 })
}

export async function onRequestPost({ request, env }: EventContext<Env, any, any>) {
  try {
    const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    if (!sessionId) return json({ error: 'অনুমোদিত নয়' }, 401)
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?').bind(sessionId, Date.now()).first<{ user_id: string }>()
    if (!session) return json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, 401)

    const body = await request.json() as { amount?: number; method?: string }
    const settings = await env.DB.prepare('SELECT minimum_amount FROM deposit_settings WHERE id=1').first<{ minimum_amount: number }>()
    const minimumAmount = (settings?.minimum_amount ?? 300) * 100
    if (
      !Number.isSafeInteger(body.amount) ||
      (body.amount ?? 0) < minimumAmount ||
      (body.amount as number) % 100 !== 0 ||
      !['BKASH', 'NAGAD', 'ROCKET', 'BKASH-C', 'NAGAD-C'].includes(body.method ?? '')
    ) return json({ error: `সঠিক পেমেন্ট পদ্ধতি ও ন্যূনতম ৳${settings?.minimum_amount ?? 300} পরিমাণ দিন` }, 400)

    const depositId = crypto.randomUUID()
    const outTradeNo = makeOutTradeNo()
    await env.DB.prepare(
      "INSERT INTO deposits (id,user_id,out_trade_no,method,amount,status,created_at) VALUES (?,?,?,?,?,'pending',?)"
    ).bind(depositId, session.user_id, outTradeNo, body.method!.startsWith('NAGAD') ? 'NAGAD' : 'BKASH', body.amount, Date.now()).run()
    await env.DB.prepare("INSERT INTO deposit_events (id,deposit_id,event,new_status,note,created_at) VALUES (?,?, 'created','pending','Deposit request created',?)")
      .bind(crypto.randomUUID(), depositId, Date.now()).run()

    const markFailed = async (note: string) => {
      const now = Date.now()
      await env.DB.batch([
        env.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'").bind(outTradeNo),
        env.DB.prepare("INSERT INTO deposit_events (id,deposit_id,event,previous_status,new_status,note,created_at) SELECT ?,?,'failed','pending','failed',?,? WHERE changes()>0").bind(crypto.randomUUID(), depositId, note, now),
      ])
    }

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
      await markFailed('Payment gateway request failed')
      return json({ error: err instanceof Error ? err.message : String(err) }, 502)
    }

    if (!result.success || !result.paymentUrl) {
      await markFailed('Payment gateway rejected request')
      return json({ error: `Payment API rejected order: ${result.error || result.message || JSON.stringify(result).slice(0, 500)}` }, 502)
    }

    let paymentUrl: URL
    try {
      paymentUrl = new URL(result.paymentUrl)
    } catch {
      await markFailed('Gateway returned invalid payment URL')
      return json({ error: 'গেটওয়ের পেমেন্ট URL গ্রহণযোগ্য নয়' }, 502)
    }
    if (paymentUrl.protocol !== 'https:') {
      await markFailed('Gateway returned insecure payment URL')
      return json({ error: 'গেটওয়ের পেমেন্ট URL গ্রহণযোগ্য নয়' }, 502)
    }

    await env.DB.prepare('UPDATE deposits SET gateway_transaction_id=? WHERE out_trade_no=?').bind(result.transactionId || null, outTradeNo).run()
    return json({ success: true, paymentUrl: paymentUrl.toString() })
  } catch (error) {
    console.error('Create deposit error:', error)
    return json({ error: 'সার্ভার সমস্যা হয়েছে' }, 500)
  }
}
