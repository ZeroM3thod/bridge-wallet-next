I've rewritten the styling so it's mobile-first and put it all in **one shared stylesheet**. The sidebar becomes a mobile top bar with a slide-in menu. On phones, tables turn into stacked cards and popups become bottom sheets. Logic, API calls, features and class names are unchanged, and I haven't run any of it.

## What changed

| # | File | Action |
|---|---|---|
| 1 | `app/superadmin/layout.tsx` | replace |
| 2 | `app/superadmin/admin.css` | **replace the whole file** (this is where the new design lives) |
| 3 | `components/admin/AdminSidebar.tsx` | replace |
| 4 | `app/superadmin/page.tsx` (dashboard) | replace |
| 5 | `app/superadmin/users/page.tsx` | replace |
| 6 | `app/superadmin/deposit/page.tsx` | replace |
| 7 | `app/superadmin/withdrawal/page.tsx` | replace |
| 8 | `app/superadmin/support/page.tsx` | replace |
| 9 | `app/superadmin/settings/page.tsx` | replace |
| 10 | `packages/page.tsx` and `reffer/page.tsx` | 2 small deletions (see the end) |
| – | `withdrawl/page.tsx` | no change |

**Mobile fixes:**
- The old hamburger icon had no stroke, so it was invisible. It's fixed.
- The sidebar was fixed to the left with no top bar. Now there's a fixed top bar, a drawer that closes with the scrim, the ✕ button or Esc, and page scrolling is locked while it's open.
- Inputs are 16px, so iOS doesn't zoom in when you tap them.
- Buttons are at least 44px tall.
- Bottom sheets and the toast respect the iPhone notch and home-bar safe areas.

**Other fixes:**
- Several pages had duplicate inline CSS that conflicted with each other. All of it now lives in `admin.css`.
- I fixed the deposit "no records" `colSpan` from 7 to 8.
- I changed `.ad-stack` tables to `.ad-cards`, because the referral page already uses `ad-stack` for something else.

## 1) `app/superadmin/layout.tsx`

```tsx
import "./admin.css"

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

If your Next.js version is older than 14 and complains about `viewport`, delete those 5 lines. Everything else works without them.

## 2) `app/superadmin/admin.css` (replace everything)

```css
/* =====================================================================
   ADMIN DESIGN SYSTEM  (single source of truth for every /superadmin page)
   ===================================================================== */
.ad{
  --sky-50:#f0f9ff;--sky-100:#e0f2fe;--sky-200:#bae6fd;--sky-500:#0ea5e9;--sky-600:#0284c7;--sky-700:#0369a1;
  --ink:#0c2a3d;--muted:#5b7488;--line:#e3eef5;--bg:#f4f9fc;--card:#fff;
  --red:#c23030;--red-bg:#fdecec;--green:#15803d;--green-bg:#dcfce7;--amber:#8a5a00;--amber-bg:#fff4d6;
  --radius:14px;
  --shadow:0 1px 2px rgba(12,42,61,.04),0 6px 18px rgba(12,42,61,.05);
  --ring:0 0 0 3px rgba(14,165,233,.2);
  display:flex;min-height:100vh;min-height:100dvh;background:var(--bg);color:var(--ink);
  font:15px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans Bengali",sans-serif;
  -webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;
}
.ad *,.ad *::before,.ad *::after{box-sizing:border-box}
.ad h1,.ad h2,.ad h3,.ad p{margin:0}
.ad button{font:inherit}
.ad-muted{color:var(--muted)}
.ad-sm{font-size:13px}
.ad-spacer{flex:1}
.ad .ad-eyebrow,.ad .deposit-eyebrow{color:var(--sky-600);font-size:11px;font-weight:700;letter-spacing:.12em;margin-bottom:4px}
.ad .ad-subtitle,.ad .users-subtitle{color:var(--muted);margin-top:4px;font-size:14px}

/* ---------- Sidebar (desktop) ---------- */
.ad-side{width:252px;flex:none;background:var(--card);border-right:1px solid var(--line);padding:18px 14px;display:flex;flex-direction:column;gap:18px;position:sticky;top:0;height:100vh;height:100dvh;overflow-y:auto}
.ad-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;padding:4px 10px}
.ad-logo{width:24px;height:24px;border-radius:8px;background:linear-gradient(135deg,var(--sky-500),var(--sky-700));display:inline-block;flex:none}
.ad-side-close{display:none;margin-left:auto;border:0;background:transparent;color:var(--muted);border-radius:10px;width:40px;height:40px;align-items:center;justify-content:center;cursor:pointer}
.ad-nav{display:flex;flex-direction:column;gap:2px}
.ad-link{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;text-align:left;border:0;background:transparent;color:var(--muted);font-weight:500;padding:10px 12px;border-radius:10px;cursor:pointer;transition:background .15s,color .15s}
.ad-link svg{flex:none}
.ad-link:hover{background:var(--sky-50);color:var(--sky-700)}
.ad-link.is-active{background:var(--sky-100);color:var(--sky-700);font-weight:600}
.ad-link:focus-visible,.ad-burger:focus-visible,.ad-side-close:focus-visible,.ad-btn:focus-visible,.ad-tab:focus-visible,.ad-switch:focus-visible,.ad-x:focus-visible{outline:2px solid var(--sky-500);outline-offset:2px}
.ad-mbar,.ad-burger{display:none}
.ad-scrim{display:none}

/* ---------- Layout ---------- */
.ad-main{flex:1;min-width:0;padding:30px 34px 56px;max-width:1400px}
.ad-top{display:flex;align-items:center;gap:12px;margin-bottom:22px;flex-wrap:wrap}
.ad-top-title{flex:1;min-width:220px}
.ad-top h1{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.2}
.ad-top-actions{display:flex;gap:8px}

/* ---------- Buttons ---------- */
.ad-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid transparent;border-radius:10px;padding:9px 16px;min-height:40px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s,transform .05s;white-space:nowrap}
.ad-btn:active:not(:disabled){transform:translateY(1px)}
.ad-btn:disabled{opacity:.5;cursor:not-allowed}
.ad-btn-sm{padding:6px 12px;min-height:34px;font-size:13px}
.ad-btn-primary{background:var(--sky-500);color:#fff;box-shadow:0 1px 2px rgba(2,132,199,.25)}
.ad-btn-primary:hover:not(:disabled){background:var(--sky-600)}
.ad-btn-ghost{background:#fff;color:var(--sky-700);border-color:var(--line)}
.ad-btn-ghost:hover:not(:disabled){background:var(--sky-50);border-color:var(--sky-200)}
.ad-btn-danger{background:var(--red);color:#fff}
.ad-btn-danger-ghost{background:#fff;color:var(--red);border-color:#f3d4d4}
.ad-btn-danger-ghost:hover:not(:disabled){background:#fdf1f1}

/* ---------- Cards / stats ---------- */
.ad-grid,.ad-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.ad-stats{margin-bottom:16px}
.ad-card{position:relative;overflow:hidden;background:linear-gradient(180deg,#fff,#f9fcff);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px;box-shadow:var(--shadow)}
.ad-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,var(--sky-500),var(--sky-200))}
.ad-card-label{color:var(--muted);font-size:13.5px;font-weight:500}
.ad-card-value{font-size:28px;font-weight:700;letter-spacing:-.02em;margin-top:6px;color:var(--sky-700);line-height:1.2;overflow-wrap:anywhere}
.ad-card-note{color:var(--muted);font-size:13px;margin-top:4px}

/* ---------- Panels ---------- */
.ad-panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px;margin-top:16px;box-shadow:var(--shadow)}
.ad-top + .ad-panel,.ad-tabs + .ad-panel{margin-top:0}
.ad-panel h2{font-size:17px;font-weight:600;margin-bottom:6px}
.ad-panel > h2 + p{margin-bottom:4px}
.ad-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
.ad-panel-head h2{margin:0}
.ad-panel-head .ad-muted{font-size:13px;margin-top:3px}
.ad-empty{text-align:center;color:var(--muted);padding:28px 12px}
.ad-alert{margin:0 0 14px;padding:11px 14px;border-radius:10px;background:var(--red-bg);color:#a12525;font-size:14px}
.ad-ok{margin:0;padding:11px 14px;border-radius:10px;background:var(--green-bg);color:var(--green);font-size:14px}

/* ---------- Tables ---------- */
.ad-table-wrap{overflow-x:auto;margin-top:8px;-webkit-overflow-scrolling:touch}
.ad table{width:100%;border-collapse:collapse;min-width:520px}
.ad th{text-align:left;font-weight:600;color:var(--muted);font-size:12.5px;padding:10px 12px;border-bottom:1px solid var(--line);white-space:nowrap;background:#fafdff}
.ad td{padding:13px 12px;border-bottom:1px solid var(--line);vertical-align:middle}
.ad tbody tr:hover td{background:#fafdff}
.ad tr:last-child td{border-bottom:0}
.ad-cell{min-width:0}
.ad-secondary{display:block;color:var(--muted);font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis}
.ad-check{width:36px}
.ad-right{text-align:right}
.ad-hint{font-size:12.5px;color:var(--muted)}
.ad-warn{color:var(--red)}
.ad-amount{font-weight:700;white-space:nowrap}

/* ---------- Status pills ---------- */
.ad-pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:12.5px;font-weight:600;white-space:nowrap}
.ad-pill::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;margin-right:6px}
.ad-completed,.ad-approved,.ad-paid{background:var(--green-bg);color:var(--green)}
.ad-pending{background:var(--amber-bg);color:var(--amber)}
.ad-rejected,.ad-failed,.ad-cancelled{background:var(--red-bg);color:#a12525}

/* ---------- Tabs ---------- */
.ad-tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:16px;overflow-x:auto;scrollbar-width:none}
.ad-tabs::-webkit-scrollbar{display:none}
.ad-tab{border:0;background:transparent;color:var(--muted);font-weight:600;padding:11px 14px;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
.ad-tab:hover{color:var(--sky-700)}
.ad-tab.is-active{color:var(--sky-700);border-bottom-color:var(--sky-500)}
.ad-count{display:inline-block;min-width:22px;text-align:center;background:var(--sky-100);color:var(--sky-700);border-radius:999px;font-size:12.5px;padding:0 7px;margin-left:6px}

/* ---------- Forms ---------- */
.ad-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 16px;margin:14px 0}
.ad-form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}
.ad-form-grid.is-off{opacity:.45;pointer-events:none}
.ad-stack{display:flex;flex-direction:column;gap:12px}
.ad-field{display:flex;flex-direction:column;gap:5px}
.ad-field-label{font-size:14px;font-weight:600}
.ad-field-hint{font-size:12.5px;color:var(--muted)}
.ad-field-error{font-size:12.5px;color:var(--red)}
.ad input,.ad select,.ad textarea{width:100%;border:1px solid #d5e4ed;background:#fff;color:var(--ink);border-radius:10px;padding:10px 12px;min-height:42px;font:inherit;transition:border-color .15s,box-shadow .15s}
.ad textarea{resize:vertical;min-height:80px}
.ad input:focus,.ad select:focus,.ad textarea:focus{outline:0;border-color:var(--sky-500);box-shadow:var(--ring)}
.ad input:disabled{background:var(--bg);color:var(--muted)}
.ad input[type=checkbox]{width:18px;height:18px;min-height:0;padding:0;accent-color:var(--sky-500)}
.ad input[type=file]{padding:8px;min-height:0}
.ad-inline-form{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap}
.ad-inline-form .ad-field{min-width:150px}
.ad-modal-body h3{font-size:15px;font-weight:600;margin-top:20px}

/* ---------- Switch ---------- */
.ad-switch-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;border-top:1px solid var(--line)}
.ad-panel > h2 + .ad-switch-row{border-top:0}
.ad-switch-label{font-weight:600}
.ad-switch{flex:none;width:44px;height:26px;border-radius:999px;border:0;background:#cfe0ea;position:relative;cursor:pointer;transition:background .15s;padding:0}
.ad-switch span{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .15s}
.ad-switch.is-on{background:var(--sky-500)}
.ad-switch.is-on span{transform:translateX(18px)}

/* ---------- Package / level / tier cards ---------- */
.ad-lvl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:12px}
.ad-pkg-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.ad-pkg{border:1px solid var(--line);border-radius:var(--radius);padding:16px;display:flex;flex-direction:column;gap:14px;background:var(--card);box-shadow:var(--shadow)}
.ad-pkg.is-hidden{background:var(--bg);box-shadow:none}
.ad-pkg-head{display:flex;align-items:center;gap:12px}
.ad-pkg-head > div{flex:1;min-width:0}
.ad-pkg-head h3{font-size:17px;font-weight:700;overflow-wrap:anywhere}
.ad-pkg-head small{color:var(--muted)}
.ad-pkg-icon{width:42px;height:42px;border-radius:12px;background:var(--sky-100);color:var(--sky-700);display:inline-flex;align-items:center;justify-content:center;flex:none;font-weight:700}
.ad-emoji{font-size:20px}
.ad-badge{font-size:12.5px;font-weight:600;padding:3px 12px;border-radius:999px;background:var(--green-bg);color:var(--green);white-space:nowrap}
.ad-badge.is-off{background:#eef2f5;color:var(--muted)}
.ad-pkg-metrics,.ad-pkg-rules{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.ad-pkg-metrics > div{background:var(--sky-50);border:1px solid var(--sky-100);border-radius:12px;padding:10px 12px;min-width:0}
.ad-pkg-rules > div{border:1px solid var(--line);border-radius:12px;padding:10px 12px;min-width:0}
.ad-pkg-metrics small,.ad-pkg-rules small{display:block;color:var(--muted);font-size:12.5px}
.ad-pkg-metrics strong{color:var(--sky-700);font-size:17px;overflow-wrap:anywhere}
.ad-pkg-rules strong{font-size:14.5px}
.ad-pkg-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;flex-wrap:wrap}
.ad-pkg-toggle{display:flex;align-items:center;gap:10px;font-weight:500;font-size:14px}
.ad-grid-empty{grid-column:1/-1}
.ad-reqs{display:flex;flex-wrap:wrap;gap:8px}
.ad-req{background:var(--sky-50);border:1px solid var(--sky-100);color:var(--sky-700);border-radius:999px;padding:3px 12px;font-size:13px;font-weight:500}
.ad-req.pass{background:var(--green-bg);border-color:#bbf7d0;color:var(--green)}
.ad-req.fail{background:#fdf1f1;border-color:#f3d4d4;color:var(--red)}

.ad-preview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;background:var(--sky-50);border:1px solid var(--sky-100);border-radius:12px;padding:12px 14px;margin-top:4px}
.ad-preview small{display:block;color:var(--muted);font-size:12.5px}
.ad-preview strong{color:var(--sky-700);font-size:16px}
.ad-ledger{margin-top:12px;border:1px solid var(--line);border-radius:12px}
.ad-ledger summary{cursor:pointer;padding:12px 14px;font-weight:600;color:var(--sky-700)}
.ad-ledger-list{max-height:240px;overflow-y:auto;border-top:1px solid var(--line)}
.ad-ledger-list article{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--line)}
.ad-ledger-list article:last-child{border-bottom:0}
.ad-ledger-list article > span{width:30px;height:30px;border-radius:50%;background:var(--sky-100);color:var(--sky-700);display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex:none}
.ad-ledger-list article > div{flex:1;min-width:0}
.ad-ledger-list small{display:block;color:var(--muted);font-size:12.5px}
.ad-ledger-list b{color:var(--sky-700);white-space:nowrap}

/* ---------- Salary requests extras ---------- */
.ad-toolbar{display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.ad-toolbar input{flex:1;min-width:200px}
.ad-toolbar select{width:200px}
.ad-bulk{display:flex;align-items:center;gap:10px;background:var(--sky-50);border:1px solid var(--sky-100);border-radius:12px;padding:10px 14px;margin-bottom:12px;flex-wrap:wrap}
.ad-col{display:flex;flex-direction:column;gap:14px;padding-top:16px}
.ad-col h3{margin-top:0 !important}
.ad-dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0}
.ad-dl > div{border:1px solid var(--line);border-radius:12px;padding:10px 12px;min-width:0}
.ad-dl dt{color:var(--muted);font-size:12.5px}
.ad-dl dd{font-weight:600;margin:0;overflow-wrap:anywhere}
.ad-note{border-radius:12px;padding:10px 14px;font-size:14px}
.ad-note-warn{background:#fff8e1;color:var(--amber)}
.ad-note-bad{background:#fdf1f1;color:#a12525}
.ad-reject{display:flex;flex-direction:column;gap:12px}

/* ---------- Modal ---------- */
.ad-modal-back{position:fixed;inset:0;background:rgba(12,42,61,.45);display:flex;align-items:center;justify-content:center;padding:16px;z-index:60}
.ad-modal{background:var(--card);border-radius:18px;width:100%;max-width:640px;max-height:92vh;max-height:92dvh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(12,42,61,.25)}
.ad-modal-sm{max-width:440px}
.ad-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid var(--line)}
.ad-modal-head h2{font-size:18px;font-weight:700;margin:0}
.ad-x{border:0;background:transparent;color:var(--muted);cursor:pointer;border-radius:10px;padding:8px}
.ad-x:hover{background:var(--sky-50);color:var(--ink)}
.ad-modal-body{padding:6px 20px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch}
.ad-modal-foot{display:flex;align-items:center;gap:8px;padding:14px 20px;border-top:1px solid var(--line);flex-wrap:wrap}
.ad-confirm{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13.5px}

/* ---------- Toast ---------- */
.ad-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:11px 18px;border-radius:12px;z-index:70;font-weight:500;box-shadow:0 10px 30px rgba(12,42,61,.3);max-width:calc(100vw - 24px)}
.ad-toast.is-bad{background:var(--red)}

/* ---------- Page: users ---------- */
.users-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}
.users-toolbar h2{margin:0 !important}
.users-toolbar input{width:min(360px,100%)}
.users-table{min-width:1000px}
.users-table td{vertical-align:top}
.users-id{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--muted)}
.users-role{display:inline-block;padding:3px 10px;border-radius:999px;background:var(--sky-100);color:var(--sky-700);text-transform:capitalize;font-size:12.5px;font-weight:600}
.users-count{margin-top:12px;font-size:13px;color:var(--muted)}
.users-error{color:var(--red)}

/* ---------- Page: deposits ---------- */
.deposit-filter{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px}
.deposit-filter select{width:auto}
.deposit-table{min-width:1000px}
.deposit-events summary{cursor:pointer;color:var(--sky-700);font-weight:600;white-space:nowrap}
.deposit-event{padding:9px 0;border-bottom:1px solid var(--line);font-size:12px;min-width:230px;text-align:left}
.deposit-event span{display:block;color:var(--muted)}

/* ---------- Page: support / settings forms ---------- */
.support-manage,.site-settings-card{max-width:680px;padding:22px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);display:grid;gap:16px}
.support-manage > p,.site-settings-card > p{color:var(--muted)}
.support-row{min-width:0;margin:0;padding:16px;border:1px solid var(--line);border-radius:12px;display:grid;gap:12px;background:#fbfdff}
.support-row legend{padding:0 6px;color:var(--muted);font-size:13px;font-weight:600}
.support-row label,.site-setting-field{display:grid;gap:6px;font-weight:600;font-size:14px}
.support-remove,.support-add{justify-self:start;min-height:40px;padding:6px 0;border:0;background:none;font:inherit;cursor:pointer}
.support-remove{color:var(--red)}
.support-add{color:var(--sky-600);font-weight:700}
.support-save,.site-settings-save{min-height:46px;padding:11px 18px;border:0;border-radius:10px;background:var(--sky-500);color:#fff;font:inherit;font-weight:700;cursor:pointer}
.support-save:hover:not(:disabled),.site-settings-save:hover:not(:disabled){background:var(--sky-600)}
.support-save:disabled,.support-add:disabled,.site-settings-save:disabled{opacity:.6;cursor:not-allowed}
.support-error,.site-settings-error{color:var(--red)}
.support-saved{color:var(--green)}

/* =====================================================================
   RESPONSIVE
   ===================================================================== */
@media(max-width:1100px){
  .ad-main{padding:26px 22px 48px}
  .ad-lvl-grid{grid-template-columns:1fr}
}
@media(max-width:1024px){
  .ad-grid,.ad-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
}

/* ---------- Phones & small tablets ---------- */
@media(max-width:760px){
  /* top bar + drawer */
  .ad-mbar{display:flex;position:fixed;top:0;left:0;right:0;z-index:20;align-items:center;gap:10px;height:calc(56px + env(safe-area-inset-top));padding:env(safe-area-inset-top) 12px 0;background:rgba(255,255,255,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  .ad-mbar-title{display:flex;align-items:center;gap:10px;font-weight:700;font-size:16px}
  .ad-burger{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:12px;cursor:pointer;padding:0}
  .ad-scrim{display:block;position:fixed;inset:0;background:rgba(12,42,61,.45);z-index:40;border:0;padding:0}
  .ad-side{position:fixed;left:0;top:0;bottom:0;height:auto;width:min(84vw,300px);z-index:50;transform:translateX(-100%);visibility:hidden;transition:transform .22s ease,visibility 0s linear .22s;padding-top:calc(18px + env(safe-area-inset-top));padding-bottom:calc(18px + env(safe-area-inset-bottom))}
  .ad-side.is-open{transform:none;visibility:visible;transition-delay:0s;box-shadow:0 0 40px rgba(12,42,61,.25)}
  .ad-side-close{display:inline-flex}
  .ad-link{min-height:48px;font-size:15.5px}

  /* page */
  .ad-main{padding:calc(70px + env(safe-area-inset-top)) 14px calc(40px + env(safe-area-inset-bottom))}
  .ad-top{margin-bottom:16px;gap:10px}
  .ad-top h1{font-size:21px}
  .ad-top-title{min-width:0;flex-basis:100%}
  .ad-top-actions{width:100%}
  .ad-top-actions .ad-btn{flex:1}
  .ad-grid,.ad-stats{gap:10px}
  .ad-card{padding:14px}
  .ad-card-value{font-size:21px}
  .ad-panel{padding:14px;border-radius:12px}
  .ad-panel-head{flex-direction:column;align-items:stretch}
  .ad-panel-head > .ad-btn{width:100%}

  /* forms: 16px stops iOS zoom, bigger touch targets */
  .ad input,.ad select,.ad textarea{font-size:16px;min-height:46px}
  .ad input[type=checkbox]{width:20px;height:20px}
  .ad-btn{min-height:46px}
  .ad-btn-sm{min-height:42px;font-size:14px}
  .ad-form-grid,.ad-form-grid.three,.ad-pkg-grid,.ad-dl,.ad-preview{grid-template-columns:1fr}
  .ad-inline-form{flex-direction:column;align-items:stretch}
  .ad-inline-form .ad-btn{width:100%}
  .ad-toolbar select{width:100%}
  .ad-bulk .ad-btn{flex:1}
  .users-toolbar{flex-direction:column;align-items:stretch;gap:10px}
  .users-toolbar input{width:100%}
  .deposit-filter{width:100%;flex-direction:column;align-items:stretch;gap:5px}
  .deposit-filter select{width:100%}
  .deposit-filter input{width:100%}
  .ad-pkg-actions{flex-direction:column;align-items:stretch}
  .ad-pkg-actions .ad-btn{width:100%}
  .ad-top-actions{flex-wrap:wrap}

  /* tables -> stacked cards (add class "ad-cards" + data-label on <td>) */
  .ad .ad-cards{min-width:0 !important}
  .ad .ad-cards thead{display:none}
  .ad .ad-cards,.ad .ad-cards tbody,.ad .ad-cards tr{display:block;width:100%}
  .ad .ad-cards tr{border:1px solid var(--line);border-radius:12px;padding:4px 14px;margin-bottom:12px;background:#fff;box-shadow:var(--shadow)}
  .ad .ad-cards td{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border:0;border-bottom:1px dashed var(--line);padding:10px 0;text-align:right}
  .ad .ad-cards td:last-child{border-bottom:0}
  .ad .ad-cards td::before{content:attr(data-label);flex:none;color:var(--muted);font-size:12.5px;font-weight:600;text-align:left;max-width:42%}
  .ad .ad-cards td > .ad-cell{min-width:0;text-align:right;overflow-wrap:anywhere}
  .ad .ad-cards td[colspan]{display:block;text-align:center}
  .ad .ad-cards td[colspan]::before{display:none}
  .ad .ad-cards tbody tr:hover td{background:transparent}
  .ad-secondary{max-width:none;white-space:normal;overflow-wrap:anywhere}
  .users-id{max-width:none;white-space:normal;overflow-wrap:anywhere}
  .deposit-event{min-width:0}
  .deposit-events summary{white-space:normal}

  /* modals -> bottom sheets */
  .ad-modal-back{align-items:flex-end;padding:0}
  .ad-modal{max-width:none;max-height:92dvh;border-radius:20px 20px 0 0}
  .ad-modal-body{padding:6px 16px 16px}
  .ad-modal-head{padding:16px}
  .ad-modal-foot{padding:12px 16px calc(12px + env(safe-area-inset-bottom));position:sticky;bottom:0;background:var(--card)}
  .ad-modal-foot .ad-btn{flex:1}
  .ad-confirm{width:100%}
  .ad-toast{bottom:calc(16px + env(safe-area-inset-bottom));width:calc(100vw - 24px);text-align:center}

  /* support / settings */
  .support-manage,.site-settings-card{padding:14px;max-width:none}
  .support-row{padding:12px}
}
@media(max-width:380px){
  .ad-grid,.ad-stats{grid-template-columns:1fr}
  .ad-pkg-metrics,.ad-pkg-rules{grid-template-columns:1fr}
}
@media(hover:none){
  .ad-btn:hover,.ad-link:hover{background-color:revert-layer}
}
@media(prefers-reduced-motion:reduce){
  .ad-side,.ad-link,.ad-switch,.ad-switch span,.ad-btn{transition:none !important}
}
```

## 3) `components/admin/AdminSidebar.tsx`

```tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const items = [
  ["dashboard", "Dashboard", "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z"],
  ["users", "Users", "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0"],
  ["deposits", "Deposits", "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"],
  ["withdraws", "Withdraws", "M12 15V3m0 0L8 7m4-4l4 4M4 21h16"],
  ["withdrawal", "Withdrawal requests", "M4 6h16M4 12h16M4 18h16"],
  ["packages", "Packages", "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"],
  ["referrals", "Referral Manage", "M17 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM7 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 21a5 5 0 0 0-8-4"],
  ["support", "Support Manage", "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"],
  ["settings", "Settings", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"],
] as const
const routes: Record<string, string> = { dashboard: "/superadmin", users: "/superadmin/users", deposits: "/superadmin/deposit", withdrawal: "/superadmin/withdrawal", referrals: "/superadmin/reffer", settings: "/superadmin/settings", support: "/superadmin/support" }

export function AdminSidebar({ active: activeOverride, onNavigate }: { active?: string; onNavigate?: (key: string) => void } = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const active = activeOverride ?? (pathname === "/superadmin" ? "dashboard" : pathname.split("/").pop())
  const go = (key: string) => {
    onNavigate?.(key)
    router.push(routes[key] ?? `/superadmin/${key}`)
    setOpen(false)
  }

  // Mobile drawer: close with Esc, lock page scroll while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  }, [open])

  return <>
    <header className="ad-mbar">
      <button className="ad-burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <span className="ad-mbar-title"><span className="ad-logo" />Admin</span>
    </header>
    {open && <button className="ad-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <aside className={`ad-side ${open ? "is-open" : ""}`}>
      <div className="ad-brand"><span className="ad-logo" />Admin
        <button className="ad-side-close" aria-label="Close menu" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <nav className="ad-nav" aria-label="Admin">
        {items.map(([key, label, d]) => <button key={key} className={`ad-link ${active === key ? "is-active" : ""}`} aria-current={active === key ? "page" : undefined} onClick={() => go(key)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>{label}</button>)}
      </nav>
    </aside>
  </>
}
```

## 4) `app/superadmin/page.tsx` (dashboard)

```tsx
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
```

## 5) `app/superadmin/users/page.tsx`

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type User = { id: string; name: string; email: string; phone: string; balance: number | null; role: string; referral_code: string | null; referred_by: string | null; created_at: number }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/users", { credentials: "include", cache: "no-store" }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error || "Users load failed"); setUsers(data.users) }).catch(e => setError(e.message || "Users load failed")).finally(() => setLoading(false)) }, [])
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return users.filter(u => !needle || [u.id, u.name, u.email, u.phone, u.role, u.referral_code].some(value => value?.toLowerCase().includes(needle))) }, [users, query])
  const money = (value: number | null) => `৳${(value ?? 0).toLocaleString("en-BD")}`

  return <div className="ad"><AdminSidebar active="users" /><main className="ad-main">
    <header className="ad-top"><div className="ad-top-title"><h1>User management</h1><p className="users-subtitle">{users.length.toLocaleString()} registered users</p></div></header>
    <section className="ad-panel users-panel">
      <div className="users-toolbar"><h2>All users</h2><input aria-label="Search users" placeholder="Search name, email, phone, ID…" value={query} onChange={e => setQuery(e.target.value)} /></div>
      {error ? <p role="alert" className="users-error">{error}</p> : <div className="ad-table-wrap"><table className="users-table ad-cards">
        <thead><tr>{["User", "Contact", "Balance", "Role", "Referral code", "Referred by", "Joined", "User ID"].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={8}>Loading users…</td></tr> : filtered.map(user => <tr key={user.id}>
            <td data-label="User"><div className="ad-cell"><strong>{user.name}</strong></div></td>
            <td data-label="Contact"><div className="ad-cell">{user.email}<br /><span className="ad-muted">{user.phone}</span></div></td>
            <td data-label="Balance"><div className="ad-cell ad-amount">{money(user.balance)}</div></td>
            <td data-label="Role"><div className="ad-cell"><span className="users-role">{user.role}</span></div></td>
            <td data-label="Referral code"><div className="ad-cell">{user.referral_code || "—"}</div></td>
            <td data-label="Referred by"><div className="ad-cell">{user.referred_by || "—"}</div></td>
            <td data-label="Joined"><div className="ad-cell">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</div></td>
            <td data-label="User ID" className="users-id" title={user.id}><div className="ad-cell">{user.id}</div></td>
          </tr>)}
          {!loading && !error && filtered.length === 0 && <tr><td colSpan={8} className="ad-empty">No matching users.</td></tr>}
        </tbody></table></div>}
      <p className="users-count">Showing {filtered.length.toLocaleString()} of {users.length.toLocaleString()} users</p>
    </section></main></div>
}
```

## 6) `app/superadmin/deposit/page.tsx`

```tsx
"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type Deposit = { id: string; out_trade_no: string; gateway_transaction_id: string | null; method: string; amount: number; status: string; created_at: number; paid_at: number | null; user_id: string; name: string; phone: string; email: string; balance: number }
type DepositEvent = { id: string; deposit_id: string; actor_id: string | null; event: string; previous_status: string | null; new_status: string; note: string | null; created_at: number; actor_name: string | null }
const money = (amount: number) => `৳${(amount / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`

export default function AdminDepositsPage() {
  const [rows, setRows] = useState<Deposit[]>([])
  const [events, setEvents] = useState<DepositEvent[]>([])
  const [filter, setFilter] = useState("all")
  const [minimumAmount, setMinimumAmount] = useState(300)
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/deposits", { credentials: "include", cache: "no-store" })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Could not load deposits")
    setRows(data.deposits)
    setEvents(data.events)
    setMinimumAmount(data.settings?.minimum_amount ?? 300)
  }, [])
  useEffect(() => { load().catch((e) => setError(e.message)) }, [load])
  const review = async (id: string, action: "approve" | "reject") => {
    setBusy(id); setError("")
    try {
      const response = await fetch("/api/admin/deposits", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Review failed")
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : "Review failed") }
    finally { setBusy("") }
  }
  const saveMinimum = async () => {
    setBusy("settings"); setError("")
    try {
      const response = await fetch("/api/admin/deposits", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "settings", minimumAmount }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save minimum deposit")
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save minimum deposit") }
    finally { setBusy("") }
  }
  const visible = rows.filter((row) => filter === "all" || row.status === filter)
  const pendingCount = rows.filter((row) => row.status === "pending" || row.status === "failed").length
  const eventLabels: Record<string, string> = { created: "Request created", paid: "Gateway payment confirmed", failed: "Payment failed", cancelled: "Payment cancelled", approved: "Admin approved", rejected: "Admin rejected / reversed" }
  return <div className="ad deposit-admin"><AdminSidebar active="deposits" /><main className="ad-main">
    <header className="ad-top"><div className="ad-top-title"><p className="deposit-eyebrow">PAYMENT MANAGEMENT</p><h1>Deposit history</h1><p className="ad-subtitle">Review requests and manage wallet credits.</p></div></header>
    <section className="ad-grid" aria-label="Deposit summary">
      <article className="ad-card"><p className="ad-card-label">Total requests</p><p className="ad-card-value">{rows.length}</p><p className="ad-card-note">All recorded deposits</p></article>
      <article className="ad-card"><p className="ad-card-label">Awaiting review</p><p className="ad-card-value">{pendingCount}</p><p className="ad-card-note">Pending or failed payments</p></article>
      <article className="ad-card"><p className="ad-card-label">Approved deposits</p><p className="ad-card-value">{rows.filter((row) => row.status === "paid").length}</p><p className="ad-card-note">Wallet credited</p></article>
    </section>
    <section className="ad-panel deposit-panel">
      <div className="ad-panel-head"><div><h2>Minimum deposit</h2><p className="ad-muted">Set the lowest amount users can deposit.</p></div>
        <div className="ad-inline-form">
          <label className="deposit-filter">Amount (৳) <input type="number" min="1" step="1" value={minimumAmount} onChange={(e) => setMinimumAmount(Number(e.target.value))} /></label>
          <button className="ad-btn ad-btn-primary deposit-action" disabled={busy === "settings"} onClick={saveMinimum}>{busy === "settings" ? "Saving…" : "Save minimum"}</button>
        </div>
      </div>
    </section>
    <section className="ad-panel deposit-panel">
      <div className="ad-panel-head"><div><h2>All deposits</h2><p className="ad-muted">Full request details, gateway outcomes, admin actions, and wallet history.</p></div>
        <label className="deposit-filter">Status <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All</option><option value="pending">Pending</option><option value="paid">Paid / approved</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected / reversed</option></select></label>
      </div>
      {error && <p className="ad-alert" role="alert">{error}</p>}
      <div className="ad-table-wrap"><table className="deposit-table ad-cards"><thead><tr><th>User</th><th>Deposit details</th><th>Method</th><th>Amount</th><th>Status / dates</th><th>Date</th><th>Action</th><th>Audit history</th></tr></thead><tbody>
        {visible.map((row) => <tr key={row.id}>
          <td data-label="User"><div className="ad-cell"><strong>{row.name}</strong><span className="ad-secondary">User ID: {row.user_id}</span><span className="ad-secondary">{row.phone}</span><span className="ad-secondary">{row.email}</span></div></td>
          <td data-label="Deposit"><div className="ad-cell"><strong>{row.out_trade_no}</strong><span className="ad-secondary">Deposit ID: {row.id}</span><span className="ad-secondary">Gateway TX: {row.gateway_transaction_id || "—"}</span><span className="ad-secondary">Wallet now: {money(row.balance)}</span></div></td>
          <td data-label="Method"><div className="ad-cell">{row.method}</div></td>
          <td data-label="Amount"><div className="ad-cell ad-amount">{money(row.amount)}</div></td>
          <td data-label="Status"><div className="ad-cell"><span className={`ad-pill ${row.status === "paid" ? "ad-completed" : row.status === "pending" ? "ad-pending" : "ad-rejected"}`}>{row.status === "paid" ? "Paid / approved" : row.status === "pending" ? "Pending" : row.status === "cancelled" ? "Cancelled" : row.status === "rejected" ? "Rejected / reversed" : "Failed"}</span><span className="ad-secondary">Created: {new Date(row.created_at).toLocaleString()}</span>{row.paid_at && <span className="ad-secondary">Paid: {new Date(row.paid_at).toLocaleString()}</span>}</div></td>
          <td data-label="Date"><div className="ad-cell ad-muted">{new Date(row.created_at).toLocaleString()}</div></td>
          <td data-label="Action"><div className="ad-cell">{row.status === "paid" ? <button className="ad-btn ad-btn-danger-ghost ad-btn-sm deposit-action is-reject" disabled={busy === row.id} onClick={() => review(row.id, "reject")}>{busy === row.id ? "Saving…" : "Reject"}</button> : row.status === "failed" ? <button className="ad-btn ad-btn-primary ad-btn-sm deposit-action" disabled={busy === row.id} onClick={() => review(row.id, "approve")}>{busy === row.id ? "Saving…" : "Approve"}</button> : <span className="ad-secondary">—</span>}</div></td>
          <td data-label="History"><div className="ad-cell"><details className="deposit-events"><summary>History ({events.filter((event) => event.deposit_id === row.id).length})</summary>{events.filter((event) => event.deposit_id === row.id).map((event) => <div className="deposit-event" key={event.id}><strong>{eventLabels[event.event] || event.event}</strong><span>{event.previous_status ? `${event.previous_status} → ${event.new_status}` : `Status: ${event.new_status}`}</span><span>{event.note || "—"}</span><span>{event.actor_name ? `By ${event.actor_name}` : event.actor_id ? `Admin ID ${event.actor_id}` : "System / gateway"} · {new Date(event.created_at).toLocaleString()}</span></div>)}</details></div></td>
        </tr>)}
        {!visible.length && <tr><td colSpan={8} className="ad-empty">No deposit records found.</td></tr>}
      </tbody></table></div>
    </section>
  </main></div>
}
```

## 7) `app/superadmin/withdrawal/page.tsx`

```tsx
"use client"
import {useCallback,useEffect,useState} from "react"
import {AdminSidebar} from "@/components/admin/AdminSidebar"
type Row={id:string;amount:number;fee:number;net:number;status:string;created_at:number;user_id:string;name:string;phone:string;email:string;balance:number;provider:string;account:string}
const money=(n:number)=>`৳${Number(n).toLocaleString("en-BD")}`
export default function AdminWithdrawals(){
 const [rows,setRows]=useState<Row[]>([]),[min,setMin]=useState(1000),[fee,setFee]=useState(2),[busy,setBusy]=useState(""),[error,setError]=useState("")
 const load=useCallback(async()=>{const r=await fetch('/api/admin/withdrawals',{credentials:'include',cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error);setRows(d.withdrawals);setMin(d.settings.minimum_amount);setFee(d.settings.fee_percent)},[])
 useEffect(()=>{load().catch(e=>setError(e.message))},[load])
 const post=async(body:object)=>{const r=await fetch('/api/admin/withdrawals',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),d=await r.json();if(!r.ok)throw Error(d.error);return d}
 const review=async(id:string,action:'approve'|'reject')=>{setBusy(id);setError('');try{await post({id,action});await load()}catch(e){setError(e instanceof Error?e.message:'Request failed')}finally{setBusy('')}}
 const save=async()=>{setError('');try{await post({action:'settings',minimumAmount:min,feePercent:fee});await load()}catch(e){setError(e instanceof Error?e.message:'Settings save failed')}}
 return <div className="ad"><AdminSidebar active="withdrawal"/><main className="ad-main">
 <header className="ad-top"><div className="ad-top-title"><p className="ad-eyebrow">PAYMENT MANAGEMENT</p><h1>Withdrawal requests</h1></div></header>
 <section className="ad-panel"><h2>Withdrawal settings</h2>
  <div className="ad-inline-form" style={{marginTop:12}}>
   <label className="ad-field"><span className="ad-field-label">Minimum amount ৳</span><input type="number" min="1" value={min} onChange={e=>setMin(Number(e.target.value))}/></label>
   <label className="ad-field"><span className="ad-field-label">Fee %</span><input type="number" min="0" max="100" step="0.1" value={fee} onChange={e=>setFee(Number(e.target.value))}/></label>
   <button className="ad-btn ad-btn-primary" onClick={save}>Save settings</button>
  </div>
 </section>
 {error&&<p role="alert" className="ad-alert" style={{marginTop:16}}>{error}</p>}
 <section className="ad-panel"><div className="ad-table-wrap"><table className="ad-cards" style={{minWidth:950}}><thead><tr>{['User details','Wallet','Amount / fee / net','Status','Requested','Actions'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>
  {rows.map(r=><tr key={r.id}>
   <td data-label="User"><div className="ad-cell"><strong>{r.name}</strong><span className="ad-secondary">{r.phone}</span><span className="ad-secondary">{r.email}</span><span className="ad-secondary">ID: {r.user_id}</span></div></td>
   <td data-label="Wallet"><div className="ad-cell">{r.provider} · {r.account}</div></td>
   <td data-label="Amount"><div className="ad-cell"><strong>{money(r.amount)}</strong><span className="ad-secondary">fee {money(r.fee)} · net {money(r.net)}</span></div></td>
   <td data-label="Status"><div className="ad-cell"><span className={`ad-pill ad-${r.status}`}>{r.status}</span></div></td>
   <td data-label="Requested"><div className="ad-cell ad-muted">{new Date(r.created_at).toLocaleString()}</div></td>
   <td data-label="Actions"><div className="ad-cell">{r.status==='pending'?<span style={{display:'inline-flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}><button className="ad-btn ad-btn-primary ad-btn-sm" disabled={busy===r.id} onClick={()=>review(r.id,'approve')}>Approve</button><button className="ad-btn ad-btn-danger-ghost ad-btn-sm" disabled={busy===r.id} onClick={()=>review(r.id,'reject')}>Reject</button></span>:'—'}</div></td>
  </tr>)}
  {!rows.length&&<tr><td colSpan={6} className="ad-empty">No withdrawals</td></tr>}
 </tbody></table></div></section></main></div>
}
```

## 8) `app/superadmin/support/page.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type Contact = { name: string; url: string }
export default function AdminSupportPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetch("/api/admin/support", { credentials: "include", cache: "no-store" }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Load failed"); setContacts(d.contacts || []) }).catch(e => setError(e.message || "Load failed")) }, [])
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setSaved(false)
    try {
      const r = await fetch("/api/admin/support", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contacts }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Save failed"); setSaved(true)
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed") } finally { setBusy(false) }
  }
  const update = (index: number, field: keyof Contact, value: string) => setContacts(rows => rows.map((row, i) => i === index ? { ...row, [field]: value } : row))
  return <div className="ad"><AdminSidebar active="support"/><main className="ad-main"><header className="ad-top"><div className="ad-top-title"><h1>Support contacts</h1></div></header>
    <form className="support-manage" onSubmit={save}>
      <p>Add named support contacts and their Telegram or WhatsApp profile links.</p>
      {contacts.map((contact, i) => <fieldset className="support-row" key={i}><legend>Support contact {i + 1}</legend>
        <label>Name<input required maxLength={80} value={contact.name} placeholder="Manager" onChange={e => update(i, "name", e.target.value)}/></label>
        <label>Telegram / WhatsApp link<input required type="url" value={contact.url} placeholder="https://t.me/username or https://wa.me/number" onChange={e => update(i, "url", e.target.value)}/></label>
        <button type="button" className="support-remove" onClick={() => setContacts(rows => rows.filter((_, n) => n !== i))}>Remove contact</button>
      </fieldset>)}
      <button type="button" className="support-add" disabled={contacts.length >= 50} onClick={() => setContacts(rows => [...rows, { name: "", url: "" }])}>+ Add contact</button>
      {error && <p role="alert" className="support-error">{error}</p>}
      {saved && <p role="status" className="support-saved">Changes saved.</p>}
      <button className="support-save" disabled={busy}>{busy ? "Saving…" : "Save contacts"}</button>
    </form></main></div>
}
```

## 9) `app/superadmin/settings/page.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

type Settings = { telegramChannelUrl: string; telegramSupportUrl: string; whatsappSupportUrl: string; apkDownloadUrl: string }
const empty: Settings = { telegramChannelUrl: "", telegramSupportUrl: "", whatsappSupportUrl: "", apkDownloadUrl: "" }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(empty)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetch("/api/site-settings", { credentials: "include", cache: "no-store" }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setSettings({ ...empty, ...data }) }).catch(e => setError(e.message || "Settings load failed")) }, [])
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("")
    try {
      const response = await fetch("/api/site-settings", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Save failed")
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed") }
    finally { setBusy(false) }
  }
  const field = (key: keyof Settings, label: string) => <label className="site-setting-field">{label}<input type="url" value={settings[key]} placeholder="https://…" onChange={e => setSettings(value => ({ ...value, [key]: e.target.value }))} /></label>
  return <div className="ad"><AdminSidebar active="settings" /><main className="ad-main"><header className="ad-top"><div className="ad-top-title"><h1>Site settings</h1></div></header>
    <form className="site-settings-card" onSubmit={save}>
      <p>Profile links and Android APK download URL.</p>
      {field("telegramChannelUrl", "Telegram channel URL")}
      {field("telegramSupportUrl", "Telegram support URL")}
      {field("whatsappSupportUrl", "WhatsApp support URL")}
      {field("apkDownloadUrl", "APK file URL")}
      {error && <p role="alert" className="site-settings-error">{error}</p>}
      <button className="site-settings-save" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
    </form></main></div>
}
```

## 10) `packages/page.tsx` and `reffer/page.tsx`: two deletions each

These two files are big, so I'm not repeating them. Their embedded CSS now lives in `admin.css`, and the leftover copy would override the new design. In **each** file:

1. Delete the line `<style>{css}</style>` inside the `return (...)`. In `packages/page.tsx` it appears once, right after `<div className="ad">`.
2. Delete the whole block at the bottom of the file, from `/* Styles */` down: `const css = \`...\`;` (everything from `const css = ` to the closing `` `; ``).

Everything else in those two files stays exactly as it is. Their cards, modals, tabs and tier/level grids are already styled and made responsive in the new `admin.css`.

On the referral page, the *Salary requests* table still scrolls sideways on phones. The tabs, review popup and bulk bar are all mobile-ready. To make that table stack into cards like the others, add `className="ad-cards"` to its `<table>` and `data-label="Member"`, `"Tier"`, `"Amount"`, `"Active team"`, `"Requested"` and `"Status"` to the matching `<td>`s. I left it out because that file is large and I didn't want to risk breaking its logic.

## After pasting

1. Save every file as **UTF-8**. Your uploaded files show garbled text such as `à§³` where `৳` should be, which means they were saved in the wrong encoding at some point. The files above use the real `৳`, `…` and `—` characters.
2. Restart `npm run dev`, then hard-refresh with Ctrl+Shift+R, so the old CSS isn't cached.
3. Test with Chrome DevTools device mode (Ctrl+Shift+M) at 375px and 360px width. Open the menu, a package popup and the deposit list.

