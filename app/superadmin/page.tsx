"use client"
import {useEffect,useState} from "react"
import {AdminSidebar} from "@/components/admin/AdminSidebar"
type Stats={totalUsers:number;activeUsers:number;totalDeposits:number;totalWithdraws:number;totalStake:number;pendingWithdraws:number;referralPaid:number;activePackages:number}
type Activity={id:string;user:string;type:string;amount:number;status:string;date:number}
const money=(n:number)=>"৳"+Number(n||0).toLocaleString("en-BD",{maximumFractionDigits:0}),num=(n:number)=>Number(n||0).toLocaleString("en-US")
export default function AdminDashboard(){
 const [data,setData]=useState<{stats:Stats;recent:Activity[]}|null>(null),[error,setError]=useState("")
 useEffect(()=>{fetch('/api/admin/dashboard',{credentials:'include',cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setData(d)}).catch(e=>setError(e.message||'Dashboard data unavailable'))},[])
 const stats=data?.stats, cards=stats?[
  {label:"Total users",value:num(stats.totalUsers),note:`${num(stats.activeUsers)} active sessions`},
  {label:"Active users",value:num(stats.activeUsers),note:`${Math.round(stats.activeUsers/Math.max(stats.totalUsers,1)*100)}% of all users`},
  {label:"Total deposits",value:money(stats.totalDeposits),note:"Paid deposits"},
  {label:"Total withdraws",value:money(stats.totalWithdraws),note:`${num(stats.pendingWithdraws)} waiting for approval`},
  {label:"Total stake",value:money(stats.totalStake),note:`${num(stats.activePackages)} active packages`},
  {label:"Referral paid",value:money(stats.referralPaid),note:"Referral commissions"},
 ]:[]
 return <div className="ad"><AdminSidebar active="dashboard"/><main className="ad-main"><header className="ad-top"><div className="ad-top-title"><h1>Dashboard</h1></div></header>
  {error&&<p role="alert" className="ad-alert">{error}</p>}
  {!data&&!error&&<p role="status">Loading dashboard…</p>}
  <section className="ad-grid" aria-label="Overview">{cards.map(c=><article key={c.label} className="ad-card"><p className="ad-card-label">{c.label}</p><p className="ad-card-value">{c.value}</p><p className="ad-card-note">{c.note}</p></article>)}</section>
  <section className="ad-panel"><h2>Recent activity</h2><div className="ad-table-wrap"><table className="ad-cards"><thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{data?.recent.map(r=><tr key={`${r.type}-${r.id}`}><td data-label="User"><div className="ad-cell"><strong>{r.user}</strong></div></td><td data-label="Type"><div className="ad-cell">{r.type}</div></td><td data-label="Amount"><div className="ad-cell ad-amount">{money(r.amount)}</div></td><td data-label="Status"><div className="ad-cell"><span className={`ad-pill ad-${r.status.toLowerCase()}`}>{r.status}</span></div></td><td data-label="Date"><div className="ad-cell ad-muted">{new Date(r.date).toLocaleString()}</div></td></tr>)}{data&&!data.recent.length&&<tr><td colSpan={5} className="ad-empty">No recent activity</td></tr>}</tbody></table></div></section>
 </main></div>
}
