import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Icon from "@/components/app/Icon"
import { AppLink } from "@/components/app/AppLink"
import { useAppState } from "@/components/app/AppState"
import { pagePaths, type Page } from "@/lib/app-navigation"
import { getFirstWord, toBanglaDigit } from "@/lib/bangla-utils"

type HeaderProfile = { name: string; uid: string; vip_level: number }
function AppHeader({
  page,
  isSubPage,
  onBack,
  onNotice,
  onProfile,
  profile,
}: {
  page: Page
  isSubPage: boolean
  onBack: () => void
  onNotice: () => void
  onProfile: () => void
  profile: HeaderProfile | null
}) {
  const pageLabel = navItems.find((item) => item.id === page)?.label ?? ({ members: "সদস্য ও কমিশন", salary: "মাসিক বেতন", deposit: "জমা করুন", withdraw: "অর্থ উত্তোলন", settings: "প্রোফাইল সেটিংস", ledger: "লেনদেন", password: "পাসওয়ার্ড", wpassword: "উত্তোলন পাসওয়ার্ড", profits: "লাভের বিবরণ", download: "তথ্য ডাউনলোড" } as Partial<Record<Page, string>>)[page]

  if (page !== "profile") {
    return (
      <header className="page-title-header">
        {isSubPage && <button className="page-title-back" onClick={onBack}>‹ ফিরতি পথ</button>}
        <h1>{pageLabel}</h1>
      </header>
    )
  }

  return (
    <header className="app-header">

      <AppLink page="profile" label="আমার পরিসর খুলুন" className="header-profile">
        <span className="avatar">
          <Icon name="user" size={41} strokeWidth={1.7} />
          <i />
        </span>
        <span className="identity">
          <small>{pageLabel}</small>
          <strong>{profile ? getFirstWord(profile.name) : "বরজাজ"}</strong>
          <span>
            <b>আইডি {profile ? toBanglaDigit(profile.uid) : "০০০০০০০০"}</b>
            <em>
              <Icon name="shield" size={12} /> বিশিষ্ট স্তর {profile ? toBanglaDigit(profile.vip_level) : "০"}
            </em>
          </span>
        </span>
      </AppLink>
      <div className="header-actions">
        <span className="header-balance">
          <small>অ্যাকাউন্ট</small>
          <strong>সক্রিয়</strong>
        </span>
        <button
          className="notice-button"
          aria-label="নোটিফিকেশন"
          onClick={onNotice}
        >
          <Icon name="bell" size={30} />
          <b />
        </button>
      </div>
    </header>
  )
}

const navItems: { id: Page; icon: string; label: string }[] = [
  { id: "home", icon: "home", label: "মূল অফিস" },
  { id: "work", icon: "work", label: "কর্মক্ষেত্র" },
  { id: "earn", icon: "chart", label: "অর্জনের পথ" },
  { id: "team", icon: "handshake", label: "সাফল্যের সঙ্গী" },
  { id: "profile", icon: "user", label: "আমার পরিসর" },
]

export default function BorojajApp({ children }: { children: React.ReactNode }) {
 const pathname = usePathname()
 const router = useRouter()
  const { showToast, changePage } = useAppState()
  const [profile, setProfile] = useState<HeaderProfile | null>(null)
 const isPublic = pathname === "/signin" || pathname === "/signup"
 const [authorized, setAuthorized] = useState(false)
  useEffect(() => {
  setAuthorized(false)
  if (isPublic) return
  let active = true
  fetch("/api/auth/session", { credentials: "include" }).then(response => {
   if (!active) return
   if (response.ok) setAuthorized(true)
   else router.replace("/signin")
  }).catch(() => router.replace("/signin"))
  return () => { active = false }
  }, [pathname, isPublic, router])
  useEffect(() => {
    if (isPublic || !authorized) return
    let active = true
    const load = () => fetch('/api/profile', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (active && d?.success) setProfile(d.user) })
      .catch(() => {})
    load()
    const onFocus = () => { void load() }
    window.addEventListener('focus', onFocus)
    return () => { active = false; window.removeEventListener('focus', onFocus) }
  }, [authorized, isPublic])
 if (!isPublic && !authorized) return <main aria-live="polite">অ্যাকাউন্ট যাচাই হচ্ছে...</main>
 const page: Page = (Object.entries(pagePaths).find(([, path]) => path === pathname)?.[0] as Page | undefined) ?? "home"
 const activePage = pathname.startsWith("/profile") ? "profile" : pathname.startsWith("/team") ? "team" : page
  const isSubPage = ["members", "salary", "deposit", "withdraw", "settings", "ledger", "password", "wpassword", "profits", "download"].includes(page)
  return <div className="app blue-header">
    <AppHeader page={page} isSubPage={isSubPage} onBack={() => router.back()} onNotice={() => showToast("নতুন নোটিফিকেশন নেই")} onProfile={() => changePage("profile")} profile={profile} />
  {children}
  <nav className="bottom-nav" aria-label="প্রধান নেভিগেশন">{navItems.map(item => <AppLink key={item.id} page={item.id} plain className={activePage === item.id ? "active" : ""}><Icon name={item.icon} size={27} /><span>{item.label}</span></AppLink>)}</nav>
 </div>
}
