# Workspace

## Overview

PRESSBOX WIRE — a real-time multi-sport news + AI insights dashboard covering **NFL, MLB, and NBA** (92 teams total). Pulls live news from Yardbarker per-team RSS feeds, auto-categorizes alerts (player_update, team_update, coaching_update, general), prioritizes them (breaking, high, normal), and streams them into a live feed dashboard with sport filtering, team filtering and user preference persistence. Includes an "Analyst Desk" that uses Claude (via the Replit Anthropic AI proxy) to generate sport-aware trends, predictions, stats, and matchup insights from the news stream.

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

- `teams` — 92 teams across 3 sports (32 NFL + 30 MLB + 30 NBA), each with `sport` ('nfl' | 'mlb' | 'nba'), id, city, name, abbreviation, conference, division, primary/secondary color, slug, yardbarker slug, alert count. Seed data in `artifacts/api-server/src/lib/teams-data/{nfl,mlb,nba}.ts`.
- `alerts` — news alerts (id, team_id, headline, summary, category, priority, source name/url, published_at)
- `insights` — AI-generated stats/trends (id, team_id, insight_type, title, body, confidence, tags, related_alert_ids)
- `preferences` — per-client (anonymous) followed teams + enabled categories
- `refresh_state` — last global refresh timestamp

## Categories

Alerts are auto-categorized by keyword into four high-value buckets:
- `player_update` — injuries, trades, signings, depth chart, props/performance
- `team_update` — standings, results, scheme, front office, matchups
- `coaching_update` — hires/fires, coordinators, playcaller news
- `general` — stadium, ownership, miscellaneous

## AI Analyst (Insights)

A second background worker uses Anthropic Claude (via Replit AI Integrations, no API key needed) to read the last 72 hours of per-team headlines and generate short, high-value insights for sports bettors and fantasy managers. Insights have:
- `insightType`: trend / prediction / stat / matchup
- `title`, `body`, `confidence` (0-100), `tags`, `relatedAlertIds`

Generation runs every 30 minutes (`startInsightsPoller`), processes up to 6 teams per run with a 6h per-team cooldown, and uses claude-haiku-4-5 with strict-JSON parsing. Manual trigger: `POST /api/insights/generate`. Results are surfaced on the home page strip and the dedicated `/analyst` page.

## Background Jobs

The API server polls all 32 team feeds in parallel every 5 minutes and after a 2s warm-up at startup. A `POST /api/alerts/refresh` endpoint triggers a manual refresh. New alerts are deduplicated by source URL. The AI Analyst poller runs every 30 minutes after a 20s warm-up.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
