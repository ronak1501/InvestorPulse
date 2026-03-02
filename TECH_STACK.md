# InvestorPulse Tech Stack

This project uses a modern and robust tech stack for building web applications. Based on the project dependencies, here is the complete tech stack breakdown:

## 1. The Core Framework
*   **Next.js (v16)**: The foundational React framework that handles both the frontend and backend (API routes) of the application. It provides server-side rendering, routing, and an optimized build system via Turbopack.
*   **React (v19)**: The foundational library for building user interfaces using resuable components.

## 2. Styling and UI
*   **Tailwind CSS (v4)**: A utility-first CSS framework that lets you style components directly from HTML/JSX without writing separate CSS files.
*   **Lucide React**: A lightweight icon library that provides beautiful icons like arrows, users, and dashboards.
*   **Clsx & Tailwind Merge**: Utility libraries that properly merge and handle multiple dynamic Tailwind CSS classes conditionally to prevent style conflicts.

## 3. Backend & Database (BaaS)
*   **Supabase (`@supabase/supabase-js`, `@supabase/ssr`)**: The backend-as-a-service. It provides a managed PostgreSQL database, robust authentication, and secure Row-Level Security (RLS) rules that ensure users only see their own data. The `@supabase/ssr` package is used for handling authentication optimally across Server Components and Client Components in Next.js.

## 4. Data Processing & Visualization
*   **Recharts**: A charting library built for React used to render the investor performance, panic risk, and historical asset graphs.
*   **XLSX (`xlsx`)**: Used for parsing Excel and CSV spreadsheet files containing market NAV updates and portfolio entries uploaded directly onto the dashboard.
*   **Date-fns**: A powerful toolset used for manipulating and formatting dates dynamically based on user timezone and report ranges.

## 5. Language & Tooling
*   **TypeScript**: Ensures complete type-safety across the application so the IDE can catch bugs before compiling the code.
*   **ESLint**: Inspects the code for formatting and structural mistakes.
