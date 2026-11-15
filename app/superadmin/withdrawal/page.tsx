"use client"
import {useCallback,useEffect,useState} from "react"
import {AdminSidebar} from "@/components/admin/AdminSidebar"
type Row={id:string;amount:number;fee:number;net:number;status:string;created_at:number;user_id:string;name:string;phone:string;email:string;balance:number;provider:string;account:string}
const money=(n:number)=>`৳${Number(n).toLocaleString("en-BD")}`
export default function AdminWithdrawals(){
 const [rows,setRows]=useState<Row[]>([]),[min,setMin]=useState(1000),[fee,setFee]=useState(2),[busy,setBusy]=useState(""),[error,setError]=useState("")
 const load=useCallback(async()=>{const r=await fetch('/api/admin/withdrawals',{credentials:'include',cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error);setRows(d.withdrawals);setMin(d.settings.minimum_amount);setFee(d.settings.fee_percent)},[])
 useEffect(()=>{load().catch(e=>setError(e.message))},[load])
 const post=async(body:object)=>{const r=await fetch('/api/admin/withdrawals',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),d=await r.json();if(!r.ok)throw Error(d.error);return d}
 const review=async(id:string,action:'approve'|'reject')=>{setBusy(id);setError('');try{await post({id,action});await load()}catch(e){setError(e instanceof Error?e.message:'Request failed')}finally{setBusy('')}}
 const save=async()=>{setError('');try{await post({action:'settings',minimumAmount:min,feePercent:fee});await load()}catch(e){setError(e instanceof Error?e.message:'Settings save failed')}}
 return <div className="ad"><AdminSidebar active="withdrawal"/><main className="ad-main">
 <header className="ad-top"><div className="ad-top-title"><p className="ad-eyebrow">PAYMENT MANAGEMENT</p><h1>Withdrawal requests</h1></div></header>
 <section className="ad-panel"><h2>Withdrawal settings</h2>
  <div className="ad-inline-form" style={{marginTop:12}}>
   <label className="ad-field"><span className="ad-field-label">Minimum amount ৳</span><input type="number" min="1" value={min} onChange={e=>setMin(Number(e.target.value))}/></label>
   <label className="ad-field"><span className="ad-field-label">Fee %</span><input type="number" min="0" max="100" step="0.1" value={fee} onChange={e=>setFee(Number(e.target.value))}/></label>
   <button className="ad-btn ad-btn-primary" onClick={save}>Save settings</button>
  </div>
 </section>
 {error&&<p role="alert" className="ad-alert" style={{marginTop:16}}>{error}</p>}
 <section className="ad-panel"><div className="ad-table-wrap"><table className="ad-cards" style={{minWidth:950}}><thead><tr>{['User details','Wallet','Amount / fee / net','Status','Requested','Actions'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>
  {rows.map(r=><tr key={r.id}>
   <td data-label="User"><div className="ad-cell"><strong>{r.name}</strong><span className="ad-secondary">{r.phone}</span><span className="ad-secondary">{r.email}</span><span className="ad-secondary">ID: {r.user_id}</span></div></td>
   <td data-label="Wallet"><div className="ad-cell">{r.provider} · {r.account}</div></td>
   <td data-label="Amount"><div className="ad-cell"><strong>{money(r.amount)}</strong><span className="ad-secondary">fee {money(r.fee)} · net {money(r.net)}</span></div></td>
   <td data-label="Status"><div className="ad-cell"><span className={`ad-pill ad-${r.status}`}>{r.status}</span></div></td>
   <td data-label="Requested"><div className="ad-cell ad-muted">{new Date(r.created_at).toLocaleString()}</div></td>
   <td data-label="Actions"><div className="ad-cell">{r.status==='pending'?<span style={{display:'inline-flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}><button className="ad-btn ad-btn-primary ad-btn-sm" disabled={busy===r.id} onClick={()=>review(r.id,'approve')}>Approve</button><button className="ad-btn ad-btn-danger-ghost ad-btn-sm" disabled={busy===r.id} onClick={()=>review(r.id,'reject')}>Reject</button></span>:'—'}</div></td>
  </tr>)}
  {!rows.length&&<tr><td colSpan={6} className="ad-empty">No withdrawals</td></tr>}
 </tbody></table></div></section></main></div>
}
