"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types + data                                                       */
/*  Replace DEFAULT_STATS / RECENT with your Supabase / API data.      */
/* ------------------------------------------------------------------ */

export type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdraws: number;
  totalStake: number;
  pendingWithdraws: number;
  referralPaid: number;
  activePackages: number;
};

type Activity = {
  id: string;
  user: string;
  type: "Deposit" | "Withdraw" | "Stake";
  amount: number;
  status: "Completed" | "Pending" | "Rejected";
  date: string;
};

const DEFAULT_STATS: DashboardStats = {
  totalUsers: 1248,
  activeUsers: 612,
  totalDeposits: 184250,
  totalWithdraws: 96480,
  totalStake: 73900,
  pendingWithdraws: 14,
  referralPaid: 8320,
  activePackages: 389,
};

const RECENT: Activity[] = [
  { id: "1", user: "rakib_h", type: "Deposit", amount: 500, status: "Completed", date: "Today, 10:42" },
  { id: "2", user: "nusrat22", type: "Withdraw", amount: 120, status: "Pending", date: "Today, 09:15" },
  { id: "3", user: "sajid.bd", type: "Stake", amount: 300, status: "Completed", date: "Yesterday, 21:03" },
  { id: "4", user: "tanvir_x", type: "Withdraw", amount: 75, status: "Rejected", date: "Yesterday, 18:27" },
  { id: "5", user: "mim_k", type: "Deposit", amount: 1000, status: "Completed", date: "Yesterday, 14:50" },
];

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" },
  { key: "users", label: "Users", icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0" },
  { key: "deposits", label: "Deposits", icon: "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" },
  { key: "withdraws", label: "Withdraws", icon: "M12 15V3m0 0L8 7m4-4l4 4M4 21h16" },
  { key: "packages", label: "Packages", icon: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" },
  { key: "referrals", label: "Referral Manage", icon: "M17 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM7 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 21a5 5 0 0 0-8-4" },
  { key: "settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" },
] as const;

const money = (n: number) =>
  "৳" + n.toLocaleString("en-BD", { maximumFractionDigits: 0 });
const num = (n: number) => n.toLocaleString("en-US");

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminDashboard({
  stats = DEFAULT_STATS,
  recent = RECENT,
  onNavigate,
}: {
  stats?: DashboardStats;
  recent?: Activity[];
  /** Called with the nav key when a sidebar button is clicked, e.g. router.push(`/admin/${key}`) */
  onNavigate?: (key: string) => void;
}) {
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(false);

  const cards = [
    { label: "Total users", value: num(stats.totalUsers), note: `${num(stats.activeUsers)} active now` },
    { label: "Active users", value: num(stats.activeUsers), note: `${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% of all users` },
    { label: "Total deposits", value: money(stats.totalDeposits), note: "All time" },
    { label: "Total withdraws", value: money(stats.totalWithdraws), note: `${stats.pendingWithdraws} waiting for approval` },
    { label: "Total stake", value: money(stats.totalStake), note: `${num(stats.activePackages)} active packages` },
    { label: "Referral paid", value: money(stats.referralPaid), note: "Bonus paid out" },
  ];

  const go = (key: string) => {
    setActive(key);
    setOpen(false);
    onNavigate?.(key);
  };

  return (
    <div className="ad">
      <style>{css}</style>

      {open && <div className="ad-scrim" onClick={() => setOpen(false)} />}

      <aside className={`ad-side ${open ? "is-open" : ""}`}>
        <div className="ad-brand">
          <span className="ad-logo" />
          Admin
        </div>
        <nav className="ad-nav" aria-label="Admin">
          {NAV.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`ad-link ${active === item.key ? "is-active" : ""}`}
              aria-current={active === item.key ? "page" : undefined}
              onClick={() => go(item.key)}
            >
              <Icon d={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="ad-main">
        <header className="ad-top">
          <button
            type="button"
            className="ad-burger"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Icon d="M4 6h16M4 12h16M4 18h16" />
          </button>
          <h1>Dashboard</h1>
        </header>

        <section className="ad-grid" aria-label="Overview">
          {cards.map((c) => (
            <article key={c.label} className="ad-card">
              <p className="ad-card-label">{c.label}</p>
              <p className="ad-card-value">{c.value}</p>
              <p className="ad-card-note">{c.note}</p>
            </article>
          ))}
        </section>

        <section className="ad-panel">
          <h2>Recent activity</h2>
          <div className="ad-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.user}</td>
                    <td>{r.type}</td>
                    <td>{money(r.amount)}</td>
                    <td>
                      <span className={`ad-pill ad-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="ad-muted">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles (self-contained, no Tailwind needed)                        */
/* ------------------------------------------------------------------ */

const css = `
.ad{
  --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd; --sky-500:#0ea5e9; --sky-600:#0284c7; --sky-700:#0369a1;
  --ink:#0c2a3d; --muted:#5b7488; --line:#e3eef5; --bg:#f7fbfe; --card:#ffffff;
  display:flex; min-height:100vh; background:var(--bg); color:var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size:15px; line-height:1.5;
}
.ad *{box-sizing:border-box}
.ad h1,.ad h2,.ad p{margin:0}

.ad-side{
  width:240px; flex:none; background:var(--card); border-right:1px solid var(--line);
  padding:20px 14px; display:flex; flex-direction:column; gap:20px;
  position:sticky; top:0; height:100vh;
}
.ad-brand{display:flex; align-items:center; gap:10px; font-weight:700; font-size:17px; padding:4px 10px}
.ad-logo{width:22px; height:22px; border-radius:7px; background:var(--sky-500); display:inline-block}
.ad-nav{display:flex; flex-direction:column; gap:2px}
.ad-link{
  display:flex; align-items:center; gap:12px; width:100%; text-align:left;
  border:0; background:transparent; color:var(--muted); font:inherit; font-weight:500;
  padding:10px 12px; border-radius:10px; cursor:pointer;
  transition:background .15s, color .15s;
}
.ad-link:hover{background:var(--sky-50); color:var(--sky-700)}
.ad-link.is-active{background:var(--sky-100); color:var(--sky-700)}
.ad-link:focus-visible,.ad-burger:focus-visible{outline:2px solid var(--sky-500); outline-offset:2px}

.ad-main{flex:1; min-width:0; padding:28px 32px 48px}
.ad-top{display:flex; align-items:center; gap:12px; margin-bottom:24px}
.ad-top h1{font-size:24px; font-weight:700; letter-spacing:-.01em}
.ad-burger{display:none; border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:10px; padding:8px; cursor:pointer}

.ad-grid{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px}
.ad-card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px 20px}
.ad-card-label{color:var(--muted); font-size:14px}
.ad-card-value{font-size:30px; font-weight:700; letter-spacing:-.02em; margin-top:6px; color:var(--sky-700)}
.ad-card-note{color:var(--muted); font-size:13px; margin-top:4px}

.ad-panel{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px; margin-top:16px}
.ad-panel h2{font-size:17px; font-weight:600; margin-bottom:12px}
.ad-table-wrap{overflow-x:auto}
.ad table{width:100%; border-collapse:collapse; min-width:520px}
.ad th{text-align:left; font-weight:500; color:var(--muted); font-size:13px; padding:8px 12px; border-bottom:1px solid var(--line)}
.ad td{padding:12px; border-bottom:1px solid var(--line)}
.ad tr:last-child td{border-bottom:0}
.ad-muted{color:var(--muted)}
.ad-pill{display:inline-block; padding:2px 10px; border-radius:999px; font-size:12.5px; font-weight:500}
.ad-completed{background:var(--sky-100); color:var(--sky-700)}
.ad-pending{background:#fff4d6; color:#8a5a00}
.ad-rejected{background:#fde4e4; color:#a12525}

.ad-scrim{display:none}

@media (max-width:1024px){ .ad-grid{grid-template-columns:repeat(2,minmax(0,1fr))} }
@media (max-width:760px){
  .ad-side{position:fixed; left:0; top:0; z-index:30; transform:translateX(-100%); transition:transform .2s ease}
  .ad-side.is-open{transform:none}
  .ad-scrim{display:block; position:fixed; inset:0; background:rgba(12,42,61,.35); z-index:20}
  .ad-burger{display:inline-flex}
  .ad-main{padding:20px 16px 40px}
  .ad-grid{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){ .ad-side,.ad-link{transition:none} }
`;