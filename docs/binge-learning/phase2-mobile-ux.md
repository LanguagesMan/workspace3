# Phase 2 · Mobile UI/UX Revamp

## Lesson Player Enhancements

- Added on-player accessibility tray with caption toggles, speed cycling (0.75× / 1× / 1.25×), mute control, and offline download shortcut.
- Captions now respect learner choice, announce updates via `aria-live`, and keep the playback region labeled for screen readers.
- Vertical cards surfaced arc summaries, episode numbering, and friendly difficulty tiers pulled from the adaptive sequencer.

## Binge Queue Visibility

- Introduced `NextUpRail` component showing the next three episodes with tap-to-jump navigation, path titles, and difficulty badges.
- Zustand store now supports queue insertion, deduping, and direct index jumps so previews transition instantly without reloading the page.

## Difficulty Feedback Controls

- Bottom control tray exposes "Too Easy", "Just Right", and "Too Hard" buttons with proper accessibility labels, feeding the adaptive engine while keeping mobile ergonomics tight.
- Swipe gestures remain intact, but adaptive fetches now run before advancing to guarantee the next episode reflects the learner’s signal.

## Progress Surface Updates

- `ProgressDashboard` highlights the active learning path and episode number alongside XP, streak, and word stats for clearer binge progression.
- Visual polish keeps gradients and micro-animations while ensuring cards stay legible on small screens.

## Accessibility & Mobile Polish

- All new controls use large tap targets, high-contrast states, and descriptive `aria-label`s.
- Non-interactive overlays (arc summary, path chips) ignore pointer events to keep swipe gestures frictionless.
- Loading logic avoids duplicate fetches and keeps the experience smooth when nearing the end of the queue.
