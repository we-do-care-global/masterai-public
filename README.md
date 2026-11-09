# We Do Care Global — AI Web Research & Expansion Platform

> **Continuous Improvement, Web Research Expansions, and Two-Way GitHub Automation**  
> Serving [We Do Care Global](https://github.com/we-do-care-global/we-do-care-global) and the live site at [we-do-care-global.github.io](https://we-do-care-global.github.io/we-do-care-global/).

---

## 🎯 Executive Summary & Purpose

We Do Care Global is dedicated to empowering widows, grieving families, and humanitarian relief communities worldwide.

This platform automates technical and operational growth for We Do Care Global projects through **AI Web Research Expansions**:
1. **Interactive AI Web Discovery**: An interactive “**AI Web Research Expansions for us**” engine that continuously searches the live web for actionable improvements across **9 Core Dimensions** (Systems, Tools, Functions, Work, UX, Security, Performance, Automation, Monetization).
2. **Automated Daily Expansions**: Every day at **08:00 local time** (default `Europe/Sarajevo`), exactly **1 new expansion** is automatically added per active project. An optional evening run at **20:00** reviews the day's research.
3. **Two-Way GitHub Synchronization**: Seamlessly pulls branches, commits, issues, PRs, workflows, and GitHub Pages deployment status from `we-do-care-global/we-do-care-global`, while pushing approved expansions directly to GitHub issues and draft pull requests.
4. **Execution Roadmap / Kanban**: Converts research proposals into Backlog, Planned, In Progress, Review, and Done stages linked to real GitHub issues.

---

## 🏗️ Architecture & Stack

| Layer | Technology | Responsibilities |
|---|---|---|
| **Frontend** | Vite + React 19 + TypeScript + Tailwind CSS | Single-page application, interactive Kanban, real-time sync indicators, research modal |
| **Backend / Proxy** | Express.js + Node / tsx | Secure API routing, server-side secret isolation, cron scheduling, GitHub REST/Octokit reconciliation |
| **AI Web Research** | `@google/genai` (Gemini 3.8 Flash) | Live Google Search grounding, structured synthesis, JSON schema validation, fallback domain grounding |
| **Database & Auth** | Supabase (PostgreSQL + RLS + pg_cron) | Relational persistence, Row-Level Security, automated cron execution, edge functions |
| **GitHub Automation** | GitHub REST API, Webhooks, GitHub Actions | Two-way issue sync, automated branch & draft PR creation, Pages synthetic health checks |

---

## ⚙️ Environment Variables (`.env.example`)

### Frontend
- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Public client anon key.
- `VITE_APP_BASE_PATH`: Base path when deployed under GitHub Pages (e.g. `/ai-research/` or `/we-do-care-global/`).

### Backend / Edge Functions
- `GEMINI_API_KEY`: API key for Gemini 3.8 Flash with Google Search grounding.
- `PORT`: Server port (default `3000`).
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations and pg_cron calls.
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID.
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret.
- `GITHUB_PERSONAL_ACCESS_TOKEN`: GitHub token with `repo` and `workflow` permissions for syncing.
- `GITHUB_REPO_OWNER`: Default repository owner (`we-do-care-global`).
- `GITHUB_REPO_NAME`: Default repository name (`we-do-care-global`).
- `DAILY_RESEARCH_CRON`: Schedule for morning run (`0 8 * * *`).
- `DAILY_RESEARCH_TZ`: Default local timezone (`Europe/Sarajevo`).
- `EVENING_RESEARCH_CRON`: Schedule for evening run (`0 20 * * *`).

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the full-stack development server
npm run dev

# 3. Run all unit, integration, and E2E acceptance tests
npm test

# 4. Build for production
npm run build
```

---

## ⏰ Daily Auto-Expansion Cron (08:00 & 20:00)

### Strict Idempotency Guard
To ensure predictability and prevent noise:
- The cron runner constructs an idempotency key: `${date}-${projectId}-${type}` (e.g. `2026-10-02-proj-wdc-01-08:00`).
- If an expansion has already been generated for that project on that calendar day, duplicate runs are safely skipped.
- If an execution fails, the scheduler retries up to 3 times with exponential backoff before logging an error to `audit_logs`.

### How to Test Immediately
1. Open the app and navigate to **Daily Auto-Expansion** in the sidebar.
2. Click **Trigger 08:00 Run** or **Trigger 20:00 Run**.
3. Use the **Mock Date Simulator** to test runs across future dates.

---

## 🔄 Two-Way GitHub Synchronization

The unified `SyncService` integrates with `we-do-care-global/we-do-care-global`:
- **Pulls from GitHub**:
  - Branches (e.g. `main`, `feature/ai-research-expansions`)
  - Recent commits with author and commit SHA
  - Issues & Pull Requests with labels and draft indicators
  - GitHub Actions workflow run conclusions
  - GitHub Pages deployment status (`https://we-do-care-global.github.io/we-do-care-global/`)
- **Pushes to GitHub**:
  - 1-click **Create GitHub Issue**: Formats markdown issue body with 4 pillars (Systems, Tools, Functions, Work) and labels.
  - 1-click **Create Draft PR**: Generates branch `expansion/<slug>` with implementation scaffolding.

---

## 🗄️ Supabase Migrations & Edge Functions

- `supabase/migrations/20261001_initial_schema.sql`:
  - Tables: `profiles`, `projects`, `github_connections`, `sync_jobs`, `research_runs`, `expansions`, `roadmap_items`, `notifications`, `settings`, `audit_logs`.
  - Row Level Security (RLS) enabled on all tables.
  - `pg_cron` schedule statements.
- `supabase/functions/run-research/index.ts`: Manual AI research function.
- `supabase/functions/daily-research/index.ts`: Scheduled 08:00 / 20:00 auto-expansion edge function.

---

## 📖 Step-by-Step User Guide

1. **Sign In**:
   Click **Continue with GitHub** on the login page to authenticate as `@emir-wedocare`.
2. **AI Web Research Expansions**:
   Click the prominent **AI Web Research Expansions for us** button in the navbar or dashboard. Choose depth (Quick, Standard, Deep) and select focus dimensions (Systems, Tools, Functions, Work, UX, Security, etc.).
3. **Review Full Breakdown**:
   Click any proposal to inspect the 4 dimensions, implementation steps, target code tasks, generated GitHub issue preview, and live web sources.
4. **Export to GitHub**:
   Click **Create GitHub Issue** or **Create Draft PR** to push the proposal directly into the `we-do-care-global` repository.
5. **Move along Roadmap**:
   Add items to the Kanban board to track progress from Backlog to Done.
6. **Daily Automated Expansion**:
   Monitor the **Daily Auto-Expansion** tab to see proposals generated automatically at 08:00 local time.
