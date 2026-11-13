import { useEffect, useRef, useState } from "react"
import Icon from "@/components/app/Icon"
import { useAppState } from "@/components/app/AppState"
import { bengaliNumber, money, expiryDateFromToday } from "@/lib/app-format"

type VipPackage = {
  id: string
  name: string
  price: number
  dailyRate: number
  durationDays: number
  maxPerUser: number
  stockLimit: number
  minActiveReferrals: number
  requiresPackageId: string
  allowWhileActive: boolean
  visible: boolean
  imageUrl: string
}

/* Compound return over the whole duration */
const totalReturn = (p: VipPackage) => {
  const value = p.price * Math.pow(1 + p.dailyRate / 100, p.durationDays)
  return Number.isFinite(value) ? value : p.price
}

/* Square photo with a graceful fallback if the URL is empty or fails to load */
function PackageImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div className="pk-photo pk-photo-empty" role="img" aria-label={alt}>
        <Icon name="chart" size={36} />
      </div>
    )
  }
  return (
    <div className="pk-photo">
      <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
    </div>
  )
}

export default function EarnPage() {
  const { showToast: action } = useAppState()
  const toastRef = useRef(action)
  toastRef.current = action

  const [vipPackages, setVipPackages] = useState<VipPackage[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<VipPackage | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/packages", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/profile", { credentials: "include", cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([packages, profile]) => {
        setVipPackages(packages.packages ?? [])
        if (profile.success) setBalance(profile.user.balance)
      })
      .catch(() => toastRef.current("ডেটা লোড করা যায়নি"))
      .finally(() => setLoading(false))
  }, [])

  /* Popup: lock page scroll + close on Escape */
  useEffect(() => {
    if (!selectedPackage) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !purchasing) closeModal()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage, purchasing])

  const suggestedPackage = [...vipPackages].reverse().find((item) => balance >= item.price)
  const dailyRates = vipPackages.map((item) => item.dailyRate).filter(Number.isFinite)
  const dailyProfitRange = dailyRates.length
    ? dailyRates.length === 1
      ? `${bengaliNumber(dailyRates[0])}%`
      : `${bengaliNumber(Math.min(...dailyRates))}% – ${bengaliNumber(Math.max(...dailyRates))}%`
    : "—"

  const shortage = selectedPackage ? Math.max(0, selectedPackage.price - balance) : 0
  const amountError = selectedPackage && shortage > 0 ? "পর্যাপ্ত সঞ্চয় নেই" : ""
  const selectedExpiry = selectedPackage ? expiryDateFromToday(selectedPackage.durationDays) : ""

  const openPackage = (item: VipPackage) => {
    setPurchaseError("")
    setSelectedPackage(item)
  }
  const closeModal = () => {
    if (purchasing) return
    setSelectedPackage(null)
    setPurchaseError("")
  }

  const confirmPurchase = async () => {
    if (!selectedPackage || purchasing) return
    setPurchasing(true)
    setPurchaseError("")
    try {
      const response = await fetch("/api/packages/purchase", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackage.id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "ক্রয় ব্যর্থ")
      setBalance(data.balance)
      setSelectedPackage(null)
      action("প্যাকেজ কেনা সফল হয়েছে")
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : "ক্রয় ব্যর্থ")
    } finally {
      setPurchasing(false)
    }
  }

  /* ---------- Loading skeleton ---------- */
  if (loading)
    return (
      <main className="pk-page page-content" aria-busy="true">
        <div className="pk-skeleton pk-skeleton-hero" />
        <div className="pk-grid">
          {[0, 1, 2].map((i) => (
            <div className="pk-skeleton pk-skeleton-card" key={i} />
          ))}
        </div>
      </main>
    )

  return (
    <>
      <main className="pk-page page-content">
        {/* ---------- Hero ---------- */}
        <section className="pk-hero">
          <div className="pk-hero-top">
            <span className="pk-hero-icon">
              <Icon name="chart" size={28} />
            </span>
            <div className="pk-hero-text">
              <span className="pk-chip">বিনিয়োগ পরিকল্পনা</span>
              <h1>আপনার অর্জনের পথ</h1>
              <p>প্যাকেজ বেছে নিন</p>
            </div>
          </div>
          <dl className="pk-stats">
            <div>
              <dt>মোট প্যাকেজ</dt>
              <dd>{bengaliNumber(vipPackages.length)}টি</dd>
            </div>
            <div>
              <dt>দৈনিক সম্ভাব্য লাভ</dt>
              <dd>{dailyProfitRange}</dd>
            </div>
            <div>
              <dt>আপনার ব্যালেন্স</dt>
              <dd>{money(balance)}</dd>
            </div>
          </dl>
        </section>

        {/* ---------- Packages ---------- */}
        <section className="pk-section" aria-labelledby="pk-list-title">
          <div className="pk-section-head">
            <span className="pk-section-icon">
              <Icon name="wallet" size={20} />
            </span>
            <div>
              <h2 id="pk-list-title">ভিআইপি প্যাকেজসমূহ</h2>
              <p>মূল্য ও লাভ</p>
            </div>
            <b className="pk-count">{bengaliNumber(vipPackages.length)}টি স্তর</b>
          </div>

          {suggestedPackage && (
            <div className="pk-suggest">
              <span>
                <Icon name="target" size={20} />
              </span>
              <div>
                <small>প্রস্তাবিত প্যাকেজ</small>
                <strong>{suggestedPackage.name}</strong>
              </div>
            </div>
          )}

          {vipPackages.length === 0 ? (
            <p className="pk-empty">এই মুহূর্তে কোনো প্যাকেজ নেই। কিছুক্ষণ পরে আবার দেখুন।</p>
          ) : (
            <div className="pk-grid" aria-label="ভিআইপি প্যাকেজের তালিকা">
              {vipPackages.map((item) => {
                const isSuggested = suggestedPackage?.id === item.id
                const profit = totalReturn(item) - item.price
                return (
                  <article className={`pk-card${isSuggested ? " is-suggested" : ""}`} key={item.id}>
                    {/* square photo */}
                    <div className="pk-card-media">
                      <PackageImage src={item.imageUrl} alt={item.name} />
                      {isSuggested && <b className="pk-badge">সেরা পছন্দ</b>}
                    </div>

                    {/* name + price + rate (sits beside the photo on mobile) */}
                    <div className="pk-card-head">
                      <h3>{item.name}</h3>
                      <div className="pk-price">
                        <small>প্যাকেজ মূল্য</small>
                        <strong>{money(item.price)}</strong>
                      </div>
                      <span className="pk-rate">দৈনিক {bengaliNumber(item.dailyRate)}% লাভ</span>
                    </div>

                    {/* details + action (full width under both) */}
                    <div className="pk-card-body">
                      <dl className="pk-facts">
                        <div>
                          <dt>মেয়াদ</dt>
                          <dd>{bengaliNumber(item.durationDays)} দিন</dd>
                        </div>
                        <div>
                          <dt>ক্রয় সীমা</dt>
                          <dd>{item.maxPerUser > 0 ? `${bengaliNumber(item.maxPerUser)} বার` : "সীমাহীন"}</dd>
                        </div>
                        <div>
                          <dt>মোট রিটার্ন</dt>
                          <dd>{money(totalReturn(item))}</dd>
                        </div>
                        <div>
                          <dt>মোট লাভ</dt>
                          <dd className="pk-gain">{money(profit)}</dd>
                        </div>
                      </dl>

                      {(item.minActiveReferrals > 0 || item.stockLimit > 0) && (
                        <ul className="pk-reqs">
                          {item.minActiveReferrals > 0 && (
                            <li>ন্যূনতম {bengaliNumber(item.minActiveReferrals)} জন সক্রিয় রেফারেল</li>
                          )}
                          {item.stockLimit > 0 && <li>স্টক {bengaliNumber(item.stockLimit)}টি</li>}
                        </ul>
                      )}

                      <button className="pk-buy" type="button" onClick={() => openPackage(item)}>
                        প্যাকেজ কিনুন
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* ---------- Note ---------- */}
        <section className="pk-note">
          <span>
            <Icon name="check" size={20} />
          </span>
          <div>
            <h2>গুরুত্বপূর্ণ তথ্য</h2>
            <p>লাভ ব্যালেন্সে যুক্ত</p>
          </div>
        </section>
      </main>

      {/* ---------- Purchase popup (bottom sheet on mobile, dialog on desktop) ---------- */}
      {selectedPackage && (
        <div className="pk-backdrop" onClick={closeModal}>
          <section
            className="pk-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pk-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="pk-grab" aria-hidden="true" />

            <header className="pk-sheet-head">
              <small>প্যাকেজ কেনার অনুমোদন</small>
              <button type="button" className="pk-close" aria-label="বন্ধ করুন" onClick={closeModal} disabled={purchasing}>
                <Icon name="close" size={20} />
              </button>
            </header>

            <div className="pk-sheet-body">
              {/* square photo + name + price */}
              <div className="pk-sheet-hero">
                <PackageImage src={selectedPackage.imageUrl} alt={selectedPackage.name} />
                <div>
                  <h2 id="pk-modal-title">{selectedPackage.name}</h2>
                  <small>প্যাকেজের নির্ধারিত মূল্য</small>
                  <strong>{money(selectedPackage.price)}</strong>
                  <span className="pk-rate">দৈনিক {bengaliNumber(selectedPackage.dailyRate)}% লাভ</span>
                </div>
              </div>

              {/* details as a clean label/value list */}
              <dl className="pk-rows">
                <div>
                  <dt>দৈনিক সম্ভাব্য লাভ</dt>
                  <dd>{bengaliNumber(selectedPackage.dailyRate)}%</dd>
                </div>
                <div>
                  <dt>প্যাকেজের মেয়াদ</dt>
                  <dd>{bengaliNumber(selectedPackage.durationDays)} দিন</dd>
                </div>
                <div>
                  <dt>মেয়াদ ফুরোনোর দিন</dt>
                  <dd>{selectedExpiry}</dd>
                </div>
              </dl>

              {/* balance vs price */}
              <div className="pk-balance">
                <div>
                  <span className="pk-balance-icon">
                    <Icon name="wallet" size={20} />
                  </span>
                  <small>আপনার সম্পূর্ণ ব্যালেন্স</small>
                  <strong>{money(balance)}</strong>
                </div>
                <div>
                  <span className="pk-balance-icon pk-balance-icon-alt">
                    <Icon name="target" size={20} />
                  </span>
                  <small>প্যাকেজের নির্ধারিত মূল্য</small>
                  <strong className={shortage > 0 ? "is-short" : ""}>{money(selectedPackage.price)}</strong>
                </div>
              </div>

              {(purchaseError || amountError) && (
                <p className="pk-warning" role="alert">
                  {purchaseError || amountError}
                </p>
              )}

              <div className="pk-rules">
                <h3>প্যাকেজ কেনার নিয়ম</h3>
                <ol>
                  <li>মূল্য কাটা হবে</li>
                  <li>প্যাকেজ তাৎক্ষণিক সক্রিয়</li>
                  <li>লাভ দৈনিক হিসাব</li>
                  <li>মেয়াদে প্যাকেজ শেষ</li>
                </ol>
              </div>
            </div>

            <footer className="pk-sheet-actions">
              <button type="button" className="pk-cancel" onClick={closeModal} disabled={purchasing}>
                বাতিল করুন
              </button>
              <button
                type="button"
                className="pk-confirm"
                onClick={confirmPurchase}
                disabled={purchasing || Boolean(amountError)}
              >
                {purchasing ? "ক্রয় হচ্ছে…" : "ক্রয় নিশ্চিত করুন"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}