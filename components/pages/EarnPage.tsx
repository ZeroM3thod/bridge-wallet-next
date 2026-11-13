import { useEffect, useRef, useState } from "react"
import Icon from "@/components/app/Icon"
import { useAppState } from "@/components/app/AppState"
import { bengaliNumber, money, expiryDateFromToday } from "@/lib/app-format"

type VipPackage = {
  id: string
  name: string
  shortDescription: string
  modelNo: string
  tankOverview: string
  profitMechanism: string
  price: number
  dailyProfit: number
  durationDays: number
  maxPerUser: number
  stockLimit: number
  minActiveReferrals: number
  requiresPackageId: string
  allowWhileActive: boolean
  visible: boolean
  imageUrl: string
  stockSold: number
  userPurchaseCount: number
  eligible: boolean
  eligibilityMessage: string
}

const totalReturn = (p: VipPackage) => p.price + p.dailyProfit * p.durationDays

/* Square photo with a graceful fallback if the URL is empty or fails to load */
function PackageImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div className="pk-photo pk-photo-empty" role="img" aria-label={alt}>
        <svg viewBox="0 0 420 190" aria-hidden="true">
          <defs><linearGradient id="tank-bg" x2="1" y2="1"><stop stopColor="#e8f2fe"/><stop offset="1" stopColor="#d4e7fc"/></linearGradient><linearGradient id="tank-steel" x2="0" y2="1"><stop stopColor="#fff"/><stop offset=".5" stopColor="#dbe5ef"/><stop offset="1" stopColor="#94a3b8"/></linearGradient></defs>
          <rect width="420" height="190" rx="14" fill="url(#tank-bg)"/><ellipse cx="210" cy="160" rx="155" ry="9" fill="#0b63ce" opacity=".14"/>
          <rect x="178" y="29" width="64" height="11" rx="3" fill="#475569"/><rect x="195" y="22" width="30" height="9" rx="2" fill="#0b63ce"/>
          <rect x="64" y="42" width="292" height="102" rx="46" fill="url(#tank-steel)" stroke="#64748b" strokeWidth="2"/>
          <path d="M132 44v98m78-98v98m78-98v98M52 36v116m316-116v116M50 37h320M50 151h320" stroke="#0b63ce" strokeWidth="5" opacity=".85"/>
          <path d="m52 36 24 116m0-116-24 116m292-116 24 116m0-116-24 116" stroke="#0854c7" strokeWidth="2"/>
          <rect x="147" y="75" width="126" height="34" rx="7" fill="#0b63ce"/><text x="210" y="96" textAnchor="middle" fill="#fff" fontFamily="monospace" fontWeight="700" fontSize="13">ISO TANK</text>
        </svg>
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
        if (profile.success) {
          setBalance(profile.user.balance)
        }
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
  const dailyProfits = vipPackages.map((item) => item.dailyProfit).filter(Number.isFinite)
  const dailyProfitRange = dailyProfits.length
    ? dailyProfits.length === 1
      ? money(dailyProfits[0])
      : `${money(Math.min(...dailyProfits))} – ${money(Math.max(...dailyProfits))}`
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
               <span className="pk-chip">ট্যাংক লিজিং পরিকল্পনা</span>
              <h1>আপনার অর্জনের পথ</h1>
              <p>পছন্দের প্যাকেজ বেছে নিন</p>
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
              <h2 id="pk-list-title">আইএসও ট্যাংক প্যাকেজসমূহ</h2>
              <p>নিরবচ্ছিন্ন বাণিজ্যিক ভাড়ার সুবর্ণ প্রবাহ</p>
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
            <div className="pk-grid" aria-label="আইএসও ট্যাংক প্যাকেজের তালিকা">
              {vipPackages.map((item) => {
                const isSuggested = suggestedPackage?.id === item.id
                const requirement = item.eligibilityMessage
                const unavailable = !item.eligible || balance < item.price
                const profit = totalReturn(item) - item.price
                return (
                  <article className={`pk-card${isSuggested ? " is-suggested" : ""}`} key={item.id}>
                    {/* square photo */}
                    <div className="pk-card-media">
                      <PackageImage src={item.imageUrl} alt={item.name} />
                      {item.modelNo && <span className="pk-model-tag">{item.modelNo}</span>}
                      {isSuggested && <b className="pk-badge">সেরা পছন্দ</b>}
                    </div>

                    {/* name + price + rate (sits beside the photo on mobile) */}
                    <div className="pk-card-head">
                       <h3>{item.name}</h3>
                       {item.shortDescription && <small>{item.shortDescription}</small>}
                      <div className="pk-price">
                        <small>প্যাকেজ মূল্য</small>
                        <strong>{money(item.price)}</strong>
                      </div>
                      <span className="pk-rate">দৈনিক নির্ধারিত লাভ {money(item.dailyProfit)}</span>
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

                      {(item.minActiveReferrals > 0 || item.stockLimit > 0 || item.requiresPackageId) && (
                        <ul className="pk-reqs">
                          {item.minActiveReferrals > 0 && <li>{bengaliNumber(item.minActiveReferrals)} জন সক্রিয় রেফারেল</li>}
                          {item.requiresPackageId && <li>আগে {vipPackages.find(p => p.id === item.requiresPackageId)?.name ?? 'পূর্ববর্তী'} প্যাকেজ কিনুন</li>}
                          {item.stockLimit > 0 && <li>স্টক {bengaliNumber(item.stockLimit)}টি</li>}
                        </ul>
                      )}

                      {unavailable && <p className="pk-unavailable" role="status">{requirement || (balance < item.price ? 'পর্যাপ্ত ব্যালেন্স নেই' : item.userPurchaseCount >= item.maxPerUser ? 'ক্রয়ের সীমা পূর্ণ' : 'এই প্যাকেজ এখন কেনা যাবে না')}</p>}
                      <button className="pk-buy" type="button" disabled={unavailable} onClick={() => openPackage(item)}>
                        {unavailable ? 'কেনার যোগ্য নন' : 'প্যাকেজ কিনুন'}
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
            <header className="pk-sheet-head">
              <button type="button" className="pk-return" onClick={closeModal} disabled={purchasing}>← ফিরে যান</button>
              <small>প্যাকেজ চুক্তি ও নিশ্চিতকরণ</small>
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
                  <small>{selectedPackage.shortDescription}</small>
                  {selectedPackage.modelNo && <small>মডেল নম্বর: {selectedPackage.modelNo}</small>}
                  <small>প্যাকেজের নির্ধারিত মূল্য</small>
                  <strong>{money(selectedPackage.price)}</strong>
                  <span className="pk-rate">মডেল: {selectedPackage.modelNo || selectedPackage.name}</span>
                </div>
              </div>

              <section className="pk-rules">
                <h3>লভ্যাংশ অর্জনের উৎস ও ট্যাংক বিবরণ</h3>
                {selectedPackage.tankOverview && <p>{selectedPackage.tankOverview}</p>}
                {selectedPackage.profitMechanism && <p>{selectedPackage.profitMechanism}</p>}
              </section>

              {/* details as a clean label/value list */}
              <dl className="pk-rows">
                <div>
                  <dt>দৈনিক নির্ধারিত লাভ</dt>
                  <dd>{money(selectedPackage.dailyProfit)}</dd>
                </div>
                <div>
                  <dt>প্যাকেজের মেয়াদ</dt>
                  <dd>{bengaliNumber(selectedPackage.durationDays)} দিন</dd>
                </div>
                <div>
                  <dt>মেয়াদ ফুরোনোর দিন</dt>
                  <dd>{selectedExpiry}</dd>
                </div>
                <div><dt>মেয়াদ শেষে মোট লাভ</dt><dd>{money(totalReturn(selectedPackage) - selectedPackage.price)}</dd></div>
                <div><dt>মেয়াদ শেষে মোট প্রাপ্তি</dt><dd>{money(totalReturn(selectedPackage))}</dd></div>
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
                <h3>অঙ্গীকারনামা ও সম্মতি</h3>
                <ol>
                  <li>আমি নিজ ইচ্ছায় এই প্যাকেজ গ্রহণে সম্মত।</li>
                  <li>দৈনিক লাভ হিসাব অনুযায়ী ব্যালেন্সে যুক্ত হবে।</li>
                  <li>মেয়াদ শেষে বিনিয়োগকৃত মূলধন ফেরতযোগ্য।</li>
                </ol>
              </div>
              <div className="pk-contract-warning"><strong>বিশেষ সতর্কবার্তা</strong><p>চুক্তি নিশ্চিত করার আগে প্যাকেজের মূল্য, দৈনিক লাভ ও মেয়াদ যাচাই করুন।</p></div>
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
