# Phase 2 · Episode Blueprint, Adaptive Quiz Logic, and Micro-Tip System

## Modular Episode Template

| Segment | Duration | Purpose | Beginner Guardrails |
|---------|----------|---------|----------------------|
| Cold Open Hook | 0:05 | Surface outcome or wow moment; set stakes | Auto-caption, emoji overlay for quick comprehension |
| Context Setup | 0:20-0:30 | Frame why concept matters using story or real-life scenario | Use plain language, avoid jargon until defined |
| Concept Burst | 1:00-1:30 | Deliver core instruction with visual anchors | Include dual-language subtitle toggle, highlight keywords |
| Guided Example | 0:45-1:00 | Demonstrate concept with step-by-step animation | Provide "slow mode" button to replay at 0.75× |
| Micro-Quiz Transition | 0:05 | Signal interactive break, prime learner | Friendly avatar prompt, countdown |
| Micro-Quiz Segment | 0:20-0:45 | Validate understanding, gather data signals | Start with binary/tap choices, escalate to drag-sort |
| Micro-Tip Reveal | 0:15 | Offer tailored advice based on response | Pull from adaptive tip engine (see below) |
| Cliffhanger Tease | 0:10 | Introduce next concept or challenge | Tease upcoming reward/unlock |

Target total runtime: 2:45–4:10 for beginner cohorts.

## Adaptive Quiz Logic

1. **Question Bank Tagging**  
   - Metadata: concept tag, difficulty tier (0-3), modality (tap, drag, arrange), misconception codes.  
   - Each episode predefines primary (tier 0-1) and stretch (tier 2-3) items.

2. **Selection Rules**  
   - Start episodes with tier 0 question; escalate to tier 1 on correct, fallback to tier 0 variant on incorrect.  
   - Track learner mastery per concept; when mastery ≥80%, inject tier 2 challenge at end of binge chain.  
   - Avoid repeating same question within 3 sessions; use sibling variants with same learning objective.

3. **Response Handling**  
   - Correct: instant positive micro-animation, reveal insight snippet, bank XP.  
   - Incorrect: show quick clarifying clip, auto-enqueue remedial micro-tip, optionally replay relevant segment.  
   - Partial credit logic for drag-sort: highlight misplaced items, allow one retry with lowered XP but maintain streak.

4. **Data Signals Captured**  
   - Time-to-answer, retries, hint usage, confidence slider (optional).  
   - Feed into mastery model and personalization engine for subsequent episodes.

## Micro-Tip System

- **Tip Library Structure**: Each tip entry includes trigger condition (concept + misconception), delivery format (text overlay, whisper audio, character cameo), length ≤ 12 seconds.  
- **Trigger Logic**:  
  - Incorrect answer → serve targeted misconception tip.  
  - Slow response (>7s) → serve "speed booster" tactic (mnemonic, shortcut).  
  - Correct streak ≥5 → deliver advanced optional nugget to keep excitement high.  
- **Surface Mechanism**: Tips appear as tappable cards post-quiz or as picture-in-picture pop-ups mid-replay.  
- **Retention Reinforcement**: After tip is consumed, queue a personalized reminder in next session's opener.  
- **Authoring Workflow**: Instructional designers tag tips with tone (playful, coach, mentor) to match learner profile.

## Beginner-Friendly Safeguards

- Provide "I’m lost" tap; auto-triggers supportive tip + curated recap playlist.  
- Limit back-to-back incorrect streaks by swapping in guided practice episodes.  
- Allow skip with gentle consequence (reduced loot rarity) to prevent frustration without blocking progress.  
- Offer optional text summary and printable cheat-sheet after every 3 episodes.
