import type { PagesFunction } from '@cloudflare/workers-types'
import { INITIAL_PACKAGES } from '../../lib/initial-packages'

type Env = { DB: D1Database }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM packages').first<{ count: number }>()
    if (!count?.count) {
      const now = Date.now()
      await env.DB.batch(INITIAL_PACKAGES.map(p => env.DB.prepare(
        'INSERT OR IGNORE INTO packages (id,name,price,daily_rate,duration_days,max_per_user,stock_limit,min_active_referrals,requires_package_id,allow_while_active,visible,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
      ).bind(p.id,p.name,p.price,p.dailyRate,p.durationDays,p.maxPerUser,p.stockLimit,p.minActiveReferrals,p.requiresPackageId,+p.allowWhileActive,+p.visible,now,now)))
    }
    const result = await env.DB.prepare('SELECT id,name,price,daily_rate AS dailyRate,duration_days AS durationDays,max_per_user AS maxPerUser,stock_limit AS stockLimit,min_active_referrals AS minActiveReferrals,requires_package_id AS requiresPackageId,allow_while_active AS allowWhileActive,visible FROM packages WHERE visible = 1 ORDER BY price').all()
    return json({ packages: result.results })
  } catch (error) { console.error(error); return json({ error: 'প্যাকেজ লোড করা যায়নি' }, 500) }
}
