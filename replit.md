# Workspace

## Overview

GRIDIRON ALERTS — a real-time NFL news alerts dashboard for sports bettors and fantasy managers. Pulls live news from Yardbarker per-team RSS feeds, auto-categorizes alerts (injury, trade, lineup, signing, suspension, performance, general), prioritizes them (breaking, high, normal), and streams them into a live feed dashboard with team filtering and user preference persistence.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind, framer-motion, wouter, TanStack Query
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **News source**: Yardbarker per-team RSS (`https://www.yardbarker.com/rss/team/{id}-{slug}`)

## Artifacts

- `artifacts/nfl-alerts` — the React + Vite dashboard, served at `/`
- `artifacts/api-server` — the shared Express API server, served at `/api`
- `artifacts/mockup-sandbox` — design mockup sandbox (canvas)

## Data Model (lib/db/src/schema)

- `teams` — 32 NFL teams (id, city, name, abbreviation, conference, division, primary/secondary color, slug, yardbarker slug, alert count)
- `alerts` — news alerts (id, team_id, headline, summary, category, priority, source name/url, published_at)
- `preferences` — per-client (anonymous) followed teams + enabled categories
- `refresh_state` — last global refresh timestamp

## Background Jobs

The API server polls all 32 team feeds in parallel every 5 minutes and after a 2s warm-up at startup. A `POST /api/alerts/refresh` endpoint triggers a manual refresh. New alerts are deduplicated by source URL.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
