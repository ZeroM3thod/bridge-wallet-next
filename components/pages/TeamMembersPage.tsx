import { useEffect, useState } from "react"
import Icon from "@/components/app/Icon"
import { AppLink } from "@/components/app/AppLink"
import { bengaliNumber, money } from "@/lib/app-format"
type Member={level:number;id:string;name:string;phone:string;joinedAt:number;active:number;vipLevel:number|null;deposit:number;profit:number}
type Data={config:any;members:Member[];counts:number[]}
export default function TeamMembersPage(){
 const [level,setLevel]=useState(1),[data,setData]=useState<Data|null>(null),[error,setError]=useState("")
 useEffect(()=>{fetch("/api/team",{credentials:"include",cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setData(d)}).catch(e=>setError(e.message||"কমিশনের তথ্য লোড হয়নি"))},[])
 const c=data?.config?.commissions?.levels?.find((x:any)=>x.level===level),rate=c?.enabled===false?{depositBonus:0,profitCommission:0}:c
 const members=data?.members?.filter(m=>m.level===level)??[]
 const depRate=rate?.depositBonus??0,profitRate=rate?.profitCommission??0
 const depositCommission=members.reduce((s,m)=>s+m.deposit*depRate/100,0),profitCommission=members.reduce((s,m)=>s+m.profit*profitRate/100,0)
  return <main className="team-page page-content"><section className="team-levels"><h2><i/> সদস্য ও কমিশন</h2>
  <div className="level-tabs">{([1,2,3] as const).map(item=><button className={level===item?"active":""} key={item} onClick={()=>setLevel(item)}>লেভেল {bengaliNumber(item)}<span>({bengaliNumber(item===level?profitRate:data?.config?.commissions?.levels?.find((x:any)=>x.level===item)?.profitCommission??0)}%)</span></button>)}</div>
  {!data&&<div className="team-card p-4">{error||"কমিশনের তথ্য লোড হচ্ছে…"}</div>}
  <div className="level-stats team-card"><div className="level-stats-head"><div><small>লেভেল {bengaliNumber(level)} ({bengaliNumber(depRate)}% ডিপোজিট · {bengaliNumber(profitRate)}% প্রফিট)</small><strong>সদস্য: {bengaliNumber(members.length)} জন <em>({bengaliNumber(members.filter(m=>m.active).length)} জন সক্রিয়)</em></strong></div><div><small>এই লেভেলের আনুমানিক কমিশন</small><strong>{money(depositCommission+profitCommission)}</strong></div></div><div className="level-income"><div><small><Icon name="wallet" size={13}/> ডিপোজিট কমিশন ({bengaliNumber(depRate)}%)</small><strong>{money(depositCommission)}</strong></div><div><small><Icon name="chart" size={13}/> প্রফিট কমিশন ({bengaliNumber(profitRate)}%)</small><strong>{money(profitCommission)}</strong></div></div></div>
  {data&&members.length===0&&<p className="team-card p-4 text-center">এই লেভেলে রেফারেল সদস্য নেই; তাই কমিশন ৳০.০০। সদস্য যুক্ত হলে জমা ও লাভের ভিত্তিতে কমিশন হিসাব হবে।</p>}
  <div className="referral-list">{members.map(m=><article className="referral-member" key={m.id}><header className="referral-member-header"><div className="referral-mobile"><span className="referral-avatar"><Icon name="user" size={18}/></span><div><span className="referral-label">মোবাইল নম্বর</span><strong>{m.phone}</strong></div></div><span className={`referral-status ${m.active?"is-active":""}`}><i/>{m.active?"সক্রিয়":"নিষ্ক্রিয়"}</span></header><dl className="referral-details"><div><dt>সদস্য আইডি</dt><dd>{m.id}</dd></div><div><dt>VIP</dt><dd>{m.vipLevel??"—"}</dd></div><div><dt>মোট ডিপোজিট</dt><dd>{money(m.deposit)}</dd></div><div><dt>ডিপোজিট কমিশন ({bengaliNumber(depRate)}%)</dt><dd>{money(m.deposit*depRate/100)}</dd></div><div><dt>প্রফিট কমিশন ({bengaliNumber(profitRate)}%)</dt><dd>{money(m.profit*profitRate/100)}</dd></div></dl><footer className="referral-member-footer"><span>যোগদান: {new Date(m.joinedAt).toLocaleDateString("bn-BD")}</span></footer></article>)}</div>
 </section></main>
}
