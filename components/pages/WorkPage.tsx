import { useEffect, useState } from "react"
import Icon from "@/components/app/Icon"
import { AppLink } from "@/components/app/AppLink"
import { bengaliNumber, money } from "@/lib/app-format"

type Package = { id: string; packageId: string; name: string; amount: number; dailyRate: number; durationDays: number; startedAt: number; expiresAt: number; status: string }
type Profit = { id: string; packageId: string; day: number; amount: number; createdAt: number }

export default function WorkPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [profits, setProfits] = useState<Profit[]>([])
  const [error, setError] = useState("")
  useEffect(() => { fetch('/api/work', { credentials: 'include', cache: 'no-store' }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setPackages(d.packages); setProfits(d.profits) }).catch(e => setError(e.message || 'ডেটা লোড করা যায়নি')) }, [])
  const active = packages.filter(p => p.status === 'active' && p.expiresAt > Date.now())
  const earned = profits.reduce((sum, p) => sum + p.amount, 0)
  const schedule = new Map<string, { day: number; amount: number }>()
  for (const pkg of active) {
    const elapsed = Math.max(0, Math.floor((Date.now() - pkg.startedAt) / 86400000))
    const remaining = Math.max(0, pkg.durationDays - elapsed)
    for (let i = 0; i < remaining; i++) {
      const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() + i)
      const key = date.toISOString().slice(0, 10)
      const daily = Math.round(pkg.amount * Math.pow(1 + pkg.dailyRate / 100, elapsed + i) * pkg.dailyRate / 100)
      const row = schedule.get(key) ?? { day: i + 1, amount: 0 }
      row.amount += daily
      schedule.set(key, row)
    }
  }
  const profitDays = [...schedule.entries()].sort(([a], [b]) => a.localeCompare(b))
  return <main className="earn-page work-investment-page page-content">
    <section className="earn-hero"><div className="earn-hero-icon"><Icon name="work" size={38} /></div><div><span className="earn-kicker">দৈনিক আয়</span><h1>আপনার কর্মক্ষেত্র</h1><p>ডাটাবেসে জমা প্যাকেজ ও লাভ</p></div><div className="earn-overview"><div><small>সক্রিয় প্যাকেজ</small><strong>{bengaliNumber(active.length)}টি</strong></div><div><small>এ পর্যন্ত ক্রেডিট হয়েছে</small><strong>{money(earned)}</strong></div></div></section>
    {error && <p role="alert">{error}</p>}
    <section className="package-section"><div className="package-heading"><div><span><Icon name="wallet" size={21} /></span><div><h2>আপনার প্যাকেজ</h2><p>মূলধন এবং বাস্তব স্ট্যাটাস</p></div></div></div>
      {packages.length ? packages.map(p => <article className="active-package-card" key={p.id}><div className="active-package-head"><span><Icon name="check" size={21} /></span><div><h3>{p.name}</h3><small>{bengaliNumber(p.durationDays)} দিনের মেয়াদ</small></div><b>{p.status === 'active' && p.expiresAt > Date.now() ? 'সক্রিয়' : 'শেষ'}</b></div><div className="active-package-metrics">{[["প্যাকেজ মূল্য",money(p.amount)],["দৈনিক হার",`${bengaliNumber(p.dailyRate)}%`],["দৈনিক লাভ",money(Math.round(p.amount*p.dailyRate/100))],["জমা লাভ",money(profits.filter(x=>x.packageId===p.id).reduce((s,x)=>s+x.amount,0))]].map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><div className="active-package-dates"><div><small>শুরুর তারিখ</small><strong>{new Date(p.startedAt).toLocaleDateString('bn-BD')}</strong></div><div><small>শেষ তারিখ</small><strong>{new Date(p.expiresAt).toLocaleDateString('bn-BD')}</strong></div></div></article>) : !error && <div className="investment-empty"><span><Icon name="work" size={42} /></span><h2>প্যাকেজ সক্রিয় নয়</h2><p>প্যাকেজ বেছে নিন</p><AppLink page="earn">প্যাকেজ বেছে নিন</AppLink></div>}
    </section>
    <section className="daily-ledger"><div className="package-heading"><div><span><Icon name="calendar" size={21} /></span><div><h2>দৈনিক লাভের হিসাব</h2><p>সক্রিয় প্যাকেজগুলোর সম্মিলিত দৈনিক লাভ</p></div></div></div><div className="daily-profit-list">{profitDays.map(([date, row])=><article key={date}><span>{bengaliNumber(row.day)}</span><div><strong>দিন-{bengaliNumber(row.day)}</strong><small>{new Date(`${date}T00:00:00`).toLocaleDateString('bn-BD')}</small></div><b>+ {money(row.amount)}</b></article>)}</div></section>
  </main>
}
