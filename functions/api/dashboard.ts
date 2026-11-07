import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const sid = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sid) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sid,Date.now()).first<{user_id:string}>()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const [user, packageRow, tx, deposited, withdrawn] = await Promise.all([
      env.DB.prepare('SELECT id,name,balance FROM users WHERE id=?').bind(session.user_id).first(),
      env.DB.prepare("SELECT up.id,up.package_id AS packageId,p.name,up.price_paid AS amount,up.daily_rate AS dailyRate,up.duration_days AS durationDays,up.started_at AS startedAt,up.expires_at AS expiresAt FROM user_packages up JOIN packages p ON p.id=up.package_id WHERE up.user_id=? AND up.status='active' AND up.expires_at>? ORDER BY up.created_at DESC LIMIT 1").bind(session.user_id,Date.now()).first(),
      env.DB.prepare('SELECT id,type,amount,label,created_at AS createdAt FROM transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 30').bind(session.user_id).all(),
      env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=? AND type='credit' AND label NOT LIKE '%লাভ%'").bind(session.user_id).first<{total:number}>(),
      env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=? AND type='debit' AND label LIKE '%উত্তোলন%'").bind(session.user_id).first<{total:number}>(),
    ])
    return Response.json({ success:true,user,investment:packageRow,transactions:tx.results,totalDeposited:deposited?.total ?? 0,totalWithdrawn:withdrawn?.total ?? 0 })
  } catch (error) { console.error(error); return Response.json({error:'Dashboard unavailable'},{status:500}) }
}
