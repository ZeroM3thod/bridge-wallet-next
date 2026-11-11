"use client"

import { useState } from "react"
import { AppLink } from "@/components/app/AppLink"
import { useAppState } from "@/components/app/AppState"
import { teamData, salaryTiers } from "@/lib/app-data"
import { bengaliNumber } from "@/lib/app-format"

export default function TeamSalaryPage() {
  const { showToast, setBalance, claimedTier, setClaimedTier } = useAppState()
  const [claimAmount, setClaimAmount] = useState<number | null>(null)
  const stats = { l1: teamData[1].active, l2: teamData[2].active, l3: teamData[3].active }

  const claim = (index: number, amount: number) => {
    if (claimedTier !== null) return
    setClaimedTier(index)
    setBalance((balance) => balance + amount)
    setClaimAmount(amount)
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
      <header className="app-header sticky top-0 z-50 px-4 py-3.5 text-white shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <AppLink page="team" className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20">← ফিরে যান</AppLink>
          <h1 className="flex-1 text-center text-base font-bold">বেতন ও লেভেল সিস্টেম</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 pt-6">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <svg className="h-20 w-20 text-[#3b1e54]" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
            <path d="M50 12 L56 22 L67 18 L62 27 L50 24 L38 27 L33 18 L44 22 Z" />
            <circle cx="50" cy="11" r="1.5" /><circle cx="33" cy="17" r="1" /><circle cx="67" cy="17" r="1" />
            <path d="M48 29 L52 29 L55 35 L45 35 Z" /><path d="M44 38 L56 38 L60 47 L40 47 Z" />
            <path d="M38 50 L62 50 L66 61 L34 61 Z" /><path d="M32 64 L68 64 L72 75 L28 75 Z" />
          </svg>
          <h2 className="text-2xl font-bold tracking-tight text-[#2e1c3a]">বেতন ও লেভেল সিস্টেম</h2>
        </div>

        <div className="space-y-4">
          {salaryTiers.map((tier, index) => {
            const completed = stats.l1 >= tier.req.l1 && stats.l2 >= tier.req.l2 && stats.l3 >= tier.req.l3
            const requirements = [
              tier.req.l1 > 0 ? `প্রথম জনগোষ্ঠী ${bengaliNumber(tier.req.l1)} জন` : "",
              tier.req.l2 > 0 ? `দ্বিতীয় জনগোষ্ঠী ${bengaliNumber(tier.req.l2)} জন` : "",
              tier.req.l3 > 0 ? `তৃতীয় জনগোষ্ঠী ${bengaliNumber(tier.req.l3)} জন` : "",
            ].filter(Boolean).join(", ")
            return (
              <article key={tier.rank} className={`salary-card-custom space-y-3 p-4 ${completed ? "unlocked" : ""}`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2e1c3a]"><span>{tier.icon}</span><span>{tier.rank}</span></div>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">{bengaliNumber(tier.amount)}৳ / মাস</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-lg leading-none text-emerald-600">•</span>
                  <p className="text-xs font-bold leading-relaxed text-slate-800">{requirements} সদস্য যুক্ত করলে মাসিক বেতন {bengaliNumber(tier.amount)}৳</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <div className="space-x-1 text-[10px] font-bold text-slate-400">
                    <span>L1: {bengaliNumber(stats.l1)}/{bengaliNumber(tier.req.l1)}</span>
                    {tier.req.l2 > 0 && <span>| L2: {bengaliNumber(stats.l2)}/{bengaliNumber(tier.req.l2)}</span>}
                    {tier.req.l3 > 0 && <span>| L3: {bengaliNumber(stats.l3)}/{bengaliNumber(tier.req.l3)}</span>}
                  </div>
                  {completed ? (
                    <button type="button" onClick={() => claim(index, tier.amount)} disabled={claimedTier !== null} className="btn-claim-glow rounded-xl px-4 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60">দাবি করুন</button>
                  ) : <button type="button" disabled className="btn-locked-custom cursor-not-allowed rounded-xl px-3.5 py-1.5 text-xs font-bold">শর্ত পূরণ হয়নি</button>}
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
