import type { D1Database } from '@cloudflare/workers-types'

export async function referralCommissionStatements(DB: D1Database, userId: string, deposit: number, now: number) {
  const [settings, ancestors, previousPaid] = await Promise.all([
    DB.prepare('SELECT config_json FROM referral_settings WHERE id=1').first<{ config_json: string }>(),
    DB.prepare(`WITH RECURSIVE chain(id,depth) AS (
      SELECT referred_by,1 FROM users WHERE id=? AND referred_by IS NOT NULL
      UNION ALL SELECT u.referred_by,chain.depth+1 FROM users u JOIN chain ON u.id=chain.id WHERE u.referred_by IS NOT NULL AND chain.depth<3
    ) SELECT id,depth FROM chain`).bind(userId).all<{ id: string; depth: number }>(),
    DB.prepare("SELECT COUNT(*) AS count FROM deposits WHERE user_id=? AND status='paid'").bind(userId).first<{ count: number }>(),
  ])
  const config = settings ? JSON.parse(settings.config_json) : null
  const commission = config?.commissions
  if (config?.general?.enabled === false || !commission || (commission.depositBonusOn === 'first' && (previousPaid?.count ?? 0) > 0) || deposit < (Number(commission.minDepositForBonus) || 0)) return []

  const statements: D1PreparedStatement[] = []
  for (const ancestor of ancestors.results ?? []) {
    const level = commission.levels?.find((item: any) => item.level === ancestor.depth && item.enabled !== false)
    const amount = Math.round(deposit * (Number(level?.depositBonus) || 0) / 100)
    if (!amount) continue
    statements.push(
      DB.prepare('UPDATE users SET balance=balance+? WHERE id=? AND changes()>0').bind(amount, ancestor.id),
      DB.prepare("INSERT INTO transactions(id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'রেফারেল ডিপোজিট কমিশন',? WHERE changes()>0").bind(crypto.randomUUID(), ancestor.id, amount, now),
      DB.prepare('INSERT INTO user_stats(user_id,team_received) SELECT ?,? WHERE changes()>0 ON CONFLICT(user_id) DO UPDATE SET team_received=team_received+excluded.team_received').bind(ancestor.id, amount),
    )
  }
  return statements
}
