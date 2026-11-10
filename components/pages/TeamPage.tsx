"use client"

import { useEffect, useState } from "react"
import Icon from "@/components/app/Icon"
import { useAppState } from "@/components/app/AppState"
import { AppLink } from "@/components/app/AppLink"
import { bengaliNumber, money } from "@/lib/app-format"
export default function TeamPage() {
 const { showToast: action } = useAppState()
 const [referral, setReferral] = useState<{ referralCode: string; members: number; active: number; depositBonus: number; profitCommission: number } | null>(null)
 const [origin, setOrigin] = useState("")
 const [error, setError] = useState("")
 useEffect(() => {
   setOrigin(window.location.origin)
   fetch("/api/referrals", { credentials: "include", cache: "no-store" }).then(async response => {
     const data = await response.json()
     if (!response.ok) throw new Error(data.error)
     setReferral(data)
   }).catch(reason => setError(reason instanceof Error ? reason.message : "ডেটা লোড করা যায়নি"))
 }, [])
 const referralLink = referral ? `${origin}/signup?ref=${encodeURIComponent(referral.referralCode)}` : ""

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const input = document.createElement("input")
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      input.remove()
    }
    action(message)
  }

 return <main className="team-page page-content">
        <>
      <section className="team-summary">
        <div className="team-summary-mark">
          <Icon name="users" size={74} strokeWidth={1.4} />
        </div>
        <div className="team-badges">
          <span>রেফারেল প্রোগ্রাম</span>
          <small>৩ স্তরের দল</small>
        </div>
        <h1>সাফল্যের সঙ্গী</h1>
        <p>আমন্ত্রণে বোনাস পান</p>
        <div className="team-summary-grid main">
          <div>
            <small>মোট রেফার ইনকাম</small>
            <strong className="amber">
              {money((referral?.depositBonus ?? 0) + (referral?.profitCommission ?? 0))}
            </strong>
          </div>
          <div>
            <small>মোট সদস্য</small>
            <strong>{bengaliNumber(referral?.members ?? 0)} জন</strong>
          </div>
          <div>
            <small>সক্রিয় সদস্য</small>
            <strong className="green">
              {bengaliNumber(referral?.active ?? 0)} জন
            </strong>
          </div>
          <div>
            <small>ডিপোজিট বোনাস</small>
            <strong>{money(referral?.depositBonus ?? 0)}</strong>
          </div>
          <div>
            <small>প্রফিট কমিশন</small>
            <strong>{money(referral?.profitCommission ?? 0)}</strong>
          </div>
        </div>
      </section>

      <section className="invite-card team-card">
        <div className="team-card-heading">
          <span>
            <Icon name="share" size={20} />
          </span>
          <div>
            <h2>আমন্ত্রণ লিংক</h2>
            <p>নতুন সদস্য আনুন</p>
          </div>
        </div>
        <label>আমন্ত্রণ কোড</label>
        <div className="copy-field">
          <strong>{referral?.referralCode ?? (error || "লোড হচ্ছে...")}</strong>
          <button
            disabled={!referral}
            onClick={() => referral && copyText(referral.referralCode, "কোড কপি হয়েছে")}
          >
            <Icon name="copy" size={15} /> কপি
          </button>
        </div>
        <label>আমন্ত্রণ লিংক</label>
        <div className="copy-field link-field">
          <span>{referralLink || "লোড হচ্ছে..."}</span>
          <button
            disabled={!referral}
            onClick={() => referral && copyText(referralLink, "লিংক কপি হয়েছে")}
          >
            <Icon name="link" size={15} /> কপি লিংক
          </button>
        </div>
      </section>

      <section className="team-links">
        <AppLink className="team-card" page="members">
          <Icon name="users" size={20} />
          <span>সদস্য ও কমিশন</span>
          <em>›</em>
        </AppLink>
        <AppLink className="team-card" page="salary">
          <Icon name="wallet" size={20} />
          <span>মাসিক বেতন</span>
          <em>›</em>
        </AppLink>
      </section>
        </>
</main>
}
