import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/app/Icon"
import { useAppState } from "@/components/app/AppState"
import { AppLink } from "@/components/app/AppLink"
import { bengaliNumber, toBengaliDigits, parseBengaliNumber, money } from "@/lib/app-format"
import { WORK_CSS } from "@/components/pages/WorkPage"
export default function HomePage() {
  const { showToast: action } = useAppState()
  const [dashboard, setDashboard] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [loadError, setLoadError] = useState("")
  const [now, setNow] = useState(Date.now())
  const balance = dashboard?.user?.balance ?? 0
  const investment = dashboard?.investment ?? null
  const transactions = dashboard?.transactions ?? []
  const onNavigate = (page: string) => { window.location.href = `/${page}` }
  useEffect(() => {
    Promise.all([fetch('/api/dashboard', { credentials: 'include', cache: 'no-store' }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d }), fetch('/api/packages', { cache: 'no-store' }).then(r => r.json())])
      .then(([d, p]) => { setDashboard(d); setPackages(p.packages ?? []) }).catch(e => setLoadError(e.message || 'ডেটা লোড করা যায়নি'))
  }, [])
  useEffect(() => { if (!investment) return; const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [investment])

  const [moneyAction, setMoneyAction] = useState<"deposit" | "withdraw" | null>(
    null,
  )
  const [amount, setAmount] = useState(500)
  const dailyProfit = investment
    ? investment.dailyProfit
    : 0
  const totalDeposited = dashboard?.totalDeposited ?? 0
  const totalWithdrawn = dashboard?.totalWithdrawn ?? 0
  const remaining = Math.max(0, (investment?.nextProfitAt ?? now) - now)
  const timerParts = [Math.floor(remaining / 3_600_000), Math.floor((remaining % 3_600_000) / 60_000), Math.floor((remaining % 60_000) / 1000)]
  const formatCountdown = (value: number) => bengaliNumber(value).padStart(2, "০")

  const submitMoneyAction = () => {
    if (!moneyAction || amount <= 0) {
      setLoadError("সঠিক অঙ্ক লিখুন")
      return
    }
    if (moneyAction === "withdraw" && amount > balance) {
      setLoadError("পর্যাপ্ত সঞ্চয় নেই")
      return
    }

    if (moneyAction === "deposit") {
      onNavigate("deposit")
    } else {
      onNavigate("withdraw")
    }
    setMoneyAction(null)
    setAmount(500)
  }

  return (
    <>
      <main className="home-page office-page page-content">
        {loadError && <p role="alert">{loadError}</p>}
        <section className="office-hero">
          <div className="office-welcome">
            <span>আপনার মূল অফিস</span>
            <h1>স্বাগতম, {dashboard?.user?.name || "বরজাজ"}</h1>
            <p>সব হিসাব একসাথে</p>
          </div>
          <div className="office-balance">
            <span>
              <Icon name="wallet" size={26} />
            </span>
            <div>
              <small>ব্যবহারযোগ্য সঞ্চয়</small>
              <strong>{money(balance)}</strong>
            </div>
          </div>
          <div className="office-vip-pill">
            <Icon name={investment ? "check" : "clock"} size={16} />
            {investment ? investment.name : "প্যাকেজ সক্রিয় নয়"}
          </div>
        </section>

        <section className="office-actions" aria-label="দ্রুত কার্যক্রম">
          <Button variant="ghost" onClick={() => onNavigate("deposit")}><span><Icon name="deposit" size={26} strokeWidth={2.8} /></span><b>সঞ্চয় জমা</b></Button>
          <AppLink page="withdraw"><span><Icon name="withdraw" size={26} strokeWidth={2.8} /></span><b>অর্থ উত্তোলন</b></AppLink>
          <AppLink page="earn"><span><Icon name="chart" size={26} strokeWidth={2.8} /></span><b>প্যাকেজ কিনুন</b></AppLink>
          <AppLink page="work"><span><Icon name="work" size={26} strokeWidth={2.8} /></span><b>কর্মক্ষেত্র</b></AppLink>
        </section>

        {(() => {
          const pkg = investment
            ? investment
            : [...packages].reverse().find((item) => balance >= item.price) ?? packages[0]
          if (!pkg) return null
          const pkgIndex = packages.findIndex((item) => item.id === pkg.packageId || item.name === pkg.name)
          if (investment) return <div key={investment.id} className="wk-page page-content home-active-wrap"><style>{WORK_CSS}</style><HomeActivePackage investment={investment} remaining={remaining} now={now} timerParts={timerParts} formatCountdown={formatCountdown} /></div>
          return (
            <div className="pk-screen home-package-screen" key={pkg.id}><main className="pk-page page-content home-suggest-wrap"><article className="pk-card">
              <div className="pk-card-top"><div className="pk-card-id"><span className="pk-tier">{bengaliNumber(pkgIndex + 1)}</span><div><h4>{pkg.name}</h4>{pkg.shortDescription && <p>{pkg.shortDescription}</p>}</div></div><span className="pk-pill pk-pill-open"><i aria-hidden="true" />সেরা পছন্দ</span></div>
              <div className="pk-card-media"><div className="pk-photo">{pkg.imageUrl && <img src={pkg.imageUrl} alt={pkg.name} width={840} height={380} loading="lazy" />}</div>{pkg.modelNo && <span className="pk-model-tag">{pkg.modelNo}</span>}<span className="pk-unit-tag">আইএসও ট্যাংক ইউনিট</span></div>
              <dl className="pk-facts"><div><dt>প্যাকেজ মূল্য</dt><dd>{money(pkg.price)}</dd></div><div><dt>দৈনিক লাভ</dt><dd>{money(pkg.dailyProfit)}</dd></div><div><dt>মেয়াদ</dt><dd>{bengaliNumber(pkg.durationDays)} দিন</dd></div><div><dt>অভিজাত ধাপ</dt><dd>{pkg.minVipLevel > 0 ? bengaliNumber(pkg.minVipLevel) : "যেকোনো ধাপ"}</dd></div></dl>
              <div className="pk-total"><p>মেয়াদ শেষে মোট প্রাপ্তি: <b>{money(pkg.price + pkg.dailyProfit * pkg.durationDays)}</b><span>(মূলধন {money(pkg.price)} ফেরত + লাভ: {money(pkg.dailyProfit * pkg.durationDays)})</span></p></div>
              <AppLink page="earn" className="pk-buy">প্যাকেজ কিনুন</AppLink>
            </article></main></div>
          )
        })()}

        <section className="menu-list" aria-label="অফিসের অন্যান্য কার্যক্রম">
          <AppLink page="team"><span>সাফল্যের সঙ্গী</span><b aria-hidden="true">›</b></AppLink>
          <AppLink page="notifications"><span>বার্তা ও ঘোষণা</span><b aria-hidden="true">›</b></AppLink>
          <AppLink page="settings"><span>নিরাপত্তা ও বিন্যাস</span><b aria-hidden="true">›</b></AppLink>
        </section>

      </main>

      {moneyAction && (
        <div
          className="purchase-modal-backdrop"
          onClick={() => setMoneyAction(null)}
        >
          <section
            aria-modal="true"
            className="purchase-modal office-money-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="purchase-modal-head">
              <div>
                <span>
                  <Icon
                    name={moneyAction === "deposit" ? "deposit" : "withdraw"}
                    size={22}
                  />
                </span>
                <div>
                  <small>নিরাপদ হিসাব কার্যক্রম</small>
                  <h2>
                    {moneyAction === "deposit"
                      ? "সঞ্চয় জমা করুন"
                      : "অর্থ উত্তোলন করুন"}
                  </h2>
                </div>
              </div>
              <button
                aria-label="বন্ধ করুন"
                onClick={() => setMoneyAction(null)}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="office-current-balance">
              <small>বর্তমান ব্যবহারযোগ্য সঞ্চয়</small>
              <strong>{money(balance)}</strong>
            </div>
            <label className="office-amount-field">
              <span>অঙ্ক লিখুন</span>
              <div>
                <b>৳</b>
                <input
                  inputMode="numeric"
                  onChange={(event) =>
                    setAmount(parseBengaliNumber(event.target.value))
                  }
                  type="text"
                  value={toBengaliDigits(amount)}
                />
              </div>
            </label>
            <div className="office-amount-presets">
              {[500, 1000, 2500].map((preset) => (
                <button key={preset} onClick={() => setAmount(preset)}>
                  {money(preset)}
                </button>
              ))}
            </div>
            <div className="purchase-actions">
              <button className="cancel" onClick={() => setMoneyAction(null)}>
                বাতিল করুন
              </button>
              <button className="confirm" onClick={submitMoneyAction}>
                {moneyAction === "deposit"
                  ? "জমা নিশ্চিত করুন"
                  : "উত্তোলন নিশ্চিত করুন"}
              </button>
            </div>
          </section>
        </div>
      )}

    </>
  )
}

function HomeActivePackage({ investment, remaining, now, timerParts, formatCountdown }: { investment: any; remaining: number; now: number; timerParts: number[]; formatCountdown: (n: number) => string }) {
  const live = investment.expiresAt > Date.now()
  const cycle = live ? Math.min(100, Math.max(0, (1 - remaining / 86_400_000) * 100)) : 100
  const life = Math.min(100, Math.max(0, ((now - investment.startedAt) / Math.max(1, investment.expiresAt - investment.startedAt)) * 100))
  const [hours, minutes, seconds] = timerParts
  return <article className={`home-active-card wk-card ${remaining <= 0 ? "is-ready" : ""} ${live ? "" : "is-ended"}`}>
    <div className="wk-card-head"><span className="wk-card-icon"><Icon name="check" size={20} /></span><div className="wk-card-title"><h3>{investment.name}</h3><small>{bengaliNumber(investment.durationDays)} দিনের মেয়াদ</small></div><b className={`wk-badge ${live ? "is-active" : "is-ended"}`}>{live ? "সক্রিয়" : "শেষ"}</b></div>
    <div className="wk-body">{live && <div className="wk-ring" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(cycle)} style={{ background: `conic-gradient(${remaining <= 0 ? "#12ad75" : "#008ad9"} ${cycle}%, #dbeafe ${cycle}%)` }}><div className="wk-ring-inner">{remaining <= 0 ? <strong className="wk-ring-now">এখন</strong> : <><strong>{formatCountdown(hours)}ঘ</strong><strong>{formatCountdown(minutes)}মি {formatCountdown(seconds)}সে</strong></>}</div></div>}
      <div className="wk-figures" style={live ? undefined : { gridColumn: "1 / -1" }}><div className="wk-profit"><small>দৈনিক নির্ধারিত লাভ</small><strong>{money(investment.dailyProfit)}</strong></div><dl className="wk-pair"><div><dt>প্যাকেজ মূল্য</dt><dd>{money(investment.amount)}</dd></div><div><dt>মেয়াদ ফুরোবে</dt><dd>{new Date(investment.expiresAt).toLocaleDateString("bn-BD")}</dd></div></dl></div>
    </div><div className="wk-life"><div className="wk-life-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(life)}><i style={{ width: `${life}%` }} /></div><div className="wk-life-dates"><small>শুরু: <b>{new Date(investment.startedAt).toLocaleDateString("bn-BD")}</b></small><small>শেষ: <b>{new Date(investment.expiresAt).toLocaleDateString("bn-BD")}</b></small></div></div>
    {live && <AppLink page="work" className={`wk-claim-btn ${remaining <= 0 ? "is-ready" : ""}`}>লাভ সংগ্রহ করুন</AppLink>}
  </article>
}
