import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export async function onRequestGet({ request, env }: EventContext<Env, any, any>) {
  const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!token) return Response.json({ error: 'অনুমোদিত নয়' }, { status: 401 })

  try {
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?').bind(token, Date.now()).first<{ user_id: string }>()
    if (!session) return Response.json({ error: 'সেশনের মেয়াদ শেষ' }, { status: 401 })
    const [user, totals, earnings] = await Promise.all([
      env.DB.prepare('SELECT referral_code FROM users WHERE id = ?').bind(session.user_id).first<{ referral_code: string | null }>(),
      env.DB.prepare("SELECT COUNT(*) AS members, COALESCE(SUM(CASE WHEN EXISTS (SELECT 1 FROM user_packages p WHERE p.user_id = users.id AND p.status = 'active') THEN 1 ELSE 0 END), 0) AS active FROM users WHERE referred_by = ?").bind(session.user_id).first<{ members: number; active: number }>(),
      env.DB.prepare('SELECT team_received, team_dividend FROM user_stats WHERE user_id = ?').bind(session.user_id).first<{ team_received: number; team_dividend: number }>(),
    ])
    if (!user?.referral_code) return Response.json({ error: 'রেফারেল কোড পাওয়া যায়নি' }, { status: 404 })
    return Response.json({ referralCode: user.referral_code, members: totals?.members ?? 0, active: totals?.active ?? 0, depositBonus: earnings?.team_received ?? 0, profitCommission: earnings?.team_dividend ?? 0 })
  } catch (error) {
    console.error('Referral fetch error:', error)
    return Response.json({ error: 'সার্ভার সমস্যা হয়েছে' }, { status: 500 })
  }
}
