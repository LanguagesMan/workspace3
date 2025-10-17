# Playwright MCP Persona Testing

This document outlines how to exercise core learner journeys with Playwright while leveraging the Playwright MCP agent for multi-user coverage.

## Goals
- Validate core onboarding and feed flows for beginner, intermediate, and advanced personas.
- Capture traces, screenshots, and logs per persona for regression review.
- Keep tests hermetic by seeding Supabase data and stubbing external APIs.

## Test Topology
- **beginnerPersona**: brand new account, runs placement test, receives beginner feed, completes first vocabulary save.
- **intermediateSwitcher**: returning learner with history, checks analytics dashboard, switches to articles feed.
- **powerUser**: high-XP account, runs SRS review, launches AI conversation.

Each persona lives in its own Playwright project so failures are isolated and parallelisable.

## Local Setup
1. Ensure `@playwright/test` is installed and the MCP bridge is configured globally.
2. Copy `.env.example`, populate secrets, and run `npm install`.
3. Start the server via `node -e "require('./server').startServer()"` or let Playwright spawn it with `webServer` settings.

## Seeding Strategy
- Use Supabase REST admin endpoints to upsert persona profiles before each test. Store helper functions in `tests/utils/personas.ts`.
- Mock external APIs with `page.route` (OpenAI, Firecrawl, news providers).
- Store fixtures in `tests/fixtures/personas/*.json` to describe expected feed entries.

## Playwright Configuration
Create `playwright.personas.config.ts` with:
- `projects` array for the three personas.
- `globalSetup` to seed baseline data.
- `webServer` invoking `node scripts/start-server.js` which calls `startServer`.
- `use` options enabling `trace: 'on-first-retry'` and `screenshot: 'on'`.

Example command:
```bash
npx playwright test --config=playwright.personas.config.ts
```

## CI Integration
- Add a GitHub Actions/Vercel Workflow job `persona-tests` triggered on `push`/`pull_request`.
- Cache `~/.cache/ms-playwright` for faster runs.
- Upload traces and screenshots as artifacts.

## Reporting
- Emit per-persona JSON summaries to `test-results/personas/`.
- Surface high-level pass/fail + screenshots inside the MCP control plane for rapid triage.

With this setup the MCP agent can execute persona suites on demand, guaranteeing top-level flows stay production-ready.
