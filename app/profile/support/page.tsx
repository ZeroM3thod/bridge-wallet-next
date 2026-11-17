"use client"

import { useEffect, useState } from "react"

type Contact = { name: string; url: string }
export default function SupportPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  useEffect(() => { fetch("/api/admin/support", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => { if (d?.contacts) setContacts(d.contacts) }).catch(() => {}) }, [])
  return <main className="home-page page-content"><section className="support-card"><header className="support-head"><span aria-hidden="true">✦</span><div><h1>গ্রাহক সেবা ও সহায়তা কেন্দ্র</h1><p>আমাদের সাপোর্ট টিমের সঙ্গে যোগাযোগ করুন</p></div></header><div className="support-list">{contacts.map((contact, i) => <article className="support-contact" key={`${contact.url}-${i}`}><div><span className="support-role">SUPPORT</span><h2>{contact.name}</h2></div><a href={contact.url} target="_blank" rel="noopener noreferrer">যোগাযোগ করুন <b aria-hidden="true">→</b></a></article>)}{!contacts.length && <p className="support-empty">সহায়তা যোগাযোগের তথ্য শীঘ্রই প্রকাশ করা হবে।</p>}</div></section><style>{`
.support-card{max-width:620px;margin:0 auto;padding:22px;background:#fff;border:1px solid #deedf7;border-radius:18px;box-shadow:0 8px 24px rgba(7,85,191,.08)}
.support-head{display:flex;align-items:center;gap:13px;margin-bottom:18px}
.support-head>span{display:grid;place-items:center;flex:none;width:48px;height:48px;border-radius:14px;background:#e3f1fd;color:#0879db;font-size:24px}
.support-head h1{margin:0;color:#0b2b5c;font-size:19px;line-height:1.4}
.support-head p{margin:3px 0 0;color:#64748b;font-size:14px}

.support-list{display:grid}
.support-contact{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 2px;border-top:1px solid #e9f1f8}
.support-role{display:block;color:#8a9bb0;font-size:10.5px;font-weight:700;letter-spacing:.14em}
.page-content .support-contact h2{margin:2px 0 0;color:#10284f;font-size:16px;font-weight:700;line-height:1.35;overflow-wrap:anywhere}

.support-contact a{flex:none;color:#168bd2;text-decoration:none;font-size:14px;font-weight:700;white-space:nowrap}
.support-contact a b{display:inline-block;margin-left:3px;font-weight:700;transition:transform .15s ease}
.support-contact a:hover{text-decoration:underline;text-underline-offset:3px}
.support-contact a:hover b{transform:translateX(3px)}
.support-contact a:focus-visible{outline:2px solid rgba(22,139,210,.45);outline-offset:3px;border-radius:4px}

.support-empty{margin:0;padding:16px 0;border-top:1px solid #e9f1f8;color:#64748b;font-size:14px}

@media(max-width:480px){
  .support-card{padding:17px}
  .support-head h1{font-size:17px}
  .support-contact a{font-size:13px}
}
`}</style></main>
}