import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
type Package = { id: string; name: string; price: number; dailyRate: number; durationDays: number; maxPerUser: number; stockLimit: number; minActiveReferrals: number; requiresPackageId?: string; allowWhileActive: boolean; visible: boolean }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

async function admin(request: Request, db: D1Database) {
  const id = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!id) return false
  const row = await db.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(id, Date.now()).first<{role:string}>()
  return row?.role === 'admin'
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (!await admin(request, env.DB)) return json({ error: 'Not found' }, 404)
  if (request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT id,name,price,daily_rate AS dailyRate,duration_days AS durationDays,max_per_user AS maxPerUser,stock_limit AS stockLimit,min_active_referrals AS minActiveReferrals,requires_package_id AS requiresPackageId,allow_while_active AS allowWhileActive,visible FROM packages ORDER BY price').all()
    return json({ packages: rows.results })
  }
  if (request.method !== 'PUT') return json({ error: 'Method not allowed' }, 405)
  try {
    const body = await request.json() as { packages?: Package[] }
    if (!Array.isArray(body.packages) || body.packages.length > 100) return json({ error: 'Invalid package list' }, 400)
    const ids = new Set<string>(), now = Date.now()
    const statements = []
    for (const p of body.packages) {
      if (!p || typeof p.id !== 'string' || !p.id.trim() || ids.has(p.id) || typeof p.name !== 'string' || !p.name.trim() || !Number.isSafeInteger(p.price) || p.price <= 0 || !Number.isFinite(p.dailyRate) || p.dailyRate <= 0 || p.dailyRate > 100 || !Number.isSafeInteger(p.durationDays) || p.durationDays < 1 || ![p.maxPerUser,p.stockLimit,p.minActiveReferrals].every(n => Number.isSafeInteger(n) && n >= 0) || typeof p.allowWhileActive !== 'boolean' || typeof p.visible !== 'boolean') return json({ error: 'Invalid package fields' }, 400)
      ids.add(p.id)
      statements.push(env.DB.prepare('INSERT INTO packages (id,name,price,daily_rate,duration_days,max_per_user,stock_limit,min_active_referrals,requires_package_id,allow_while_active,visible,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,price=excluded.price,daily_rate=excluded.daily_rate,duration_days=excluded.duration_days,max_per_user=excluded.max_per_user,stock_limit=excluded.stock_limit,min_active_referrals=excluded.min_active_referrals,requires_package_id=excluded.requires_package_id,allow_while_active=excluded.allow_while_active,visible=excluded.visible,updated_at=excluded.updated_at').bind(p.id,p.name.trim(),p.price,p.dailyRate,p.durationDays,p.maxPerUser,p.stockLimit,p.minActiveReferrals,p.requiresPackageId || '',+p.allowWhileActive,+p.visible,now,now))
    }
    statements.push(env.DB.prepare(`UPDATE packages SET visible=0,updated_at=? WHERE id NOT IN (${ids.size ? [...ids].map(() => '?').join(',') : "''"})`).bind(now, ...ids))
    if (statements.length) await env.DB.batch(statements)
    return json({ success: true, saved: statements.length })
  } catch (error) { console.error(error); return json({ error: 'Save failed' }, 500) }
}
