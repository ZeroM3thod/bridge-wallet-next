"use client";

import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type GeneralSettings = {
  enabled: boolean;
  requireCodeAtSignup: boolean;
  blockSelfReferral: boolean;
  activeWhen: "min_vip" | "min_deposit" | "any_package";
  activeMinVip: number;
  activeMinDeposit: number; // BDT
  maxBonusPerUser: number; // BDT, 0 = no cap
};

export type LevelSettings = {
  level: 1 | 2 | 3;
  enabled: boolean;
  title: string;
  depositBonus: number; // %
  profitCommission: number; // %
};

export type CommissionSettings = {
  levels: LevelSettings[];
  depositBonusOn: "first" | "every";
  minDepositForBonus: number; // BDT
  payout: "instant" | "approval";
  maxCommissionPerMember: number; // BDT, 0 = no cap
};

export type SalaryTier = {
  id: string;
  icon: string;
  rank: string;
  amount: number; // BDT per cycle
  reqL1: number;
  reqL2: number;
  reqL3: number;
  enabled: boolean;
};

export type SalarySettings = {
  enabled: boolean;
  minVip: number; // lowest VIP level that counts toward salary
  cycle: "monthly" | "weekly";
  onePerCycle: boolean;
  needsApproval: boolean;
  tiers: SalaryTier[];
};

export type ReferralConfig = {
  general: GeneralSettings;
  commissions: CommissionSettings;
  salary: SalarySettings;
};

/* ------------------------------------------------------------------ */
/*  Placeholder data - replace with data from your API / Supabase      */
/* ------------------------------------------------------------------ */

const DEFAULT_CONFIG: ReferralConfig = {
  general: {
    enabled: true,
    requireCodeAtSignup: false,
    blockSelfReferral: true,
    activeWhen: "min_vip",
    activeMinVip: 1,
    activeMinDeposit: 500,
    maxBonusPerUser: 0,
  },
  commissions: {
    levels: [
      { level: 1, enabled: true, title: "১ম লেভেল", depositBonus: 8, profitCommission: 8 },
      { level: 2, enabled: true, title: "২য় লেভেল", depositBonus: 3, profitCommission: 3 },
      { level: 3, enabled: true, title: "৩য় লেভেল", depositBonus: 1, profitCommission: 1 },
    ],
    depositBonusOn: "every",
    minDepositForBonus: 0,
    payout: "instant",
    maxCommissionPerMember: 0,
  },
  salary: {
    enabled: true,
    minVip: 1,
    cycle: "monthly",
    onePerCycle: true,
    needsApproval: true,
    tiers: [
      { id: "t1", icon: "🥉", rank: "ব্রোঞ্জ লিডার", amount: 1000, reqL1: 5, reqL2: 0, reqL3: 0, enabled: true },
      { id: "t2", icon: "🥈", rank: "সিলভার লিডার", amount: 3000, reqL1: 10, reqL2: 5, reqL3: 0, enabled: true },
      { id: "t3", icon: "🥇", rank: "গোল্ড লিডার", amount: 8000, reqL1: 20, reqL2: 10, reqL3: 5, enabled: true },
      { id: "t4", icon: "💎", rank: "ডায়মন্ড লিডার", amount: 20000, reqL1: 40, reqL2: 20, reqL3: 10, enabled: true },
      { id: "t5", icon: "👑", rank: "ক্রাউন লিডার", amount: 50000, reqL1: 80, reqL2: 40, reqL3: 20, enabled: true },
    ],
  },
};

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" },
  { key: "users", label: "Users", icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0" },
  { key: "deposits", label: "Deposits", icon: "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" },
  { key: "withdraws", label: "Withdraws", icon: "M12 15V3m0 0L8 7m4-4l4 4M4 21h16" },
  { key: "packages", label: "Packages", icon: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" },
  { key: "referrals", label: "Referral Manage", icon: "M17 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM7 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 21a5 5 0 0 0-8-4" },
  { key: "settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" },
] as const;

const bdt = (n: number) => "৳" + n.toLocaleString("en-BD", { maximumFractionDigits: 2 });

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Small form pieces                                                  */
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

/** Number input that lets you clear and retype; only valid values are committed. */
function NumInput({ value, onChange, min = 0, max, step, int, disabled, ariaLabel }: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: string;
  int?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText((t) => (Number(t) === value ? t : String(value)));
  }, [value]);
  return (
    <input
      type="number"
      inputMode={int ? "numeric" : "decimal"}
      value={text}
      min={min}
      max={max}
      step={step ?? (int ? "1" : "any")}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        const n = Number(t);
        const ok = t.trim() !== "" && Number.isFinite(n) && n >= min && (max === undefined || n <= max) && (!int || Number.isInteger(n));
        if (ok) onChange(n);
      }}
      onBlur={() => setText(String(value))}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Salary tier form                                                   */
/* ------------------------------------------------------------------ */

type TierDraft = { id: string; icon: string; rank: string; amount: string; reqL1: string; reqL2: string; reqL3: string; enabled: boolean };
type TierErrors = Partial<Record<keyof TierDraft, string>>;

const tierToDraft = (t: SalaryTier): TierDraft => ({ ...t, amount: String(t.amount), reqL1: String(t.reqL1), reqL2: String(t.reqL2), reqL3: String(t.reqL3) });
const emptyTier = (): TierDraft => ({ id: "", icon: "⭐", rank: "", amount: "", reqL1: "1", reqL2: "0", reqL3: "0", enabled: true });

function validateTier(d: TierDraft, others: SalaryTier[]): TierErrors {
  const e: TierErrors = {};
  const n = (v: string) => (v.trim() === "" ? NaN : Number(v));
  if (!d.rank.trim()) e.rank = "Enter a rank name.";
  else if (others.some((t) => t.rank.trim().toLowerCase() === d.rank.trim().toLowerCase())) e.rank = "Another tier already uses this name.";
  if (!(n(d.amount) > 0)) e.amount = "Amount must be more than 0.";
  (["reqL1", "reqL2", "reqL3"] as const).forEach((k) => {
    if (!(Number.isInteger(n(d[k])) && n(d[k]) >= 0)) e[k] = "Whole number, 0 or more.";
  });
  if (!e.reqL1 && n(d.reqL1) < 1) e.reqL1 = "Level 1 needs at least 1 active member.";
  return e;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type Tab = "general" | "commissions" | "salary";

export default function ReferralManagement({
  initial = DEFAULT_CONFIG,
  onSave,
  onNavigate,
}: {
  initial?: ReferralConfig;
  /** Save to your backend. Throw / reject to show an error. */
  onSave?: (config: ReferralConfig) => Promise<void> | void;
  onNavigate?: (key: string) => void;
}) {
  const [saved, setSaved] = useState<ReferralConfig>(initial);
  const [config, setConfig] = useState<ReferralConfig>(initial);
  const [tab, setTab] = useState<Tab>("general");
  const [menu, setMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);

  const [tier, setTier] = useState<TierDraft | null>(null);
  const [tierNew, setTierNew] = useState(false);
  const [tierErrors, setTierErrors] = useState<TierErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [exDeposit, setExDeposit] = useState(1000);
  const [exProfit, setExProfit] = useState(20);

  const { general: g, commissions: cm, salary: sl } = config;

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(config), [saved, config]);

  const say = (text: string, bad?: boolean) => {
    setToast({ text, bad });
    setTimeout(() => setToast(null), 3000);
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave?.(config);
      setSaved(config);
      say("Changes saved");
    } catch {
      say("Could not save changes. Try again.", true);
    } finally {
      setSaving(false);
    }
  };

  /* ---- updaters ---- */
  function upd<S extends keyof ReferralConfig>(section: S, patch: Partial<ReferralConfig[S]>) {
    setConfig((c) => ({ ...c, [section]: { ...c[section], ...patch } }) as ReferralConfig);
  }
  const updLevel = (level: 1 | 2 | 3, patch: Partial<LevelSettings>) =>
    upd("commissions", { levels: cm.levels.map((l) => (l.level === level ? { ...l, ...patch } : l)) });

  /* ---- salary tier modal ---- */
  const openTier = (t: SalaryTier) => { setTier(tierToDraft(t)); setTierNew(false); setTierErrors({}); setConfirmDelete(false); };
  const openNewTier = () => { setTier(emptyTier()); setTierNew(true); setTierErrors({}); setConfirmDelete(false); };
  const setTierField = <K extends keyof TierDraft>(k: K, v: TierDraft[K]) => setTier((d) => (d ? { ...d, [k]: v } : d));

  const applyTier = () => {
    if (!tier) return;
    const e = validateTier(tier, sl.tiers.filter((t) => t.id !== tier.id));
    setTierErrors(e);
    if (Object.keys(e).length) return;
    const next: SalaryTier = {
      id: tierNew ? `tier-${Date.now()}` : tier.id,
      icon: tier.icon.trim() || "⭐",
      rank: tier.rank.trim(),
      amount: Number(tier.amount),
      reqL1: Number(tier.reqL1),
      reqL2: Number(tier.reqL2),
      reqL3: Number(tier.reqL3),
      enabled: tier.enabled,
    };
    const list = tierNew ? [...sl.tiers, next] : sl.tiers.map((t) => (t.id === next.id ? next : t));
    // The user page picks the best tier assuming lowest -> highest, so keep them sorted by amount.
    upd("salary", { tiers: list.sort((a, b) => a.amount - b.amount) });
    setTier(null);
  };
  const deleteTier = () => {
    if (!tier) return;
    upd("salary", { tiers: sl.tiers.filter((t) => t.id !== tier.id) });
    setTier(null);
  };
  const toggleTier = (id: string) => upd("salary", { tiers: sl.tiers.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)) });

  /* ---- previews ---- */
  const TABS: [Tab, string][] = [["general", "General"], ["commissions", "Commissions"], ["salary", "Monthly salary"]];

  return (
    <div className="ad">
      <style>{css}</style>

      {menu && <div className="ad-scrim" onClick={() => setMenu(false)} />}

      <aside className={`ad-side ${menu ? "is-open" : ""}`}>
        <div className="ad-brand"><span className="ad-logo" />Admin</div>
        <nav className="ad-nav" aria-label="Admin">
          {NAV.map((item) => (
            <button key={item.key} type="button" className={`ad-link ${item.key === "referrals" ? "is-active" : ""}`} aria-current={item.key === "referrals" ? "page" : undefined} onClick={() => { setMenu(false); onNavigate?.(item.key); }}>
              <Icon d={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="ad-main">
        <header className="ad-top">
          <button type="button" className="ad-burger" aria-label="Open menu" onClick={() => setMenu(true)}><Icon d="M4 6h16M4 12h16M4 18h16" /></button>
          <div className="ad-top-title">
            <h1>Referral management</h1>
            <p className="ad-muted">Rules, commissions and salary for the Team pages. Changes apply from the next transaction.</p>
          </div>
          <div className="ad-top-actions">
            {dirty && <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setConfig(saved)} disabled={saving}>Discard</button>}
            <button type="button" className="ad-btn ad-btn-primary" onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </header>

        <div className="ad-tabs" role="tablist">
          {TABS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={`ad-tab ${tab === k ? "is-active" : ""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* ================= GENERAL ================= */}
        {tab === "general" && (
          <>
            <section className="ad-panel">
              <h2>Referral program</h2>
              <Switch checked={g.enabled} onChange={(v) => upd("general", { enabled: v })} label="Referral system" hint="Turn off to stop all referral bonuses, commissions and salary claims." />
              <Switch checked={g.requireCodeAtSignup} onChange={(v) => upd("general", { requireCodeAtSignup: v })} label="Require an invite code to sign up" hint="Off: new members can join without a code." />
              <Switch checked={g.blockSelfReferral} onChange={(v) => upd("general", { blockSelfReferral: v })} label="Block self-referral" hint="Stops a member using their own code or the same device/number." />
            </section>

            <section className="ad-panel">
              <h2>Active member rules</h2>
              <p className="ad-muted">Decides who counts as an active referral in the member list and salary conditions.</p>
              <div className="ad-form-grid">
                <Field label="A member is active when">
                  <select value={g.activeWhen} onChange={(e) => upd("general", { activeWhen: e.target.value as GeneralSettings["activeWhen"] })}>
                    <option value="min_vip">They reach a minimum VIP level</option>
                    <option value="min_deposit">They deposited at least an amount</option>
                    <option value="any_package">They bought any package</option>
                  </select>
                </Field>
                {g.activeWhen === "min_vip" && (
                  <Field label="Minimum VIP level" hint="1 means VIP 1 or higher.">
                    <NumInput int min={0} max={20} value={g.activeMinVip} onChange={(n) => upd("general", { activeMinVip: n })} />
                  </Field>
                )}
                {g.activeWhen === "min_deposit" && (
                  <Field label="Minimum total deposit (BDT)">
                    <NumInput min={0} value={g.activeMinDeposit} onChange={(n) => upd("general", { activeMinDeposit: n })} />
                  </Field>
                )}
                <Field label="Max referral earnings per user (BDT)" hint="0 means no cap.">
                  <NumInput min={0} value={g.maxBonusPerUser} onChange={(n) => upd("general", { maxBonusPerUser: n })} />
                </Field>
              </div>
            </section>
          </>
        )}

        {/* ================= COMMISSIONS ================= */}
        {tab === "commissions" && (
          <>
            <section className="ad-panel">
              <h2>Level rates</h2>
              <p className="ad-muted">Deposit bonus and profit commission can be different for each level.</p>
              <div className="ad-lvl-grid">
                {cm.levels.map((l) => (
                  <article key={l.level} className={`ad-pkg ${l.enabled ? "" : "is-hidden"}`}>
                    <div className="ad-pkg-head">
                      <span className="ad-pkg-icon">{l.level}</span>
                      <div><h3>Level {l.level}</h3><small>{l.enabled ? "Paying commission" : "Turned off"}</small></div>
                      <button type="button" role="switch" aria-checked={l.enabled} aria-label={`Level ${l.level} on or off`} className={`ad-switch ${l.enabled ? "is-on" : ""}`} onClick={() => updLevel(l.level, { enabled: !l.enabled })}><span /></button>
                    </div>
                    <div className="ad-stack">
                      <Field label="Level name (shown to users)"><input value={l.title} onChange={(e) => updLevel(l.level, { title: e.target.value })} /></Field>
                      <Field label="Deposit bonus (%)"><NumInput min={0} max={100} step="0.1" value={l.depositBonus} onChange={(n) => updLevel(l.level, { depositBonus: n })} /></Field>
                      <Field label="Profit commission (%)"><NumInput min={0} max={100} step="0.1" value={l.profitCommission} onChange={(n) => updLevel(l.level, { profitCommission: n })} /></Field>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="ad-panel">
              <h2>How commissions are paid</h2>
              <div className="ad-form-grid">
                <Field label="Deposit bonus is paid on">
                  <select value={cm.depositBonusOn} onChange={(e) => upd("commissions", { depositBonusOn: e.target.value as CommissionSettings["depositBonusOn"] })}>
                    <option value="every">Every deposit</option>
                    <option value="first">First deposit only</option>
                  </select>
                </Field>
                <Field label="Minimum deposit to earn a bonus (BDT)" hint="0 means any amount.">
                  <NumInput min={0} value={cm.minDepositForBonus} onChange={(n) => upd("commissions", { minDepositForBonus: n })} />
                </Field>
                <Field label="Payout">
                  <select value={cm.payout} onChange={(e) => upd("commissions", { payout: e.target.value as CommissionSettings["payout"] })}>
                    <option value="instant">Instantly to the wallet</option>
                    <option value="approval">After admin approval</option>
                  </select>
                </Field>
                <Field label="Max earnings from one member (BDT)" hint="0 means no cap.">
                  <NumInput min={0} value={cm.maxCommissionPerMember} onChange={(n) => upd("commissions", { maxCommissionPerMember: n })} />
                </Field>
              </div>
            </section>

            <section className="ad-panel">
              <h2>Try it</h2>
              <div className="ad-form-grid">
                <Field label="Example deposit (BDT)"><NumInput min={0} value={exDeposit} onChange={setExDeposit} /></Field>
                <Field label="Example daily profit of that member (BDT)"><NumInput min={0} value={exProfit} onChange={setExProfit} /></Field>
              </div>
              <div className="ad-table-wrap">
                <table>
                  <thead><tr><th>Level</th><th>Deposit bonus</th><th>Daily commission</th></tr></thead>
                  <tbody>
                    {cm.levels.map((l) => (
                      <tr key={l.level}>
                        <td>{l.title || `Level ${l.level}`}</td>
                        <td>{l.enabled ? `${bdt((exDeposit * l.depositBonus) / 100)} (${l.depositBonus}%)` : <span className="ad-muted">Off</span>}</td>
                        <td>{l.enabled ? `${bdt((exProfit * l.profitCommission) / 100)} (${l.profitCommission}%)` : <span className="ad-muted">Off</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ================= SALARY ================= */}
        {tab === "salary" && (
          <>
            <section className="ad-panel">
              <h2>Salary rules</h2>
              <Switch checked={sl.enabled} onChange={(v) => upd("salary", { enabled: v })} label="Team salary" hint="Turn off to hide claims on the salary page." />
              <div className={`ad-form-grid ${sl.enabled ? "" : "is-off"}`}>
                <Field label="Lowest VIP level that counts" hint="Members below this are not counted for salary.">
                  <NumInput int min={0} max={20} value={sl.minVip} onChange={(n) => upd("salary", { minVip: n })} />
                </Field>
                <Field label="Salary cycle">
                  <select value={sl.cycle} onChange={(e) => upd("salary", { cycle: e.target.value as SalarySettings["cycle"] })}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </Field>
              </div>
              <Switch checked={sl.onePerCycle} onChange={(v) => upd("salary", { onePerCycle: v })} label="Only one tier claim per cycle" hint="On: after claiming one tier the member cannot claim another until the next cycle." />
              <Switch checked={sl.needsApproval} onChange={(v) => upd("salary", { needsApproval: v })} label="Admin approval before payment" hint="On: claims wait for the admin, then go to the wallet." />
            </section>

            <section className="ad-panel">
              <div className="ad-panel-head">
                <div>
                  <h2>Salary tiers <span className="ad-muted">({sl.tiers.length})</span></h2>
                  <p className="ad-muted">Members need this many active referrals at each level. Tiers are kept in order of amount.</p>
                </div>
                <button type="button" className="ad-btn ad-btn-primary" onClick={openNewTier}>Add tier</button>
              </div>
              <div className="ad-pkg-grid">
                {sl.tiers.map((t) => (
                  <article key={t.id} className={`ad-pkg ${t.enabled ? "" : "is-hidden"}`}>
                    <div className="ad-pkg-head">
                      <span className="ad-pkg-icon ad-emoji">{t.icon}</span>
                      <div><h3>{t.rank}</h3><small>{bdt(t.amount)} / {sl.cycle === "monthly" ? "month" : "week"}</small></div>
                      <b className={`ad-badge ${t.enabled ? "" : "is-off"}`}>{t.enabled ? "Active" : "Hidden"}</b>
                    </div>
                    <div className="ad-reqs">
                      <span className="ad-req">Level 1: {t.reqL1} active</span>
                      {t.reqL2 > 0 && <span className="ad-req">Level 2: {t.reqL2} active</span>}
                      {t.reqL3 > 0 && <span className="ad-req">Level 3: {t.reqL3} active</span>}
                    </div>
                    <div className="ad-pkg-actions">
                      <label className="ad-pkg-toggle">
                        <button type="button" role="switch" aria-checked={t.enabled} aria-label={`Show ${t.rank} to users`} className={`ad-switch ${t.enabled ? "is-on" : ""}`} onClick={() => toggleTier(t.id)}><span /></button>
                        Show to users
                      </label>
                      <button type="button" className="ad-btn ad-btn-ghost" onClick={() => openTier(t)}>Edit tier</button>
                    </div>
                  </article>
                ))}
                {sl.tiers.length === 0 && <div className="ad-empty ad-grid-empty">No tiers yet. Add your first tier.</div>}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ---------------- Salary tier modal ---------------- */}
      {tier && (
        <div className="ad-modal-back" onClick={() => setTier(null)}>
          <section className="ad-modal" role="dialog" aria-modal="true" aria-label={tierNew ? "Add tier" : `Edit ${tier.rank}`} onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head">
              <h2>{tierNew ? "Add salary tier" : `Edit ${tier.rank || "tier"}`}</h2>
              <button type="button" className="ad-x" aria-label="Close" onClick={() => setTier(null)}><Icon d="M6 6l12 12M18 6L6 18" /></button>
            </div>
            <div className="ad-modal-body">
              <div className="ad-form-grid">
                <Field label="Icon (emoji)" hint="Shown before the rank name."><input value={tier.icon} maxLength={4} onChange={(e) => setTierField("icon", e.target.value)} /></Field>
                <Field label="Rank name" error={tierErrors.rank}><input value={tier.rank} onChange={(e) => setTierField("rank", e.target.value)} /></Field>
                <Field label={`Salary per ${sl.cycle === "monthly" ? "month" : "week"} (BDT)`} error={tierErrors.amount}><input type="number" min={0} value={tier.amount} onChange={(e) => setTierField("amount", e.target.value)} /></Field>
              </div>
              <h3>Conditions (active referrals needed)</h3>
              <div className="ad-form-grid three">
                <Field label="Level 1" error={tierErrors.reqL1}><input type="number" min={1} value={tier.reqL1} onChange={(e) => setTierField("reqL1", e.target.value)} /></Field>
                <Field label="Level 2" error={tierErrors.reqL2} hint="0 means not needed."><input type="number" min={0} value={tier.reqL2} onChange={(e) => setTierField("reqL2", e.target.value)} /></Field>
                <Field label="Level 3" error={tierErrors.reqL3} hint="0 means not needed."><input type="number" min={0} value={tier.reqL3} onChange={(e) => setTierField("reqL3", e.target.value)} /></Field>
              </div>
              <Switch checked={tier.enabled} onChange={(v) => setTierField("enabled", v)} label="Show to users" hint="Hidden tiers cannot be claimed." />
            </div>
            <div className="ad-modal-foot">
              {!tierNew && (
                confirmDelete ? (
                  <span className="ad-confirm">
                    Delete this tier?
                    <button type="button" className="ad-btn ad-btn-danger" onClick={deleteTier}>Yes, delete</button>
                    <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
                  </span>
                ) : (
                  <button type="button" className="ad-btn ad-btn-danger-ghost" onClick={() => setConfirmDelete(true)}>Delete tier</button>
                )
              )}
              <span className="ad-spacer" />
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setTier(null)}>Cancel</button>
              <button type="button" className="ad-btn ad-btn-primary" onClick={applyTier}>{tierNew ? "Add tier" : "Apply changes"}</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className={`ad-toast ${toast.bad ? "is-bad" : ""}`} role="status">{toast.text}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles (self-contained)                                            */
/* ------------------------------------------------------------------ */

const css = `
.ad{
  --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd; --sky-500:#0ea5e9; --sky-600:#0284c7; --sky-700:#0369a1;
  --ink:#0c2a3d; --muted:#5b7488; --line:#e3eef5; --bg:#f7fbfe; --card:#fff; --red:#c23030;
  display:flex; min-height:100vh; background:var(--bg); color:var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size:15px; line-height:1.5;
}
.ad *{box-sizing:border-box}
.ad h1,.ad h2,.ad h3,.ad p{margin:0}
.ad button{font:inherit}
.ad-muted{color:var(--muted)}
.ad-spacer{flex:1}

/* sidebar */
.ad-side{width:240px; flex:none; background:var(--card); border-right:1px solid var(--line); padding:20px 14px; display:flex; flex-direction:column; gap:20px; position:sticky; top:0; height:100vh}
.ad-brand{display:flex; align-items:center; gap:10px; font-weight:700; font-size:17px; padding:4px 10px}
.ad-logo{width:22px; height:22px; border-radius:7px; background:var(--sky-500); display:inline-block}
.ad-nav{display:flex; flex-direction:column; gap:2px}
.ad-link{display:flex; align-items:center; gap:12px; width:100%; text-align:left; border:0; background:transparent; color:var(--muted); font-weight:500; padding:10px 12px; border-radius:10px; cursor:pointer; transition:background .15s,color .15s}
.ad-link:hover{background:var(--sky-50); color:var(--sky-700)}
.ad-link.is-active{background:var(--sky-100); color:var(--sky-700)}
.ad-link:focus-visible,.ad-burger:focus-visible,.ad-btn:focus-visible,.ad-tab:focus-visible,.ad-switch:focus-visible,.ad-x:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}

/* layout */
.ad-main{flex:1; min-width:0; padding:28px 32px 56px}
.ad-top{display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap}
.ad-top-title{flex:1; min-width:220px}
.ad-top h1{font-size:24px; font-weight:700; letter-spacing:-.01em}
.ad-top-actions{display:flex; gap:8px}
.ad-burger{display:none; border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:10px; padding:8px; cursor:pointer}

/* buttons */
.ad-btn{border:1px solid transparent; border-radius:10px; padding:8px 16px; font-weight:600; cursor:pointer; transition:background .15s,border-color .15s; white-space:nowrap}
.ad-btn:disabled{opacity:.5; cursor:not-allowed}
.ad-btn-primary{background:var(--sky-500); color:#fff}
.ad-btn-primary:hover:not(:disabled){background:var(--sky-600)}
.ad-btn-ghost{background:transparent; color:var(--sky-700); border-color:var(--line)}
.ad-btn-ghost:hover:not(:disabled){background:var(--sky-50); border-color:var(--sky-200)}
.ad-btn-danger{background:var(--red); color:#fff}
.ad-btn-danger-ghost{background:transparent; color:var(--red); border-color:#f3d4d4}
.ad-btn-danger-ghost:hover{background:#fdf1f1}

/* tabs */
.ad-tabs{display:flex; gap:4px; border-bottom:1px solid var(--line); margin-bottom:16px; overflow-x:auto}
.ad-tab{border:0; background:transparent; color:var(--muted); font-weight:600; padding:10px 14px; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; white-space:nowrap}
.ad-tab:hover{color:var(--sky-700)}
.ad-tab.is-active{color:var(--sky-700); border-bottom-color:var(--sky-500)}

/* panels */
.ad-panel{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px}
.ad-panel + .ad-panel{margin-top:16px}
.ad-panel h2{font-size:17px; font-weight:600; margin-bottom:6px}
.ad-panel-head{display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px}
.ad-empty{text-align:center; color:var(--muted); padding:24px 12px}
.ad-table-wrap{overflow-x:auto; margin-top:8px}
.ad table{width:100%; border-collapse:collapse; min-width:420px}
.ad th{text-align:left; font-weight:500; color:var(--muted); font-size:13px; padding:8px 12px; border-bottom:1px solid var(--line); white-space:nowrap}
.ad td{padding:12px; border-bottom:1px solid var(--line)}
.ad tr:last-child td{border-bottom:0}

/* forms */
.ad-form-grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px 16px; margin:14px 0}
.ad-form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}
.ad-form-grid.is-off{opacity:.45; pointer-events:none}
.ad-stack{display:flex; flex-direction:column; gap:12px}
.ad-field{display:flex; flex-direction:column; gap:5px}
.ad-field-label{font-size:14px; font-weight:600}
.ad-field-hint{font-size:12.5px; color:var(--muted)}
.ad-field-error{font-size:12.5px; color:var(--red)}
.ad input,.ad select,.ad textarea{width:100%; border:1px solid var(--line); background:#fff; color:var(--ink); border-radius:10px; padding:9px 12px; font:inherit}
.ad textarea{resize:vertical}
.ad input:focus,.ad select:focus,.ad textarea:focus{outline:2px solid var(--sky-200); border-color:var(--sky-500)}
.ad input:disabled{background:var(--bg); color:var(--muted)}
.ad-modal-body h3{font-size:15px; font-weight:600; margin-top:20px}

/* switch */
.ad-switch-row{display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 0; border-top:1px solid var(--line)}
.ad-panel > h2 + .ad-switch-row{border-top:0}
.ad-switch-label{font-weight:600}
.ad-switch{flex:none; width:40px; height:24px; border-radius:999px; border:0; background:#cfe0ea; position:relative; cursor:pointer; transition:background .15s; padding:0}
.ad-switch span{position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:transform .15s}
.ad-switch.is-on{background:var(--sky-500)}
.ad-switch.is-on span{transform:translateX(16px)}

/* cards (levels, tiers) */
.ad-lvl-grid{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-top:12px}
.ad-pkg-grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px}
.ad-pkg{border:1px solid var(--line); border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:14px; background:var(--card)}
.ad-pkg.is-hidden{background:var(--bg)}
.ad-pkg-head{display:flex; align-items:center; gap:12px}
.ad-pkg-head > div{flex:1; min-width:0}
.ad-pkg-head h3{font-size:17px; font-weight:700}
.ad-pkg-head small{color:var(--muted)}
.ad-pkg-icon{width:40px; height:40px; border-radius:12px; background:var(--sky-100); color:var(--sky-700); display:inline-flex; align-items:center; justify-content:center; flex:none; font-weight:700}
.ad-emoji{font-size:20px}
.ad-badge{font-size:12.5px; font-weight:600; padding:3px 12px; border-radius:999px; background:var(--sky-100); color:var(--sky-700)}
.ad-badge.is-off{background:#eef2f5; color:var(--muted)}
.ad-reqs{display:flex; flex-wrap:wrap; gap:8px}
.ad-req{background:var(--sky-50); border:1px solid var(--sky-100); color:var(--sky-700); border-radius:999px; padding:3px 12px; font-size:13px; font-weight:500}
.ad-pkg-actions{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:auto}
.ad-pkg-toggle{display:flex; align-items:center; gap:10px; font-weight:500; font-size:14px}
.ad-grid-empty{grid-column:1/-1}

/* modal */
.ad-modal-back{position:fixed; inset:0; background:rgba(12,42,61,.4); display:flex; align-items:center; justify-content:center; padding:16px; z-index:50}
.ad-modal{background:var(--card); border-radius:16px; width:100%; max-width:600px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(12,42,61,.2)}
.ad-modal-head{display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid var(--line)}
.ad-modal-head h2{font-size:18px; font-weight:700; margin:0}
.ad-x{border:0; background:transparent; color:var(--muted); cursor:pointer; border-radius:8px; padding:6px}
.ad-x:hover{background:var(--sky-50); color:var(--ink)}
.ad-modal-body{padding:6px 20px 14px; overflow-y:auto}
.ad-modal-foot{display:flex; align-items:center; gap:8px; padding:14px 20px; border-top:1px solid var(--line); flex-wrap:wrap}
.ad-confirm{display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:13.5px}

.ad-toast{position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff; padding:10px 18px; border-radius:10px; z-index:60; font-weight:500}
.ad-toast.is-bad{background:var(--red)}
.ad-scrim{display:none}

@media (max-width:1024px){ .ad-lvl-grid{grid-template-columns:1fr} }
@media (max-width:760px){
  .ad-side{position:fixed; left:0; top:0; z-index:30; transform:translateX(-100%); transition:transform .2s ease}
  .ad-side.is-open{transform:none}
  .ad-scrim{display:block; position:fixed; inset:0; background:rgba(12,42,61,.35); z-index:20}
  .ad-burger{display:inline-flex}
  .ad-main{padding:20px 16px 40px}
  .ad-form-grid,.ad-form-grid.three,.ad-pkg-grid{grid-template-columns:1fr}
  .ad-top-actions{width:100%}
  .ad-top-actions .ad-btn{flex:1}
  .ad-panel-head{flex-direction:column}
}
@media (prefers-reduced-motion:reduce){ .ad-side,.ad-link,.ad-switch,.ad-switch span{transition:none} }
`;