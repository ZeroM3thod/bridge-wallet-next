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
    const user = await env.DB.prepare('SELECT balance FROM users WHERE id=?').bind(session.user_id).first<{balance:number}>()
    if (!user) return json({ error: 'ব্যবহারকারী পাওয়া যায়নি' }, 404)
    if (user.balance < pkg.price) return json({ error: 'পর্যাপ্ত ব্যালেন্স নেই' }, 400)
    const [count, stock, referrals, prerequisite, active] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS n FROM user_packages WHERE user_id=? AND package_id=?').bind(session.user_id,pkg.id).first<{n:number}>(),
      env.DB.prepare('SELECT COUNT(*) AS n FROM user_packages WHERE package_id=?').bind(pkg.id).first<{n:number}>(),
      env.DB.prepare("SELECT COUNT(*) AS n FROM users u WHERE u.referred_by=? AND EXISTS (SELECT 1 FROM user_packages up WHERE up.user_id=u.id AND up.status='active' AND up.expires_at>?)").bind(session.user_id,Date.now()).first<{n:number}>(),
      pkg.requires_package_id ? env.DB.prepare('SELECT 1 AS yes FROM user_packages WHERE user_id=? AND package_id=? LIMIT 1').bind(session.user_id,pkg.requires_package_id).first() : Promise.resolve({ yes: 1 }),
      env.DB.prepare("SELECT 1 AS yes FROM user_packages WHERE user_id=? AND status='active' AND expires_at>? LIMIT 1").bind(session.user_id,Date.now()).first(),
    ])
    if (pkg.max_per_user && count!.n >= pkg.max_per_user) return json({ error: 'এই প্যাকেজ কেনার সর্বোচ্চ সীমা পূর্ণ' }, 400)
    if (pkg.stock_limit && stock!.n >= pkg.stock_limit) return json({ error: 'প্যাকেজের স্টক শেষ' }, 400)
    if (referrals!.n < pkg.min_active_referrals) return json({ error: `সক্রিয় রেফারেল কম। প্রয়োজন: ${pkg.min_active_referrals}` }, 400)
    if (!prerequisite) return json({ error: 'আগের প্রয়োজনীয় প্যাকেজটি আগে কিনুন' }, 400)
    if (!pkg.allow_while_active && active) return json({ error: 'চলমান প্যাকেজ শেষ হলে আবার কিনতে পারবেন' }, 400)

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
