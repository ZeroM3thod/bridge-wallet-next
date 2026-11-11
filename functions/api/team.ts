import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

async function sessionUser(request: Request, DB: D1Database) {
  const sid = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sid) return null
  return DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sid, Date.now()).first<{ user_id: string }>()
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const session = await sessionUser(request, env.DB)
  if (!session) return json({ error: 'Unauthorized' }, 401)
  try {
    const configRow = await env.DB.prepare('SELECT config_json FROM referral_settings WHERE id=1').first<{ config_json: string }>()
    const config = configRow ? JSON.parse(configRow.config_json) : null
    const activeWhen = config?.general?.activeWhen ?? 'min_vip'
    const activeVip = Number(config?.general?.activeMinVip ?? 1)
    const activeDeposit = Number(config?.general?.activeMinDeposit ?? 500)
    const isActive = activeWhen === 'any_package'
      ? "EXISTS(SELECT 1 FROM user_packages p WHERE p.user_id=u.id)"
      : activeWhen === 'min_deposit'
        ? "COALESCE((SELECT SUM(price_paid) FROM user_packages p WHERE p.user_id=u.id),0)>=?"
        : 'COALESCE(u.vip_level,0)>=?'
    if (request.method === 'GET') {
      const [members, earnings, user, requests] = await Promise.all([
        env.DB.prepare(`WITH RECURSIVE tree(id,depth) AS (
          SELECT id,1 FROM users WHERE referred_by=?
          UNION ALL SELECT u.id,t.depth+1 FROM users u JOIN tree t ON u.referred_by=t.id WHERE t.depth<3
        ) SELECT t.depth AS level,u.id,u.name,u.phone,u.created_at AS joinedAt,u.balance,u.vip_level AS vipLevel,
          CASE WHEN ${isActive} THEN 1 ELSE 0 END AS active,
          COALESCE((SELECT SUM(price_paid) FROM user_packages p WHERE p.user_id=u.id),0) AS deposit,
          COALESCE((SELECT SUM(amount) FROM daily_profits p WHERE p.user_id=u.id),0) AS profit
          FROM tree t JOIN users u ON u.id=t.id ORDER BY t.depth,u.created_at DESC`).bind(...(activeWhen==='min_deposit'?[session.user_id,activeDeposit]:activeWhen==='min_vip'?[session.user_id,activeVip]:[session.user_id])).all(),
        env.DB.prepare('SELECT team_received,team_dividend FROM user_stats WHERE user_id=?').bind(session.user_id).first(),
        env.DB.prepare('SELECT referral_code FROM users WHERE id=?').bind(session.user_id).first(),
        env.DB.prepare('SELECT tier_id AS tierId,amount,status,cycle_key AS cycleKey,created_at AS createdAt FROM salary_requests WHERE user_id=? ORDER BY created_at DESC').bind(session.user_id).all(),
      ])
      const list = members.results ?? []
      return json({ config, referralCode: (user as any)?.referral_code, members: list, counts: [1,2,3].map(level => list.filter((m: any) => m.level===level && m.active).length), earnings, requests: requests.results })
    }
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
    if (!config?.general?.enabled || !config?.salary?.enabled) return json({ error: 'Salary unavailable' }, 400)
    const body = await request.json() as { tierId?: string }
    const tier = config.salary.tiers.find((t: any) => t.id === body.tierId && t.enabled)
    if (!tier) return json({ error: 'Invalid salary tier' }, 400)
    const countActive = activeWhen === 'any_package'
      ? 'EXISTS(SELECT 1 FROM user_packages p WHERE p.user_id=u.id)'
      : activeWhen === 'min_deposit'
        ? 'COALESCE((SELECT SUM(price_paid) FROM user_packages p WHERE p.user_id=u.id),0)>=?'
        : 'COALESCE(u.vip_level,0)>=?'
    const countBind = activeWhen === 'min_deposit' ? [session.user_id,activeDeposit] : activeWhen === 'min_vip' ? [session.user_id,activeVip] : [session.user_id]
    const counts = await env.DB.prepare(`WITH RECURSIVE tree(id,depth) AS (
      SELECT id,1 FROM users WHERE referred_by=? UNION ALL SELECT u.id,t.depth+1 FROM users u JOIN tree t ON u.referred_by=t.id WHERE t.depth<3
    ) SELECT t.depth AS level,COUNT(*) AS n FROM tree t JOIN users u ON u.id=t.id WHERE ${countActive} GROUP BY t.depth`).bind(...countBind).all<{level:number;n:number}>()
    const team = [1,2,3].map(level => counts.results?.find(x=>x.level===level)?.n ?? 0)
    if (team[0]<tier.reqL1 || team[1]<tier.reqL2 || team[2]<tier.reqL3) return json({ error: 'Salary requirements not met' }, 400)
    const now=Date.now(), cycle=config.salary.cycle==='weekly' ? `w${Math.floor(now/604800000)}` : new Date(now).toISOString().slice(0,7)
    const existing=await env.DB.prepare("SELECT id FROM salary_requests WHERE user_id=? AND cycle_key=? AND status IN ('pending','approved')").bind(session.user_id,cycle).first()
    if(existing) return json({error:'One salary tier per cycle'},409)
    const id=crypto.randomUUID()
    await env.DB.prepare('INSERT INTO salary_requests (id,user_id,tier_id,amount,cycle_key,team_l1,team_l2,team_l3,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,session.user_id,tier.id,tier.amount,cycle,...team,config.salary.needsApproval?'pending':'approved',now).run()
    if (!config.salary.needsApproval) await env.DB.batch([
      env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=?').bind(tier.amount,session.user_id),
      env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) VALUES (?,?,'credit',?,'Team salary',?)").bind(crypto.randomUUID(),session.user_id,tier.amount,now),
    ])
    return json({success:true,id,status:config.salary.needsApproval?'pending':'approved'})
  } catch(error) { console.error('Team API:',error); return json({error:'Team data unavailable'},500) }
}
