"use client"

import { useEffect, useState } from "react"
import { useAppState } from "@/components/app/AppState"
import { bengaliNumber } from "@/lib/app-format"
type Tier = { id: string; icon: string; rank: string; amount: number; reqL1: number; reqL2: number; reqL3: number; enabled: boolean }

export default function TeamSalaryPage() {
  const { showToast } = useAppState()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [counts, setCounts] = useState([0,0,0])
  const [claimed, setClaimed] = useState(false)
  const [cycleLabel, setCycleLabel] = useState('মাস')
  useEffect(() => { fetch('/api/team',{credentials:'include',cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);return d}).then(d=>{const c=d.counts ?? [0,0,0]; setCounts(c); setTiers(d.config?.salary?.enabled ? (d.config.salary.tiers ?? []).filter((t:Tier)=>t.enabled) : []); const weekly=d.config?.salary?.cycle==='weekly';setCycleLabel(weekly?'সপ্তাহ':'মাস');const cycle=weekly?`w${Math.floor(Date.now()/604800000)}`:new Date().toISOString().slice(0,7); setClaimed((d.requests ?? []).some((r:{status:string;cycleKey:string})=>r.cycleKey===cycle&&(r.status==='pending'||r.status==='approved')))}).catch(()=>showToast('তথ্য লোড হয়নি')) }, [])
  const [claimAmount, setClaimAmount] = useState<number | null>(null)
  const claim = async (tierId: string) => {
    const response=await fetch('/api/team',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({tierId})})
    const data=await response.json()
    if(!response.ok){showToast(data.error ?? 'Դիմումը ձախողվեց');return}
    setClaimed(true)
    setClaimAmount(tiers.find(t=>t.id===tierId)?.amount ?? null)
  }

  return (
    <div className="salary-redesign min-h-screen pb-16" lang="bn">
      <style>{`
        .salary-redesign{font-family:'SolaimanLipi','Nikosh','Hind Siliguri',sans-serif;background:#f8fafc;color:#2e1c3a;-webkit-tap-highlight-color:transparent}
        .salary-redesign .app-header{background:linear-gradient(135deg,#0284c7 0%,#0369a1 100%)}
        .salary-redesign .salary-card-custom{background:#fff;border-radius:20px;border:1px solid #e9e3ed;box-shadow:0 4px 18px rgba(46,28,58,.03);transition:all .2s ease}
        .salary-redesign .salary-card-custom.unlocked{border:1.5px solid #10b981;background:#f0fdf4;box-shadow:0 4px 20px rgba(16,185,129,.08)}
        .salary-redesign .btn-claim-glow{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;box-shadow:0 4px 12px rgba(16,185,129,.35)}
        .salary-redesign .btn-locked-custom{background:#f1f5f9;color:#94a3b8;border:1px solid #e2e8f0}
        .salary-redesign .modal-overlay{background:rgba(15,23,42,.65);backdrop-filter:blur(8px)}
        .salary-redesign .modal-card{animation:salaryModalPop .35s cubic-bezier(.175,.885,.32,1.275) forwards}
        @keyframes salaryModalPop{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
      <main className="mx-auto max-w-md space-y-6 px-4 pt-6">
        <div className="space-y-4">
          {tiers.map((tier) => {
            const completed = counts[0] >= tier.reqL1 && counts[1] >= tier.reqL2 && counts[2] >= tier.reqL3
            const requirements = [
              tier.reqL1 > 0 ? `প্রথম জনগোষ্ঠী ${bengaliNumber(tier.reqL1)} জন` : "",
              tier.reqL2 > 0 ? `দ্বিতীয় লেভেল ${bengaliNumber(tier.reqL2)} জন` : "",
              tier.reqL3 > 0 ? `তৃতীয় জনগোষ্ঠী ${bengaliNumber(tier.reqL3)} জন` : "",
            ].filter(Boolean).join(", ")
            return (
              <article key={tier.rank} className={`salary-card-custom space-y-3 p-4 ${completed ? "unlocked" : ""}`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2e1c3a]"><span>{tier.icon}</span><span>{tier.rank}</span></div>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">{bengaliNumber(tier.amount)}৳ / {cycleLabel}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-lg leading-none text-emerald-600">•</span>
                  <p className="text-xs font-bold leading-relaxed text-slate-800">{requirements} সদস্য যুক্ত করলে প্রতি {cycleLabel} বেতন {bengaliNumber(tier.amount)}৳</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <div className="space-x-1 text-[10px] font-bold text-slate-400">
                    <span>L1: {bengaliNumber(counts[0])}/{bengaliNumber(tier.reqL1)}</span>
                    {tier.reqL2 > 0 && <span>| L2: {bengaliNumber(counts[1])}/{bengaliNumber(tier.reqL2)}</span>}
                    {tier.reqL3 > 0 && <span>| L3: {bengaliNumber(counts[2])}/{bengaliNumber(tier.reqL3)}</span>}
                  </div>
                  <button type="button" onClick={() => claim(tier.id)} disabled={!completed || claimed} className={`${completed ? 'btn-claim-glow' : 'btn-locked-custom'} rounded-xl px-4 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70`}>{claimed ? 'এই মাসে নেওয়া হয়েছে' : completed ? 'দাবি করুন' : 'শর্ত পূরণ হয়নি'}</button>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {claimAmount !== null && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onClick={() => setClaimAmount(null)}>
          <section className="modal-card relative w-full max-w-xs space-y-4 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="salary-claim-title" onClick={(event) => event.stopPropagation()}>
            <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">✓</div>
            <div className="space-y-1">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-emerald-600">আবেদন সফল হয়েছে</span>
              <h3 id="salary-claim-title" className="text-xl font-extrabold text-[#2e1c3a]">{bengaliNumber(claimAmount)}৳ বেতনের দাবি</h3>
              <p className="text-xs leading-relaxed text-slate-500">আপনার দাবীকৃত বেতন সফলভাবে জমা হয়েছে। অ্যাডমিন ভেরিফিকেশন শেষে আপনার ওয়ালেটে জমা হবে।</p>
            </div>
            <button type="button" onClick={() => { setClaimAmount(null); showToast("বেতনের আবেদন জমা হয়েছে") }} className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:opacity-95">ঠিক আছে</button>
          </section>
        </div>
      )}
    </div>
  )
}
