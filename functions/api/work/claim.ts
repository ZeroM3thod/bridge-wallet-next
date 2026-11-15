import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
const DAY = 86_400_000

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sessionId) return Response.json({ error: 'লগইন করুন' }, { status: 401 })
  try {
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sessionId, Date.now()).first<{ user_id: string }>()
    if (!session) return Response.json({ error: 'সেশনের মেয়াদ শেষ' }, { status: 401 })
    const { packageId } = await request.json() as { packageId?: string }
    if (!packageId) return Response.json({ error: 'প্যাকেজ নির্বাচন করুন' }, { status: 400 })
    const now = Date.now()
    const pkg = await env.DB.prepare("SELECT id,user_id,package_id,daily_profit,duration_days,started_at,expires_at,next_profit_at FROM user_packages WHERE id=? AND user_id=? AND status='active'").bind(packageId, session.user_id).first<{ id: string; user_id: string; package_id: string; daily_profit: number; duration_days: number; started_at: number; expires_at: number; next_profit_at: number }>()
    if (!pkg || now > pkg.expires_at) return Response.json({ error: 'সক্রিয় প্যাকেজ পাওয়া যায়নি' }, { status: 404 })
    if (now < pkg.next_profit_at) return Response.json({ error: 'লাভ জমার সময় এখনো হয়নি', nextProfitAt: pkg.next_profit_at }, { status: 409 })
    const previous = await env.DB.prepare('SELECT COALESCE(MAX(day_number),0) AS day FROM daily_profits WHERE user_package_id=?').bind(pkg.id).first<{ day: number }>()
    const day = (previous?.day ?? 0) + 1
    if (day < 1 || day > pkg.duration_days) return Response.json({ error: 'প্যাকেজের লাভের মেয়াদ শেষ' }, { status: 409 })
    const amount = pkg.daily_profit
    const result = await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO daily_profits (id,user_package_id,user_id,package_id,day_number,amount,credited_at,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), pkg.id, pkg.user_id, pkg.package_id, day, amount, now, now),
      env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=? AND changes()=1').bind(amount, pkg.user_id),
      env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'দৈনিক প্যাকেজ লাভ',? WHERE changes()=1").bind(crypto.randomUUID(), pkg.user_id, amount, now),
      env.DB.prepare('UPDATE user_packages SET next_profit_at=? WHERE id=? AND next_profit_at=? AND changes()=1').bind(now + DAY, pkg.id, pkg.next_profit_at),
    ])
    if (!result[0].meta.changes) return Response.json({ error: 'এই দিনের লাভ ইতিমধ্যে জমা হয়েছে' }, { status: 409 })
    return Response.json({ success: true, amount, nextProfitAt: now + DAY })
  } catch (error) {
    console.error('Profit claim failed', error)
    return Response.json({ error: 'লাভ জমা করা যায়নি' }, { status: 500 })
  }
}
