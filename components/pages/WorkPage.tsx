"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Icon from "@/components/app/Icon"
import { AppLink } from "@/components/app/AppLink"
import { bengaliNumber, money } from "@/lib/app-format"

type Package = {
  id: string
  packageId: string
  name: string
  amount: number
  dailyProfit: number
  durationDays: number
  startedAt: number
  expiresAt: number
  nextProfitAt: number
  status: string
}

type Profit = {
  id: string
  packageId: string
  day: number
  amount: number
  createdAt: number
}

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000
const MIN_MS = 60_000

const LOAD_ERROR = "ডেটা লোড করা যায়নি"
const CLAIM_ERROR = "লাভ জমা করা যায়নি"

function countdownParts(ms: number): [string, string] {
  const h = Math.floor(ms / HOUR_MS)
  const m = Math.floor((ms % HOUR_MS) / MIN_MS)
  const s = Math.floor((ms % MIN_MS) / 1000)
  if (h > 0) return [`${bengaliNumber(h)}ঘ`, `${bengaliNumber(m)}মি`]
  return [`${bengaliNumber(m)}মি`, `${bengaliNumber(s)}সে`]
}

const clamp = (n: number) => Math.min(100, Math.max(0, n))
const formatDate = (ts: number) => new Date(ts).toLocaleDateString("bn-BD")
const formatDateTime = (ts: number) => new Date(ts).toLocaleString("bn-BD")

export const WORK_CSS = `
/* Work page — scoped styles (wk-*). Platform blue palette only. */
.wk-page.page-content {
  display: grid;
  gap: 10px;
  width: 100%;
  max-width: 720px;
  margin-inline: auto;
  padding: 10px 10px 22px;
  color: #000;
  background: #f4faff;
}
.wk-page.page-content :is(h1, h2, h3, p, small, dl, dd, ul) { margin: 0; }
.wk-page.page-content ul { padding: 0; list-style: none; }
.wk-page.page-content :is(dt, dd, small, strong, b, h1, h2, h3, p) { overflow-wrap: anywhere; }

/* ---------- Hero ---------- */
.wk-page.page-content .wk-hero {
  position: relative;
  display: grid;
  gap: 10px;
  padding: 14px;
  overflow: hidden;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, #0758c9, #079add);
  box-shadow: 0 8px 20px rgba(0, 104, 196, .16);
}
.wk-page.page-content .wk-hero::after {
  position: absolute;
  top: -44px;
  right: -38px;
  width: 120px;
  height: 120px;
  border: 18px solid rgba(255, 255, 255, .09);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}
.wk-page.page-content .wk-hero-top { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; }
.wk-page.page-content .wk-hero-icon {
  display: grid;
  flex: 0 0 42px;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, .35);
  border-radius: 50%;
  background: rgba(255, 255, 255, .15);
}
.wk-page.page-content .wk-hero-text { min-width: 0; }
.wk-page.page-content .wk-chip {
  display: inline-block;
  padding: 1px 9px;
  border-radius: 999px;
  color: #dff6ff;
  background: rgba(255, 255, 255, .14);
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.5;
}
.wk-page.page-content .wk-hero h1 { margin-top: 2px; color: #fff; font-size: clamp(18px, 5vw, 21px); font-weight: 700; line-height: 1.3; }
.wk-page.page-content .wk-hero p { margin-top: 1px; color: #e5f5ff; font-size: 12px; line-height: 1.4; }
.wk-page.page-content .wk-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding-top: 9px;
  border-top: 1px solid rgba(255, 255, 255, .22);
  text-align: center;
}
.wk-page.page-content .wk-stats > div { min-width: 0; padding: 0 8px; border-right: 1px solid rgba(255, 255, 255, .2); }
.wk-page.page-content .wk-stats > div:last-child { border-right: 0; }
.wk-page.page-content .wk-stats dt { color: #d9efff; font-size: 11.5px; line-height: 1.35; }
.wk-page.page-content .wk-stats dd { margin-top: 1px; color: #fff; font-size: 15px; font-weight: 700; line-height: 1.3; }

/* ---------- Alert ---------- */
.wk-page.page-content .wk-alert {
  padding: 8px 11px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #b42318;
  background: #fff1f2;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.45;
}

/* ---------- Section shell ---------- */
.wk-page.page-content .wk-section {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e2eef8;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 5px 14px rgba(12, 91, 145, .06);
}
.wk-page.page-content .wk-section-head { display: flex; align-items: center; gap: 9px; }
.wk-page.page-content .wk-section-icon {
  display: grid;
  flex: 0 0 32px;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #315a78;
  background: #eaf5ff;
}
.wk-page.page-content .wk-section-head > div { min-width: 0; flex: 1; }
.wk-page.page-content .wk-section-head h2 { color: #000; font-size: 15px; font-weight: 700; line-height: 1.3; }
.wk-page.page-content .wk-section-head p { margin-top: 0; color: #315a78; font-size: 11.5px; line-height: 1.35; }
.wk-page.page-content .wk-card-title :is(p, small, time),
.wk-page.page-content .wk-card :is(dt, .wk-muted),
.wk-page.page-content .wk-ledger small { color: #315a78; }
.wk-page.page-content .wk-card :is(h1, h2, h3, strong, b, dd) { color: #000; }
.wk-page.page-content .wk-profit strong,
.wk-page.page-content .wk-pair dd,
.wk-page.page-content .wk-life-dates b,
.wk-page.page-content .wk-ledger li > b,
.wk-page.page-content .wk-ring-inner strong { color: #15803d; }
.wk-page.page-content .wk-section-head p,
.wk-page.page-content .wk-card-title small,
.wk-page.page-content .wk-muted,
.wk-page.page-content .wk-profit small,
.wk-page.page-content .wk-pair dt,
.wk-page.page-content .wk-life-dates small,
.wk-page.page-content .wk-empty p,
.wk-page.page-content .wk-ledger small,
.wk-page.page-content .wk-badge.is-ended { color: #000; }
.wk-page.page-content .wk-count {
  flex: none;
  padding: 2px 9px;
  border-radius: 999px;
  color: #0870c8;
  background: #eef8ff;
  font-size: 11.5px;
  font-weight: 700;
}
.wk-page.page-content .wk-muted { padding: 12px; border-radius: 10px; color: #315a78; background: #f5fbff; font-size: 12.5px; text-align: center; }

/* ---------- Package card ---------- */
.wk-page.page-content .wk-list { display: grid; gap: 10px; }
.wk-page.page-content .wk-card {
  display: grid;
  gap: 10px;
  padding: 11px;
  border: 1px solid #d9eaf6;
  border-radius: 14px;
  background: linear-gradient(145deg, #fff, #f5faff);
}
.wk-page.page-content .wk-card.is-ready { border-color: #008ad9; box-shadow: 0 0 0 2px rgba(0, 138, 217, .1); }
.wk-page.page-content .wk-card.is-ended { opacity: .8; }

.wk-page.page-content .wk-card-head { display: flex; align-items: center; gap: 9px; }
.wk-page.page-content .wk-card-icon {
  display: grid;
  flex: 0 0 34px;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(145deg, #0869cf, #08a8df);
  box-shadow: 0 4px 10px rgba(0, 112, 201, .18);
}
.wk-page.page-content .is-ended .wk-card-icon { background: linear-gradient(145deg, #94a3b8, #64748b); box-shadow: none; }
.wk-page.page-content .wk-card-title { min-width: 0; flex: 1; }
.wk-page.page-content .wk-card-title h3 { color: #000; font-size: 14.5px; font-weight: 700; line-height: 1.25; }
.wk-page.page-content .wk-card-title small { display: block; margin-top: 1px; color: #315a78; font-size: 11.5px; }
.wk-page.page-content .wk-badge { flex: none; padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; line-height: 1.4; white-space: nowrap; }
.wk-page.page-content .wk-badge.is-active { color: #15803d; background: #dcfce7; }
.wk-page.page-content .wk-badge.is-ended { color: #315a78; background: #eaf5ff; }

/* ring + figures */
.wk-page.page-content .wk-body { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 12px; }
.wk-page.page-content .wk-ring {
  position: relative;
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  border-radius: 50%;
}
.wk-page.page-content .wk-ring::before {
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  background: #fff;
  content: '';
}
.wk-page.page-content .wk-ring-inner { position: relative; z-index: 1; display: grid; justify-items: center; text-align: center; }
.wk-page.page-content .wk-ring-inner strong { color: #15803d; font-size: 12.5px; font-weight: 700; line-height: 1.25; }
.wk-page.page-content .wk-grab {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  align-content: center;
  width: calc(100% - 14px);
  height: calc(100% - 14px);
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(145deg, #0869cf, #08a8df);
  box-shadow: 0 3px 8px rgba(0, 102, 190, .28);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
}
.wk-page.page-content .wk-grab span { display: block; }
.wk-page.page-content .wk-grab:disabled { opacity: .6; cursor: not-allowed; }
.wk-page.page-content .wk-grab:focus-visible { outline: 3px solid rgba(0, 138, 217, .4); outline-offset: 2px; }

.wk-page.page-content .wk-figures { display: grid; gap: 6px; min-width: 0; }
.wk-page.page-content .wk-profit {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid #dcebf7;
  border-radius: 10px;
  background: #eef8ff;
}
.wk-page.page-content .wk-profit small { color: #315a78; font-size: 11.5px; }
.wk-page.page-content .wk-profit strong { color: #15803d; font-size: 15px; font-weight: 700; line-height: 1.25; white-space: nowrap; }
.wk-page.page-content .wk-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.wk-page.page-content .wk-pair > div { min-width: 0; padding: 6px 9px; border: 1px solid #deedf7; border-radius: 10px; background: #f8fcff; }
.wk-page.page-content .wk-pair dt { color: #315a78; font-size: 11px; line-height: 1.3; }
.wk-page.page-content .wk-pair dd { margin-top: 1px; color: #15803d; font-size: 13px; font-weight: 700; line-height: 1.3; }

/* lifetime */
.wk-page.page-content .wk-life { display: grid; gap: 4px; }
.wk-page.page-content .wk-life-bar { height: 6px; overflow: hidden; border-radius: 999px; background: #dbeafe; }
.wk-page.page-content .wk-life-bar i { display: block; height: 100%; border-radius: inherit; background: #008ad9; }
.wk-page.page-content .wk-life-dates { display: flex; justify-content: space-between; gap: 8px; }
.wk-page.page-content .wk-life-dates small { color: #315a78; font-size: 11px; }
.wk-page.page-content .wk-life-dates b { color: #15803d; font-weight: 700; }

/* ---------- Empty ---------- */
.wk-page.page-content .wk-empty {
  display: flex;
  min-height: 190px;
  padding: 18px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #9ed7ed;
  border-radius: 12px;
  background: #f5fbff;
  text-align: center;
}
.wk-page.page-content .wk-empty > span {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(145deg, #0871d2, #08a9df);
  box-shadow: 0 6px 14px rgba(0, 112, 201, .18);
}
.wk-page.page-content .wk-empty h2 { color: #000; font-size: 16px; font-weight: 700; }
.wk-page.page-content .wk-empty p { margin-top: 2px; color: #315a78; font-size: 12.5px; line-height: 1.5; }
.wk-page.page-content .wk-empty a {
  margin-top: 11px;
  padding: 8px 20px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #0871d2, #079edf);
  box-shadow: 0 4px 11px rgba(0, 112, 201, .18);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

/* ---------- Ledger ---------- */
.wk-page.page-content .wk-ledger { display: grid; gap: 6px; }
.wk-page.page-content .wk-ledger li {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding: 7px 10px 7px 7px;
  border: 1px solid #deedf7;
  border-radius: 999px;
  background: linear-gradient(100deg, #f8fcff, #fff);
}
.wk-page.page-content .wk-ledger-no {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(145deg, #0871d2, #08a9df);
  font-size: 12px;
  font-weight: 700;
}
.wk-page.page-content .wk-ledger strong { display: block; color: #000; font-size: 13px; font-weight: 700; line-height: 1.3; }
.wk-page.page-content .wk-ledger small { display: block; color: #315a78; font-size: 11px; line-height: 1.3; }
.wk-page.page-content .wk-ledger li > b { color: #15803d; font-size: 13px; font-weight: 700; white-space: nowrap; }

/* ---------- Skeleton ---------- */
.wk-page.page-content .wk-skeleton {
  height: 200px;
  border-radius: 14px;
  background: linear-gradient(90deg, #e3f1fc 25%, #f2f9ff 50%, #e3f1fc 75%);
  background-size: 200% 100%;
  animation: wk-shimmer 1.3s linear infinite;
}
@keyframes wk-shimmer { to { background-position: -200% 0; } }

/* ---------- Responsive ---------- */
@media (min-width: 600px) {
  .wk-page.page-content .wk-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 380px) {
  .wk-page.page-content { padding: 8px 8px 20px; }
  .wk-page.page-content .wk-body { gap: 9px; }
  .wk-page.page-content .wk-ring { width: 78px; height: 78px; }
  .wk-page.page-content .wk-ring::before { inset: 6px; }
  .wk-page.page-content .wk-ring-inner strong { font-size: 10px; }
  .wk-page.page-content .wk-ring-inner small { font-size: 9px; }
  .wk-page.page-content .wk-body { grid-template-columns: 78px minmax(0, 1fr); gap: 8px; }
  .wk-page.page-content .wk-pair { gap: 5px; }
  .wk-page.page-content .wk-pair > div { padding: 7px 6px; }
  .wk-page.page-content .wk-pair dd { font-size: 12px; }
  .wk-page.page-content .wk-profit { padding: 8px; }
  .wk-page.page-content .wk-profit strong { font-size: 16px; }
  .wk-page.page-content .wk-grab { font-size: 11px; }
  .wk-page.page-content .wk-profit { flex-direction: column; align-items: flex-start; gap: 0; }
  .wk-page.page-content .wk-ledger li { grid-template-columns: 28px minmax(0, 1fr); border-radius: 18px; }
  .wk-page.page-content .wk-ledger li > b { grid-column: 2; justify-self: start; }
}
@media (max-width: 340px) {
  .wk-page.page-content .wk-pair { grid-template-columns: minmax(0, 1fr); }
  .wk-page.page-content .wk-life-dates { flex-direction: column; gap: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .wk-page.page-content .wk-skeleton { animation: none; }
}
`

export default function WorkPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [profits, setProfits] = useState<Profit[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())
  const [claiming, setClaiming] = useState("")

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const load = useCallback(async () => {
    const res = await fetch("/api/work", { credentials: "include", cache: "no-store" })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setPackages(data.packages)
    setProfits(data.profits)
  }, [])

  useEffect(() => {
    load()
      .catch((e) => setError(e.message || LOAD_ERROR))
      .finally(() => setLoading(false))
  }, [load])

  const claim = async (pkg: Package) => {
    setClaiming(pkg.id)
    setError("")
    try {
      const res = await fetch("/api/work/claim", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || CLAIM_ERROR)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : CLAIM_ERROR)
    } finally {
      setClaiming("")
    }
  }

  const isActive = useCallback((p: Package) => p.status === "active" && p.expiresAt > now, [now])
  const active = useMemo(() => packages.filter(isActive), [packages, isActive])

  const earnedByPackage = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of profits) map.set(p.packageId, (map.get(p.packageId) ?? 0) + p.amount)
    return map
  }, [profits])

  const totalEarned = useMemo(() => profits.reduce((sum, p) => sum + p.amount, 0), [profits])

  return (
    <main className="wk-page page-content">
      <style>{WORK_CSS}</style>

      {/* Hero */}
      <section className="wk-hero">
        <div className="wk-hero-top">
          <div className="wk-hero-icon">
            <Icon name="work" size={24} />
          </div>
          <div className="wk-hero-text">
            <span className="wk-chip">দৈনিক আয়</span>
            <h1>আপনার কর্মক্ষেত্র</h1>
            <p>ডাটাবেসে জমা প্যাকেজ ও লাভ</p>
          </div>
        </div>
        <dl className="wk-stats">
          <div>
            <dt>সক্রিয় প্যাকেজ</dt>
            <dd>{bengaliNumber(active.length)}টি</dd>
          </div>
          <div>
            <dt>এ পর্যন্ত ক্রেডিট হয়েছে</dt>
            <dd>{money(totalEarned)}</dd>
          </div>
        </dl>
      </section>

      {error && (
        <p className="wk-alert" role="alert">
          {error}
        </p>
      )}

      {/* Packages */}
      <section className="wk-section">
        <header className="wk-section-head">
          <span className="wk-section-icon">
            <Icon name="wallet" size={17} />
          </span>
          <div>
            <h2>আপনার প্যাকেজ</h2>
            <p>মূলধন এবং বাস্তব স্ট্যাটাস</p>
          </div>
          {packages.length > 0 && <b className="wk-count">{bengaliNumber(packages.length)}টি</b>}
        </header>

        {loading ? (
          <div className="wk-list" aria-busy="true">
            <div className="wk-skeleton" />
          </div>
        ) : packages.length ? (
          <div className="wk-list">
            {packages.map((p) => {
              const live = isActive(p)
              const remaining = Math.max(0, p.nextProfitAt - now)
              const ready = live && remaining === 0
              const cycle = clamp((1 - remaining / DAY_MS) * 100)
              const life = clamp(((now - p.startedAt) / Math.max(1, p.expiresAt - p.startedAt)) * 100)
              const busy = claiming === p.id
              const [top, bottom] = countdownParts(remaining)
              const ringFill = "#008ad9"

              return (
                <article className={`wk-card ${ready ? "is-ready" : ""} ${live ? "" : "is-ended"}`} key={p.id}>
                  <div className="wk-card-head">
                    <span className="wk-card-icon">
                      <Icon name="check" size={17} />
                    </span>
                    <div className="wk-card-title">
                      <h3>{p.name}</h3>
                      <small>{bengaliNumber(p.durationDays)} দিনের মেয়াদ</small>
                    </div>
                    <b className={`wk-badge ${live ? "is-active" : "is-ended"}`}>{live ? "সক্রিয়" : "শেষ"}</b>
                  </div>

                  <div className="wk-body">
                    {live && (
                      <div
                        className="wk-ring"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(cycle)}
                        style={{ background: `conic-gradient(${ringFill} ${cycle}%, #dbeafe ${cycle}%)` }}
                      >
                        {ready ? (
                          <button
                            type="button"
                            className="wk-grab"
                            aria-label="লাভ সংগ্রহ করুন"
                            onClick={() => claim(p)}
                            disabled={busy}
                          >
                            {busy ? (
                              "জমা…"
                            ) : (
                              <>
                                <span>সংগ্রহ</span>
                                <span>করুন</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="wk-ring-inner">
                            <strong>{top}</strong>
                            <strong>{bottom}</strong>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="wk-figures" style={live ? undefined : { gridColumn: "1 / -1" }}>
                      <div className="wk-profit">
                        <small>দৈনিক লাভ</small>
                        <strong>{money(p.dailyProfit)}</strong>
                      </div>
                      <dl className="wk-pair">
                        <div>
                          <dt>প্যাকেজ মূল্য</dt>
                          <dd>{money(p.amount)}</dd>
                        </div>
                        <div>
                          <dt>জমা লাভ</dt>
                          <dd>{money(earnedByPackage.get(p.id) ?? 0)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="wk-life">
                    <div
                      className="wk-life-bar"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(life)}
                    >
                      <i style={{ width: `${life}%` }} />
                    </div>
                    <div className="wk-life-dates">
                      <small>
                        শুরু: <b>{formatDate(p.startedAt)}</b>
                      </small>
                      <small>
                        শেষ: <b>{formatDate(p.expiresAt)}</b>
                      </small>
                    </div>
                  </div>

                </article>
              )
            })}
          </div>
        ) : (
          !error && (
            <div className="wk-empty">
              <span>
                <Icon name="work" size={28} />
              </span>
              <h2>প্যাকেজ সক্রিয় নয়</h2>
              <p>প্যাকেজ বেছে নিন</p>
              <AppLink page="earn">প্যাকেজ বেছে নিন</AppLink>
            </div>
          )
        )}
      </section>

      {/* Daily ledger */}
      <section className="wk-section">
        <header className="wk-section-head">
          <span className="wk-section-icon">
            <Icon name="calendar" size={17} />
          </span>
          <div>
            <h2>দৈনিক লাভের হিসাব</h2>
            <p>প্রতিটি সক্রিয় প্যাকেজের পরবর্তী লাভ জমার বিবরণ</p>
          </div>
        </header>

        {active.length ? (
          <ul className="wk-ledger">
            {active.map((pkg, index) => (
              <li key={pkg.id}>
                <span className="wk-ledger-no">{bengaliNumber(index + 1)}</span>
                <div>
                  <strong>{pkg.name}</strong>
                  <small>পরবর্তী লাভ জমা: {formatDateTime(pkg.nextProfitAt)}</small>
                </div>
                <b>+ {money(pkg.dailyProfit)}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="wk-muted">এখন কোনো সক্রিয় প্যাকেজ নেই।</p>
        )}
      </section>
    </main>
  )
}
