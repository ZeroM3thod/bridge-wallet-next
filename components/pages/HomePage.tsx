import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/app/Icon"
import { useAppState } from "@/components/app/AppState"
import { AppLink } from "@/components/app/AppLink"
import { bengaliNumber, toBengaliDigits, parseBengaliNumber, money } from "@/lib/app-format"
export default function HomePage() {
  const { showToast: action } = useAppState()
  const [dashboard, setDashboard] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [loadError, setLoadError] = useState("")
  const balance = dashboard?.user?.balance ?? 0
  const investment = dashboard?.investment ?? null
  const transactions = dashboard?.transactions ?? []
  const onNavigate = (page: string) => { window.location.href = `/${page}` }
  useEffect(() => {
    Promise.all([fetch('/api/dashboard', { credentials: 'include', cache: 'no-store' }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d }), fetch('/api/packages', { cache: 'no-store' }).then(r => r.json())])
      .then(([d, p]) => { setDashboard(d); setPackages(p.packages ?? []) }).catch(e => setLoadError(e.message || 'ডেটা লোড করা যায়নি'))
  }, [])

  const [moneyAction, setMoneyAction] = useState<"deposit" | "withdraw" | null>(
    null,
  )
  const [amount, setAmount] = useState(500)
  const dailyProfit = investment
    ? investment.dailyProfit
    : 0
  const totalDeposited = dashboard?.totalDeposited ?? 0
  const totalWithdrawn = dashboard?.totalWithdrawn ?? 0

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
          return (
            <article
              className={
                investment ? "tier-package-card" : "tier-package-card suggested-package"
              }
            >
              <div className="tier-package-head">
                <div className="package-number">{bengaliNumber(pkgIndex)}</div>
                <div className="package-name">
                  <span>{pkg.name}</span>
                  <small>{investment ? "সক্রিয় প্যাকেজ" : "প্রস্তাবিত প্যাকেজ"}</small>
                </div>
                {!investment && <b className="tier-package-tag">সেরা পছন্দ</b>}
              </div>
              <div className={`tier-package-metrics ${investment ? "" : "package-purchase-metrics"}`}>
                <div>
                  <small>{investment ? "রোপিত পুঁজি" : "প্যাকেজ মূল্য"}</small>
                  <strong>{money(investment ? investment.amount : pkg.price)}</strong>
                </div>
                <div>
                  <small>দৈনিক লাভ</small>
                  <strong>{money(pkg.dailyProfit)}</strong>
                </div>
                <div>
                  <small>{investment ? "মেয়াদ ফুরোবে" : "মেয়াদ"}</small>
                  <strong>
                    {investment ? new Date(investment.expiresAt).toLocaleDateString('bn-BD') : `${bengaliNumber(pkg.durationDays)} দিন`}
                  </strong>
                </div>
                {!investment && <div>
                  <small>অভিজাত ধাপ</small>
                  <strong>{pkg.minVipLevel > 0 ? bengaliNumber(pkg.minVipLevel) : "যেকোনো ধাপ"}</strong>
                </div>}
              </div>
              {!investment && <div className="package-total-return">
                মেয়াদ শেষে মোট রিটার্ন: <strong>{money(pkg.price + pkg.dailyProfit * pkg.durationDays)}</strong> (লাভ: <strong>{money(pkg.dailyProfit * pkg.durationDays)}</strong>)
              </div>}
              {investment ? (
                <AppLink page="work">বিস্তারিত</AppLink>
              ) : (
                <button
                  onClick={() => onNavigate("earn")}
                >
                  প্যাকেজ কিনুন
                </button>
              )}
            </article>
          )
        })()}

        <section className="menu-list" aria-label="অফিসের অন্যান্য কার্যক্রম">
          <AppLink page="team"><span>সাফল্যের সঙ্গী</span><b aria-hidden="true">›</b></AppLink>
          {["বার্তা ও ঘোষণা", "নিরাপত্তা ও বিন্যাস"].map(title => <Button variant="ghost" key={title} onClick={() => action(`${title} শীঘ্রই আসছে`)}><span>{title}</span><b aria-hidden="true">›</b></Button>)}
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
