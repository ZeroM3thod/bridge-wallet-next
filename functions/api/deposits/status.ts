import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export async function onRequestGet({ request, env }: EventContext<Env, any, any>) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
  try {
    const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    if (!sessionId) return json({ error: 'অনুমোদিত নয়' }, 401)
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sessionId, Date.now()).first<{ user_id: string }>()
    if (!session) return json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, 401)
    const order = new URL(request.url).searchParams.get('order')
    if (!order) return json({ error: 'অর্ডার নম্বর নেই' }, 400)
    const deposit = await env.DB.prepare('SELECT status FROM deposits WHERE out_trade_no=? AND user_id=?').bind(order, session.user_id).first<{ status: string }>()
    return deposit ? json({ status: deposit.status }) : json({ error: 'অর্ডার পাওয়া যায়নি' }, 404)
  } catch (error) {
    console.error('Deposit status lookup failed:', error)
    return json({ error: 'সার্ভার সমস্যা হয়েছে' }, 500)
  }
}
