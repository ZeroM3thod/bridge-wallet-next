import { useEffect, useState } from "react"
import Icon from "@/components/app/Icon"
import { AppLink } from "@/components/app/AppLink"
import { bengaliNumber, money } from "@/lib/app-format"

type Package = { id: string; packageId: string; name: string; amount: number; dailyProfit: number; durationDays: number; startedAt: number; expiresAt: number; nextProfitAt: number; status: string }
type Profit = { id: string; packageId: string; day: number; amount: number; createdAt: number }

export default function WorkPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [profits, setProfits] = useState<Profit[]>([])
  const [error, setError] = useState("")
  const [now, setNow] = useState(Date.now())
  const [claiming, setClaiming] = useState("")
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  const load = async () => { const r = await fetch('/api/work', { credentials: 'include', cache: 'no-store' }); const d = await r.json(); if (!r.ok) throw new Error(d.error); setPackages(d.packages); setProfits(d.profits) }
  useEffect(() => { load().catch(e => setError(e.message || 'ডেটা লোড করা যায়নি')) }, [])
  const claim = async (pkg: Package) => {
    setClaiming(pkg.id); setError("")
    try {
      const r = await fetch('/api/work/claim', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: pkg.id }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'লাভ জমা করা যায়নি')
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'লাভ জমা করা যায়নি') }
    finally { setClaiming("") }
  }
  const active = packages.filter(p => p.status === 'active' && p.expiresAt > Date.now())
  const earned = profits.reduce((sum, p) => sum + p.amount, 0)
  const nextCredits = active
  return <main className="earn-page work-investment-page page-content">
    <section className="earn-hero"><div className="earn-hero-icon"><Icon name="work" size={38} /></div><div><span className="earn-kicker">দৈনিক আয়</span><h1>আপনার কর্মক্ষেত্র</h1><p>ডাটাবেসে জমা প্যাকেজ ও লাভ</p></div><div className="earn-overview"><div><small>সক্রিয় প্যাকেজ</small><strong>{bengaliNumber(active.length)}টি</strong></div><div><small>এ পর্যন্ত ক্রেডিট হয়েছে</small><strong>{money(earned)}</strong></div></div></section>
    {error && <p role="alert">{error}</p>}
    <section className="package-section"><div className="package-heading"><div><span><Icon name="wallet" size={21} /></span><div><h2>আপনার প্যাকেজ</h2><p>মূলধন এবং বাস্তব স্ট্যাটাস</p></div></div></div>
       {packages.length ? packages.map(p => { const remaining = Math.max(0, p.nextProfitAt - now); const ready = remaining === 0 && p.status === 'active' && p.expiresAt > now; const progress = Math.min(100, Math.max(0, (1 - remaining / 86400000) * 100)); return <article className="active-package-card" key={p.id}><div className="active-package-head"><span><Icon name="check" size={21} /></span><div><h3>{p.name}</h3><small>{bengaliNumber(p.durationDays)} দিনের মেয়াদ</small></div><b>{p.status === 'active' && p.expiresAt > now ? 'সক্রিয়' : 'শেষ'}</b></div><div className="active-package-metrics">{[["প্যাকেজ মূল্য",money(p.amount)],["দৈনিক নির্ধারিত লাভ",money(p.dailyProfit)],["জমা লাভ",money(profits.filter(x=>x.packageId===p.id).reduce((s,x)=>s+x.amount,0))]].map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><div className="active-package-dates"><div><small>শুরুর তারিখ</small><strong>{new Date(p.startedAt).toLocaleDateString('bn-BD')}</strong></div><div><small>শেষ তারিখ</small><strong>{new Date(p.expiresAt).toLocaleDateString('bn-BD')}</strong></div></div>{p.status === 'active' && p.expiresAt > now && <div className="package-profit-claim"><span className="profit-countdown" style={{ background: `conic-gradient(#008ad9 ${progress}%, #dbeafe ${progress}%)` }}><span>{ready ? 'এখন' : `${bengaliNumber(Math.floor(remaining / 3600000))}ঘ ${bengaliNumber(Math.floor(remaining % 3600000 / 60000))}মি`}</span></span><button type="button" onClick={() => claim(p)} disabled={!ready || claiming === p.id}>{claiming === p.id ? 'জমা হচ্ছে…' : 'লাভ সংগ্রহ করুন'}</button></div>}</article> }) : !error && <div className="investment-empty"><span><Icon name="work" size={42} /></span><h2>প্যাকেজ সক্রিয় নয়</h2><p>প্যাকেজ বেছে নিন</p><AppLink page="earn">প্যাকেজ বেছে নিন</AppLink></div>}
    </section>
      <section className="daily-ledger"><div className="package-heading"><div><span><Icon name="calendar" size={21} /></span><div><h2>দৈনিক লাভের হিসাব</h2><p>প্রতিটি সক্রিয় প্যাকেজের পরবর্তী লাভ জমার বিবরণ</p></div></div></div><div className="daily-profit-list">{nextCredits.length ? nextCredits.map((pkg, index)=><article key={pkg.id}><span>{bengaliNumber(index + 1)}</span><div><strong>{pkg.name}</strong><small>পরবর্তী লাভ জমা: {new Date(pkg.nextProfitAt).toLocaleString('bn-BD')}</small></div><b>+ {money(pkg.dailyProfit)}</b></article>) : <p>এখন কোনো সক্রিয় প্যাকেজ নেই।</p>}</div></section>
  </main>
}
