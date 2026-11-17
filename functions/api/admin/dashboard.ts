import type { PagesFunction } from '@cloudflare/workers-types'
type Env={DB:D1Database}
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}})
async function isAdmin(request:Request,DB:D1Database){const sid=request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];if(!sid)return false;const row=await DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(sid,Date.now()).first<{role:string}>();return row?.role==='admin'}
export const onRequest:PagesFunction<Env>=async({request,env})=>{
 if(!await isAdmin(request,env.DB))return json({error:'Not found'},404)
 try{
  const [users,deposits,withdrawals,stake,referralPaid,activePackages,pendingWithdraws,recent]=await Promise.all([
   env.DB.prepare('SELECT COUNT(DISTINCT u.id) AS total,COUNT(DISTINCT s.user_id) AS active FROM users u LEFT JOIN sessions s ON s.user_id=u.id AND s.expires_at>?').bind(Date.now()).first<{total:number;active:number}>(),
   env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM deposits WHERE status='paid'").first<{total:number}>(),
   env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM withdrawals WHERE status='approved'").first<{total:number}>(),
   env.DB.prepare("SELECT COALESCE(SUM(price_paid),0) AS total FROM user_packages WHERE status='active'").first<{total:number}>(),
   env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE type='credit' AND label LIKE '%রেফারেল%'").first<{total:number}>(),
   env.DB.prepare("SELECT COUNT(*) AS total FROM user_packages WHERE status='active'").first<{total:number}>(),
   env.DB.prepare("SELECT COUNT(*) AS total FROM withdrawals WHERE status='pending'").first<{total:number}>(),
   env.DB.prepare("SELECT a.id,a.user,a.type,a.amount,a.status,a.created_at AS date FROM (SELECT d.id,u.name AS user,'Deposit' AS type,d.amount,CASE d.status WHEN 'paid' THEN 'Completed' WHEN 'failed' THEN 'Rejected' ELSE 'Pending' END AS status,d.created_at FROM deposits d JOIN users u ON u.id=d.user_id UNION ALL SELECT w.id,u.name,'Withdraw',w.amount,CASE w.status WHEN 'approved' THEN 'Completed' WHEN 'rejected' THEN 'Rejected' ELSE 'Pending' END,w.created_at FROM withdrawals w JOIN users u ON u.id=w.user_id UNION ALL SELECT p.id,u.name,'Stake',p.price_paid,CASE WHEN p.status='active' THEN 'Completed' ELSE p.status END,p.started_at FROM user_packages p JOIN users u ON u.id=p.user_id) a ORDER BY a.created_at DESC LIMIT 10").all()
  ])
  return json({stats:{totalUsers:users?.total??0,activeUsers:users?.active??0,totalDeposits:deposits?.total??0,totalWithdraws:withdrawals?.total??0,totalStake:stake?.total??0,pendingWithdraws:pendingWithdraws?.total??0,referralPaid:referralPaid?.total??0,activePackages:activePackages?.total??0},recent:recent.results})
 }catch(error){console.error('Admin dashboard:',error);return json({error:'Dashboard data unavailable'},500)}
}
