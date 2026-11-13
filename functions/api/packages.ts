import type { PagesFunction } from '@cloudflare/workers-types'
import { INITIAL_PACKAGES } from '../../lib/initial-packages'

type Env = { DB: D1Database }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const now = Date.now()
    await env.DB.batch(INITIAL_PACKAGES.flatMap(p => [
      env.DB.prepare('INSERT OR IGNORE INTO packages (id,name,short_description,model_no,tank_overview,profit_mechanism,price,daily_rate,duration_days,max_per_user,stock_limit,min_active_referrals,requires_package_id,allow_while_active,visible,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.id,p.name,p.shortDescription,p.modelNo,p.tankOverview,p.profitMechanism,p.price,p.dailyRate,p.durationDays,p.maxPerUser,p.stockLimit,p.minActiveReferrals,p.requiresPackageId,+p.allowWhileActive,+p.visible,now,now),
      env.DB.prepare("UPDATE packages SET short_description=?,model_no=?,tank_overview=?,profit_mechanism=?,updated_at=? WHERE id=? AND short_description=''").bind(p.shortDescription,p.modelNo,p.tankOverview,p.profitMechanism,now,p.id),
    ]))
    try {
      const result = await env.DB.prepare("SELECT id,name,short_description AS shortDescription,model_no AS modelNo,tank_overview AS tankOverview,profit_mechanism AS profitMechanism,price,daily_profit AS dailyProfit,duration_days AS durationDays,max_per_user AS maxPerUser,stock_limit AS stockLimit,min_active_referrals AS minActiveReferrals,requires_package_id AS requiresPackageId,allow_while_active AS allowWhileActive,visible,CASE WHEN image_key='' THEN '' ELSE '/api/package-images/'||id||'?v='||updated_at END AS imageUrl FROM packages WHERE visible = 1 ORDER BY price").all<any>()
      const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
      const session = sessionId ? await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sessionId, now).first<{user_id:string}>() : null
      if (!session) return json({ packages: result.results.map(p => ({ ...p, eligible: false, eligibilityMessage: 'প্যাকেজ কিনতে লগইন করুন' })) })
      const [balance, referrals, active] = await Promise.all([
        env.DB.prepare('SELECT balance FROM users WHERE id=?').bind(session.user_id).first<{balance:number}>(),
        env.DB.prepare("SELECT COUNT(*) AS n FROM users u WHERE u.referred_by=? AND EXISTS (SELECT 1 FROM user_packages up WHERE up.user_id=u.id AND up.status='active' AND up.expires_at>?)").bind(session.user_id, now).first<{n:number}>(),
        env.DB.prepare("SELECT 1 AS yes FROM user_packages WHERE user_id=? AND status='active' AND expires_at>? LIMIT 1").bind(session.user_id, now).first(),
      ])
      const packages = await Promise.all(result.results.map(async p => {
        const [bought, stock] = await Promise.all([
          env.DB.prepare('SELECT COUNT(*) AS n FROM user_packages WHERE user_id=? AND package_id=?').bind(session.user_id,p.id).first<{n:number}>(),
          env.DB.prepare('SELECT COUNT(*) AS n FROM user_packages WHERE package_id=?').bind(p.id).first<{n:number}>(),
        ])
        let eligibilityMessage = ''
        if (balance && balance.balance < p.price) eligibilityMessage = 'পর্যাপ্ত ব্যালেন্স নেই'
        else if (p.maxPerUser && (bought?.n ?? 0) >= p.maxPerUser) eligibilityMessage = 'ক্রয়ের সীমা পূর্ণ'
        else if (p.stockLimit && (stock?.n ?? 0) >= p.stockLimit) eligibilityMessage = 'প্যাকেজের স্টক শেষ'
        else if ((referrals?.n ?? 0) < p.minActiveReferrals) eligibilityMessage = `সক্রিয় রেফারেল কম। প্রয়োজন: ${p.minActiveReferrals}`
        else if (p.requiresPackageId && !await env.DB.prepare('SELECT 1 AS yes FROM user_packages WHERE user_id=? AND package_id=? LIMIT 1').bind(session.user_id,p.requiresPackageId).first()) eligibilityMessage = 'আগের প্রয়োজনীয় প্যাকেজটি আগে কিনুন'
        else if (!p.allowWhileActive && active) eligibilityMessage = 'চলমান প্যাকেজ শেষ হলে আবার কিনতে পারবেন'
        return { ...p, stockSold: stock?.n ?? 0, userPurchaseCount: bought?.n ?? 0, eligible: !eligibilityMessage, eligibilityMessage }
      }))
      return json({ packages })
    } catch {
      const result = await env.DB.prepare('SELECT id,name,price,300 AS dailyProfit,duration_days AS durationDays,max_per_user AS maxPerUser,stock_limit AS stockLimit,min_active_referrals AS minActiveReferrals,requires_package_id AS requiresPackageId,allow_while_active AS allowWhileActive,visible,\'\' AS imageUrl FROM packages WHERE visible=1 ORDER BY price').all()
      return json({ packages: result.results })
    }
  } catch (error) { console.error(error); return json({ error: 'প্যাকেজ লোড করা যায়নি' }, 500) }
}
