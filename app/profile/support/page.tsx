"use client"

import { useEffect, useState } from "react"

type Links = { telegramSupportUrl: string; whatsappSupportUrl: string }

export default function SupportPage() {
  const [links, setLinks] = useState<Links>({ telegramSupportUrl: "", whatsappSupportUrl: "" })
  useEffect(() => { fetch("/api/site-settings", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => { if (d) setLinks(d) }).catch(() => {}) }, [])
  return <main className="home-page page-content"><section className="ps-card"><h1>গ্রাহক সেবা ও সহায়তা কেন্দ্র</h1><p>সহায়তার জন্য আমাদের গ্রাহক সেবা প্রতিনিধির সঙ্গে যোগাযোগ করুন।</p>{links.telegramSupportUrl && <a className="telegram-channel-link" href={links.telegramSupportUrl} target="_blank" rel="noreferrer"><span>টেলিগ্রাম সহায়তা</span><b>›</b></a>}{links.whatsappSupportUrl && <a className="telegram-channel-link" href={links.whatsappSupportUrl} target="_blank" rel="noreferrer"><span>হোয়াটসঅ্যাপ সহায়তা</span><b>›</b></a>}{!links.telegramSupportUrl && !links.whatsappSupportUrl && <p>সহায়তা যোগাযোগের তথ্য শীঘ্রই প্রকাশ করা হবে।</p>}</section></main>
}
