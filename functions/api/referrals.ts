import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export async function onRequestGet({ request, env }: EventContext<Env, any, any>) {
  const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!token) return Response.json({ error: 'অনুমোদিত নয়' }, { status: 401 })

  try {
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?').bind(token, Date.now()).first<{ user_id: string }>()
    if (!session) return Response.json({ error: 'সেশনের মেয়াদ শেষ' }, { status: 401 })
    const configRow = await env.DB.prepare('SELECT config_json FROM referral_settings WHERE id=1').first<{config_json:string}>()
    const config = configRow ? JSON.parse(configRow.config_json) : null
    const activeWhen = config?.general?.activeWhen ?? 'min_vip'
    const activeTest = activeWhen === 'any_package'
      ? "EXISTS(SELECT 1 FROM user_packages p WHERE p.user_id=tree.id)"
      : activeWhen === 'min_deposit'
        ? "COALESCE((SELECT SUM(price_paid) FROM user_packages p WHERE p.user_id=tree.id),0)>=?"
        : 'COALESCE((SELECT vip_level FROM users WHERE id=tree.id),0)>=?'
    const activeBind = activeWhen === 'min_deposit'
      ? [config?.general?.activeMinDeposit ?? 500]
      : activeWhen === 'min_vip' ? [config?.general?.activeMinVip ?? 1] : []
    const [user, members, earnings] = await Promise.all([
      env.DB.prepare('SELECT referral_code FROM users WHERE id = ?').bind(session.user_id).first<{ referral_code: string | null }>(),
      env.DB.prepare(`WITH RECURSIVE tree(id,depth) AS (SELECT id,1 FROM users WHERE referred_by=? UNION ALL SELECT u.id,t.depth+1 FROM users u JOIN tree t ON u.referred_by=t.id WHERE t.depth<3) SELECT COUNT(*) members,SUM(CASE WHEN ${activeTest} THEN 1 ELSE 0 END) active FROM tree`).bind(session.user_id,...activeBind).first<{ members: number; active: number }>(),
      env.DB.prepare('SELECT team_received, team_dividend FROM user_stats WHERE user_id = ?').bind(session.user_id).first<{ team_received: number; team_dividend: number }>(),
    ])
    if (!user?.referral_code) return Response.json({ error: 'রেফারেল কোড পাওয়া যায়নি' }, { status: 404 })
    return Response.json({ referralCode: user.referral_code, members: members?.members ?? 0, active: members?.active ?? 0, depositBonus: earnings?.team_received ?? 0, profitCommission: earnings?.team_dividend ?? 0, rates: config?.commissions?.levels ?? [] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Referral fetch error:', error)
    return Response.json({ error: 'সার্ভার সমস্যা হয়েছে' }, { status: 500 })
  }
}
