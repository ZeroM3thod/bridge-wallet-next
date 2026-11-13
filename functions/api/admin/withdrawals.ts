import type { PagesFunction } from '@cloudflare/workers-types'
type Env={DB:D1Database}
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}})
async function admin(request:Request,DB:D1Database){const sid=request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];if(!sid)return false;const row=await DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(sid,Date.now()).first<{role:string}>();return row?.role==='admin'}
export const onRequest:PagesFunction<Env>=async({request,env})=>{
 if(!await admin(request,env.DB))return json({error:'Not found'},404)
 try{
  if(request.method==='GET'){const [rows,settings]=await Promise.all([env.DB.prepare('SELECT x.id,x.amount,x.fee,x.net,x.status,x.created_at,x.reviewed_at,u.id AS user_id,u.name,u.phone,u.email,u.balance,w.provider,w.account FROM withdrawals x JOIN users u ON u.id=x.user_id JOIN withdrawal_wallets w ON w.id=x.wallet_id ORDER BY x.created_at DESC').all(),env.DB.prepare('SELECT minimum_amount,fee_percent FROM withdrawal_settings WHERE id=1').first()]);return json({withdrawals:rows.results,settings})}
  if(request.method!=='POST')return json({error:'Method not allowed'},405)
  const body=await request.json() as {action?:string;id?:string;minimumAmount?:number;feePercent?:number}
  if(body.action==='settings'){
   if(!Number.isSafeInteger(body.minimumAmount)||body.minimumAmount!<1||typeof body.feePercent!=='number'||!Number.isFinite(body.feePercent)||body.feePercent!<0||body.feePercent!>100)return json({error:'Invalid withdrawal settings'},400)
   await env.DB.prepare('UPDATE withdrawal_settings SET minimum_amount=?,fee_percent=?,updated_at=? WHERE id=1').bind(body.minimumAmount,body.feePercent,Date.now()).run();return json({success:true})
  }
  if(!body.id||!['approve','reject'].includes(body.action||''))return json({error:'Invalid request'},400)
  const row=await env.DB.prepare('SELECT user_id,amount,status FROM withdrawals WHERE id=?').bind(body.id).first<{user_id:string;amount:number;status:string}>();if(!row)return json({error:'Withdrawal not found'},404);if(row.status!=='pending')return json({error:'Already reviewed'},409)
  const now=Date.now(), decision=body.action==='approve'?'approved':'rejected', sid=request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]??''
  const actor=await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sid,now).first<{user_id:string}>()
  await env.DB.batch([env.DB.prepare('UPDATE withdrawals SET status=?,reviewed_at=?,reviewed_by=? WHERE id=? AND status=\'pending\'').bind(decision,now,actor?.user_id??null,body.id),...(decision==='rejected'?[env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=? AND changes()>0').bind(row.amount,row.user_id),env.DB.prepare("INSERT INTO transactions(id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'উত্তোলন ফেরত',? WHERE changes()>0").bind(crypto.randomUUID(),row.user_id,row.amount,now)]:[])])
  const updated=await env.DB.prepare('SELECT status FROM withdrawals WHERE id=?').bind(body.id).first<{status:string}>();return updated?.status===decision?json({success:true,status:decision}):json({error:'Review conflict'},409)
 }catch(error){console.error('Admin withdrawals:',error);return json({error:'Withdrawal review failed'},500)}
}
