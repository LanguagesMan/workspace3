# Phase 4 · Personalization, Onboarding, and Beginner Safety Nets

## AI Coach Architecture

- **Core Components**:  
  - Real-time transcript analysis with concept tagging to detect confusion moments.  
  - Learner profile graph storing mastery scores, motivation type, preferred tone.  
  - Response generator leveraging template-first approach with ML personalization to keep messaging consistent and friendly.

- **Coach Modes**:  
  1. *Sidekick*: Light-touch nudges during episodes (emoji reactions, celebration gifs).  
  2. *Guide*: Step-by-step walkthrough on demand, triggered after repeated errors.  
  3. *Mentor*: Reflective prompts post-session encouraging metacognition.

- **Interaction Surfaces**:  
  - Popover hints during video when pause is detected.  
  - Chat-style drawer accessible any time with quick actions ("Summarize", "Explain differently", "Give me practice").  
  - Push notifications tailored to persona preferences (motivational vs. pragmatic).

## Onboarding Playbook

1. **Pre-Flight Check**  
   - 60-second interactive tutorial showing how to tap micro-quizzes, earn rewards, and request help.  
   - Persona self-identification quiz to tune tone, difficulty, and content arc.

2. **First Binge Path**  
   - Auto-curated 3-episode starter run optimized for quick wins, with low cognitive load and frequent rewards.  
   - Provide immediate feedback on progress with celebratory end-card.

3. **Safety Briefing**  
   - Introduce skip/rewind controls, offline download options, and accessibility features.  
   - Encourage using “I’m lost” button with demo scenario.

4. **Goal Setting**  
   - Prompt learners to choose a micro-goal (e.g., "15-minute daily binge", "Master topic in 2 weeks").  
   - AI coach translates goal into personalized quest calendar.

## Beginner Safety Nets

- **Adaptive Difficulty Governor**: Monitors frustration signals (rapid incorrect answers, session abort). Auto-switches to recap mode with slower pacing.  
- **Recovery Playlists**: Curated episodes that revisit tricky concepts with alternative explanations (visual, storytelling, practice).  
- **Compassionate Messaging**: Coach acknowledges setbacks and celebrates effort, not only accuracy.  
- **Accessibility Options**:  
  - Closed captions, language toggles, dyslexia-friendly fonts, high-contrast mode.  
  - Audio descriptions and haptic cues for key interactions.

- **Emergency Exit**: Quick "Take a break" flow that pauses streak decay and suggests mindful break content.

## Progress Visibility & Reflection

- **Progress Dashboard**: Shows binge streak, XP trajectory, concept mastery map, and unlocked collectibles.  
- **Reflection Journal**: After every binge session, coach prompts for short voice/text reflection stored in timeline; AI surfaces insights weekly.  
- **Feedback Loop**: Learners can rate tips, episodes, and coach interactions; data feeds directly into iteration backlog.

## Collaboration with Support Team

- Escalation triggers (e.g., repeated frustration) notify human mentors for proactive outreach.  
- Unified inbox aggregating AI coach logs and learner reflections to guide community managers.
