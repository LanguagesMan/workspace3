# Langflix Mobile Brand System

## Narrative
- **North Star:** “Swipe, vibe, and speak.” Interactions feel as effortless as TikTok while rewarding like Duolingo.
- **Tone:** Energetic, optimistic, never academic. Copy celebrates “discoveries” and “quests” instead of “lessons” or “reviews.”
- **Texture:** Minimal framing with purposeful neon accents and soft glow moments to signal rewards.

## Core Palette
| Token | Hex | Usage |
| --- | --- | --- |
| `brand.surface` | `#070711` | Default background; near-black for immersion. |
| `brand.surfaceAlt` | `#111129` | Elevated cards, modals. |
| `brand.textPrimary` | `#F6F6FF` | Headlines & critical copy. |
| `brand.textSecondary` | `#B4B6C8` | Body text, helper copy. |
| `brand.accent` | `#8B82FF` | Primary CTA, active states. |
| `brand.accentSoft` | `#C0BAFF` | Secondary CTA hover, gradients. |
| `brand.success` | `#2EE6C5` | Level ups, streak boosts. |
| `brand.warning` | `#FFB84D` | Streak at risk, nudges. |
| `brand.danger` | `#FF5C8D` | “Too hard” feedback, errors. |
| `brand.glow` | `#5EFFFB` | Rim lights, particle effects. |

### Gradient Recipes
- `brand.hero`: linear(135°, `#6141FF` → `#FF73B7`)
- `brand.reward`: linear(120°, `#2EE6C5` → `#5EFFFB`)
- `brand.quest`: linear(130°, `#FFB84D` → `#FF5C8D`)

## Typography
- **Display / Headline:** `Clash Display` (or `Geist Sans` fallback) with tracking tightened to −0.02em. Used for hero statements and XP numbers.
- **Body:** `Inter` for legibility, 16px base scale.
- **Special:** Use `JetBrains Mono` for streak counters and timers to convey precision.
- **Hierarchy:** H1 32px, H2 26px, H3 20px, body 16px, caption 13px. Keep line-height 1.2–1.35 for headlines, 1.5 for body text.

## Elevation & Effects
- Cards float via dual shadows: `0 12px 32px -20px rgba(98, 88, 255, 0.6)` + `0 4px 18px -14px rgba(0, 0, 0, 0.7)`.
- Utilize 1px border with `rgba(255,255,255,0.06)` for subtle separation.
- Glow chips: apply `box-shadow: 0 0 24px rgba(94, 255, 251, 0.45)` on active rewards.

## Motion
- **Swipe transitions:** 240ms ease-out with slight overshoot (`[0.16, 1, 0.3, 1]`).
- **Reward reveals:** 380ms spring, delay 90ms after action to build anticipation.
- **Confetti bursts:** Cap at 750ms, fade to 0.4 opacity before removal.

## Components & Patterns
- **Mobile Shell:** Safe-area padding, translucent status bar, and bottom action rail with central `accent` CTA.
- **Action Tray:** Primary swipe hints + quest chip, uses `brand.surfaceAlt` and neon border.
- **Reward Modal:** Full bleed gradient (`brand.reward`), celebratory emoji, XP stamp.
- **Progress HUD:** Collapsible card pinned to top-safe area, includes XP ring and streak flame.

## Accessibility
- Minimum contrast ratio 4.5:1 for text.
- Ensure dynamic type scaling + haptic feedback for primary CTA, difficulty controls, and reward claims.
- Provide audio cues (subtle chime) for milestone unlocks with a fallback to vibration on mute.

## Voice & Copy
- Primary verbs: “Unlock”, “Boost”, “Save”, “Keep streak alive.”
- Avoid “study”, “test”, “homework.” Lean on celebration microcopy (“🔥 2-day streak intact!”).

## Analytics Hooks
- Track `onboarding_language_selected`, `quest_claimed`, `swipe_streak_continue`, `reward_modal_shown`.
- Expose interface through `lib/analytics.ts` with noop fallback for offline/mobile webview scenarios.


