import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export async function onRequestGet({ request, env }: EventContext<Env, any, any>) {
  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sessionId) return Response.json({ error: 'অনুমোদিত নয়' }, { status: 401 })

  try {
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first<{ user_id: string }>()
    if (!session) return Response.json({ error: 'সেশনের মেয়াদ শেষ' }, { status: 401 })

    const user = await env.DB.prepare(
      'SELECT name, email, phone, balance, vip_level, gender, uid FROM users WHERE id = ?'
    ).bind(session.user_id).first<{
      name: string; email: string; phone: string; balance: number;
      vip_level: number; gender: string | null; uid: string | null
    }>()
    if (!user) return Response.json({ error: 'ব্যবহারকারী পাওয়া যায়নি' }, { status: 404 })

    const stats = await env.DB.prepare(
      'SELECT work_earnings, team_received, team_dividend, today_earnings, total_deposit, total_withdraw FROM user_stats WHERE user_id = ?'
    ).bind(session.user_id).first() ?? {
      work_earnings: 0, team_received: 0, team_dividend: 0,
      today_earnings: 0, total_deposit: 0, total_withdraw: 0,
    }

    return Response.json({ success: true, user, stats })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return Response.json({ error: 'সার্ভার সমস্যা হয়েছে' }, { status: 500 })
  }
}
