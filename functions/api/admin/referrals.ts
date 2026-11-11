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
    { id: 't1', icon: '🥉', rank: 'ব্রোঞ্জ লিডার', amount: 300, reqL1: 3, reqL2: 0, reqL3: 0, enabled: true },
    { id: 't2', icon: '🥈', rank: 'সিলভার লিডার', amount: 700, reqL1: 5, reqL2: 0, reqL3: 0, enabled: true },
    { id: 't3', icon: '🥇', rank: 'গোল্ড লিডার', amount: 1200, reqL1: 7, reqL2: 3, reqL3: 0, enabled: true },
    { id: 't4', icon: '💎', rank: 'প্লাটিনাম লিডার', amount: 2500, reqL1: 10, reqL2: 5, reqL3: 0, enabled: true },
    { id: 't5', icon: '👑', rank: 'ডায়মন্ড লিডার', amount: 5000, reqL1: 15, reqL2: 10, reqL3: 5, enabled: true },
    { id: 't6', icon: '⭐', rank: 'ক্রাউন ডিরেক্টর', amount: 10000, reqL1: 30, reqL2: 20, reqL3: 10, enabled: true },
    { id: 't7', icon: '🚀', rank: 'এম্বাসেডর', amount: 25000, reqL1: 60, reqL2: 40, reqL3: 20, enabled: true },
    { id: 't8', icon: '🏛️', rank: 'প্রেসিডেন্সিয়াল লিডার', amount: 50000, reqL1: 120, reqL2: 80, reqL3: 50, enabled: true },
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
      const config = row ? JSON.parse(row.config_json) : defaults
      if (!row) await env.DB.prepare('INSERT INTO referral_settings (id,config_json,updated_at) VALUES (1,?,?)').bind(JSON.stringify(config),Date.now()).run()
      const requests = await env.DB.prepare(`SELECT r.id,r.user_id AS userId,u.phone AS mobile,u.id AS memberId,COALESCE(u.vip_level,0) AS vipLevel,r.tier_id AS tierId,r.amount,r.team_l1 AS teamL1,r.team_l2 AS teamL2,r.team_l3 AS teamL3,r.cycle_key AS cycleKey,r.status,r.review_note AS reviewNote,r.created_at AS createdAt,r.reviewed_at AS reviewedAt FROM salary_requests r JOIN users u ON u.id=r.user_id ORDER BY r.created_at DESC`).all()
      return json({ config, requests: requests.results.map((r:any)=>{const tier=config.salary.tiers.find((t:any)=>t.id===r.tierId);return {...r,...(tier ?? {icon:'⭐',rank:r.tierId,reqL1:0,reqL2:0,reqL3:0}),requestedAt:new Date(r.createdAt).toISOString(),reviewedAt:r.reviewedAt ? new Date(r.reviewedAt).toISOString() : undefined}}) })
    }
    if (request.method === 'PATCH') {
      const body = await request.json() as { id?: string; status?: 'approved'|'rejected'; note?: string }
      if (!body.id || !['approved','rejected'].includes(body.status ?? '')) return json({error:'Invalid review'},400)
      const row = await env.DB.prepare("SELECT id,user_id,amount,cycle_key FROM salary_requests WHERE id=? AND status='pending'").bind(body.id).first<{id:string;user_id:string;amount:number;cycle_key:string}>()
      if (!row) return json({error:'Pending request not found'},404)
      if (body.status==='approved') {
        const duplicate=await env.DB.prepare("SELECT id FROM salary_requests WHERE user_id=? AND cycle_key=? AND status='approved'").bind(row.user_id,row.cycle_key).first()
        if(duplicate) return json({error:'Salary already paid this cycle'},409)
        const reviewedAt=Date.now()
        const result=await env.DB.prepare("UPDATE salary_requests SET status='approved',reviewed_at=? WHERE id=? AND status='pending'").bind(reviewedAt,row.id).run()
        if(!result.meta.changes) return json({error:'Request already reviewed'},409)
        await env.DB.batch([
          env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=?').bind(row.amount,row.user_id),
          env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) VALUES (?,?,'credit',?,'Team salary',?)").bind(crypto.randomUUID(),row.user_id,row.amount,reviewedAt),
        ])
      } else await env.DB.prepare("UPDATE salary_requests SET status='rejected',review_note=?,reviewed_at=? WHERE id=? AND status='pending'").bind((body.note ?? '').slice(0,500),Date.now(),row.id).run()
      return json({success:true})
    }
    if (request.method !== 'PUT') return json({ error: 'Method not allowed' },405)
    const config = await request.json() as any
    if (!config || !config.general || !config.commissions || !Array.isArray(config.commissions.levels) || !config.salary || !Array.isArray(config.salary.tiers) || JSON.stringify(config).length > 100_000) return json({ error: 'Invalid referral configuration' },400)
    if (!config.commissions.levels.every((level:any)=>Number.isInteger(level.level)&&level.level>=1&&level.level<=3&&Number.isFinite(level.depositBonus)&&level.depositBonus>=0&&level.depositBonus<=100&&Number.isFinite(level.profitCommission)&&level.profitCommission>=0&&level.profitCommission<=100)) return json({error:'Invalid commission rates'},400)
    if (!config.salary.tiers.every((tier:any)=>typeof tier.id==='string'&&tier.id.length<=80&&typeof tier.rank==='string'&&tier.rank.trim()&&Number.isInteger(tier.amount)&&tier.amount>0&&['reqL1','reqL2','reqL3'].every(key=>Number.isInteger(tier[key])&&tier[key]>=0))) return json({error:'Invalid salary tier'},400)
    await env.DB.prepare('INSERT INTO referral_settings (id,config_json,updated_at) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET config_json=excluded.config_json,updated_at=excluded.updated_at').bind(JSON.stringify(config),Date.now()).run()
    return json({ success:true })
  } catch (error) { console.error(error); return json({ error:'Referral settings unavailable' },500) }
}
