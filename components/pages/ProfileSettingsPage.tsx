import { useEffect, useState } from "react"
import { useAppState } from "@/components/app/AppState"
export default function ProfileSettingsPage() {
  const { showToast: action, changePage: onNavigate } = useAppState()

  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    fetch("/api/profile", { credentials: "include", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data?.success) return
        setName(data.user.name ?? "")
        setGender(data.user.gender ?? "")
        setEmail(data.user.email ?? "")
        setPhone(data.user.phone ?? "")
        if (data.user.photo_url) setPhoto(data.user.photo_url)
      })
      .catch(() => {})
  }, [])
  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) return action("৫ MB-এর মধ্যে JPG, PNG বা WebP ছবি দিন")
    setUploading(true)
    try {
      const form = new FormData()
      form.set("photo", file)
      const response = await fetch("/api/profile/photo", { method: "POST", credentials: "include", body: form })
      const result = await response.json()
      if (!response.ok) return action(result.error || "ছবি আপলোড ব্যর্থ হয়েছে")
      setPhoto(`${result.photoUrl}&t=${Date.now()}`)
      window.dispatchEvent(new Event("profile-photo-updated"))
      action("প্রোফাইল ছবি পরিবর্তন হয়েছে")
    } catch {
      action("নেটওয়ার্ক সমস্যা")
    } finally {
      setUploading(false)
    }
  }
  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender }),
      })
      const result = await response.json()
      action(response.ok ? 'লিঙ্গ সংরক্ষিত হয়েছে' : result.error || 'প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে')
    } catch {
      action('নেটওয়ার্ক সমস্যা')
    } finally {
      setSaving(false)
    }
  }
  return (
    <main className="home-page page-content profile-settings">
      <h1 className="ps-title">প্রোফাইল সেটিংস</h1>
      <section className="ps-card ps-avatar-wrap">
        <label className="ps-avatar">
          {photo ? <img src={photo} alt="প্রোফাইল ছবি" /> : <span>{name.trim().charAt(0) || "?"}</span>}
          <input type="file" accept="image/*" onChange={onPhoto} hidden />
          <b>{uploading ? "আপলোড হচ্ছে..." : "ছবি পরিবর্তন"}</b>
        </label>
      </section>
      <section className="ps-card">
        <label className="ps-field">
          <span>নাম</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" />
        </label>
        <div className="ps-field">
          <span>লিঙ্গ</span>
          <div className="ps-gender">
            {["পুরুষ", "মহিলা", "অন্যান্য"].map((g) => (
              <button key={g} className={gender === g ? "active" : undefined} onClick={() => setGender(g)}>{g}</button>
            ))}
          </div>
        </div>
        <label className="ps-field">
          <span>জিমেইল</span>
          <input value={email} readOnly disabled />
        </label>
        <label className="ps-field">
          <span>মোবাইল নম্বর</span>
          <input value={phone} readOnly disabled />
        </label>
        <p className="ps-note">জিমেইল ও মোবাইল নম্বর পরিবর্তন করা যাবে না।</p>
      </section>
      <button
        className="ps-save"
        onClick={save}
        disabled={saving || !gender}
      >{saving ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</button>
    </main>
  )
}

