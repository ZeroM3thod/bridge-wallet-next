import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sessionId) return json({ error: 'লগইন করুন' }, 401)
  try {
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sessionId, Date.now()).first<{user_id:string}>()
    if (!session) return json({ error: 'সেশনের মেয়াদ শেষ' }, 401)
    const body = await request.json() as { packageId?: unknown }
    if (typeof body.packageId !== 'string' || !body.packageId) return json({ error: 'প্যাকেজ নির্বাচন করুন' }, 400)
    const pkg = await env.DB.prepare('SELECT * FROM packages WHERE id=? AND visible=1').bind(body.packageId).first<any>()
    if (!pkg) return json({ error: 'প্যাকেজ পাওয়া যায়নি' }, 404)
    const user = await env.DB.prepare('SELECT balance,COALESCE(vip_level,0) AS vip_level FROM users WHERE id=?').bind(session.user_id).first<{balance:number;vip_level:number}>()
    if (!user) return json({ error: 'ব্যবহারকারী পাওয়া যায়নি' }, 404)
    if (user.balance < pkg.price) return json({ error: 'পর্যাপ্ত ব্যালেন্স নেই' }, 400)
    const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM user_packages WHERE user_id=? AND package_id=?').bind(session.user_id,pkg.id).first<{n:number}>()
    if (pkg.max_per_user && count!.n >= pkg.max_per_user) return json({ error: 'এই প্যাকেজ কেনার সর্বোচ্চ সীমা পূর্ণ' }, 400)
    if (user.vip_level < pkg.min_vip_level) return json({ error: `অভিজাত ধাপ ${pkg.min_vip_level} প্রয়োজন` }, 400)

    const now = Date.now(), purchaseId = crypto.randomUUID()
    const result = await env.DB.batch([
      env.DB.prepare('UPDATE users SET balance=balance-? WHERE id=? AND balance>=?').bind(pkg.price,session.user_id,pkg.price),
      env.DB.prepare("INSERT INTO user_packages (id,user_id,package_id,price_paid,daily_rate,duration_days,started_at,expires_at,status,created_at,daily_profit) SELECT ?,?,?,?,?,?,?,?,'active',?,? WHERE EXISTS (SELECT 1 FROM users WHERE id=? AND balance=?)").bind(purchaseId,session.user_id,pkg.id,pkg.price,pkg.daily_rate,pkg.duration_days,now,now+pkg.duration_days*86400000,now,pkg.daily_profit,session.user_id,user.balance-pkg.price),
      env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'debit',?,'প্যাকেজ ক্রয়',? WHERE EXISTS (SELECT 1 FROM user_packages WHERE id=?)").bind(crypto.randomUUID(),session.user_id,pkg.price,now,purchaseId),
    ])
    if (!result[0].meta.changes || !result[1].meta.changes) return json({ error: 'ব্যালেন্স পরিবর্তিত হয়েছে; আবার চেষ্টা করুন' }, 409)
    return json({ success: true, balance: user.balance - pkg.price })
  } catch (error) { console.error('Package purchase failed', error); return json({ error: 'ক্রয় সম্পন্ন হয়নি' }, 500) }
}
