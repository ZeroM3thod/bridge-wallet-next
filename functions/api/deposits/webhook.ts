import type { EventContext } from '@cloudflare/workers-types'
import { md5 } from '../../lib/md5'

type Env = { DB: D1Database; OKEXPAY_KEY?: string }

export async function onRequestPost({ request, env }: EventContext<Env, any, any>) {
  try {
    // Verify sender IP allowlist from gateway document before production; sandbox callback spec lacks a signature format.
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
