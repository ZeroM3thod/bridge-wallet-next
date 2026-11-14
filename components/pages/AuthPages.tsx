import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* Company                                                             */
/* Company logo asset */
/* ------------------------------------------------------------------ */
const COMPANY_NAME = "GHM Groups"

function Logo() {
  return <img className="ap-logo" src="/ghm-logo.png" alt={COMPANY_NAME} width={640} height={472} />
}

/* ------------------------------------------------------------------ */
/* Styles - copied from index.html / login.html, scoped with `ap-`     */
/* so nothing else in the app is touched (no globals.css change)       */
/* ------------------------------------------------------------------ */
const css = `
.ap-wrap{--bg:#eff3f7;--card:#ffffff;--text:#000000;--muted:#374151;--border:#b8bfc9;--accent:#008ad9;--accent-dark:#0077bd;--dark:#008ad9;--error:#d64545;--ok:#1f9d6b;
  display:flex;justify-content:center;width:100%;min-height:100vh;min-height:100dvh;background:var(--bg);color:var(--text);
  font-family:"Hind Siliguri","Noto Sans Bengali",system-ui,sans-serif}
.ap-wrap *,.ap-wrap *::before,.ap-wrap *::after{box-sizing:border-box}
.ap-wrap input,.ap-wrap button{font-family:inherit}
.ap-wrap [hidden]{display:none!important}
.ap-wrap ~ .bottom-nav{display:none}
.app:has(.ap-wrap) .bottom-nav{display:none}

.ap-page{width:100%;max-width:430px;min-height:100vh;min-height:100dvh;background:var(--card);position:relative;overflow:hidden;padding:0 26px 40px;box-shadow:0 0 40px rgba(0,138,217,.08)}
.ap-page::before{content:"";position:absolute;inset:0 0 auto 0;height:190px;background:linear-gradient(160deg,#dde7f2 0%,#f3f6fa 55%,#fff 100%);z-index:0}
.ap-page::after{content:"";position:absolute;top:-70px;right:-70px;width:200px;height:200px;border-radius:50%;border:1px solid rgba(0,138,217,.25);box-shadow:0 0 0 24px rgba(0,138,217,.06);z-index:0}
.ap-inner{position:relative;z-index:1;padding-top:max(30px,env(safe-area-inset-top))}
.ap-page h1{margin:0;text-align:center;font-size:28px;font-weight:700;line-height:1.3;color:#000}
.ap-sub{margin:2px 0 14px;text-align:center;font-size:16px;font-weight:500;line-height:1.5;color:var(--muted)}

/* logo: the emblem of ghm-logo.png on the logo's own navy tile (same spot as the old hexagon) */
.ap-logo{display:block;width:min(100%,240px);height:auto;margin:0 auto 22px;filter:drop-shadow(0 8px 14px rgba(0,138,217,.16))}
.ap-brand{margin:-12px 0 22px;text-align:center;font-size:24px;font-weight:700;letter-spacing:.3px;line-height:1.4;color:#001e51}

/* phone / email switch (login) */
.ap-tabs{display:flex;background:#e3f4fc;border-radius:10px;padding:4px;margin-bottom:16px}
.ap-tab{flex:1;height:42px;border:0;border-radius:7px;background:transparent;font-size:17px;font-weight:600;color:var(--muted);cursor:pointer;transition:background .15s,color .15s,box-shadow .15s}
.ap-tab[aria-selected="true"]{background:#fff;color:#0077bd;box-shadow:0 2px 6px rgba(0,138,217,.2)}

.ap-field{position:relative;display:flex;align-items:center;height:52px;margin-bottom:13px;border:1px solid var(--border);border-radius:8px;background:#fff;transition:border-color .15s,box-shadow .15s}
.ap-field:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,138,217,.18)}
.ap-field.invalid{border-color:var(--error);box-shadow:0 0 0 3px rgba(214,69,69,.12)}
.ap-consent{display:flex;align-items:flex-start;gap:16px;margin:16px 0;padding:18px 16px;border:1px solid #d8dee7;border-radius:20px;background:#f8fafc;color:#374151;font-size:17px;line-height:1.7;cursor:pointer}
.ap-consent input{width:24px;height:24px;flex:none;margin:4px 0 0;accent-color:#1264c4}
.ap-consent.invalid{border-color:var(--error);box-shadow:0 0 0 3px rgba(214,69,69,.12)}
.ap-ico{width:44px;height:100%;display:flex;align-items:center;justify-content:center;color:#5b6472;flex:none}
.ap-field:focus-within .ap-ico{color:var(--accent)}
.ap-field input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font-size:18px;font-weight:500;color:var(--text);padding:0 12px 0 0;box-shadow:none}
.ap-field input::placeholder{color:#4b5563;font-weight:500}
.ap-prefix{height:60%;padding:0 12px 0 0;margin-right:12px;display:flex;align-items:center;font-size:17px;font-weight:600;color:var(--text);border-right:1px solid var(--border)}
.ap-send{margin-right:8px;height:36px;padding:0 20px;border:0;border-radius:6px;flex:none;background:var(--accent);color:#fff;font-size:17px;font-weight:700;cursor:pointer;transition:background .15s}
.ap-send:hover:not(:disabled){background:var(--accent-dark)}
.ap-send:disabled{opacity:.6;cursor:default}
.ap-eye{width:42px;height:100%;border:0;background:none;cursor:pointer;color:#6b7280;flex:none;display:flex;align-items:center;justify-content:center}
.ap-eye:hover{color:var(--muted)}
.ap-page button:focus-visible,.ap-page a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

.ap-note{margin:-6px 0 12px;font-size:15px;font-weight:500;line-height:1.5;color:var(--muted)}
.ap-note.ok{color:#0f7a54}

.ap-strength{display:flex;gap:4px;margin:-4px 0 12px}
.ap-strength i{flex:1;height:3px;border-radius:2px;background:#e5e8ec;transition:background .2s}
.ap-strength[data-level="1"] i:nth-child(1){background:var(--error)}
.ap-strength[data-level="2"] i:nth-child(-n+2){background:#e9a23b}
.ap-strength[data-level="3"] i:nth-child(-n+3){background:var(--ok)}

.ap-row{display:flex;justify-content:space-between;align-items:center;margin:2px 0 16px;font-size:15px;font-weight:500}
.ap-remember{display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--text)}
.ap-remember input{width:18px;height:18px;margin:0;accent-color:var(--accent)}
.ap-page a.ap-forgot{color:var(--accent-dark);font-weight:600;text-decoration:none}
.ap-page a.ap-forgot:hover{text-decoration:underline}

.ap-submit{width:100%;height:50px;margin-top:4px;border:0;border-radius:8px;background:linear-gradient(135deg,#12a4e8,#008ad9 60%,#0077bd);color:#fff;font-size:20px;font-weight:700;cursor:pointer;box-shadow:0 6px 16px rgba(0,138,217,.25);transition:transform .1s,box-shadow .15s,opacity .15s}
.ap-submit:active:not(:disabled){transform:translateY(1px);box-shadow:0 3px 8px rgba(0,138,217,.25)}
.ap-submit:disabled{opacity:.7;cursor:default}
.ap-page a.ap-login{display:block;text-align:center;margin-top:16px;font-size:17px;font-weight:600;color:var(--accent-dark);text-decoration:none}
.ap-page a.ap-login:hover{text-decoration:underline}
.ap-page a.ap-login,.ap-page .ap-signup a{transition:color .18s ease,opacity .18s ease}
.ap-page a.ap-login:active,.ap-page .ap-signup a:active{opacity:.65}
::view-transition-old(root),::view-transition-new(root){animation-duration:.22s;animation-timing-function:ease-out}
.ap-signup{margin:16px 0 0;text-align:center;font-size:16px;font-weight:500;color:var(--muted)}
.ap-page .ap-signup a{color:var(--accent-dark);font-weight:700;text-decoration:none}
.ap-page .ap-signup a:hover{text-decoration:underline}
.ap-msg{min-height:20px;margin:10px 0 0;text-align:center;font-size:16px;font-weight:500;line-height:1.5;color:var(--error)}
.ap-msg.ok{color:var(--ok)}
`

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRe = /^0?1\d{9}$/
const toEnglishDigits = (value: string) => value.replace(/[০-৯]/g, digit => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
const toBanglaDigits = (value: string) => value.replace(/\d/g, digit => "০১২৩৪৫৬৭৮৯"[Number(digit)])
const onlyDigits = (value: string) => toEnglishDigits(value).replace(/\D/g, "")

const sv = { width: 21, height: 21, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
const icons: Record<string, ReactNode> = {
  user: <svg {...sv}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
  phone: <svg {...sv}><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>,
  mail: <svg {...sv}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>,
  shield: <svg {...sv}><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3z" /><path d="m9 12 2 2 4-4" /></svg>,
  lock: <svg {...sv}><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>,
  gift: <svg {...sv}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 13h18M12 8c-2 0-4-1-4-3s2-2.5 4 1c2-3.5 4-3 4-1s-2 3-4 3z" /></svg>,
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */
function Field({ icon, invalid, hidden, children }: { icon: string; invalid?: boolean; hidden?: boolean; children: ReactNode }) {
  return (
    <div className={`ap-field${invalid ? " invalid" : ""}`} hidden={hidden}>
      <span className="ap-ico">{icons[icon]}</span>
      {children}
    </div>
  )
}

function PwInput({ value, onChange, placeholder, autoComplete }: { value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string }) {
  const [show, setShow] = useState(false)
  return (
    <>
      <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" className="ap-eye" onClick={() => setShow(s => !s)} aria-label={show ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"} aria-pressed={show}>
        {show ? (
          <svg {...sv} width={23} height={23}><path d="M3 3l18 18" /><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-3.2 4M6.6 6.6A18.4 18.4 0 0 0 1 12s4 7 11 7a10.8 10.8 0 0 0 5.4-1.4" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
        ) : (
          <svg {...sv} width={23} height={23}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
        )}
      </button>
    </>
  )
}

function Shell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="ap-wrap">
      <style>{css}</style>
      <main className="ap-page">
        <div className="ap-inner">
          <h1>{title}</h1>
          <p className="ap-sub">{sub}</p>
          <Logo />
          {children}
        </div>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Signup follows index.html; second password field confirms password. */
/* ------------------------------------------------------------------ */
function AuthSwitch({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const router = useRouter()
  return <a href={href} className={className} onClick={(event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const navigate = () => router.push(href)
    const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown }
    if (doc.startViewTransition) doc.startViewTransition(navigate)
    else navigate()
  }}>{children}</a>
}

export function SignupPage() {
  const [f, setF] = useState({ name: "", phone: "", email: "", otp: "", pw: "", confirmPw: "", invite: "" })
  const [consent, setConsent] = useState(false)
  const [bad, setBad] = useState("")
  const [msg, setMsg] = useState({ text: "", ok: false })
  const [timer, setTimer] = useState(0)
  const [sentTo, setSentTo] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)

  useEffect(() => {
    const referralCode = new URLSearchParams(window.location.search).get("ref")
    if (referralCode) setF(current => ({ ...current, invite: referralCode.slice(0, 20) }))
  }, [])

  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const set = (k: keyof typeof f) => (v: string) => {
    setF(current => ({ ...current, [k]: v }))
    setBad(current => (current === k ? "" : current))
  }
  const fail = (k: string, text: string) => { setBad(k); setMsg({ text, ok: false }) }
  const level = !f.pw ? 0 : Math.max(1, (f.pw.length >= 6 ? 1 : 0) + (/[A-Za-z]/.test(f.pw) && /\d/.test(f.pw) ? 1 : 0) + (f.pw.length >= 10 && /[^A-Za-z0-9]/.test(f.pw) ? 1 : 0))

  const sendCode = async () => {
    if (timer > 0 || sendingCode) return
    const email = f.email.trim()
    if (!emailRe.test(email)) return fail("email", "সঠিক ইমেইল ঠিকানা দিন")
    setSendingCode(true)
    setBad("")
    setMsg({ text: "", ok: false })
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error)
      setSentTo(email)
      setTimer(60)
    } catch (err) {
      fail("email", err instanceof Error && err.message ? err.message : "কোড পাঠাতে ব্যর্থ")
    } finally {
      setSendingCode(false)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!consent) return fail("consent", "নিবন্ধন করতে শর্তাবলিতে সম্মতি দিন")
    const phone = onlyDigits(f.phone)
    if (f.name.trim().length < 2) return fail("name", "নাম কমপক্ষে ২ অক্ষরের হতে হবে")
    if (!phoneRe.test(phone)) return fail("phone", "সঠিক ফোন নম্বর দিন")
    if (!emailRe.test(f.email.trim())) return fail("email", "সঠিক ইমেইল ঠিকানা দিন")
    if (!/^\d{6}$/.test(f.otp.trim())) return fail("otp", "ইমেইলে পাঠানো ৬ সংখ্যার কোড দিন")
    if (f.pw.length < 6) return fail("pw", "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
    if (f.pw !== f.confirmPw) return fail("confirmPw", "পাসওয়ার্ড মিলছে না")

    setLoading(true)
    setBad("")
    setMsg({ text: "", ok: false })
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: f.name.trim(),
          phone,
          email: f.email.trim(),
          otp: f.otp.trim(),
          password: f.pw,
          invite: f.invite.trim()
        })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMsg({ text: "নিবন্ধন সফল হয়েছে", ok: true })
        setTimeout(() => { window.location.href = "/" }, 1500)
      } else {
        fail(data.field || "", data.error || "নিবন্ধন ব্যর্থ")
      }
    } catch {
      fail("", "নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell title="নিবন্ধন" sub="নতুন অ্যাকাউন্ট তৈরি করুন">
      <form onSubmit={submit} noValidate>
        <Field icon="user" invalid={bad === "name"}>
          <input value={f.name} onChange={(e) => set("name")(e.target.value)} placeholder="আপনার পুরো নাম" maxLength={100} autoComplete="name" />
        </Field>

        <Field icon="phone" invalid={bad === "phone"}>
          <span className="ap-prefix">+৮৮০</span>
          <input type="tel" inputMode="numeric" value={toBanglaDigits(f.phone)} onChange={(e) => set("phone")(onlyDigits(e.target.value))} placeholder="ফোন নম্বর" maxLength={11} autoComplete="tel-national" />
        </Field>

        <Field icon="mail" invalid={bad === "email"}>
          <input type="email" inputMode="email" value={f.email} onChange={(e) => set("email")(e.target.value)} placeholder="ইমেইল ঠিকানা" maxLength={255} autoComplete="email" />
        </Field>

        <Field icon="shield" invalid={bad === "otp"}>
          <input inputMode="numeric" value={toBanglaDigits(f.otp)} onChange={(e) => set("otp")(onlyDigits(e.target.value).slice(0, 6))} placeholder="ইমেইল যাচাই কোড (OTP)" maxLength={6} autoComplete="one-time-code" />
          <button type="button" className="ap-send" onClick={sendCode} disabled={timer > 0 || sendingCode}>
            {timer > 0 ? `${timer}s` : sendingCode ? "..." : "পাঠান"}
          </button>
        </Field>
        <p className={`ap-note${sentTo ? " ok" : ""}`}>{sentTo ? `${sentTo} ঠিকানায় কোড পাঠানো হয়েছে` : "আপনার ইমেইলে ৬ সংখ্যার কোড পাঠানো হবে"}</p>

        <Field icon="lock" invalid={bad === "pw"}>
          <PwInput value={f.pw} onChange={set("pw")} placeholder="লগইন পাসওয়ার্ড" autoComplete="new-password" />
        </Field>
        <div className="ap-strength" data-level={level}><i /><i /><i /></div>

        <Field icon="lock" invalid={bad === "confirmPw"}>
          <PwInput value={f.confirmPw} onChange={set("confirmPw")} placeholder="পাসওয়ার্ড নিশ্চিত করুন" autoComplete="new-password" />
        </Field>

        <Field icon="gift">
          <input value={f.invite} onChange={(e) => set("invite")(e.target.value)} placeholder="আমন্ত্রণ কোড" maxLength={20} autoComplete="off" />
        </Field>

        <label className={`ap-consent${bad === "consent" ? " invalid" : ""}`}>
          <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setBad("") }} />
          <span>আমি GHM GROUPS-এর ব্যবহারবিধি, গোপনীয়তা নীতি এবং আইএসও ট্যাংক লিজ চুক্তির শর্তাবলি পড়েছি ও স্বেচ্ছায় সম্মত হয়েছি। আমার দেওয়া সব তথ্য সত্য ও নির্ভুল।</span>
        </label>

        <button type="submit" className="ap-submit" disabled={loading}>{loading ? "অপেক্ষা করুন..." : "নিবন্ধন"}</button>
        <AuthSwitch href="/signin" className="ap-login">ইতিমধ্যে নিবন্ধিত</AuthSwitch>
        <p className={`ap-msg${msg.ok ? " ok" : ""}`} role="alert">{msg.text}</p>
      </form>
    </Shell>
  )
}

/* ------------------------------------------------------------------ */
/* Signin follows login.html.                                          */
/* ------------------------------------------------------------------ */
export function SigninPage() {
  const [mode, setMode] = useState<"phone" | "email">("phone")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [remember, setRemember] = useState(false)
  const [bad, setBad] = useState("")
  const [msg, setMsg] = useState({ text: "", ok: false })
  const [loading, setLoading] = useState(false)
  const phoneRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const fail = (k: string, text: string) => { setBad(k); setMsg({ text, ok: false }) }

  const switchMode = (m: "phone" | "email") => {
    setMode(m)
    setBad("")
    setMsg({ text: "", ok: false })
    setTimeout(() => (m === "phone" ? phoneRef : emailRef).current?.focus(), 0)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    let identifier = ""
    if (mode === "phone") {
      identifier = onlyDigits(phone)
      if (!phoneRe.test(identifier)) return fail("phone", "সঠিক ফোন নম্বর দিন")
    } else {
      identifier = email.trim()
      if (!emailRe.test(identifier)) return fail("email", "সঠিক ইমেইল ঠিকানা দিন")
    }
    if (!pw) return fail("pw", "পাসওয়ার্ড দিন")

    setLoading(true)
    setBad("")
    setMsg({ text: "", ok: false })
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password: pw, remember })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMsg({ text: "লগইন সফল হয়েছে", ok: true })
        const redirect = data.user?.role === "admin" ? "/superadmin" : "/"
        setTimeout(() => { window.location.href = redirect }, 1500)
      } else {
        fail(data.field || "", data.error || "লগইন ব্যর্থ")
      }
    } catch {
      fail("", "নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell title="লগইন" sub="আপনার অ্যাকাউন্টে প্রবেশ করুন">
      <form onSubmit={submit} noValidate>
        <div className="ap-tabs" role="tablist">
          <button type="button" className="ap-tab" role="tab" aria-selected={mode === "phone"} onClick={() => switchMode("phone")}>ফোন</button>
          <button type="button" className="ap-tab" role="tab" aria-selected={mode === "email"} onClick={() => switchMode("email")}>ইমেইল</button>
        </div>

        <Field icon="phone" invalid={bad === "phone"} hidden={mode !== "phone"}>
          <span className="ap-prefix">+৮৮০</span>
          <input ref={phoneRef} type="tel" inputMode="numeric" value={toBanglaDigits(phone)} onChange={(e) => { setPhone(onlyDigits(e.target.value)); setBad("") }} placeholder="ফোন নম্বর" maxLength={11} autoComplete="tel-national" />
        </Field>

        <Field icon="mail" invalid={bad === "email"} hidden={mode !== "email"}>
          <input ref={emailRef} type="email" inputMode="email" value={email} onChange={(e) => { setEmail(e.target.value); setBad("") }} placeholder="ইমেইল ঠিকানা" maxLength={255} autoComplete="email" />
        </Field>

        <Field icon="lock" invalid={bad === "pw"}>
          <PwInput value={pw} onChange={(v) => { setPw(v); setBad("") }} placeholder="লগইন পাসওয়ার্ড" autoComplete="current-password" />
        </Field>

        <div className="ap-row">
          <label className="ap-remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> মনে রাখুন</label>
          {/* change href to your real "forgot password" route */}
          <a className="ap-forgot" href="/forgot-password">পাসওয়ার্ড ভুলে গেছেন?</a>
        </div>

        <button type="submit" className="ap-submit" disabled={loading}>{loading ? "অপেক্ষা করুন..." : "লগইন"}</button>
        <p className="ap-signup">অ্যাকাউন্ট নেই? <AuthSwitch href="/signup">নিবন্ধন করুন</AuthSwitch></p>
        <p className={`ap-msg${msg.ok ? " ok" : ""}`} role="alert">{msg.text}</p>
      </form>
    </Shell>
  )
}
