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
