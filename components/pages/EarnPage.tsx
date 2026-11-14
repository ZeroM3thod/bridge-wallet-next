import { useEffect, useRef, useState } from "react"
import { bengaliNumber, money } from "@/lib/app-format"

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
  minVipLevel: number
  visible: boolean
  imageUrl: string
  eligible: boolean
  eligibilityMessage: string
  /* optional - send these from /api/packages to show the real purchase limit */
  purchaseLimit?: number
  purchasedCount?: number
}

/* Set to false if your app shell already renders its own title bar on this route */
const SHOW_TOPBAR = false

const totalReturn = (p: VipPackage) => p.price + p.dailyProfit * p.durationDays

/* Purchase limit per tier (same values as the reference HTML) - used when the API sends none */
const DEFAULT_LIMITS = [1, 2, 1, 1, 1, 2, 2]
const limitOf = (p: VipPackage, tier: number) => p.purchaseLimit ?? DEFAULT_LIMITS[tier - 1] ?? 1
const usedOf = (p: VipPackage) => p.purchasedCount ?? 0

/* Lock texts - same wording as the reference HTML */
const lockLabelOf = (p: VipPackage) =>
  p.minVipLevel > 0 ? `অভিজাত ধাপ-${bengaliNumber(p.minVipLevel)} প্রয়োজন` : ""
const lockTextOf = (p: VipPackage) =>
  p.minVipLevel > 0
    ? `তালাবদ্ধ স্তর • শর্ত: অভিজাত ধাপ-${bengaliNumber(p.minVipLevel)} অর্জন করিতে হইবে${
        p.minVipLevel === 1 ? " (৩ জন সক্রিয় সঙ্গী যুক্ত করিলেই এই স্তরটি উন্মুক্ত হইবে)" : ""
      }`
    : p.eligibilityMessage || "এই প্যাকেজ এখন কেনা যাবে না"

/* ------------------------------------------------------------------ */
/* Small inline icons (same paths as the reference HTML)               */
/* ------------------------------------------------------------------ */
const BarsIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="4" y="11" width="3.5" height="9" rx="1.2" />
    <rect x="10.25" y="5" width="3.5" height="15" rx="1.2" />
    <rect x="16.5" y="8" width="3.5" height="12" rx="1.2" />
  </svg>
)

const strokeIcon = (size: number, d: string | string[]) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {(Array.isArray(d) ? d : [d]).map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
)

const LockIcon = ({ size = 16 }: { size?: number }) =>
  strokeIcon(size, "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z")
const InfoIcon = ({ size = 16 }: { size?: number }) =>
  strokeIcon(size, "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z")
const CheckCircleIcon = ({ size = 16 }: { size?: number }) =>
  strokeIcon(size, "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z")
const WarnIcon = ({ size = 20 }: { size?: number }) =>
  strokeIcon(
    size,
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  )
const BoxIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

/* ------------------------------------------------------------------ */
/* ISO tank illustrations (fallback when a package has no photo).      */
/* Same 420 x 190 artwork as the reference HTML = 840 x 380 ratio.     */
/* ------------------------------------------------------------------ */
const TANK_ART = [
  // t11-beam
  (label: string) => (
    <>
      <defs>
        <linearGradient id="bgGrad1" x1="0" y1="0" x2="420" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8F2FE"/>
          <stop offset="100%" stopColor="#D4E7FC"/>
        </linearGradient>
        <linearGradient id="steelCyl1" x1="80" y1="44" x2="80" y2="142" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="48%" stopColor="#E2E8F0"/>
          <stop offset="100%" stopColor="#94A3B8"/>
        </linearGradient>
      </defs>
      <rect width="420" height="190" rx="14" fill="url(#bgGrad1)"/>
      <ellipse cx="210" cy="162" rx="156" ry="10" fill="#0B63CE" fillOpacity="0.14"/>
      {/* Top Manway & Walkway */}
      <rect x="178" y="30" width="64" height="10" rx="3" fill="#475569"/>
      <rect x="196" y="23" width="28" height="9" rx="2" fill="#0B63CE"/>
      <line x1="115" y1="34" x2="305" y2="34" stroke="#64748B" strokeWidth="2.5" strokeDasharray="6 4"/>
      {/* Main Cylindrical Stainless Shell */}
      <rect x="64" y="42" width="292" height="102" rx="46" fill="url(#steelCyl1)" stroke="#64748B" strokeWidth="2"/>
      {/* Structural Reinforcing Rings */}
      <rect x="128" y="42" width="7" height="102" fill="#0B63CE" fillOpacity="0.85"/>
      <rect x="206" y="42" width="7" height="102" fill="#0B63CE" fillOpacity="0.85"/>
      <rect x="284" y="42" width="7" height="102" fill="#0B63CE" fillOpacity="0.85"/>
      {/* Front & Rear ISO Frame End-Frames */}
      <rect x="52" y="36" width="24" height="116" rx="3" stroke="#0B63CE" strokeWidth="4" fill="#0B63CE" fillOpacity="0.08"/>
      <line x1="52" y1="36" x2="76" y2="152" stroke="#0B63CE" strokeWidth="2.2"/>
      <line x1="76" y1="36" x2="52" y2="152" stroke="#0B63CE" strokeWidth="2.2"/>
      <rect x="344" y="36" width="24" height="116" rx="3" stroke="#0B63CE" strokeWidth="4" fill="#0B63CE" fillOpacity="0.08"/>
      <line x1="344" y1="36" x2="368" y2="152" stroke="#0B63CE" strokeWidth="2.2"/>
      <line x1="368" y1="36" x2="344" y2="152" stroke="#0B63CE" strokeWidth="2.2"/>
      {/* Top & Bottom Longitudinal Rails */}
      <rect x="50" y="34" width="320" height="6" rx="2" fill="#0854C7"/>
      <rect x="50" y="148" width="320" height="7" rx="2" fill="#0854C7"/>
      {/* ISO Corner Castings */}
      <rect x="49" y="32" width="11" height="11" rx="2" fill="#0F172A"/>
      <rect x="360" y="32" width="11" height="11" rx="2" fill="#0F172A"/>
      <rect x="49" y="146" width="11" height="11" rx="2" fill="#0F172A"/>
      <rect x="360" y="146" width="11" height="11" rx="2" fill="#0F172A"/>
      {/* Bottom Discharge Valve */}
      <rect x="198" y="142" width="24" height="12" rx="2" fill="#1484E6"/>
      <circle cx="210" cy="148" r="4" fill="#FFFFFF"/>
      {/* Model Stencil Plate */}
      <rect x="148" y="75" width="124" height="34" rx="7" fill="#0B63CE"/>
      <text x="210" y="96" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontWeight="700" fontSize="13">{label}</text>
    </>
  ),
  // t14-insulated
  (label: string) => (
    <>
      <rect width="420" height="190" rx="14" fill="#E6F3FF"/>
      <ellipse cx="210" cy="162" rx="158" ry="10" fill="#0B63CE" fillOpacity="0.14"/>
      {/* Full Frame Box */}
      <rect x="52" y="34" width="316" height="118" rx="5" stroke="#1484E6" strokeWidth="4.5" fill="#1484E6" fillOpacity="0.06"/>
      {/* Insulated White Thermal Cladded Tank */}
      <rect x="66" y="42" width="288" height="102" rx="38" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2.5"/>
      {/* Royal Blue Thermal Cladding Bands */}
      <rect x="108" y="42" width="10" height="102" fill="#0B63CE"/>
      <rect x="176" y="42" width="10" height="102" fill="#1484E6"/>
      <rect x="244" y="42" width="10" height="102" fill="#1484E6"/>
      <rect x="304" y="42" width="10" height="102" fill="#0B63CE"/>
      {/* Diagonal End Braces */}
      <line x1="52" y1="34" x2="82" y2="152" stroke="#1484E6" strokeWidth="3"/>
      <line x1="368" y1="34" x2="338" y2="152" stroke="#1484E6" strokeWidth="3"/>
      {/* Top Spill Box */}
      <rect x="184" y="25" width="52" height="11" rx="3" fill="#0B63CE"/>
      {/* Model Label */}
      <rect x="145" y="75" width="130" height="34" rx="7" fill="#0854C7"/>
      <text x="210" y="96" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontWeight="700" fontSize="13">{label}</text>
    </>
  ),
  // t20-chem
  (label: string) => (
    <>
      <rect width="420" height="190" rx="14" fill="#E4EFFC"/>
      <ellipse cx="210" cy="162" rx="160" ry="10" fill="#0F172A" fillOpacity="0.14"/>
      {/* Heavy Frame */}
      <rect x="48" y="34" width="324" height="118" rx="4" stroke="#0F172A" strokeWidth="4.5" fill="#CBD5E1" fillOpacity="0.25"/>
      {/* Thick Pressure Barrel */}
      <rect x="64" y="43" width="292" height="100" rx="44" fill="#F8FAFC" stroke="#475569" strokeWidth="2.5"/>
      {/* Protective Top Valve Roll-Cage */}
      <path d="M168 34V20H252V34" stroke="#0B63CE" strokeWidth="3.5" strokeLinejoin="round"/>
      <rect x="190" y="24" width="40" height="10" rx="2" fill="#0B63CE"/>
      {/* Safety Hazard Diamond Placards */}
      <g transform="translate(96, 92) rotate(45)">
        <rect x="-12" y="-12" width="24" height="24" rx="2" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5"/>
      </g>
      <g transform="translate(324, 92) rotate(45)">
        <rect x="-12" y="-12" width="24" height="24" rx="2" fill="#0EA5E9" stroke="#0F172A" strokeWidth="1.5"/>
      </g>
      {/* Frame Gussets */}
      <line x1="48" y1="34" x2="78" y2="152" stroke="#0F172A" strokeWidth="3"/>
      <line x1="372" y1="34" x2="342" y2="152" stroke="#0F172A" strokeWidth="3"/>
      {/* Model Plate */}
      <rect x="145" y="75" width="130" height="34" rx="7" fill="#0F172A"/>
      <text x="210" y="96" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontWeight="700" fontSize="13">{label}</text>
    </>
  ),
  // t50-gas
  (label: string) => (
    <>
      <rect width="420" height="190" rx="14" fill="#E2EEFC"/>
      <ellipse cx="210" cy="162" rx="160" ry="10" fill="#0B63CE" fillOpacity="0.16"/>
      {/* ISO Outer Frame */}
      <rect x="48" y="34" width="324" height="118" rx="4" stroke="#0B63CE" strokeWidth="4.5" fill="#0B63CE" fillOpacity="0.06"/>
      {/* Hemispherical Pressure Vessel */}
      <rect x="64" y="45" width="292" height="96" rx="48" fill="#FFFFFF" stroke="#0B63CE" strokeWidth="2.5"/>
      {/* Upper Aluminum Sunshield Canopy */}
      <path d="M74 68C74 48 92 40 112 40H308C328 40 346 48 346 68H74Z" fill="#1484E6"/>
      {/* Pressure Relief & Vapor/Liquid Valves */}
      <circle cx="155" cy="34" r="5" fill="#0F172A"/>
      <circle cx="210" cy="34" r="6" fill="#0B63CE"/>
      <circle cx="265" cy="34" r="5" fill="#0F172A"/>
      {/* Model Plate */}
      <rect x="148" y="84" width="124" height="34" rx="7" fill="#0B63CE"/>
      <text x="210" y="105" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontWeight="700" fontSize="13">{label}</text>
    </>
  ),
  // t75-cryo
  (label: string) => (
    <>
      <rect width="420" height="190" rx="14" fill="#DFF0FF"/>
      <ellipse cx="210" cy="162" rx="162" ry="10" fill="#0284C7" fillOpacity="0.18"/>
      {/* Cryogenic Outer Frame */}
      <rect x="46" y="34" width="328" height="118" rx="5" stroke="#0369A1" strokeWidth="4.5" fill="#E0F2FE"/>
      {/* Vacuum Jacketed Double-Wall Shell */}
      <rect x="62" y="42" width="252" height="102" rx="34" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2.5"/>
      {/* Cryo Frost Wave Lines */}
      <path d="M84 68Q100 62 116 68T148 68" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M84 118Q100 112 116 118T148 118" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round"/>
      {/* Rear Cryogenic Vaporizer & Piping Cabinet */}
      <rect x="318" y="42" width="44" height="102" rx="4" fill="#0B63CE"/>
      <line x1="328" y1="54" x2="328" y2="132" stroke="#7DD3FC" strokeWidth="2.5"/>
      <line x1="340" y1="54" x2="340" y2="132" stroke="#FFFFFF" strokeWidth="2.5"/>
      <line x1="352" y1="54" x2="352" y2="132" stroke="#7DD3FC" strokeWidth="2.5"/>
      {/* Model Plate */}
      <rect x="122" y="75" width="132" height="34" rx="7" fill="#0369A1"/>
      <text x="188" y="96" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontWeight="700" fontSize="13">{label}</text>
    </>
  ),
  // t11-duo
  (label: string) => (
    <>
      <rect width="420" height="190" rx="14" fill="#E5F0FD"/>
      {/* Highway / Rail Deck */}
      <rect x="28" y="138" width="364" height="10" rx="4" fill="#0F172A"/>
      {/* Tank Unit 1 (Left) */}
      <rect x="38" y="42" width="166" height="92" rx="4" stroke="#0B63CE" strokeWidth="3.5" fill="#0B63CE" fillOpacity="0.08"/>
      <rect x="46" y="49" width="150" height="78" rx="30" fill="#FFFFFF" stroke="#64748B" strokeWidth="2"/>
      <rect x="92" y="49" width="6" height="78" fill="#1484E6"/>
      <rect x="144" y="49" width="6" height="78" fill="#1484E6"/>
      {/* Tank Unit 2 (Right) */}
      <rect x="216" y="42" width="166" height="92" rx="4" stroke="#0B63CE" strokeWidth="3.5" fill="#0B63CE" fillOpacity="0.08"/>
      <rect x="224" y="49" width="150" height="78" rx="30" fill="#FFFFFF" stroke="#64748B" strokeWidth="2"/>
      <rect x="270" y="49" width="6" height="78" fill="#1484E6"/>
      <rect x="322" y="49" width="6" height="78" fill="#1484E6"/>
      {/* Heavy Bogie Wheels */}
      <circle cx="72" cy="156" r="13" fill="#1E293B" stroke="#94A3B8" strokeWidth="3"/>
      <circle cx="106" cy="156" r="13" fill="#1E293B" stroke="#94A3B8" strokeWidth="3"/>
      <circle cx="314" cy="156" r="13" fill="#1E293B" stroke="#94A3B8" strokeWidth="3"/>
      <circle cx="348" cy="156" r="13" fill="#1E293B" stroke="#94A3B8" strokeWidth="3"/>
      {/* Unified Fleet Model Badge */}
      <rect x="130" y="72" width="160" height="32" rx="8" fill="#0B63CE"/>
      <text x="210" y="92" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontWeight="700" fontSize="12.5">{label}</text>
    </>
  ),
  // t75-global
  (label: string) => (
    <>
      <rect width="420" height="190" rx="14" fill="#DCEBFC"/>
      {/* Port Gantry Crane Silhouette */}
      <path d="M320 154V22H388M320 44L365 22" stroke="#0854C7" strokeWidth="4" strokeLinecap="round"/>
      <line x1="358" y1="22" x2="358" y2="66" stroke="#0854C7" strokeWidth="2.2" strokeDasharray="4 3"/>
      {/* Bottom Row Stacked ISO Tanks */}
      <rect x="36" y="94" width="134" height="58" rx="4" stroke="#0B63CE" strokeWidth="3" fill="#FFFFFF"/>
      <rect x="44" y="100" width="118" height="46" rx="20" fill="#E2E8F0"/>
      <rect x="178" y="94" width="134" height="58" rx="4" stroke="#0B63CE" strokeWidth="3" fill="#FFFFFF"/>
      <rect x="186" y="100" width="118" height="46" rx="20" fill="#E2E8F0"/>
      {/* Top Tier Flagship ISO Tank */}
      <rect x="106" y="32" width="138" height="58" rx="4" stroke="#0854C7" strokeWidth="3.5" fill="#0B63CE"/>
      <rect x="114" y="38" width="122" height="46" rx="20" fill="#FFFFFF"/>
      {/* Terminal Quay Ground */}
      <rect x="24" y="152" width="372" height="10" rx="4" fill="#0F172A"/>
      {/* Flagship Model Badge */}
      <rect x="122" y="106" width="176" height="32" rx="8" fill="#0854C7"/>
      <text x="210" y="126" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontWeight="700" fontSize="12">{label}</text>
    </>
  ),
]

function pickTankVariant(modelNo: string, tier: number) {
  const m = (modelNo || "").toUpperCase()
  if (m.includes("DUO")) return 5
  if (m.includes("GLOBAL")) return 6
  if (m.includes("CRYO")) return 4
  if (m.includes("T50")) return 3
  if (m.includes("T20")) return 2
  if (m.includes("T14")) return 1
  if (m.includes("T11")) return 0
  return Math.max(0, tier - 1) % TANK_ART.length
}

/* 840 x 380 photo with a tank illustration fallback if the URL is empty or fails */
function PackageImage({
  src,
  alt,
  label,
  tier,
}: {
  src: string
  alt: string
  label: string
  tier: number
}) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    const art = TANK_ART[pickTankVariant(label, tier)]
    return (
      <div className="pk-photo pk-photo-empty" role="img" aria-label={alt}>
        <svg viewBox="0 0 420 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {art(label || alt)}
        </svg>
      </div>
    )
  }
  return (
    <div className="pk-photo">
      <img
        src={src}
        alt={alt}
        width={840}
        height={380}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export default function EarnPage() {
  /* Toast with title + message - same look and behaviour as the reference HTML (auto-hides after 4.5 s) */
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notifyRef = useRef<(title: string, message?: string) => void>(() => {})
  const notify = (title: string, message = "") => {
    setToast({ title, message })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }
  notifyRef.current = notify
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    },
    [],
  )

  const [vipPackages, setVipPackages] = useState<VipPackage[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<VipPackage | null>(null)
  const [consent, setConsent] = useState(true)
  const [receipt, setReceipt] = useState<{ title: string; body: string } | null>(null)

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
      .catch(() => notifyRef.current("ডেটা লোড করা যায়নি", "অনুগ্রহ করিয়া কিছুক্ষণ পরে আবার চেষ্টা করুন।"))
      .finally(() => setLoading(false))
  }, [])

  /* Purchase page: lock page scroll + close on Escape */
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

  const dailyProfits = vipPackages.map((item) => item.dailyProfit).filter(Number.isFinite)
  const dailyProfitRange = dailyProfits.length
    ? dailyProfits.length === 1
      ? money(dailyProfits[0])
      : `${money(Math.min(...dailyProfits))} – ${money(Math.max(...dailyProfits))}`
    : "—"

  const shortage = selectedPackage ? Math.max(0, selectedPackage.price - balance) : 0
  const amountError = selectedPackage && shortage > 0 ? "পর্যাপ্ত সঞ্চয় নেই" : ""
  const selectedTier = selectedPackage ? vipPackages.findIndex((p) => p.id === selectedPackage.id) + 1 : 0
  const selectedLimit = selectedPackage ? limitOf(selectedPackage, selectedTier) : 0
  const selectedRemaining = selectedPackage ? Math.max(0, selectedLimit - usedOf(selectedPackage)) : 0

  const lockedToast = (item: VipPackage, exhausted: boolean) => {
    if (exhausted) {
      notify("ক্রয় সীমা পূর্ণ হইয়াছে", `'${item.name}' (${item.modelNo}) প্যাকেজটির নির্ধারিত ক্রয় সীমা ইতিমধ্যেই সম্পূর্ণ হইয়াছে।`)
      return
    }
    const label = lockLabelOf(item)
    notify(
      "প্যাকেজটি বর্তমানে তালাবদ্ধ",
      item.minVipLevel === 1
        ? `'${item.name}' (${item.modelNo}) গ্রহণ করিতে হইলে অভিজাত ধাপ-১ অর্জন করিতে হইবে। ৩ জন সক্রিয় সঙ্গী যুক্ত করিলেই এই স্তরটি উন্মুক্ত হইবে।`
        : label
          ? `'${item.name}' (${item.modelNo}) গ্রহণ করিতে হইলে ${label}।`
          : lockTextOf(item),
    )
  }

  const openPackage = (item: VipPackage) => {
    setPurchaseError("")
    setConsent(true)
    setSelectedPackage(item)
  }
  const closeModal = () => {
    if (purchasing) return
    setSelectedPackage(null)
    setPurchaseError("")
  }

  const confirmPurchase = async () => {
    if (!selectedPackage || purchasing) return
    if (!consent) {
      notify("সম্মতি আবশ্যক", "চুক্তি চূড়ান্ত করিবার পূর্বে অনুগ্রহ করিয়া অঙ্গীকারনামার ঘরটিতে টিক চিহ্ন প্রদান করুন।")
      return
    }
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
      const bought = selectedPackage
      const nextCount = usedOf(bought) + 1
      const lockNote =
        typeof bought.purchasedCount === "number" && nextCount >= selectedLimit
          ? " এই প্যাকেজের নির্ধারিত ক্রয় সীমা পূর্ণ হওয়ায় এটি স্বয়ংক্রিয়ভাবে তালাবদ্ধ হইয়াছে।"
          : ""
      setBalance(data.balance)
      setSelectedPackage(null)
      setReceipt({
        title: `অভিনন্দন! '${bought.name}' (${bought.modelNo}) প্যাকেজটি সফলভাবে গৃহীত হইয়াছে`,
        body: `বিনিয়োগকৃত মূলধন ${money(bought.price)} এবং ${bengaliNumber(bought.durationDays)} দিন মেয়াদান্তে মোট প্রাপ্তি ${money(totalReturn(bought))} নির্ধারিত হইয়াছে।${lockNote}`,
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
      /* refresh counts / eligibility after a purchase */
      fetch("/api/packages", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => Array.isArray(d.packages) && setVipPackages(d.packages))
        .catch(() => {})
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : "ক্রয় ব্যর্থ")
    } finally {
      setPurchasing(false)
    }
  }

  const toastView = toast ? (
    <div className="pk-toast" role="status" aria-live="polite">
      <span className="pk-toast-icon">{InfoIcon({ size: 16 })}</span>
      <div className="pk-toast-text">
        <p className="pk-toast-title">{toast.title}</p>
        {toast.message && <p className="pk-toast-msg">{toast.message}</p>}
      </div>
      <button type="button" className="pk-toast-close" aria-label="বার্তা বন্ধ করুন" onClick={() => setToast(null)}>
        {strokeIcon(16, "M6 18L18 6M6 6l12 12")}
      </button>
    </div>
  ) : null

  const topbar = SHOW_TOPBAR ? (
    <header className="pk-topbar">
      <h1>অর্জনের পথ</h1>
    </header>
  ) : null

  /* ---------- Loading skeleton ---------- */
  if (loading)
    return (
      <div className="pk-screen">
        {topbar}
        {toastView}
        <main className="pk-page page-content" aria-busy="true">
          <div className="pk-skeleton pk-skeleton-hero" />
          <div className="pk-grid">
            {[0, 1, 2].map((i) => (
              <div className="pk-skeleton pk-skeleton-card" key={i} />
            ))}
          </div>
        </main>
      </div>
    )

  return (
    <>
      {toastView}
      <div className="pk-screen">
        {topbar}
        <main className="pk-page page-content">
          {/* ---------- Purchase receipt banner ---------- */}
          {receipt && (
            <div className="pk-receipt" role="status">
              <div className="pk-receipt-main">
                <span className="pk-receipt-icon">{strokeIcon(20, "M5 13l4 4L19 7")}</span>
                <div>
                  <h4>{receipt.title}</h4>
                  <p>{receipt.body}</p>
                </div>
              </div>
              <button type="button" onClick={() => setReceipt(null)}>
                বন্ধ করুন
              </button>
            </div>
          )}

          {/* ---------- Hero ---------- */}
          <section className="pk-hero">
            <span className="pk-hero-orb pk-hero-orb-a" aria-hidden="true" />
            <span className="pk-hero-orb pk-hero-orb-b" aria-hidden="true" />
            <div className="pk-hero-top">
              <span className="pk-hero-icon">
                <BarsIcon size={28} />
              </span>
              <div className="pk-hero-text">
                <span className="pk-chip">ট্যাংক লিজিং পরিকল্পনা</span>
                <h2>আপনার অর্জনের পথ</h2>
                <p>পছন্দের প্যাকেজ বেছে নিন</p>
              </div>
            </div>
            <dl className="pk-stats">
              <div>
                <dt>মোট প্যাকেজ</dt>
                <dd>{bengaliNumber(vipPackages.length)}টি</dd>
              </div>
              <div>
                <dt>দৈনিক লভ্যাংশ</dt>
                <dd>{dailyProfitRange}</dd>
              </div>
            </dl>
          </section>

          {/* ---------- Section header ---------- */}
          <section className="pk-section-head" aria-labelledby="pk-list-title">
            <span className="pk-section-icon">
              <BoxIcon size={20} />
            </span>
            <div>
              <h3 id="pk-list-title">আইএসও ট্যাংক প্যাকেজসমূহ</h3>
              <p>নিরবচ্ছিন্ন বাণিজ্যিক ভাড়ার সুবর্ণ প্রবাহ</p>
            </div>
            <b className="pk-count">{bengaliNumber(vipPackages.length)}টি স্তর</b>
          </section>

          {/* ---------- Package cards ---------- */}
          {vipPackages.length === 0 ? (
            <p className="pk-empty">এই মুহূর্তে কোনো প্যাকেজ নেই। কিছুক্ষণ পরে আবার দেখুন।</p>
          ) : (
            <section className="pk-grid" aria-label="আইএসও ট্যাংক প্যাকেজের তালিকা">
              {vipPackages.map((item, index) => {
                const tier = index + 1
                const limit = limitOf(item, tier)
                const used = usedOf(item)
                const locked = !item.eligible
                const exhausted = !locked && used >= limit
                const short = !locked && !exhausted && balance < item.price
                const dim = locked || exhausted
                const profit = totalReturn(item) - item.price
                const lockLabel = lockLabelOf(item)
                const usedBn = bengaliNumber(used)
                const limitBn = bengaliNumber(limit)

                return (
                  <article className={`pk-card${dim ? " is-locked" : ""}`} key={item.id}>
                    {/* tier badge + name + status pill */}
                    <div className="pk-card-top">
                      <div className="pk-card-id">
                        <span className="pk-tier">{bengaliNumber(tier)}</span>
                        <div>
                          <h4>{item.name}</h4>
                          {item.shortDescription && <p>{item.shortDescription}</p>}
                        </div>
                      </div>
                      {exhausted ? (
                        <span className="pk-pill pk-pill-full">
                          <LockIcon size={14} />
                          <span>ক্রয় সীমা পূর্ণ — তালাবদ্ধ</span>
                        </span>
                      ) : locked ? (
                        <span className="pk-pill pk-pill-locked">
                          <LockIcon size={14} />
                          <span>তালাবদ্ধ</span>
                        </span>
                      ) : (
                        <span className="pk-pill pk-pill-open">
                          <i aria-hidden="true" />
                          <span>উন্মুক্ত স্তর</span>
                        </span>
                      )}
                    </div>

                    {/* 840 x 380 photo + tags */}
                    <div className="pk-card-media">
                      <PackageImage src={item.imageUrl} alt={item.name} label={item.modelNo} tier={tier} />
                      {item.modelNo && <span className="pk-model-tag">{item.modelNo}</span>}
                      <span className="pk-unit-tag">আইএসও ট্যাংক ইউনিট</span>
                    </div>

                    {/* lock / limit / balance notice */}
                    {exhausted && (
                      <div className="pk-notice pk-notice-short" role="status">
                        <LockIcon size={16} />
                        <span>
                          এই প্যাকেজের নির্ধারিত ক্রয় সীমা ({usedBn}/{limitBn} বার) পূর্ণ হইয়াছে।
                        </span>
                      </div>
                    )}
                    {locked && (
                      <div className="pk-notice pk-notice-locked" role="status">
                        <LockIcon size={16} />
                        <span>{lockTextOf(item)}</span>
                      </div>
                    )}
                    {short && (
                      <div className="pk-notice pk-notice-short" role="status">
                        <LockIcon size={16} />
                        <span>পর্যাপ্ত ব্যালেন্স নেই — আরও {money(item.price - balance)} প্রয়োজন</span>
                      </div>
                    )}

                    {/* 2 x 2 metric grid */}
                    <dl className="pk-facts">
                      <div>
                        <dt>প্যাকেজ মূল্য</dt>
                        <dd>{money(item.price)}</dd>
                      </div>
                      <div>
                        <dt>ক্রয় সীমা</dt>
                        <dd>
                          {limitBn} বার{" "}
                          <span>
                            ({usedBn}/{limitBn})
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt>দৈনিক লাভ</dt>
                        <dd>{money(item.dailyProfit)}</dd>
                      </div>
                      <div>
                        <dt>মেয়াদ</dt>
                        <dd>{bengaliNumber(item.durationDays)} দিন</dd>
                      </div>
                    </dl>

                    {/* total return strip */}
                    <div className="pk-total">
                      <p>
                        মেয়াদ শেষে মোট প্রাপ্তি: <b>{money(totalReturn(item))}</b>
                        <span>
                          (মূলধন {money(item.price)} ফেরত + লাভ: {money(profit)})
                        </span>
                      </p>
                    </div>

                    {/* action */}
                    {exhausted ? (
                      <button className="pk-buy pk-buy-short" type="button" onClick={() => lockedToast(item, true)}>
                        <LockIcon size={16} />
                        <span>ক্রয় সীমা পূর্ণ — তালাবদ্ধ</span>
                      </button>
                    ) : locked ? (
                      <button className="pk-buy pk-buy-locked" type="button" onClick={() => lockedToast(item, false)}>
                        <LockIcon size={16} />
                        <span>{lockLabel ? `তালাবদ্ধ • ${lockLabel}` : "তালাবদ্ধ"}</span>
                      </button>
                    ) : short ? (
                      <button
                        className="pk-buy pk-buy-short"
                        type="button"
                        aria-disabled="true"
                        onClick={() => notify("পর্যাপ্ত ব্যালেন্স নেই", `এই প্যাকেজের জন্য আরও ${money(item.price - balance)} প্রয়োজন।`)}
                      >
                        পর্যাপ্ত ব্যালেন্স নেই
                      </button>
                    ) : (
                      <button className="pk-buy" type="button" onClick={() => openPackage(item)}>
                        প্যাকেজ কিনুন
                      </button>
                    )}
                  </article>
                )
              })}
            </section>
          )}

          {/* ---------- Policy note ---------- */}
          <section className="pk-note">
            <span>
              <CheckCircleIcon size={16} />
            </span>
            <div>
              <h4>গুরুত্বপূর্ণ চুক্তি ও লভ্যাংশ নীতিমালা</h4>
              <p>
                প্রতিটি আইএসও ট্যাংক লিজিং চুক্তিতে নির্ধারিত দৈনিক লভ্যাংশ নিয়মিতভাবে যুক্ত হইবে এবং চুক্তির মেয়াদ পূর্ণ
                হইলেই বিনিয়োগকৃত মূল টাকা শতভাগ ফেরত প্রদান করা হইবে।
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* ---------- Full-page purchase & contract confirmation ---------- */}
      {selectedPackage && (
        <div className="pk-backdrop">
          <section className="pk-sheet" role="dialog" aria-modal="true" aria-labelledby="pk-modal-title">
            <header className="pk-sheet-head">
              <button type="button" className="pk-return" onClick={closeModal} disabled={purchasing}>
                ← ফিরে যান
              </button>
              <h1>প্যাকেজ চুক্তি ও নিশ্চিতকরণ</h1>
            </header>

            <main className="pk-sheet-body">
              {/* 1. showcase card */}
              <section className="pk-card-box pk-showcase">
                <div className="pk-showcase-top">
                  <div className="pk-card-id">
                    <span className="pk-tier pk-tier-sm">{bengaliNumber(selectedTier)}</span>
                    <div>
                      <h2 id="pk-modal-title">{selectedPackage.name}</h2>
                      {selectedPackage.shortDescription && <p>{selectedPackage.shortDescription}</p>}
                    </div>
                  </div>
                  {selectedPackage.modelNo && (
                    <span className="pk-model-pill">মডেল নম্বর: {selectedPackage.modelNo}</span>
                  )}
                </div>

                <div className="pk-frame">
                  <PackageImage
                    src={selectedPackage.imageUrl}
                    alt={selectedPackage.name}
                    label={selectedPackage.modelNo}
                    tier={selectedTier}
                  />
                </div>

                <div className="pk-strip">
                  <span>অবশিষ্ট ক্রয় সুযোগ: {bengaliNumber(selectedRemaining)} বার</span>
                  <span>চুক্তির ধরন: মেয়াদান্তে মূলধন ফেরতযোগ্য</span>
                </div>
              </section>

              {/* 2. profit mechanism */}
              {(selectedPackage.tankOverview || selectedPackage.profitMechanism) && (
                <section className="pk-card-box pk-mech">
                  <div className="pk-mech-head">
                    <span>
                      <InfoIcon size={16} />
                    </span>
                    <h3>লভ্যাংশ অর্জনের উৎস ও ট্যাংক বিবরণ</h3>
                  </div>
                  {selectedPackage.tankOverview && <p>{selectedPackage.tankOverview}</p>}
                  {selectedPackage.profitMechanism && <p>{selectedPackage.profitMechanism}</p>}
                </section>
              )}

              {/* 3. financial breakdown */}
              <section className="pk-card-box pk-ledger">
                <div className="pk-ledger-head">
                  <h3>নির্বাচিত প্যাকেজের পূর্ণাঙ্গ আর্থিক হিসাব</h3>
                  {selectedPackage.modelNo && <span>{selectedPackage.modelNo}</span>}
                </div>
                <dl className="pk-rows">
                  <div>
                    <dt>প্যাকেজের নাম ও স্তর</dt>
                    <dd>
                      {selectedPackage.name} (স্তর {bengaliNumber(selectedTier)})
                    </dd>
                  </div>
                  {selectedPackage.modelNo && (
                    <div>
                      <dt>আইএসও ট্যাংক মডেল</dt>
                      <dd className="pk-royal">{selectedPackage.modelNo}</dd>
                    </div>
                  )}
                  <div>
                    <dt>বিনিয়োগকৃত মূলধন</dt>
                    <dd className="pk-strong">{money(selectedPackage.price)}</dd>
                  </div>
                  <div>
                    <dt>দৈনিক নির্ধারিত লাভ</dt>
                    <dd className="pk-green">{money(selectedPackage.dailyProfit)} / দিন</dd>
                  </div>
                  <div>
                    <dt>চুক্তির মেয়াদ</dt>
                    <dd>{bengaliNumber(selectedPackage.durationDays)} দিন</dd>
                  </div>
                  <div>
                    <dt>মেয়াদ শেষে অর্জিত মোট লাভ</dt>
                    <dd className="pk-green">+ {money(totalReturn(selectedPackage) - selectedPackage.price)}</dd>
                  </div>
                  <div className="pk-row-refund">
                    <dt>মেয়াদ শেষে ফেরতযোগ্য মূল টাকা</dt>
                    <dd>হ্যাঁ, শতভাগ মূলধন ফেরতযোগ্য ({money(selectedPackage.price)})</dd>
                  </div>
                  <div className="pk-row-total">
                    <dt>মেয়াদ শেষে সর্বমোট প্রাপ্তি</dt>
                    <dd>{money(totalReturn(selectedPackage))}</dd>
                  </div>
                </dl>
              </section>

              {/* 4. consent */}
              <section className="pk-card-box pk-consent">
                <h3>অঙ্গীকারনামা ও সম্মতি</h3>
                <label>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    disabled={purchasing}
                  />
                  <span>
                    আমি নিজ ইচ্ছায়, সম্পূর্ণ সজ্ঞানে ও সুস্থ মস্তিষ্কে এই নির্ধারিত আইএসও ট্যাংক লিজিং প্রকল্পে আমার অর্থ
                    বিনিয়োগ করিতেছি এবং ইহার দৈনিক ও মেয়াদান্তে লভ্যাংশ গ্রহণে সম্মত রহিলাম।
                  </span>
                </label>
              </section>

              {/* 5. warning */}
              <section className="pk-contract-warning">
                <span>
                  <WarnIcon size={20} />
                </span>
                <div>
                  <h4>বিশেষ সতর্কবার্তা</h4>
                  <p>
                    সতর্কতা: চুক্তি চূড়ান্ত করিবার পর ক্রয়কৃত প্যাকেজ বা পণ্য কোনো অবস্থাতেই ফেরতযোগ্য নহে; নির্ধারিত মেয়াদ
                    পূর্ণ হইলেই কেবল মূলধন ও লভ্যাংশ প্রদেয় হইবে।
                  </p>
                </div>
              </section>

              {(purchaseError || amountError) && (
                <p className="pk-warning" role="alert">
                  {purchaseError || amountError}
                </p>
              )}

              {/* 6. confirm / cancel */}
              <section className="pk-actions">
                <button
                  type="button"
                  className="pk-confirm"
                  onClick={confirmPurchase}
                  disabled={purchasing || Boolean(amountError)}
                >
                  {purchasing ? "ক্রয় হচ্ছে…" : "নিশ্চিত করুন"}
                </button>
                <button type="button" className="pk-cancel" onClick={closeModal} disabled={purchasing}>
                  বাতিল করুন
                </button>
              </section>
            </main>
          </section>
        </div>
      )}
    </>
  )
}
