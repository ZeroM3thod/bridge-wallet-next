import { useEffect, useState } from "react"
import Icon from "@/components/app/Icon"
import { useAppState } from "@/components/app/AppState"
import { bengaliNumber, money, expiryDateFromToday } from "@/lib/app-format"
type VipPackage = { id: string; name: string; price: number; dailyRate: number; durationDays: number; maxPerUser: number; stockLimit: number; minActiveReferrals: number; requiresPackageId: string; allowWhileActive: boolean; visible: boolean }
export default function EarnPage() {
  const { showToast: action } = useAppState()
  const [vipPackages, setVipPackages] = useState<VipPackage[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState("")

  useEffect(() => {
    Promise.all([fetch('/api/packages', { cache: 'no-store' }).then(r => r.json()), fetch('/api/profile', { credentials: 'include', cache: 'no-store' }).then(r => r.json())])
      .then(([packages, profile]) => { setVipPackages(packages.packages ?? []); if (profile.success) setBalance(profile.user.balance) })
      .catch(() => action('ডেটা লোড করা যায়নি')).finally(() => setLoading(false))
  }, [action])

  const [selectedPackage, setSelectedPackage] = useState<
    VipPackage | null
  >(null)
  const suggestedPackage = [...vipPackages]
    .reverse()
    .find((item) => balance >= item.price)
  const dailyRates = vipPackages.map((item) => item.dailyRate).filter(Number.isFinite)
  const dailyProfitRange = dailyRates.length
    ? dailyRates.length === 1
      ? `${bengaliNumber(dailyRates[0])}%`
      : `${bengaliNumber(Math.min(...dailyRates))}% – ${bengaliNumber(Math.max(...dailyRates))}%`
    : "—"
  const amountError = selectedPackage
    ? balance < selectedPackage.price
      ? "পর্যাপ্ত সঞ্চয় নেই"
      : ""
    : ""
  const selectedExpiry = selectedPackage
    ? expiryDateFromToday(selectedPackage.durationDays)
    : ""

  const openPackage = (item: VipPackage) => {
    setSelectedPackage(item)
  }

  const confirmPurchase = async () => {
    if (!selectedPackage || purchasing) return
    setPurchasing(true); setPurchaseError("")
    try {
      const response = await fetch('/api/packages/purchase', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: selectedPackage.id }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ক্রয় ব্যর্থ')
      setBalance(data.balance)
      setSelectedPackage(null)
      action('প্যাকেজ কেনা সফল হয়েছে')
    } catch (error) { setPurchaseError(error instanceof Error ? error.message : 'ক্রয় ব্যর্থ') }
    finally { setPurchasing(false) }
  }

  if (loading) return <main className="earn-page page-content"><p style={{ textAlign: 'center', padding: '2rem' }}>লোড হচ্ছে...</p></main>

  return (
    <>
      <main className="earn-page page-content">
        <section className="earn-hero">
          <div className="earn-hero-icon">
            <Icon name="chart" size={38} />
          </div>
          <div>
            <span className="earn-kicker">বিনিয়োগ পরিকল্পনা</span>
            <h1>আপনার অর্জনের পথ</h1>
            <p>প্যাকেজ বেছে নিন</p>
          </div>
          <div className="earn-overview">
            <div>
              <small>মোট প্যাকেজ</small>
            <strong>{bengaliNumber(vipPackages.length)}টি</strong>
            </div>
            <div>
              <small>দৈনিক সম্ভাব্য লাভ</small>
              <strong>{dailyProfitRange}</strong>
            </div>
          </div>
        </section>

        <section className="package-section">
          <div className="package-heading">
            <div>
              <span>
                <Icon name="wallet" size={21} />
              </span>
              <div>
                <h2>ভিআইপি প্যাকেজসমূহ</h2>
                <p>মূল্য ও লাভ</p>
              </div>
            </div>
            <b>{bengaliNumber(vipPackages.length)}টি স্তর</b>
          </div>

          {suggestedPackage && (
            <div className="package-recommendation">
              <span>
                <Icon name="target" size={20} />
              </span>
              <div>
                <small>প্রস্তাবিত প্যাকেজ</small>
                <strong>{suggestedPackage.name}</strong>
              </div>
            </div>
          )}

          <div className="package-list" aria-label="ভিআইপি প্যাকেজের তালিকা">
            {vipPackages.map((item, index) => (
              <article
                className={
                  suggestedPackage?.name === item.name
                    ? "tier-package-card suggested-package"
                    : "tier-package-card"
                }
                key={item.name}
              >
                <div className="tier-package-head">
                  <div className="package-number">{bengaliNumber(index)}</div>
                  <div className="package-name">
                    <span>{item.name}</span>
                    <small>
                      {suggestedPackage?.name === item.name
                        ? "প্রস্তাবিত প্যাকেজ"
                        : "বিনিয়োগ স্তর"}
                    </small>
                  </div>
                  {suggestedPackage?.name === item.name && (
                    <b className="tier-package-tag">সেরা পছন্দ</b>
                  )}
                </div>
                <div className="tier-package-metrics package-purchase-metrics">
                  <div>
                    <small>প্যাকেজ মূল্য</small>
                    <strong>{money(item.price)}</strong>
                  </div>
                  <div>
                    <small>দৈনিক লাভ</small>
                    <strong>{bengaliNumber(item.dailyRate)}%</strong>
                  </div>
                  <div>
                    <small>মেয়াদ</small>
                    <strong>{bengaliNumber(item.durationDays)} দিন</strong>
                  </div>
                  <div>
                    <small>ক্রয় সীমা</small>
                    <strong>{item.maxPerUser > 0 ? `${bengaliNumber(item.maxPerUser)} বার` : "সীমাহীন"}</strong>
                  </div>
                </div>
                <div className="package-total-return">
                  মেয়াদ শেষে মোট রিটার্ন: <strong>{money(item.price * Math.pow(1 + item.dailyRate / 100, item.durationDays))}</strong> (লাভ: <strong>{money(item.price * (Math.pow(1 + item.dailyRate / 100, item.durationDays) - 1))}</strong>)
                </div>
                <button onClick={() => openPackage(item)}>
                  প্যাকেজ কিনুন
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="earn-note">
          <span>
            <Icon name="check" size={20} />
          </span>
          <div>
            <h2>গুরুত্বপূর্ণ তথ্য</h2>
            <p>লাভ ব্যালেন্সে যুক্ত</p>
          </div>
        </section>
      </main>

      {selectedPackage && (
        <div
          className="purchase-modal-backdrop"
          onClick={() => setSelectedPackage(null)}
        >
          <section
            aria-labelledby="purchase-modal-title"
            aria-modal="true"
            className="purchase-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="purchase-modal-head">
              <div>
                <span>
                  <Icon name="wallet" size={22} />
                </span>
                <div>
                  <small>প্যাকেজ কেনার অনুমোদন</small>
                  <h2 id="purchase-modal-title">{selectedPackage.name}</h2>
                </div>
              </div>
              <button
                aria-label="বন্ধ করুন"
                onClick={() => setSelectedPackage(null)}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="purchase-package-summary">
              <div>
                <small>প্যাকেজের নির্ধারিত মূল্য</small>
                <strong>{money(selectedPackage.price)}</strong>
              </div>
              <div>
                <small>দৈনিক সম্ভাব্য লাভ</small>
                <strong>
                  {bengaliNumber(selectedPackage.dailyRate)}%
                </strong>
              </div>
              <div>
                <small>প্যাকেজের মেয়াদ</small>
                <strong>
                  {bengaliNumber(selectedPackage.durationDays)} দিন
                </strong>
              </div>
              <div>
                <small>মেয়াদ ফুরোনোর দিন</small>
                <strong>{selectedExpiry}</strong>
              </div>
            </div>

            <div className="purchase-balance">
              <div>
                <span>
                  <Icon name="wallet" size={21} />
                </span>
                <div>
                  <small>আপনার সম্পূর্ণ ব্যালেন্স</small>
                  <strong>{money(balance)}</strong>
                </div>
              </div>
              <div>
                <small>প্যাকেজের নির্ধারিত মূল্য</small>
                <strong>{money(selectedPackage.price)}</strong>
              </div>
            </div>

            {(purchaseError || amountError) && <p className="balance-warning">{purchaseError || amountError}</p>}

            <div className="purchase-rules">
              <h3>প্যাকেজ কেনার নিয়ম</h3>
              <ol>
                <li>মূল্য কাটা হবে</li>
                <li>প্যাকেজ তাৎক্ষণিক সক্রিয়</li>
                <li>লাভ দৈনিক হিসাব</li>
                <li>মেয়াদে প্যাকেজ শেষ</li>
              </ol>
            </div>

            <div className="purchase-actions">
              <button
                className="cancel"
                onClick={() => setSelectedPackage(null)} disabled={purchasing}
              >
                বাতিল করুন
              </button>
              <button className="confirm" onClick={confirmPurchase} disabled={purchasing || Boolean(amountError)}>
                {purchasing ? 'ক্রয় হচ্ছে…' : 'ক্রয় নিশ্চিত করুন'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

