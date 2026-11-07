import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database; CRON_SECRET?: string }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.CRON_SECRET || request.headers.get('Authorization') !== `Bearer ${env.CRON_SECRET}`) return new Response('Not found', { status: 404 })
  const now = Date.now()
  try {
    const { results = [] } = await env.DB.prepare("SELECT id,user_id,price_paid,daily_rate,duration_days,started_at FROM user_packages WHERE status='active' AND started_at<=? AND expires_at>? LIMIT 500").bind(now, now).all<{id:string;user_id:string;price_paid:number;daily_rate:number;duration_days:number;started_at:number}>()
    let credited = 0
    for (const pkg of results) {
      const day = Math.floor((now - pkg.started_at) / 86400000) + 1
      if (day > pkg.duration_days) continue
      const amount = Math.round(pkg.price_paid * Math.pow(1 + pkg.daily_rate / 100, day - 1) * pkg.daily_rate / 100)
      if (amount <= 0) continue
      const id = crypto.randomUUID()
      const result = await env.DB.batch([
        env.DB.prepare('INSERT OR IGNORE INTO daily_profits (id,user_package_id,user_id,package_id,day_number,amount,credited_at,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,pkg.id,pkg.user_id,pkg.package_id,day,amount,now,now),
        env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=? AND changes()=1').bind(amount,pkg.user_id),
        env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'দৈনিক প্যাকেজ লাভ',? WHERE changes()=1").bind(crypto.randomUUID(),pkg.user_id,amount,now),
      ])
      credited += result[0].meta.changes
    }
    return Response.json({ success: true, credited })
  } catch (error) { console.error(error); return Response.json({ error: 'Profit credit failed' }, { status: 500 }) }
}
