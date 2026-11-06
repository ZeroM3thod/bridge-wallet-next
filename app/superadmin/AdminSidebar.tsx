"use client";

import { useState } from "react";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" },
  { key: "users", label: "Users", icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0" },
  { key: "deposits", label: "Deposits", icon: "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" },
  { key: "withdraws", label: "Withdraws", icon: "M12 15V3m0 0L8 7m4-4l4 4M4 21h16" },
  { key: "packages", label: "Packages", icon: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" },
  { key: "referrals", label: "Referral Manage", icon: "M17 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM7 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 21a5 5 0 0 0-8-4" },
  { key: "settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" },
] as const;

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

export function AdminSidebar({
  active = "dashboard",
  open = false,
  onToggle,
  onNavigate,
}: {
  active?: string;
  open?: boolean;
  onToggle?: () => void;
  onNavigate?: (key: string) => void;
}) {
  const go = (key: string) => {
    onNavigate?.(key);
  };

  return (
    <>
      {open && <div className="ad-scrim" onClick={onToggle} />}

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

      <button
        type="button"
        className="ad-burger"
        aria-label="Open menu"
        onClick={onToggle}
      >
        <Icon d="M4 6h16M4 12h16M4 18h16" />
      </button>
    </>
  );
}
