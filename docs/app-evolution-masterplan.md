# VIDA Evolution Masterplan

## Vision
Deliver the most engaging, data-informed language immersion platform on the market by combining TikTok-grade content polish, Duolingo-level pedagogy, and production-ready operations.

## Pillar 1 – Product Experience
- **Unified shell**: consolidate public HTML variants into a shared layout system with theme tokens, animated transitions, and responsive breakpoints.
- **Learning loop**: drive users through placement → feed → vocabulary → SRS → analytics with clear CTAs, checklists, and celebratory UI.
- **Personalized narratives**: surface story-based playlists, AI tutor prompts, and progress recaps tailored to persona segments.
- **Accessibility**: WCAG 2.2 AA compliance, subtitle contrast tuning, keyboard-only navigation, screen-reader optimized semantic structure.
- **Localization**: centralize language strings, add right-to-left support, and allow users to switch interface language seamlessly.

## Pillar 2 – Data & Intelligence
- **Single source of truth**: migrate scattered JSON/CSV content into Supabase tables; enforce referential integrity via Prisma migrations.
- **Adaptive engine 2.0**: factor in time-decay XP, topic interest weights, and speech feedback to generate feed ordering.
- **Analytics warehouse**: ship events to a dedicated analytics DB (Supabase/ClickHouse) and build Looker-style dashboards for retention, XP velocity, and content efficacy.
- **A/B experimentation**: embed assignment + exposure tracking; run weekly experiments on feed layouts, call-to-actions, and difficulty adjustments.

## Pillar 3 – Platform & Delivery
- **Build system**: adopt Vite or Next.js for bundling, code splitting, and static asset optimization while keeping the Express API for backend services.
- **Environment management**: use `.env.example` + Doppler/1Password + Vercel for secrets; keep staging/prod parity with infrastructure-as-code (Terraform for Supabase policies, Vercel config).
- **CI/CD**: GitHub Actions pipeline running lint → unit → Playwright persona suites → visual regression → deploy. Gate merges on green builds and coverage thresholds.
- **Testing strategy**: expand Playwright MCP personas, add contract tests for API responses, snapshot feed payloads, and run smoke tests on staging post-deploy.
- **Observability**: integrate Sentry, structured logging (Pino), metrics (Prometheus-compatible), and synthetic monitoring hitting `/api/health/status`.

## Pillar 4 – Content Pipeline
- **Automated ingestion**: schedule Firecrawl + RSS + API pulls with deduplication and language checking.
- **Editorial back-office**: build admin panel for tagging, approving, and scheduling content; include quality checklists and preview modes.
- **AI-assisted authoring**: fine-tune prompts for simplified, intermediate, and advanced rewrites; store original + adapted versions for audits.
- **Compliance safeguards**: track licenses, DMCA takedown workflows, and content provenance metadata.

## Pillar 5 – Engagement & Monetization
- **Gamification**: daily quests, streak shields, event-based multipliers, and leaderboard seasons tied to user cohorts.
- **Social layer**: implement friend challenges, shared playlists, and community polls to boost accountability.
- **Monetization roadmap**: tiered subscriptions (Basic, Pro, Coach), in-app purchase hooks, and referral credits via Stripe Billing.
- **Lifecycle comms**: transactional emails, push notifications (Web Push), and weekly progress digests using an event-driven queue.

## Execution Phases
1. **Foundation (Weeks 1-2)**: complete refactor of server bootstrap, set up CI/CD, migrate secrets, clean static assets.
2. **Experience (Weeks 3-6)**: deliver unified frontend shell, persona-led flows, accessibility audit fixes.
3. **Intelligence (Weeks 7-9)**: migrate data to Supabase, enhance adaptive engine, build analytics dashboards.
4. **Growth (Weeks 10-12)**: launch gamification, experiment framework, and lifecycle messaging.
5. **Scale (Post-launch)**: optimize infra costs, add multi-language support, expand content sources, and integrate mobile wrappers (React Native/Capacitor).

Use this masterplan to prioritize sprint backlogs, drive product reviews, and keep the app marching toward “best-in-class” status.
