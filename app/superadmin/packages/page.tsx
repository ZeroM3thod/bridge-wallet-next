"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import "../admin.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Pkg = {
  id: string;
  name: string;
  shortDescription?: string;
  modelNo?: string;
  tankOverview?: string;
  profitMechanism?: string;
  price: number;
  dailyProfit: number;
  durationDays: number;
  maxPerUser: number;
  minVipLevel: number;
  stockLimit: number;
  minActiveReferrals: number;
  requiresPackageId: string;
  allowWhileActive: boolean;
  visible: boolean;
  imageUrl?: string;
};

export type PackageConfig = {
  packages: Pkg[];
};

/* ------------------------------------------------------------------ */
/*  Placeholder data                                                   */
/* ------------------------------------------------------------------ */

const bdt = (n: number) => "৳" + n.toLocaleString("en-BD", { maximumFractionDigits: 2 });
function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Package form draft                                                 */
/* ------------------------------------------------------------------ */

type Draft = {
  id: string;
  name: string;
  shortDescription: string;
  modelNo: string;
  tankOverview: string;
  profitMechanism: string;
  price: string;
  dailyProfit: string;
  durationDays: string;
  maxPerUser: string;
  minVipLevel: string;
  stockLimit: string;
  minActiveReferrals: string;
  requiresPackageId: string;
  allowWhileActive: boolean;
  visible: boolean;
  imageUrl?: string;
};

const toDraft = (p: Pkg): Draft => ({
  ...p,
  shortDescription: p.shortDescription ?? "",
  modelNo: p.modelNo ?? "",
  tankOverview: p.tankOverview ?? "",
  profitMechanism: p.profitMechanism ?? "",
  price: String(p.price),
  dailyProfit: String(p.dailyProfit),
  durationDays: String(p.durationDays),
  maxPerUser: String(p.maxPerUser),
  minVipLevel: String(p.minVipLevel ?? 0),
  stockLimit: String(p.stockLimit),
  minActiveReferrals: String(p.minActiveReferrals),
});

const emptyDraft = (): Draft => ({
  id: "",
  name: "",
  shortDescription: "",
  modelNo: "",
  tankOverview: "",
  profitMechanism: "",
  price: "",
  dailyProfit: "300",
  durationDays: "",
  maxPerUser: "1",
  minVipLevel: "0",
  stockLimit: "0",
  minActiveReferrals: "0",
  requiresPackageId: "",
  allowWhileActive: false,
  visible: true,
  imageUrl: "",
});

const fromDraft = (d: Draft): Pkg => ({
  id: d.id,
  name: d.name.trim(),
  price: Number(d.price),
  dailyProfit: Number(d.dailyProfit),
  durationDays: Number(d.durationDays),
  maxPerUser: Number(d.maxPerUser),
  minVipLevel: Number(d.minVipLevel),
  stockLimit: Number(d.stockLimit),
  minActiveReferrals: Number(d.minActiveReferrals),
  requiresPackageId: d.requiresPackageId,
  allowWhileActive: d.allowWhileActive,
  visible: d.visible,
  imageUrl: d.imageUrl,
});

type Errors = Partial<Record<keyof Draft, string>>;

function validate(d: Draft, others: Pkg[]): Errors {
  const e: Errors = {};
  const n = (v: string) => (v.trim() === "" ? NaN : Number(v));
  if (!d.name.trim()) e.name = "Enter a package name.";
  else if (others.some((p) => p.name.toLowerCase() === d.name.trim().toLowerCase()))
    e.name = "Another package already uses this name.";
  if (!(n(d.price) > 0)) e.price = "Price must be more than 0.";
  if (!(Number.isSafeInteger(n(d.dailyProfit)) && n(d.dailyProfit) > 0)) e.dailyProfit = "Enter daily profit in BDT, greater than 0.";
  if (!(Number.isInteger(n(d.durationDays)) && n(d.durationDays) >= 1)) e.durationDays = "Enter a whole number of days, 1 or more.";
  (["maxPerUser", "minVipLevel"] as const).forEach((k) => {
    if (!(Number.isInteger(n(d[k])) && n(d[k]) >= 0)) e[k] = "Enter a whole number, 0 or more.";
  });
  return e;
}

/* ------------------------------------------------------------------ */
/*  Form pieces                                                        */
/* ------------------------------------------------------------------ */

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="ad-field">
      <span className="ad-field-label">{label}</span>
      {children}
      {error ? <span className="ad-field-error">{error}</span> : hint ? <span className="ad-field-hint">{hint}</span> : null}
    </label>
  );
}

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="ad-switch-row">
      <div>
        <p className="ad-switch-label">{label}</p>
        {hint && <p className="ad-field-hint">{hint}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`ad-switch ${checked ? "is-on" : ""}`} onClick={() => onChange(!checked)}>
        <span />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PackageManagement({
}: {}) {
  const [active, setActive] = useState("packages");
  const [saved, setSaved] = useState<PackageConfig>({ packages: [] });
  const [config, setConfig] = useState<PackageConfig>({ packages: [] });
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(config), [saved, config]);

  const say = (text: string, bad?: boolean) => {
    setToast({ text, bad });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.packages)) throw new Error(data.error || "Load failed");
      const cfg = { packages: data.packages.map((p: Pkg) => ({ ...p, minVipLevel: p.minVipLevel ?? 0, allowWhileActive: Boolean(p.allowWhileActive), visible: Boolean(p.visible) })) };
      setSaved(cfg);
      setConfig(cfg);
    } catch (error) { say(error instanceof Error ? error.message : "Failed to load packages", true); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadPackages(); }, []);

  const openEdit = (p: Pkg) => {
    setDraft(toDraft(p));
    setIsNew(false);
    setErrors({});
    setConfirmDelete(false);
  };
  const openNew = () => {
    setDraft(emptyDraft());
    setIsNew(true);
    setErrors({});
    setConfirmDelete(false);
  };
  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const uploadImage = async (file?: File) => {
    if (!file || !draft?.id) return;
    setImageUploading(true);
    try {
      const body = new FormData(); body.set("packageId", draft.id); body.set("image", file);
      const res = await fetch("/api/admin/package-image", { method: "POST", credentials: "include", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setDraft(d => d ? { ...d, imageUrl: data.imageUrl } : d);
      setConfig(c => ({ ...c, packages: c.packages.map(p => p.id === draft.id ? { ...p, imageUrl: data.imageUrl } : p) }));
      setSaved(c => ({ ...c, packages: c.packages.map(p => p.id === draft.id ? { ...p, imageUrl: data.imageUrl } : p) }));
      say("Package photo updated");
    } catch (error) { say(error instanceof Error ? error.message : "Upload failed", true); }
    finally { setImageUploading(false); }
  };
  const removeImage = async () => {
    if (!draft?.id || imageUploading) return;
    setImageUploading(true);
    try {
      const res = await fetch("/api/admin/package-image", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId: draft.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remove failed");
      setDraft(d => d ? { ...d, imageUrl: "" } : d);
      setConfig(c => ({ ...c, packages: c.packages.map(p => p.id === draft.id ? { ...p, imageUrl: "" } : p) }));
      setSaved(c => ({ ...c, packages: c.packages.map(p => p.id === draft.id ? { ...p, imageUrl: "" } : p) }));
      say("Package photo removed");
    } catch (error) { say(error instanceof Error ? error.message : "Remove failed", true); }
    finally { setImageUploading(false); }
  };

  const applyDraft = () => {
    if (!draft) return;
    const others = config.packages.filter((p) => p.id !== draft.id);
    const e = validate(draft, others);
    setErrors(e);
    if (Object.keys(e).length) return;
    const pkg = fromDraft(draft);
    if (isNew) {
      pkg.id = pkg.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `pkg-${Date.now()}`;
      setConfig((c) => ({ ...c, packages: [...c.packages, pkg] }));
    } else {
      setConfig((c) => ({ ...c, packages: c.packages.map((p) => (p.id === pkg.id ? pkg : p)) }));
    }
    setDraft(null);
  };

  const deleteDraft = () => {
    if (!draft) return;
    setConfig((c) => ({
      ...c,
      packages: c.packages
        .filter((p) => p.id !== draft.id)
        .map((p) => (p.requiresPackageId === draft.id ? { ...p, requiresPackageId: "" } : p)),
    }));
    setDraft(null);
  };

  const toggleVisible = (id: string) =>
    setConfig((c) => ({ ...c, packages: c.packages.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)) }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/packages", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      await loadPackages();
      say("Changes saved");
    } catch (error) {
      say(error instanceof Error ? error.message : "Could not save changes", true);
    } finally {
      setSaving(false);
    }
  };
  const discard = () => setConfig(saved);

  const preview = useMemo(() => {
    if (!draft) return null;
    const price = Number(draft.price);
    const daily = Number(draft.dailyProfit);
    const days = Number(draft.durationDays);
    if (!(price > 0 && daily > 0 && days >= 1) || !Number.isFinite(days)) return null;
    const rows = Array.from({ length: Math.min(days, 365) }, (_, i) => {
      const open = price + daily * i;
      return { day: i + 1, open, profit: daily, close: open + daily };
    });
    const total = daily * days;
    return { first: daily, total, end: price + total, rows };
  }, [draft]);


  if (loading) return <div className="ad"><AdminSidebar active={active} onNavigate={setActive} /><main className="ad-main">Loading packages…</main></div>;

  return (
    <div className="ad">
      <style>{css}</style>

      <AdminSidebar active={active} onNavigate={setActive} />

      <main className="ad-main">
        <header className="ad-top">
          <div className="ad-top-title">
            <h1>Package management</h1>
            <p className="ad-muted">Prices, profit, limits and rules. Changes apply to new purchases only.</p>
          </div>
          <div className="ad-top-actions">
            {dirty && <button type="button" className="ad-btn ad-btn-ghost" onClick={discard} disabled={saving}>Discard</button>}
            <button type="button" className="ad-btn ad-btn-primary" onClick={save} disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </header>

        <section className="ad-panel">
            <div className="ad-panel-head">
              <h2>All packages <span className="ad-muted">({config.packages.length})</span></h2>
              <button type="button" className="ad-btn ad-btn-primary" onClick={openNew}>Add package</button>
            </div>
            <div className="ad-pkg-grid">
              {config.packages.map((p) => {
                const total = p.dailyProfit * p.durationDays;
                const first = p.dailyProfit;
                return (
                  <article key={p.id} className={`ad-pkg ${p.visible ? "" : "is-hidden"}`}>
                    <div className="ad-pkg-head">
                      <span className="ad-pkg-icon"><Icon d="M5 12l5 5L20 7" size={21} /></span>
                      <div>
                        <h3>{p.name}</h3>
                        <small>{p.shortDescription || `${p.durationDays} days duration`}</small>
                      </div>
                      <b className={`ad-badge ${p.visible ? "" : "is-off"}`}>{p.visible ? "Active" : "Hidden"}</b>
                    </div>

                    <div className="ad-pkg-metrics">
                      {[
                        ["Package price", bdt(p.price)],
                        ["Daily fixed profit", bdt(p.dailyProfit)],
                        ["Daily profit", bdt(first)],
                        ["Total profit", bdt(total)],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <small>{label}</small>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="ad-pkg-rules"><div><small>অভিজাত ধাপ</small><strong>{p.minVipLevel === 0 ? "যেকোনো ধাপ" : p.minVipLevel}</strong></div><div><small>Buy limit per user</small><strong>{p.maxPerUser === 0 ? "Unlimited" : `${p.maxPerUser} time${p.maxPerUser > 1 ? "s" : ""}`}</strong></div></div>

                    <div className="ad-pkg-actions">
                      <label className="ad-pkg-toggle">
                        <button type="button" role="switch" aria-checked={p.visible} aria-label={`Show ${p.name} to users`} className={`ad-switch ${p.visible ? "is-on" : ""}`} onClick={() => toggleVisible(p.id)}>
                          <span />
                        </button>
                        Show to users
                      </label>
                      <button type="button" className="ad-btn ad-btn-ghost" onClick={() => openEdit(p)}>Edit package</button>
                    </div>
                  </article>
                );
              })}
              {config.packages.length === 0 && (
                <div className="ad-empty ad-grid-empty">No packages yet. Add your first package.</div>
              )}
            </div>
        </section>
      </main>

      {draft && (
        <div className="ad-modal-back" onClick={() => setDraft(null)}>
          <section className="ad-modal" role="dialog" aria-modal="true" aria-label={isNew ? "Add package" : `Edit ${draft.name}`} onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head">
              <h2>{isNew ? "Add package" : `Edit ${draft.name || "package"}`}</h2>
              <button type="button" className="ad-x" aria-label="Close" onClick={() => setDraft(null)}><Icon d="M6 6l12 12M18 6L6 18" /></button>
            </div>

            <div className="ad-modal-body">
              <Field label="Package photo" hint="JPG, PNG or WebP; max 5 MB.">
                {draft.id ? <><input type="file" accept="image/jpeg,image/png,image/webp" disabled={imageUploading} onChange={e => { void uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }} />{imageUploading && <small>Updating photo…</small>}{draft.imageUrl && <><img src={draft.imageUrl} alt="Package preview" style={{ display: "block", width: 120, height: 80, objectFit: "cover", marginTop: 8 }} /><button type="button" className="ad-btn ad-btn-danger-ghost" onClick={() => void removeImage()} disabled={imageUploading}>Remove photo</button></>}</> : <small>Add package first, then edit to upload photo.</small>}
              </Field>
              <div className="ad-form-grid">
                <Field label="Package name" error={errors.name}><input value={draft.name} onChange={(e) => setField("name", e.target.value)} placeholder="VIP 4" /></Field>
                <Field label="Short description"><input value={draft.shortDescription} onChange={(e) => setField("shortDescription", e.target.value)} /></Field>
                <Field label="Tank model"><input value={draft.modelNo} onChange={(e) => setField("modelNo", e.target.value)} /></Field>
                <Field label="Price (BDT)" error={errors.price}><input type="number" min={0} value={draft.price} onChange={(e) => setField("price", e.target.value)} /></Field>
                <Field label="Daily profit (BDT)" error={errors.dailyProfit} hint="Fixed amount; no percentage or compounding. Defaults to ৳300."><input type="number" min={1} step="1" value={draft.dailyProfit} onChange={(e) => setField("dailyProfit", e.target.value)} /></Field>
                <Field label="Duration (days)" error={errors.durationDays}><input type="number" min={1} value={draft.durationDays} onChange={(e) => setField("durationDays", e.target.value)} /></Field>
              </div>
              <Field label="Tank overview"><textarea rows={3} value={draft.tankOverview} onChange={(e) => setField("tankOverview", e.target.value)} /></Field>
              <Field label="Profit mechanism / purchase details"><textarea rows={3} value={draft.profitMechanism} onChange={(e) => setField("profitMechanism", e.target.value)} /></Field>

              {preview && (
                <div className="ad-preview">
                  <div><small>First day profit</small><strong>{bdt(preview.first)}</strong></div>
                  <div><small>Total profit</small><strong>{bdt(preview.total)}</strong></div>
                  <div><small>Total at the end</small><strong>{bdt(preview.end)}</strong></div>
                </div>
              )}

              {preview && (
                <details className="ad-ledger">
                  <summary>Daily profit schedule ({preview.rows.length} days)</summary>
                  <div className="ad-ledger-list">
                    {preview.rows.map((r) => (
                      <article key={r.day}>
                        <span>{r.day}</span>
                        <div>
                          <strong>Day {r.day} profit</strong>
                          <small>{bdt(r.open)} → {bdt(r.close)}</small>
                        </div>
                        <b>+ {bdt(r.profit)}</b>
                      </article>
                    ))}
                  </div>
                </details>
              )}

              <h3>ক্রয় সীমা</h3>
              <div className="ad-form-grid">
                <Field label="Times one user can buy" error={errors.maxPerUser} hint="0 means unlimited. Example: VIP 0 = 1, VIP 2 = 3."><input type="number" min={0} value={draft.maxPerUser} onChange={(e) => setField("maxPerUser", e.target.value)} /></Field>
                <Field label="অভিজাত ধাপ (সর্বনিম্ন)" error={errors.minVipLevel} hint="0 মানে কোনো ধাপের শর্ত নেই।"><input type="number" min={0} value={draft.minVipLevel} onChange={(e) => setField("minVipLevel", e.target.value)} /></Field>
              </div>
              <Switch checked={draft.visible} onChange={(v) => setField("visible", v)} label="Show to users" hint="Hidden packages cannot be bought. Running ones continue." />
            </div>

            <div className="ad-modal-foot">
              {!isNew && (
                confirmDelete ? (
                  <span className="ad-confirm">
                    Delete this package? Running investments are not affected.
                    <button type="button" className="ad-btn ad-btn-danger" onClick={deleteDraft}>Yes, delete</button>
                    <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
                  </span>
                ) : (
                  <button type="button" className="ad-btn ad-btn-danger-ghost" onClick={() => setConfirmDelete(true)}>Delete package</button>
                )
              )}
              <span className="ad-spacer" />
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setDraft(null)}>Cancel</button>
              <button type="button" className="ad-btn ad-btn-primary" onClick={applyDraft}>{isNew ? "Add package" : "Apply changes"}</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className={`ad-toast ${toast.bad ? "is-bad" : ""}`} role="status">{toast.text}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const css = `
.ad-muted{color:var(--muted)}
.ad-spacer{flex:1}
.ad-top-title{flex:1; min-width:220px}
.ad-top-actions{display:flex; gap:8px}
.ad-btn{border:1px solid transparent; border-radius:10px; padding:8px 16px; font-weight:600; cursor:pointer; transition:background .15s,border-color .15s; font:inherit}
.ad-btn:disabled{opacity:.5; cursor:not-allowed}
.ad-btn-primary{background:var(--sky-500); color:#fff}
.ad-btn-primary:hover:not(:disabled){background:var(--sky-600)}
.ad-btn-ghost{background:transparent; color:var(--sky-700); border-color:var(--line)}
.ad-btn-ghost:hover:not(:disabled){background:var(--sky-50); border-color:var(--sky-200)}
.ad-btn-danger{background:#c23030; color:#fff}
.ad-btn-danger-ghost{background:transparent; color:#c23030; border-color:#f3d4d4}
.ad-btn-danger-ghost:hover{background:#fdf1f1}
.ad-btn:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}

.ad-panel-head{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px}
.ad-panel-head h2{font-size:17px; font-weight:600; margin:0}
.ad-empty{text-align:center; color:var(--muted); padding:28px 12px !important}

.ad-form-grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px 16px; margin:14px 0}
.ad-field{display:flex; flex-direction:column; gap:5px}
.ad-field-label{font-size:14px; font-weight:600}
.ad-field-hint{font-size:12.5px; color:var(--muted)}
.ad-field-error{font-size:12.5px; color:#c23030}
.ad input,.ad select,.ad textarea{width:100%; border:1px solid var(--line); background:#fff; color:var(--ink); border-radius:10px; padding:9px 12px; font:inherit}
.ad input:focus,.ad select:focus,.ad textarea:focus{outline:2px solid var(--sky-200); border-color:var(--sky-500)}
.ad-modal-body h3{font-size:15px; font-weight:600; margin-top:20px}

.ad-switch-row{display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 0; border-top:1px solid var(--line)}
.ad-switch-label{font-weight:600}
.ad-switch{flex:none; width:40px; height:24px; border-radius:999px; border:0; background:#cfe0ea; position:relative; cursor:pointer; transition:background .15s; padding:0}
.ad-switch span{position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:transform .15s}
.ad-switch.is-on{background:var(--sky-500)}
.ad-switch.is-on span{transform:translateX(16px)}
.ad-switch:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}

.ad-preview{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; background:var(--sky-50); border:1px solid var(--sky-100); border-radius:12px; padding:12px 14px; margin-top:4px}
.ad-preview small{display:block; color:var(--muted); font-size:12.5px}
.ad-preview strong{color:var(--sky-700); font-size:16px}

.ad-pkg-grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px}
.ad-pkg{border:1px solid var(--line); border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:14px; background:var(--card)}
.ad-pkg.is-hidden{background:var(--bg)}
.ad-pkg-head{display:flex; align-items:center; gap:12px}
.ad-pkg-head > div{flex:1; min-width:0}
.ad-pkg-head h3{font-size:17px; font-weight:700; margin:0}
.ad-pkg-head small{color:var(--muted)}
.ad-pkg-icon{width:40px; height:40px; border-radius:12px; background:var(--sky-100); color:var(--sky-700); display:inline-flex; align-items:center; justify-content:center; flex:none}
.ad-badge{font-size:12.5px; font-weight:600; padding:3px 12px; border-radius:999px; background:var(--sky-100); color:var(--sky-700)}
.ad-badge.is-off{background:#eef2f5; color:var(--muted)}
.ad-pkg-metrics{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px}
.ad-pkg-metrics > div{background:var(--sky-50); border:1px solid var(--sky-100); border-radius:12px; padding:10px 12px}
.ad-pkg-metrics small,.ad-pkg-rules small{display:block; color:var(--muted); font-size:12.5px}
.ad-pkg-metrics strong{color:var(--sky-700); font-size:17px}
.ad-pkg-rules{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px}
.ad-pkg-rules > div{border:1px solid var(--line); border-radius:12px; padding:10px 12px}
.ad-pkg-rules strong{font-size:14.5px}
.ad-pkg-actions{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:auto}
.ad-pkg-toggle{display:flex; align-items:center; gap:10px; font-weight:500; font-size:14px}
.ad-grid-empty{grid-column:1/-1}

.ad-ledger{margin-top:12px; border:1px solid var(--line); border-radius:12px}
.ad-ledger summary{cursor:pointer; padding:10px 14px; font-weight:600; color:var(--sky-700)}
.ad-ledger-list{max-height:240px; overflow-y:auto; border-top:1px solid var(--line)}
.ad-ledger-list article{display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid var(--line)}
.ad-ledger-list article:last-child{border-bottom:0}
.ad-ledger-list article > span{width:30px; height:30px; border-radius:50%; background:var(--sky-100); color:var(--sky-700); display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; flex:none}
.ad-ledger-list article > div{flex:1; min-width:0}
.ad-ledger-list small{display:block; color:var(--muted); font-size:12.5px}
.ad-ledger-list b{color:var(--sky-700); white-space:nowrap}

.ad-modal-back{position:fixed; inset:0; background:rgba(12,42,61,.4); display:flex; align-items:center; justify-content:center; padding:16px; z-index:50}
.ad-modal{background:var(--card); border-radius:16px; width:100%; max-width:640px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(12,42,61,.2)}
.ad-modal-head{display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid var(--line)}
.ad-modal-head h2{font-size:18px; font-weight:700; margin:0}
.ad-x{border:0; background:transparent; color:var(--muted); cursor:pointer; border-radius:8px; padding:6px}
.ad-x:hover{background:var(--sky-50); color:var(--ink)}
.ad-x:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}
.ad-modal-body{padding:6px 20px 14px; overflow-y:auto}
.ad-modal-foot{display:flex; align-items:center; gap:8px; padding:14px 20px; border-top:1px solid var(--line); flex-wrap:wrap}
.ad-confirm{display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:13.5px}

.ad-toast{position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff; padding:10px 18px; border-radius:10px; z-index:60; font-weight:500}
.ad-toast.is-bad{background:#c23030}

@media (max-width:760px){
  .ad-form-grid,.ad-pkg-grid{grid-template-columns:1fr}
  .ad-preview{grid-template-columns:1fr}
  .ad-top-actions{width:100%}
  .ad-top-actions .ad-btn{flex:1}
}
@media (prefers-reduced-motion:reduce){ .ad-switch,.ad-switch span{transition:none} }
`;
