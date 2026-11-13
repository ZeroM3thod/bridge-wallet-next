import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
async function userId(request: Request, DB: D1Database) {
  const sid = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  return sid ? (await DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sid, Date.now()).first<{user_id:string}>())?.user_id : null
}
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('')
export const onRequest: PagesFunction<Env> = async ({request,env}) => {
  try {
    const uid = await userId(request,env.DB)
    if (!uid) return json({error:'অনুমোদিত নয়'},401)
    if (request.method === 'GET') {
      const [wallets, withdrawals, user, settings] = await Promise.all([
        env.DB.prepare('SELECT id,provider,account FROM withdrawal_wallets WHERE user_id=? ORDER BY created_at').bind(uid).all(),
        env.DB.prepare('SELECT x.id,x.amount,x.fee,x.net,x.status,x.created_at AS date,w.provider,w.account FROM withdrawals x JOIN withdrawal_wallets w ON w.id=x.wallet_id WHERE x.user_id=? ORDER BY x.created_at DESC LIMIT 50').bind(uid).all(),
        env.DB.prepare('SELECT balance,withdrawal_password_hash FROM users WHERE id=?').bind(uid).first<{balance:number;withdrawal_password_hash:string|null}>(),
        env.DB.prepare('SELECT minimum_amount,fee_percent FROM withdrawal_settings WHERE id=1').first(),
      ])
      return json({wallets:wallets.results,withdrawals:withdrawals.results,balance:user?.balance??0,hasPassword:!!user?.withdrawal_password_hash,settings})
    }
    if (request.method !== 'POST') return json({error:'Method not allowed'},405)
    const body = await request.json() as {action?:string;provider?:string;account?:string;password?:string;walletId?:string;amount?:number}
    const user = await env.DB.prepare('SELECT balance,withdrawal_password_hash FROM users WHERE id=?').bind(uid).first<{balance:number;withdrawal_password_hash:string|null}>()
    if (!user) return json({error:'ব্যবহারকারী পাওয়া যায়নি'},404)
    if (!user.withdrawal_password_hash) return json({error:'আগে উত্তোলন পাসওয়ার্ড সেট করুন',code:'PASSWORD_REQUIRED'},400)
    if (typeof body.password!=='string' || await hash(body.password)!==user.withdrawal_password_hash) return json({error:'উত্তোলন পাসওয়ার্ড সঠিক নয়'},400)
    if (body.action==='wallet') {
      if (!['bkash','nagad'].includes(body.provider||'') || !/^01[3-9]\d{8}$/.test(body.account||'')) return json({error:'সঠিক বিকাশ/নগদ নম্বর দিন'},400)
      const count=await env.DB.prepare('SELECT COUNT(*) AS n FROM withdrawal_wallets WHERE user_id=?').bind(uid).first<{n:number}>()
      if ((count?.n??0)>=2) return json({error:'সর্বোচ্চ ২টি ওয়ালেট যোগ করা যাবে'},409)
      await env.DB.prepare('INSERT INTO withdrawal_wallets(id,user_id,provider,account,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),uid,body.provider,body.account,Date.now()).run()
      return json({success:true})
    }
    if (body.action==='withdraw') {
      const settings=await env.DB.prepare('SELECT minimum_amount,fee_percent FROM withdrawal_settings WHERE id=1').first<{minimum_amount:number;fee_percent:number}>()
      const amount=Number(body.amount), min=settings?.minimum_amount??1000, percent=settings?.fee_percent??2
      if (!Number.isSafeInteger(amount)||amount<min) return json({error:`সর্বনিম্ন উত্তোলন ৳${min}`},400)
      if (amount>user.balance) return json({error:'পর্যাপ্ত ব্যালেন্স নেই'},400)
      const wallet=await env.DB.prepare('SELECT id FROM withdrawal_wallets WHERE id=? AND user_id=?').bind(body.walletId,uid).first()
      if (!wallet) return json({error:'ওয়ালেট পাওয়া যায়নি'},400)
      const fee=Math.round(amount*percent/100), now=Date.now(), id=crypto.randomUUID()
      await env.DB.batch([
        env.DB.prepare('UPDATE users SET balance=balance-? WHERE id=? AND balance>=?').bind(amount,uid,amount),
        env.DB.prepare("INSERT INTO withdrawals(id,user_id,wallet_id,amount,fee,net,status,created_at) SELECT ?,?,?,?, ?,?, 'pending',? WHERE changes()>0").bind(id,uid,body.walletId,amount,fee,amount-fee,now),
        env.DB.prepare("INSERT INTO transactions(id,user_id,type,amount,label,created_at) SELECT ?,?,'debit',?,'অর্থ উত্তোলন',? WHERE changes()>0").bind(crypto.randomUUID(),uid,amount,now),
      ])
      const row=await env.DB.prepare('SELECT id FROM withdrawals WHERE id=?').bind(id).first()
      return row ? json({success:true,id,amount,fee,net:amount-fee}) : json({error:'অনুরোধ জমা হয়নি'},409)
    }
    return json({error:'Invalid action'},400)
  } catch(error) { console.error('Withdrawals API:',error); return json({error:'সার্ভার সমস্যা হয়েছে'},500) }
}
