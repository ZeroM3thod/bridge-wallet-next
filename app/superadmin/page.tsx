"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

/* ------------------------------------------------------------------ */
/*  Types + data                                                       */
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

const money = (n: number) =>
  "৳" + n.toLocaleString("en-BD", { maximumFractionDigits: 0 });
const num = (n: number) => n.toLocaleString("en-US");

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminDashboard({
  stats = DEFAULT_STATS,
  recent = RECENT,
}: {
  stats?: DashboardStats;
  recent?: Activity[];
}) {
  const cards = [
    { label: "Total users", value: num(stats.totalUsers), note: `${num(stats.activeUsers)} active now` },
    { label: "Active users", value: num(stats.activeUsers), note: `${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% of all users` },
    { label: "Total deposits", value: money(stats.totalDeposits), note: "All time" },
    { label: "Total withdraws", value: money(stats.totalWithdraws), note: `${stats.pendingWithdraws} waiting for approval` },
    { label: "Total stake", value: money(stats.totalStake), note: `${num(stats.activePackages)} active packages` },
    { label: "Referral paid", value: money(stats.referralPaid), note: "Bonus paid out" },
  ];

  return (
    <div className="ad">
      <style>{css}</style>

      <AdminSidebar active="dashboard" />

      <main className="ad-main">
        <header className="ad-top">
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
/*  Styles                                                             */
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
