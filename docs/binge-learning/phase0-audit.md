# Phase 0 · Discovery & Architecture Snapshot

## Stack & Runtime Overview

- **Client**: `language-learning-feed/app/**` – Next.js App Router, mobile-first vertical feed using React + Tailwind + Framer Motion, Zustand store for session state.  
- **API**: Next.js route handlers under `app/api/**`; Prisma ORM against Supabase Postgres; Redis cache abstraction (`lib/redis.ts`) for per-user feed lists.  
- **Legacy Services**: Root `/src/**` Express server and ingestion scripts coexist but are not wired into the Next client; legacy stylesheets (e.g., `vocabulary-review-styles.css`) indicate historical flows that now diverge from the App Router implementation.  
- **Content Pipeline**: Prisma `Content` model stores videos/articles with CEFR level, `dopamineScore`, and word relations; fallback feed JSON seeds fill gaps during local runs.

## Current Sequencing Logic

- `app/api/feed/route.ts` ranks content by heuristic blend of CEFR proximity, `dopamineScore`, and SRS alignment, then slices by `offset`/`limit`.  
- Cache warm start only supports an initial static ordering; once a learner swipes “too hard” (`SWIPE_LEFT`) or “save” (`SWIPE_RIGHT`) the feed invalidates entirely rather than advancing adaptively.  
- `useFeedStore` advances indices but does **not** request a new recommendation after difficulty feedback; the UI simply increments position or sets loading=true without awaiting a refill.  
- No canonical ordering metadata exists on `Content` (missing `arcId`, `episodeIndex`, `difficultyTier`, `bingeChapter` fields). Ingestion scripts likewise skip sequencing guarantees, so fallback playlists loop in arbitrary order.

## Easy/Hard Feedback Gaps

- Swipe gestures map to interaction types, but `/api/interaction` only invalidates cache; it never persists difficulty preference or updates `UserPreference.preferredDifficulty`.  
- Difficulty inference relies solely on known-word percentage; learner feedback is ignored, so “too easy / too hard” swipes do **not** push the next appropriate episode.  
- `updateWordExposure` mislabels `language` as `contentWord.word`, corrupting mastery data and blocking level progression logic.

## Metadata Inventory & Pain Points

- `Content` lacks: narrative arc identifiers, recommended order, difficulty buckets, prior/next pointers, binge themes.  
- No join table to express beginner-friendly playlists or adaptive sequences per persona.  
- `ContentWord` stores CEFR per word but we do not persist aggregated difficulty tiers onto the parent item for quick filtering.  
- Supabase storage structure for videos/subtitles exists, yet no schema ensures every `Content` row has `durationSeconds`, `captions`, or `topics` populated; ingestion scripts do not enforce completeness.

## System Interactions Summary

- Client fetches `/api/feed`, renders `FeedCard`, and posts to `/api/interaction` + `/api/progress`.  
- XP logic lives in the API response (`calculateXP`) and Zustand store; no centralized reward service ties into future streak / loot systems.  
- Analytics hooks limited to console logs; no Mixpanel/Sentry wiring despite dependencies.

## Success Metrics (Audit Baseline)

| Issue Area | Current Signals | Desired Metric | Notes |
|------------|-----------------|----------------|-------|
| Sequencing accuracy | Cache invalidation only | ≥90% episodes served in target difficulty corridor within 2 interactions | Need adaptive ordering service | 
| Difficulty feedback | Ignored | ≥80% of easy/hard actions change subsequent recommendation difficulty within 1 hop | Requires preference + mastery updates | 
| Binge continuity | Manual index increment | ≥70% learners auto-advance without manual scroll glitches | Must prefetch next rec before animation ends | 
| Metadata completeness | Manual fallback JSON | 100% of published items tagged with arc + difficulty tier + duration | Enforce via ingestion QA | 
| Interaction logging | Server console | Structured analytics events for 95% feed actions | Instrument client + API | 

## Immediate Risks Identified

- Bad `language` foreign key in `updateWordExposure` poisons personalization.  
- Lack of canonical ordering prevents any “season/episode” experiences; learners see random difficulty shifts.  
- Easy/hard gestures do not move to next card; Zustand `nextItem` waits for external fetch that never triggers.  
- Legacy Express code may diverge from Next.js APIs, risking duplicate logic during future integrations.
