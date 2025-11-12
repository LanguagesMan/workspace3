# Phase 5 · Measurement, Experimentation, and Feedback Loops

## Analytics Stack & Data Flow

- **Event Collection**: Instrument mobile clients with schema-based tracker capturing episode starts, pauses, micro-quiz interactions, reward claims, coach prompts, social actions.  
- **Real-Time Processing**: Stream events into Supabase/Postgres via edge functions; aggregate session stats using materialized views.  
- **Dashboards**:  
  - *Engagement Console*: Session length, binge chain distribution, autoplay acceptance, drop-off heatmaps per timestamp.  
  - *Learning Outcome Board*: Quiz accuracy vs. difficulty, concept mastery trends, tip effectiveness.  
  - *Fun Index*: Composite score blending streak retention, loot claim rate, notification response, sentiment from reflections.

## North-Star Metrics & Leading Indicators

- **Primary**: Beginner activation rate (completing 3-episode starter run within 48 hours).  
- **Secondary**: D7 retention, XP velocity (XP per active day), binge satisfaction rating ≥4/5, coach helpfulness rating ≥4/5.  
- **Leading Signals**:  
  - Micro-quiz completion latency.  
  - Loot claim conversion.  
  - Party challenge participation.  
  - Reflection journal submission rate.

## Experimentation Framework

- **Test Types**:  
  - UX A/B tests (e.g., teaser format, quiz UI).  
  - Content variants (alternative explanations).  
  - Reward tuning (loot rarity, streak forgiveness).  
  - Notification cadence experiments.

- **Execution Workflow**:  
  1. Hypothesis intake via weekly experiment pitch doc.  
  2. Assign owner + success metrics; define guardrails (drop-off threshold).  
  3. Launch with feature flags segmented by persona.  
  4. Monitor with auto-stop triggers to prevent regressions.  
  5. Publish experiment retrospectives within 48 hours of conclusion.

- **Tooling**: Supabase for variant targeting, analytics BI (Metabase/Looker) for visualization, in-app survey microservice for rapid feedback.

## Continuous Feedback Channels

- **In-Episode Reactions**: Micro joy/snooze emoji toggles to capture vibe in real time.  
- **Post-Binge Pulse**: 15-second slider survey (fun, clarity, challenge). Triggered on third session of day.  
- **Coach Inbox**: AI summarizes learner questions and flags patterns for instructional design team.  
- **Community Signals**: Track party challenge chat sentiment, report trending tips.

## Operational Cadence

- Weekly growth + learning sync reviewing top metrics, experiments, upcoming content drops.  
- Monthly persona deep-dives combining quant + qual insights to recalibrate roadmap.  
- Quarterly binge jam: cross-functional hackathon using analytics insights to ship new delight features quickly.

## Quality & Ethics Safeguards

- Privacy-first data minimization; allow learners to opt out of personalization tracking.  
- Bias audits on AI coach messaging and reward allocation to ensure fairness.  
- Monitor for unhealthy bingeing; implement wellbeing alerts and recommended breaks.
