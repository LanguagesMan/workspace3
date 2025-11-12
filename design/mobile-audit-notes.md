# Mobile UI Audit — Langflix

## Landing (`language-learning-feed/app/page.tsx`)
- Hero layout assumes desktop widths; typography scales to `text-7xl` which clips on smaller iPhone screens.
- Value prop cards use `grid md:grid-cols-3`, collapsing into a vertical stack without spacing guidance for thumb reach.
- CTA buttons rely on long horizontal pills; no secondary micro-copy or haptic feedback states.
- Stats row rendered in three columns even on narrow screens, causing cramped numbers and scroll jitter.
- Lack of motion hierarchy; everything fades in uniformly, reducing perceived dynamism akin to TikTok.

## Onboarding (`language-learning-feed/app/onboarding/page.tsx`)
- Flow jumps between drastically different gradient backgrounds, producing visual fatigue.
- “Tap to see meaning” CTA appears as plain text; discoverability is low and lacks gamified feedback.
- Audio playback relies on `new Audio()` per interaction without buffering indicator; poor reliability on mobile autoplay restrictions.
- Welcome / language / level steps vertically centered but not optimized for one-handed reach; buttons sit too low/high depending on viewport height.
- Learning cards are static; no swipe gestures or streak reinforcement, and progress chip sits at page footer away from primary interaction zone.

## Feed (`language-learning-feed/app/feed/page.tsx`, `components/FeedCard.tsx`)
- Progress HUD is fixed at the top, overlapping status bar areas and lacking safe-area padding.
- Feed card container limits height to `80vh`, leaving unused space and breaking the immersive “edge-to-edge” feel.
- Gesture hints are always visible; no adaptive fade once the user learns controls.
- Difficulty buttons positioned in a single row; thumb stretch on smaller devices and no vibration/micro-reward feedback.
- Reward system limited to basic confetti; no streak flames, daily quests, or intermittent loot drops to match Duolingo-style gamification.

## System-Wide
- No unified brand tokens; gradients and typography vary per screen.
- Missing safe-area handling (e.g., iPhone notch) and bottom navigation rails for quick actions.
- Lack of analytics hooks to measure onboarding drop-off or reward engagement.
- Playwright tests do not assert mobile-specific affordances (swipes, safe areas, action tray visibility).


