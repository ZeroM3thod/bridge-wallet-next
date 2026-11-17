import { useEffect, useState } from "react"
import Icon from "@/components/app/Icon"
import { AppLink } from "@/components/app/AppLink"
import { bengaliNumber, money, toBengaliDigits } from "@/lib/app-format"
type Member={level:number;id:string;name:string;phone:string;joinedAt:number;active:number;vipLevel:number|null;deposit:number;profit:number}
type Data={config:any;members:Member[];counts:number[]}
export default function TeamMembersPage(){
 const [level,setLevel]=useState(1),[data,setData]=useState<Data|null>(null),[error,setError]=useState("")
 useEffect(()=>{fetch("/api/team",{credentials:"include",cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setData(d)}).catch(e=>setError(e.message||"কমিশনের তথ্য লোড হয়নি"))},[])
 const c=data?.config?.commissions?.levels?.find((x:any)=>x.level===level),rate=c?.enabled===false?{depositBonus:0,profitCommission:0}:c
 const members=data?.members?.filter(m=>m.level===level)??[]
 const depRate=rate?.depositBonus??0,profitRate=rate?.profitCommission??0
 const depositCommission=members.reduce((s,m)=>s+m.deposit*depRate/100,0),profitCommission=members.reduce((s,m)=>s+m.profit*profitRate/100,0)
 const activeCount=members.filter(m=>m.active).length
 return (
  <main className="team-page page-content tm-page">
   <section className="tm-section">
    <header className="tm-title">
     <span className="tm-title-icon"><Icon name="user" size={18}/></span>
     <h2>সদস্য ও কমিশন</h2>
    </header>

    <div className="tm-tabs" role="tablist">
     {([1,2,3] as const).map(item=>{
      const pr=item===level?profitRate:data?.config?.commissions?.levels?.find((x:any)=>x.level===item)?.profitCommission??0
      return (
       <button role="tab" aria-selected={level===item} className={`tm-tab ${level===item?"active":""}`} key={item} onClick={()=>setLevel(item)}>
        <b>লেভেল {bengaliNumber(item)}</b>
        <span>({bengaliNumber(pr)}%)</span>
       </button>
      )
     })}
    </div>

    {!data&&<div className="tm-loading">{error||"কমিশনের তথ্য লোড হচ্ছে…"}</div>}

    <div className="tm-hero">
     <div className="tm-hero-glow"/>
     <div className="tm-hero-top">
      <div>
       <small>লেভেল {bengaliNumber(level)} ({bengaliNumber(depRate)}% ডিপোজিট · {bengaliNumber(profitRate)}% প্রফিট)</small>
       <strong className="tm-hero-members">সদস্য: {bengaliNumber(members.length)} জন <em>({bengaliNumber(activeCount)} জন সক্রিয়)</em></strong>
      </div>
      <div className="tm-hero-total">
       <small>এই লেভেলের আনুমানিক কমিশন</small>
       <strong>{money(depositCommission+profitCommission)}</strong>
      </div>
     </div>
     <div className="tm-hero-split">
      <div>
       <span className="tm-split-icon"><Icon name="wallet" size={14}/></span>
       <div>
        <small>ডিপোজিট কমিশন ({bengaliNumber(depRate)}%)</small>
        <strong>{money(depositCommission)}</strong>
       </div>
      </div>
      <div>
       <span className="tm-split-icon"><Icon name="chart" size={14}/></span>
       <div>
        <small>প্রফিট কমিশন ({bengaliNumber(profitRate)}%)</small>
        <strong>{money(profitCommission)}</strong>
       </div>
      </div>
     </div>
    </div>

    {data&&members.length===0&&<p className="tm-empty">এই লেভেলে রেফারেল সদস্য নেই; তাই কমিশন ৳০.০০। সদস্য যুক্ত হলে জমা ও লাভের ভিত্তিতে কমিশন হিসাব হবে।</p>}

    <div className="tm-list">
     {members.map(m=>(
      <article className="tm-member" key={m.id}>
       <header className="tm-member-head">
        <div className="tm-member-id">
         <span className={`tm-avatar ${m.active?"is-active":""}`}><Icon name="user" size={18}/></span>
         <div>
          <span className="tm-label">মোবাইল নম্বর</span>
          <strong>{toBengaliDigits(m.phone)}</strong>
         </div>
        </div>
        <span className={`tm-status ${m.active?"is-active":""}`}><i/>{m.active?"সক্রিয়":"নিষ্ক্রিয়"}</span>
       </header>

       <dl className="tm-info">
        <div><dt>সদস্য আইডি</dt><dd>{toBengaliDigits(m.id)}</dd></div>
        <div><dt>অভিজাত ধাপ</dt><dd>{bengaliNumber(m.vipLevel ?? 0)}</dd></div>
        <div className="wide"><dt>মোট জমা</dt><dd>{money(m.deposit)}</dd></div>
       </dl>

       <div className="tm-earn">
        <div>
         <small>জমা কমিশন ({bengaliNumber(depRate)}%)</small>
         <strong>{money(m.deposit*depRate/100)}</strong>
        </div>
        <div>
         <small>লাভ কমিশন ({bengaliNumber(profitRate)}%)</small>
         <strong>{money(m.profit*profitRate/100)}</strong>
        </div>
       </div>

       <footer className="tm-member-foot">
        <Icon name="user" size={12}/>
        <span>যোগদানের তারিখ: {new Date(m.joinedAt).toLocaleDateString("bn-BD")}</span>
       </footer>
      </article>
     ))}
    </div>
   </section>
  </main>
 )
}