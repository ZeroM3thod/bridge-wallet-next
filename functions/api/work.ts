import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const id = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(id,Date.now()).first<{user_id:string}>()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const now = Date.now()
    const [packages, profits] = await Promise.all([
      env.DB.prepare("SELECT up.id,up.package_id AS packageId,p.name,up.price_paid AS amount,up.daily_rate AS dailyRate,up.duration_days AS durationDays,up.started_at AS startedAt,up.expires_at AS expiresAt,up.status FROM user_packages up JOIN packages p ON p.id=up.package_id WHERE up.user_id=? ORDER BY up.created_at DESC").bind(session.user_id).all(),
      env.DB.prepare('SELECT dp.id,dp.user_package_id AS userPackageId,dp.package_id AS packageId,p.name,dp.day_number AS day,dp.amount,dp.credited_at AS createdAt FROM daily_profits dp LEFT JOIN packages p ON p.id=dp.package_id WHERE dp.user_id=? ORDER BY dp.credited_at DESC LIMIT 500').bind(session.user_id).all(),
    ])
    return Response.json({ success: true, packages: packages.results, profits: profits.results, now })
  } catch (error) { console.error(error); return Response.json({ error: 'Work data unavailable' }, { status: 500 }) }
}
