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
