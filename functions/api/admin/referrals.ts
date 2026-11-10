import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
const defaults = {
  general: { enabled: true, requireCodeAtSignup: false, blockSelfReferral: true, activeWhen: 'min_vip', activeMinVip: 1, activeMinDeposit: 500, maxBonusPerUser: 0 },
  commissions: { levels: [
    { level: 1, enabled: true, title: '১ম লেভেল', depositBonus: 8, profitCommission: 8 },
    { level: 2, enabled: true, title: '২য় লেভেল', depositBonus: 3, profitCommission: 3 },
    { level: 3, enabled: true, title: '৩য় লেভেল', depositBonus: 1, profitCommission: 1 },
  ], depositBonusOn: 'every', minDepositForBonus: 0, payout: 'instant', maxCommissionPerMember: 0 },
  salary: { enabled: true, minVip: 1, cycle: 'monthly', onePerCycle: true, needsApproval: true, tiers: [
    { id: 't1', icon: '🥉', rank: 'ব্রোঞ্জ লিডার', amount: 1000, reqL1: 5, reqL2: 0, reqL3: 0, enabled: true },
    { id: 't2', icon: '🥈', rank: 'সিলভার লিডার', amount: 3000, reqL1: 10, reqL2: 5, reqL3: 0, enabled: true },
    { id: 't3', icon: '🥇', rank: 'গোল্ড লিডার', amount: 8000, reqL1: 20, reqL2: 10, reqL3: 5, enabled: true },
    { id: 't4', icon: '💎', rank: 'ডায়মন্ড লিডার', amount: 20000, reqL1: 40, reqL2: 20, reqL3: 10, enabled: true },
    { id: 't5', icon: '👑', rank: 'ক্রাউন লিডার', amount: 50000, reqL1: 80, reqL2: 40, reqL3: 20, enabled: true },
  ] },
}
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } })

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const sid = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  const session = sid && await env.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(sid,Date.now()).first<{role:string}>()
  if (session?.role !== 'admin') return json({ error: 'Not found' },404)
  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT config_json FROM referral_settings WHERE id=1').first<{config_json:string}>()
      return json({ config: row ? JSON.parse(row.config_json) : defaults })
    }
    if (request.method !== 'PUT') return json({ error: 'Method not allowed' },405)
    const config = await request.json() as any
    if (!config || !config.general || !config.commissions || !Array.isArray(config.commissions.levels) || !config.salary || !Array.isArray(config.salary.tiers) || JSON.stringify(config).length > 100_000) return json({ error: 'Invalid referral configuration' },400)
    await env.DB.prepare('INSERT INTO referral_settings (id,config_json,updated_at) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET config_json=excluded.config_json,updated_at=excluded.updated_at').bind(JSON.stringify(config),Date.now()).run()
    return json({ success:true })
  } catch (error) { console.error(error); return json({ error:'Referral settings unavailable' },500) }
}
