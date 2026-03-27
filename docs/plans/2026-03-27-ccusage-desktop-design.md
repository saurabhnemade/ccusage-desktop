# ccusage Desktop — Design Document

## Overview

A Tauri v2 desktop app that provides a polished visual dashboard for Claude Code usage data. Wraps the `ccusage` npm package via a Bun bridge script, presenting daily/weekly/monthly/session analytics through a React frontend with dark/light theme support.

## Architecture

```
React UI (Webview)
    ↕ Tauri invoke()
Rust Backend (Commands + Cache)
    ↕ spawn bun + stdin/stdout JSON
bridge.ts (imports ccusage modules)
    ↕
~/.claude/ (Claude Code logs)
```

### Layers

- **React + TypeScript frontend** — Dashboard UI with charts, tables, stat cards. Uses TanStack Query for data fetching, Recharts for visualization, shadcn/ui + Tailwind for styling.
- **Rust Tauri backend** — Tauri commands that spawn `bun run bridge.ts`, parse JSON responses, and cache results in-memory with 30s TTL.
- **Bun bridge script** — Single `bridge.ts` that imports ccusage's exported modules (`data-loader`, `calculate-cost`), accepts commands via stdin JSON, returns results via stdout JSON.

### Data Flow

1. React component calls `invoke("get_daily_usage", { since, until, breakdown })`
2. Rust checks in-memory cache (30s TTL)
3. On miss: spawns `bun run bridge/bridge.ts`, writes `{"command":"daily","args":{...}}` to stdin
4. bridge.ts calls ccusage modules, writes JSON result to stdout
5. Rust parses response, caches, returns to frontend
6. TanStack Query caches on frontend, auto-refetches on window focus

### Bridge Protocol

```
Input (stdin):  {"command": "daily", "args": {"since": "20260301", "breakdown": true}}
Output (stdout): {"ok": true, "data": { ...ccusage JSON... }}
Error (stdout):  {"ok": false, "error": "message"}
```

Commands: `daily`, `monthly`, `weekly`, `session`, `blocks`

## UI Design

### Overview Dashboard (Landing Page)

- **Stat cards row:** Today's cost, This Week, This Month, Total Sessions
- **Daily cost area chart:** Last 30 days trend
- **Model breakdown donut chart:** Opus / Sonnet / Haiku split
- **Recent sessions table:** Top sessions by cost with project name, models, cost, last activity

### Drill-Down Views

Navigation: `Overview | Daily | Weekly | Monthly | Sessions`

Each view provides:
- Filterable date range picker (since/until)
- Sortable data table with all columns from ccusage JSON
- Appropriate chart (bar for daily, area for monthly, table for sessions)
- Model breakdown toggle (expandable rows)
- Project filter dropdown

### Theme

- System auto-detect with manual toggle (top-right)
- Dark: slate/zinc backgrounds, blue/purple accent
- Light: white/gray backgrounds, same accents
- Smooth CSS transition

## Project Structure

```
ccusage-desktop/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── bridge.rs
│   │   └── cache.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── layout/          # Sidebar, ThemeToggle
│   │   ├── dashboard/       # StatCard, CostChart, ModelDonut, RecentSessions
│   │   └── views/           # DailyView, MonthlyView, WeeklyView, SessionsView
│   ├── hooks/
│   │   └── useUsageData.ts  # TanStack Query hooks
│   ├── lib/
│   │   ├── types.ts         # Types matching ccusage JSON
│   │   └── utils.ts         # Currency, token, date formatters
│   └── styles/
│       └── globals.css
├── bridge/
│   └── bridge.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── index.html
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Shell | Tauri v2 |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Data fetching | TanStack Query |
| Routing | React Router |
| Bridge | Bun + ccusage npm modules |
| Caching | Rust in-memory, 30s TTL |

## Non-Goals

- No local database / SQLite
- No auto-update mechanism
- No export/CSV (ccusage CLI handles this)
- No tray icon / background process
- No multi-user / auth
- No custom pricing overrides

## Prerequisites

- Rust toolchain via rustup
- Bun (already installed)
