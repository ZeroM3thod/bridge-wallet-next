interface Env { DB: D1Database }
const DAY = 86_400_000

export default {
  async scheduled(_event: ScheduledEvent, env: Env) {
    const now = Date.now()
    const { results = [] } = await env.DB.prepare(
      "SELECT id,user_id,package_id,price_paid,daily_rate,duration_days,started_at FROM user_packages WHERE status='active' AND started_at+86400000<=? LIMIT 500",
    ).bind(now).all<{id:string;user_id:string;package_id:string;price_paid:number;daily_rate:number;duration_days:number;started_at:number}>()

    for (const pkg of results) {
      const lastDueDay = Math.min(pkg.duration_days, Math.floor((now - pkg.started_at) / DAY))
      const previous = await env.DB.prepare('SELECT COALESCE(MAX(day_number),0) AS day FROM daily_profits WHERE user_package_id=?').bind(pkg.id).first<{day:number}>()
      for (let day = (previous?.day ?? 0) + 1; day <= lastDueDay; day++) {
        const amount = Math.round(pkg.price_paid * Math.pow(1 + pkg.daily_rate / 100, day - 1) * pkg.daily_rate / 100)
        if (amount <= 0) continue
        await env.DB.batch([
          env.DB.prepare('INSERT OR IGNORE INTO daily_profits (id,user_id,package_id,user_package_id,amount,day_number,credited_at,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),pkg.user_id,pkg.package_id,pkg.id,amount,day,now,now),
          env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=? AND changes()=1').bind(amount,pkg.user_id),
          env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'দৈনিক প্যাকেজ লাভ',? WHERE changes()=1").bind(crypto.randomUUID(),pkg.user_id,amount,now),
        ])
      }
      if (now >= pkg.started_at + pkg.duration_days * DAY) {
        await env.DB.prepare("UPDATE user_packages SET status='completed' WHERE id=? AND status='active'").bind(pkg.id).run()
      }
    }
  },
}
