import type { EventContext } from '@cloudflare/workers-types'
import { md5 } from '../../lib/md5'

type Env = { DB: D1Database; OKEXPAY_MCH_ID?: string; OKEXPAY_KEY?: string; OKEXPAY_HOST?: string }

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
      (body.amount ?? 0) < 10_000 ||
      (body.amount as number) % 100 !== 0 ||
      !['BKASH', 'NAGAD'].includes(body.method ?? '')
    ) return json({ error: 'সঠিক পেমেন্ট পদ্ধতি ও ন্যূনতম ৳১০০ পরিমাণ দিন' }, 400)
    if (!env.OKEXPAY_KEY) return json({ error: 'পেমেন্ট গেটওয়ে কনফিগার করা নেই' }, 503)

    const depositId = crypto.randomUUID()
    const outTradeNo = makeOutTradeNo()
    const mchId = env.OKEXPAY_MCH_ID || '1000'
    const host = (env.OKEXPAY_HOST || 'https://sandbox.okexpay.dev').replace(/\/$/, '')
    const fields: Record<string, string> = {
      mchId,
      currency: 'BDT',
      out_trade_no: outTradeNo,
      pay_type: body.method!,
      money: String(Math.round(body.amount! / 100)),
      attach: depositId,
      notify_url: new URL('/api/notify', request.url).toString(),
      returnUrl: `${new URL('/deposit', request.url).toString()}?order=${encodeURIComponent(outTradeNo)}`,
    }
    // Assumption: sorted (ASCII) non-empty fields + &key=<secret>, lowercase hex MD5.
    const signText = Object.keys(fields).sort().filter(key => fields[key] !== '').map(key => `${key}=${fields[key]}`).join('&') + `&key=${env.OKEXPAY_KEY}`
    fields.sign = md5(signText)

    await env.DB.prepare(
      "INSERT INTO deposits (id,user_id,out_trade_no,method,amount,status,created_at) VALUES (?,?,?,?,?,'pending',?)"
    ).bind(depositId, session.user_id, outTradeNo, body.method, body.amount, Date.now()).run()

    const markFailed = () => env.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'")
      .bind(outTradeNo).run()

    let gatewayOk = false
    let result: { code?: number; msg?: string; data?: { url?: string; transaction_Id?: string } } = {}
    try {
      const gatewayResponse = await fetch(`${host}/v1/Collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fields),
      })
      gatewayOk = gatewayResponse.ok
      result = await gatewayResponse.json() as typeof result
    } catch (err) {
      console.error('Gateway request/parse failed:', err)
      await markFailed()
      return json({ error: 'পেমেন্ট গেটওয়ে সাড়া দিচ্ছে না' }, 502)
    }

    if (!gatewayOk || result.code !== 0 || !result.data?.url) {
      await markFailed()
      return json({ error: result.msg || 'পেমেন্ট অর্ডার তৈরি ব্যর্থ' }, 502)
    }

    let paymentUrl: URL
    try {
      paymentUrl = new URL(result.data.url)
    } catch {
      await markFailed()
      return json({ error: 'গেটওয়ের পেমেন্ট URL গ্রহণযোগ্য নয়' }, 502)
    }
    if (paymentUrl.protocol !== 'https:' || ![new URL(host).hostname, 'sandbox.wpay.one'].includes(paymentUrl.hostname)) {
      await markFailed()
      return json({ error: 'গেটওয়ের পেমেন্ট URL গ্রহণযোগ্য নয়' }, 502)
    }

    await env.DB.prepare('UPDATE deposits SET gateway_transaction_id=? WHERE out_trade_no=?').bind(result.data.transaction_Id || null, outTradeNo).run()
    return json({ success: true, paymentUrl: paymentUrl.toString() })
  } catch (error) {
    console.error('Create deposit error:', error)
    return json({ error: 'সার্ভার সমস্যা হয়েছে' }, 500)
  }
}
