# 📊 InvestorPulse — Project Overview

---

## 🚀 Short Summary

**InvestorPulse** is a modern, full-stack **Mutual Fund & Investor Relationship Management (VRM) Dashboard** built for financial organizations and wealth management firms. It enables relationship managers to track investor portfolios, monitor SIP (Systematic Investment Plan) schedules, detect panic-selling risk, receive redemption alerts, and sync live NAV (Net Asset Value) market data — all within a single secure, real-time web platform.

It is built using **Next.js 15**, **React 19**, **Supabase (PostgreSQL + Auth)**, **Recharts**, **Tailwind CSS v4**, and **TypeScript** — a production-grade, enterprise-ready tech stack that is both performant and scalable.

---

## 📖 Long Story — What is InvestorPulse and Why Does it Matter?

### The Problem it Solves

In the Indian mutual fund distribution industry, Relationship Managers (RMs) and fund distributors manage hundreds — sometimes thousands — of investor folios manually. They rely on spreadsheets, WhatsApp messages, and scattered email threads to:

- Track which investors have upcoming SIPs
- Identify investors who are likely to panic-sell during market crashes
- Flag investors who are redeeming early (breaking long-term plans)
- Keep tabs on portfolio NAV performance over time

This manual, disconnected workflow leads to **missed follow-ups**, **poor investor retention**, and **revenue loss** for the organization.

**InvestorPulse replaces all of that chaos with a single, intelligent, role-based dashboard.**

---

### What It Does — Feature by Feature

| Feature | Description |
|---|---|
| 🏠 **Main Dashboard** | Bird's-eye view of all investor KPIs — total AUM, SIP counts, alert summaries, and portfolio trends. |
| 👥 **Investor Management** | Full list of all investors with search, filter, and drill-down into individual portfolio performance. |
| 📈 **Market Sync** | One-click button to pull the latest NAV data from market CSVs (Dec/Jan/Feb rolling periods) directly into the database. |
| 📂 **CSV/Excel Upload** | Upload investor portfolio Excel/CSV files; the system parses and stores data automatically using the `xlsx` library. |
| ⚠️ **Panic Risk Engine** | Detects investors most likely to redeem or panic-sell based on portfolio performance signals, displayed with visual risk gauges. |
| 🔔 **Redemption Alerts** | Surfaces alerts for investors who have recently redeemed or are showing early withdrawal signals. |
| 📅 **SIP Alerts & Upcoming SIPs** | Tracks SIP schedules and fires alerts for upcoming or missed SIP installments. |
| 🔐 **Auth & Security** | Full authentication system (Login, Register, Forgot Password, Reset Password) powered by Supabase Auth with Row-Level Security (RLS) — each user sees only their own investor data. |
| 📊 **Interactive Charts** | Historical NAV and portfolio performance visualized through interactive Recharts line/bar graphs. |

---

### Who Benefits from InvestorPulse?

| Stakeholder | Value Delivered |
|---|---|
| **Mutual Fund Distributors (MFDs)** | Full visibility of their book of business in one place; fewer missed SIPs and redemptions. |
| **Relationship Managers (RMs)** | Instant alerts about at-risk investors, reducing churn and improving client retention. |
| **Wealth Management Firms** | Scalable, multi-user platform with secure data isolation per RM via Supabase RLS. |
| **Operations Teams** | Automated NAV sync and CSV upload replaces manual data entry, saving hours per week. |
| **Compliance & Auditing** | All investor actions and data changes are traceable through Supabase's built-in audit capabilities. |

---

## 🛠️ Tech Stack — Full Breakdown

### 1. 🖥️ Core Framework

| Technology | Version | Role |
|---|---|---|
| **Next.js** | v15.1.12 | Full-stack React framework (App Router, Server Components, API Routes) |
| **React** | v19.2.3 | UI component library — builds every page and interactive widget |
| **TypeScript** | v5+ | Static type-safety across the entire codebase |

> **Why Next.js?** It allows InvestorPulse to run server-side logic (database queries, auth verification) and client-side UI in the same project, cutting infrastructure complexity significantly.

---

### 2. 🎨 Styling & UI

| Technology | Version | Role |
|---|---|---|
| **Tailwind CSS** | v4 | Utility-first CSS framework for all layout and styling |
| **Lucide React** | v0.575.0 | Icon system (charts, users, alerts, dashboards) |
| **clsx** | v2.1.1 | Conditional class name utility |
| **tailwind-merge** | v3.5.0 | Safely merges conflicting Tailwind classes |

> **Why Tailwind CSS v4?** The newest major version uses a native CSS-first configuration model — zero config file needed, and it compiles faster than ever.

---

### 3. 🗄️ Backend & Database (BaaS)

| Technology | Version | Role |
|---|---|---|
| **Supabase JS** | v2.98.0 | Managed PostgreSQL database + Auth SDK |
| **Supabase SSR** | v0.8.0 | Handles auth cookies across Next.js Server & Client Components |

> **Why Supabase?** It bundles PostgreSQL, authentication, role-based Row-Level Security, and real-time subscriptions into a managed cloud service — the equivalent of Firebase but with SQL power. For InvestorPulse, RLS ensures an RM can never accidentally see another RM's investor data.

---

### 4. 📊 Data Processing & Visualization

| Technology | Version | Role |
|---|---|---|
| **Recharts** | v3.7.0 | React charting library for NAV graphs, portfolio performance, and panic risk gauges |
| **XLSX** | v0.18.5 | Parses uploaded Excel/CSV investor data files on the client side |
| **date-fns** | v4.1.0 | Date manipulation for SIP scheduling, report ranges, and timeline formatting |

---

### 5. 🧰 Developer Tooling

| Technology | Version | Role |
|---|---|---|
| **ESLint** | v9 | Code linting & style enforcement |
| **PostCSS** | via Tailwind | CSS post-processing pipeline |
| **@tailwindcss/postcss** | v4 | Tailwind's official PostCSS plugin |

---

### Architecture Overview

```
InvestorPulse/
├── src/
│   ├── app/
│   │   ├── (auth pages: login, register, forgot-password, reset-password)
│   │   ├── api/              ← Next.js serverless API routes
│   │   ├── dashboard/        ← Main authenticated dashboard area
│   │   │   ├── page.tsx      ← Main overview dashboard
│   │   │   ├── investors/    ← Investor list & drilldown
│   │   │   ├── market/       ← Market NAV sync view
│   │   │   ├── panic-risk/   ← Panic risk engine
│   │   │   ├── redemption-alerts/ ← Redemption alerts
│   │   │   ├── sip-alerts/   ← SIP alert management
│   │   │   ├── upcoming-sips/← Upcoming SIP schedule
│   │   │   └── upload/       ← Data upload flow
│   ├── components/
│   │   ├── InvestorChart.tsx       ← Portfolio performance chart
│   │   ├── SyncMarketButton.tsx    ← Market NAV sync trigger
│   │   └── UploadedDataManager.tsx ← CSV/Excel upload manager
│   ├── utils/                ← Supabase client helpers
│   └── middleware.ts         ← Auth route protection middleware
├── public/                   ← Static assets
└── *.csv files               ← Sample NAV market data (Dec/Jan/Feb)
```

---

## 🏢 How is InvestorPulse Useful for an Organization?

### 1. **Reduces Investor Churn**
The Panic Risk Engine proactively identifies investors likely to exit during market downturns. RMs can reach out *before* redemption happens — retaining AUM and client trust.

### 2. **Eliminates Manual Spreadsheet Work**
NAV sync and CSV upload automation removes hours of manual data entry per week from operations teams, allowing them to focus on higher-value tasks.

### 3. **Improves SIP Retention**
Real-time SIP alerts mean no SIP installment is ever missed or forgotten — directly improving the firm's revenue predictability.

### 4. **Scales Securely Across Teams**
Supabase's Row-Level Security allows the platform to support multiple RMs within a single organization — each seeing only their own book of business — without complex backend code.

### 5. **Provides Actionable Intelligence, Not Just Data**
Unlike raw portfolio spreadsheets, InvestorPulse surfaces *insights* — alerts, risk flags, and visualizations — that drive action, not just information overload.

### 6. **Enterprise-Grade, Cost-Effective**
The entire stack (Next.js + Supabase) can run at near-zero cost for small teams on free tiers, and scales affordably to enterprise usage without re-architecture.

---

*Generated: 2026-03-03 | InvestorPulse VRM Dashboard*
