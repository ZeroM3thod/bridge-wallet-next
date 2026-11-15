"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
      <AdminSidebar active="dashboard" />

      <main className="ad-main">
        <header className="ad-top">
          <div className="ad-top-title">
            <h1>Dashboard</h1>
          </div>
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
            <table className="ad-cards">
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
                    <td data-label="User"><div className="ad-cell"><strong>{r.user}</strong></div></td>
                    <td data-label="Type"><div className="ad-cell">{r.type}</div></td>
                    <td data-label="Amount"><div className="ad-cell ad-amount">{money(r.amount)}</div></td>
                    <td data-label="Status">
                      <div className="ad-cell">
                        <span className={`ad-pill ad-${r.status.toLowerCase()}`}>{r.status}</span>
                      </div>
                    </td>
                    <td data-label="Date"><div className="ad-cell ad-muted">{r.date}</div></td>
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
