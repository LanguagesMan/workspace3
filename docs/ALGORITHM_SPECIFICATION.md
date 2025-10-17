# 🧠 Complete Algorithm Specification - TikTok + Duolingo Research

## Executive Summary

This document contains the complete technical specification for building a world-class language learning platform that combines:
- **TikTok's viral engagement algorithm** (maximize watch time and retention)
- **Duolingo's adaptive learning system** (Half-Life Regression for optimal memory retention)
- **Research-backed UX patterns** (gamification, variable rewards, optimal difficulty)

---

## PART 1: TIKTOK FEED ALGORITHM

### 1.1 Five-Point Engagement System

Every video must earn **≥50 points** from initial test audience of **300 users** to achieve broader exposure.

| Ranking Signal | Category | Points | Importance |
|---------------|----------|--------|------------|
| **Rewatching** | User Interaction | 5 | Highest - content so good they watch multiple times |
| **Watch to Completion** | User Interaction | 4 | Critical - watched start to finish |
| **Shares** | User Interaction | 3 | High - want to show friends |
| **Comments** | User Interaction | 2 | Medium - meaningful engagement |
| **Likes** | User Interaction | 1 | Low - basic approval |

**Formula:**
```
Video Score = (Rewatches × 5) + (Completions × 4) + (Shares × 3) + (Comments × 2) + (Likes × 1)
Threshold: Score ≥ 50 points from 300 users → Promote to wider audience
```

### 1.2 Theoretical Ranking Function

```
Score = (P_like × V_like) + (P_comment × V_comment) + (E_playtime × V_playtime) + (P_play × V_play)

Where:
- P = Probability of user taking action
- V = Weight/value of that action
- E_playtime = How long video is watched (most important)
```

### 1.3 Three-Step Viral Process

#### Step 1: Initial Test (300 Users)
- **Primary Metric:** Watch time and completion rate
- **Critical Window:** First 3 seconds (hook effectiveness)
- **Threshold:** Must achieve 50+ engagement points
- **Failure Point:** Quick drop-off or slow start = video fails

#### Step 2: Ranking (Wider Audience)
- **Primary Signals:** Shares > Saves > Comments > Likes
- **Algorithm Action:** Show to larger interest groups
- **Testing:** Continuous A/B testing on expanding audiences

#### Step 3: Spreading (Viral)
- **Trigger:** Maintains high metrics in Step 2
- **Scale:** Global audience, different countries/languages
- **Measurement:** Cross-cultural engagement rates

### 1.4 Watch Time Quality Metrics

#### A. Rewatching (5 points)
- **Definition:** Video looped/replayed
- **Implementation:** Track video restart within 10 seconds of end
- **Optimization:** Videos should be <30s and loopable

#### B. Completion Rate (4 points)
```
Completion Rate = (Users who watched to end / Total viewers) × 100%
Target: >70% for viral potential
```

#### C. Dwell Time/Linger Time
- **Definition:** Duration before scrolling away
- **Measurement:** Time spent on video card before swipe
- **Target:** Maximize even small gains (seconds matter at scale)

#### D. Total Watch Time
```
Total Watch Time = Σ(Individual viewer watch duration)
Quality = High avg watch time + High total views
```

### 1.5 Cold Start Strategy

#### Phase 1: Initial Inputs (First Load)
- **Explicit Preferences:** Optional category selection (pets, travel, etc.)
- **Default Content:** Popular recent posts for broad audience
- **Contextual Info:** Language, location, device type

#### Phase 2: Rapid Learning Curve

| Metric | Threshold | Source |
|--------|-----------|--------|
| **First Signal** | 15th video (~3 min) | Bot study showing first algorithmic interest |
| **Initial Profile** | 224 videos (~36 min) | Algorithm understands specific interest |
| **Robust Personalization** | <2 hours (some <40 min) | Full interest mapping complete |
| **Stable Algorithm** | After 100+ recommendations | Personalization becomes stable |

**Key Insight:** TikTok needs only **36-120 minutes** of watch data to fully personalize.

### 1.6 Exploration vs. Exploitation Balance

#### Distribution Model
```
Exploit (Personalized): 30-50% of videos
Explore (Discovery): 50-70% of videos
Noise (Random): ~20% baseline
```

#### Key Drivers of Personalization
1. **Following Creators** (HIGH IMPACT)
   - Top quartile: 30% from followed creators
   - Bottom quartile: 2% from followed creators
   
2. **Liking Videos** (HIGH IMPACT)
   - Top quartile: 14% of videos liked
   - Bottom quartile: 3% of videos liked

3. **Watch Percentage** (MEDIUM IMPACT)

4. **Early Skip Rate** (LOW IMPACT)

#### Multi-Armed Bandit Implementation
```python
# Pseudocode
def select_next_video(user_history, available_videos):
    exploit_probability = 0.4  # 40% personalized
    explore_probability = 0.6  # 60% discovery
    
    if random() < exploit_probability:
        return recommend_from_interest_graph(user_history)
    else:
        return recommend_novel_content(available_videos)
```

### 1.7 Video "Heating" Triggers

#### Critical Time Windows
- **First 30-60 minutes:** Key signal window after posting
- **Post when audience is active:** Boosts initial engagement

#### Content Optimization Factors

| Factor | Optimal Value | Impact |
|--------|---------------|--------|
| **Hashtags** | 1-5 hashtags | 1.16% reach rate (highest) |
| **Background Music** | Always use | +98.31% views |
| **Video Length** | 7-30 seconds | Highest performance |
| **Format** | 9:16 vertical | Native format requirement |
| **Content Type** | Original, TikTok-first | Algorithm favors authentic content |

#### Anti-Preference Phenomenon
- **Issue:** Algorithm can't discern comment sentiment
- **Result:** Hostile comments may trigger MORE exposure
- **Reason:** Comments = engagement = success signal

---

## PART 2: DUOLINGO ADAPTIVE LEARNING (HALF-LIFE REGRESSION)

### 2.1 Core Formula: Half-Life Regression (HLR)

#### Forgetting Curve Prediction
```
p = 2^(-Δ/h)

Where:
p = Probability of correct recall
Δ = Days since last practice
h = Half-life (days until 50% recall probability)

Examples:
- Δ = 0 (just practiced) → p = 1.0 (100% recall)
- Δ = h (lag equals half-life) → p = 0.5 (50% recall)
- Δ >> h (too long) → p ≈ 0 (forgotten)
```

#### Half-Life Estimation
```
ĥ_Θ = 2^(Θ · x)

Where:
ĥ_Θ = Estimated half-life
Θ = Model weights (learned from data)
x = Feature vector (user's practice history)

Full prediction:
p̂_Θ = 2^(-Δ / 2^(Θ·x))
```

#### Optimal Practice Timing
**Schedule review when p ≈ 0.9 (90% recall probability)**
- Too early (p > 0.95): Wasted time
- Too late (p < 0.85): Already forgotten
- Sweet spot (p = 0.9): On verge of forgetting = maximum memory strengthening

### 2.2 Training the Model

#### Loss Function
```
ℓ(⟨p,Δ,x⟩; Θ) = (p - p̂_Θ)² + α(-Δ/log₂(p) - ĥ_Θ)² + λ|Θ|²₂

Components:
1. (p - p̂_Θ)²: Error in predicted recall rate
2. α(...): Error in predicted half-life
3. λ|Θ|²₂: L2 regularization (prevent overfitting)
```

#### Feature Vector (x)
**Interaction Features:**
- Total exposures: x_n
- Correct recalls: x_⊕ (use √x_⊕ for better results)
- Incorrect recalls: x_⊖ (use √x_⊖ for better results)

**Lexeme Features:**
- Root word difficulty
- Part of speech
- Morphological complexity
- Language-specific conjugations

#### Correctness Adjustment
- **Correct answer:** Increases h → Schedule later
- **Incorrect answer:** Decreases h → Schedule sooner
- **Pattern of errors:** Identifies weak lexemes for targeted practice

### 2.3 Measuring User Level

#### Skill Tree Organization
- Lessons grouped by theme/grammar (e.g., "Gerund", "Nature")
- **Mastery Learning:** Must complete prerequisites to unlock next row
- Progress = Broadening knowledge base

#### Strength Meter Visualization
```
[████████] = 4 bars = "Golden" = Fresh in memory (p ≈ 0.95+)
[████░░░░] = 2 bars = Decaying (p ≈ 0.7)
[██░░░░░░] = 1 bar = Needs practice (p ≈ 0.5)
[░░░░░░░░] = 0 bars = Forgotten (p < 0.3)
```

### 2.4 Real-Time Difficulty Adjustment

#### Signals User is Ready for Harder Content
1. **Skill Completion:** Four bars (golden) on strength meter
2. **Increasing Half-Life:** Consistent correct recalls → h increases
3. **Positive Feature Weights:** Success on complex words/grammar
4. **Error Pattern Clearance:** No recurring mistakes in targeted areas

#### Signals User is Struggling
- **Error Patterns:** Recurring mistakes on specific concepts
- **Low Completion Rate:** High dropout on challenging material
- **Decreasing Half-Life:** h dropping across multiple items
- **Action:** Intensify practice in weak areas

#### Signals User is Bored
- **Abandoning Studies:** Sharp fall-off in Day 30 retention
- **Low Motivation:** Logging in for XP, not learning
- **High Performance, Low Engagement:** Completing tasks but not staying
- **Action:** Introduce harder content, narrative hooks

### 2.5 Spaced Repetition Efficiency

#### SuperMemo SM-2 Algorithm (Legacy/Comparison)
```
For n > 2: I(n) = I(n-1) × EF

Where:
I(n) = Interval for repetition n (days)
EF = Easiness Factor (starts at 2.5)

EF adjustment:
- Quality < 3 (wrong): Reset n to 0, I to 1 day
- Quality = 3 (hard): EF -= 0.15
- Quality = 4 (good): EF unchanged
- Quality = 5 (easy): EF += 0.10 (capped at minimum 1.3)
```

#### HLR Improvement Over SM-2
- **45%+ reduction** in recall prediction error
- **12% increase** in daily student engagement
- **Personalization:** Learns individual forgetting curves

---

## PART 3: COMPREHENSIBLE INPUT (i+1 RULE)

### 3.1 Krashen's Input Hypothesis

```
i = Current competence level
i+1 = Next stage along natural order

Rule: Acquisition occurs through understanding input at i+1
```

#### Optimal Difficulty
- **Too easy (i+0):** No challenge, no growth
- **Just right (i+1):** Slight challenge, comprehensible with context
- **Too hard (i+2+):** Overwhelming, frustrating

### 3.2 Programmatic Implementation

#### Lexical Interpretation (Vocabulary Coverage)
```
Comprehension Threshold:
- 90% known words: Adequate comprehension
- 95-98% known words: Can infer unknown words from context
- 98-100% known words: Optimal for unassisted reading

Implementation:
unknown_words_percentage = 5-10%  # Sweet spot for i+1
known_words_percentage = 90-95%
```

#### Content Difficulty Distribution
**Research-backed ratio (inferred from sources):**
```
70% at user level (i)
20% easier (i-1, scaffolding)
10% harder (i+1, challenge)
```

**Alternative distribution for faster progression:**
```
50% at user level (i)
30% easier (i-1)
20% harder (i+1)
```

### 3.3 CEFR Word Frequency Bands

| Level | Frequency Band | Characteristics |
|-------|---------------|-----------------|
| **A1** | 1-500 most frequent | Basic, high-frequency words |
| **A2** | 500-1,500 | Common daily vocabulary |
| **B1** | 1,500-3,000 | Intermediate usage |
| **B2** | 3,000-5,000 | Advanced everyday |
| **C1** | 5,000-10,000 | Sophisticated vocabulary |
| **C2** | 10,000+ | Native-level mastery |

---

## PART 4: GAMIFICATION & ENGAGEMENT

### 4.1 Streak System Psychology

#### Loss Aversion Principle
```
Fear of Loss > Pleasure of Gain

Emotional Value = f(Streak Length)
- 7-day streak: Low attachment
- 30-day streak: Moderate commitment
- 100-day streak: High emotional investment
- 365+ day streak: Identity marker, status symbol
```

#### Streak Freeze/Recovery Timing
**Show when:**
- User missed daily goal BUT streak not yet reset
- Streak length > 7 days (emotional investment exists)
- User has shown consistent engagement (not first-time user)

**Impact:**
- 21% churn reduction for at-risk users
- Converts potential quit into maintenance event
- Balances pressure with flexibility

### 4.2 XP (Experience Points) Hierarchy

Based on algorithmic value weights:

| Action | XP Value | Rationale |
|--------|----------|-----------|
| **Mastering Weak Word** | 50-100 XP | Highest - optimal retrieval practice |
| **Completing Quiz** | 30-50 XP | High - demonstrates retention |
| **Sharing Content** | 25-40 XP | High - utility signal (3 points in TikTok) |
| **Watching to Completion** | 20-30 XP | High - quality engagement (4 points) |
| **Saving/Favoriting** | 15-25 XP | Medium-High - utility signal |
| **Commenting** | 10-15 XP | Medium - engagement (2 points) |
| **Following Creator** | 8-12 XP | Medium - commitment signal |
| **Liking** | 5-8 XP | Low - basic approval (1 point) |
| **Daily Login** | 5 XP | Baseline - habit reinforcement |

### 4.3 Variable Reward System

#### B.F. Skinner's Variable Ratio Schedule
```
Fixed Reward: User expects reward → Dopamine stable → Habit extinction when removed
Variable Reward: User never knows when → Dopamine spikes → Persistent behavior
```

#### Implementation Strategy
```python
# Variable XP Bonus System
def calculate_xp_bonus(action, user_session):
    base_xp = BASE_XP[action]
    
    # Variable ratio schedule
    bonus_probability = 0.3  # 30% chance of bonus
    
    if random() < bonus_probability:
        # Variable bonus amount (50% to 200% of base)
        multiplier = random_range(1.5, 3.0)
        bonus_xp = base_xp * multiplier
        
        # Visual celebration (dopamine spike)
        show_celebration_animation()
        return base_xp + bonus_xp
    else:
        return base_xp
```

#### Double XP Events
- **Limited-Time Boosts:** "Double XP Weekend"
- **Impact:** 50% surge in activity
- **Psychology:** Scarcity + Variable reward = Compulsion

### 4.4 Notification Strategy

#### Timing (Optimal Open Rates)
```
Frequency: 
- New users: Daily (first 7 days)
- Active users: 3-5x per week
- At-risk users: Escalating reminders (exponential backoff if no response)

Best Times:
- Afternoon/Evening: Highest engagement
- User's historical active time: AI-personalized

Critical Window:
- First 30-60 min after user's usual session time
```

#### Copy Psychology
**High-Performing Patterns:**
1. **Loss Aversion:** "Your 47-day streak is at risk!"
2. **Guilt Induction:** "We'll stop sending reminders since they don't seem to be working"
3. **Variable Rewards:** "You've earned a surprise bonus! 🎁"
4. **Social Proof:** "Maria is ahead of you on the leaderboard!"
5. **Curiosity Gap:** "You won't believe what happens next in your story..."

**Personalization Impact:**
- Generic notifications: ~3% open rate
- Personalized notifications: ~15% open rate (5x increase)
- AI-optimized timing: +40% response rate

#### Fatigue Management
```
Modality:
- Passive Notifications (Snackbars): Low fatigue, minimal cognitive cost
- Active Notifications (Modals): High engagement but causes strain

Frequency Limits:
- Maximum 1-2 active notifications per day
- Batch non-urgent alerts
- Exponential backoff for non-responsive users:
  Day 1 → Day 3 → Day 7 → Day 14 → Day 30 → Stop

User Control:
- Easy opt-out
- Granular notification settings
- "Snooze" options (1 hour, 3 hours, tomorrow)
```

---

## PART 5: MONETIZATION & CONVERSION

### 5.1 Freemium Model Structure

#### Free Tier (Acquisition & Retention)
- Core learning content
- Basic lessons and vocabulary
- Adaptive difficulty (limited)
- Gamification (XP, streaks, leaderboards)
- **With friction:** Ads, limited hearts/lives, no offline mode

#### Premium Tier (Conversion & Revenue)
- Ad-free experience
- Unlimited hearts/lives
- Offline mode
- Advanced AI features (conversation, grammar explanations)
- Progress tracking and analytics
- Exclusive content and challenges

### 5.2 Paywall Triggers

**Optimal Placement Points:**
1. **Running out of hearts** (after 5 mistakes)
2. **Streak about to break** (loss aversion peak)
3. **After completing first 5 lessons** (value demonstrated)
4. **Attempting offline access** (feature gate)
5. **After ad at natural stopping point** (friction moment)

**Conversion Funnel:**
```
Free User
   ↓ (Value Recognition)
Trial Offer (7-14 days)
   ↓ (Habit Formation)
Premium Subscriber
   ↓ (Long-term Retention)
Annual/Lifetime Subscriber
```

### 5.3 Pricing Psychology

#### Tiered Structure
```
Monthly: $9.99/month
   - Charm pricing ($.99 ending)
   - Low commitment, trial-like
   - Anchors higher tiers

Annual: $69.99/year (~ $5.83/month)
   - "Best Value" badge
   - 42% discount vs monthly
   - Positioned as smart choice
   - Target: Highest conversion rate

Lifetime: $199.99 one-time
   - Premium anchor (makes annual look cheap)
   - Quick cash flow
   - Creates loyal super-users
   - Should be 2.5-3x annual price
```

#### Trial Optimization
**Research-backed findings:**
- **Adding a trial:** +64% LTV in US, +58% in Europe
- **30-day retention:** 23% → 42% (nearly 2x with trial)
- **User satisfaction:** 4.5 vs 3.9 (trial vs direct-pay)
- **Churn rate:** 9% vs 22% (trial vs direct-pay)

**Trial Types:**
- **Opt-out (credit card upfront):** 30-50% conversion
- **Opt-in (no credit card):** <25% conversion

**Recommended:** 14-day opt-out trial

### 5.4 Churn Reduction Tactics

| Tactic | Implementation | Impact |
|--------|---------------|--------|
| **Content Refresh** | New content weekly | +39% engagement |
| **Downgrade Options** | Offer cheaper tier vs cancel | -20% churn |
| **Win-back Campaigns** | Email sequence for lapsed users | +15% reactivation |
| **Gamification** | Streaks, badges, leaderboards | +30% retention |
| **Social Features** | Community, leaderboards | +40% retention time |
| **Personalization** | AI-driven content | +20% retention |
| **In-app Feedback** | Surveys, user voice | +25% retention |

---

## PART 6: UX MICRO-PATTERNS

### 6.1 Scroll Snap Physics

#### Velocity Threshold
```javascript
// Track last N motion events
const N = 4;
let motionEvents = [];

onPointerMove(event) {
    motionEvents.push({ time: event.timestamp, y: event.clientY });
    if (motionEvents.length > N) motionEvents.shift();
}

onPointerUp() {
    // Calculate velocity
    const velocity = calculateVelocity(motionEvents);
    const diffPx = motionEvents[0].y - motionEvents[N-1].y;
    
    // Threshold: Only trigger momentum if diffPx > 5px
    if (Math.abs(diffPx) > 5) {
        startMomentumScroll(velocity);
    } else {
        snapToNearest();
    }
}
```

#### Momentum & Friction
```javascript
function startMomentumScroll(initialVelocity) {
    const FRICTION = 0.95;  // Decay factor
    const MIN_VELOCITY = 0.25;  // Floor limit
    
    let velocity = initialVelocity;
    
    function animate() {
        velocity *= FRICTION;
        
        if (Math.abs(velocity) < MIN_VELOCITY) {
            snapToNearest();
            return;
        }
        
        scroll += velocity;
        requestAnimationFrame(animate);
    }
    
    animate();
}
```

#### Snap Alignment
```css
.feed-container {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
}

.video-card {
    scroll-snap-align: start;
    scroll-snap-stop: always;
}
```

### 6.2 Video Autoplay & Sound

**Default Settings:**
```javascript
// For immersive, audio-centric apps (TikTok-style)
const DEFAULT_AUTOPLAY = true;
const DEFAULT_SOUND = true;  // Sound ON

// HOWEVER: Always include captions because:
// - 30% of TikTokers watch on mute
// - 85% of Facebook videos watched without sound
// - 80%+ social media videos watched on mute
```

### 6.3 Loading Strategy

**Optimal: Preload Next Content**
```javascript
// Preload next 2-3 videos in feed
function preloadContent(currentIndex) {
    const videosToPreload = [currentIndex + 1, currentIndex + 2];
    
    videosToPreload.forEach(index => {
        if (videoFeed[index]) {
            // Preload video
            const video = document.createElement('video');
            video.src = videoFeed[index].url;
            video.load();
            
            // Preload subtitles
            fetch(videoFeed[index].subtitlesUrl);
        }
    });
}
```

**Deliberate Delay (Variable Reward):**
```javascript
// Small artificial delay creates anticipation
function loadNextBatch() {
    showLoadingAnimation();  // "Cogs spinning"
    
    // 200-500ms delay = anticipation = dopamine spike
    setTimeout(() => {
        renderContent();
        hideLoadingAnimation();
    }, 300 + Math.random() * 200);
}
```

### 6.4 Animation Timing

**Snappy vs Laggy Thresholds:**
```javascript
// Video Pacing
const CUT_INTERVAL = 0.8 - 1.4 seconds;  // Cut every 0.8-1.4s for momentum
const PATTERN_INTERRUPT = 2 - 3 seconds;  // Scene change every 2-3s

// First Frame Critical
const HOOK_WINDOW = 3 seconds;  // Must hook within 3s
const REEL_AD_HOOK = 0.5 seconds;  // Reel ads: hook in 0.5s

// UI Transitions (inferred from best practices)
const MICRO_INTERACTION = 100ms;  // Button feedback, ripples
const CARD_TRANSITION = 200ms;  // Card appear/disappear
const MODAL_TRANSITION = 300ms;  // Modal fade in/out
const HEAVY_ANIMATION = 500ms;  // Page transitions, complex animations
```

### 6.5 Progress Indicators

**Learning Apps Should Show:**
1. **Mastery Visualization (%):**
   ```
   Skill: Spanish Verbs
   [████████░░] 80% Mastered
   Next Review: In 2 days
   ```

2. **Upcoming Content (Narrative Hook):**
   ```
   🔒 Next: Unlock "Advanced Grammar" at 85%
   📚 Coming Up: Story Mode Chapter 3
   ```

3. **Visual Progress Bars:**
   - Increase video retention
   - Clear goals reduce abandonment
   - Progress-based unlocks (not time-locks)

---

## PART 7: IMPLEMENTATION ROADMAP

### Phase 1: Core Algorithm (Week 1-2)
- [ ] Implement 5-point engagement scoring
- [ ] Build HLR spaced repetition engine
- [ ] Create user profiling system
- [ ] Implement watch time tracking

### Phase 2: Feed Intelligence (Week 3-4)
- [ ] Cold start strategy (300-user test)
- [ ] Exploration/exploitation balance (40/60 split)
- [ ] Video "heating" system
- [ ] Content recommendation engine

### Phase 3: Adaptive Learning (Week 5-6)
- [ ] i+1 content selection
- [ ] 70/20/10 difficulty distribution
- [ ] Real-time difficulty adjustment
- [ ] Weak word targeting

### Phase 4: Gamification (Week 7-8)
- [ ] Streak system with loss aversion
- [ ] Variable XP rewards
- [ ] Notification optimization
- [ ] Progress visualization

### Phase 5: Monetization (Week 9-10)
- [ ] Freemium paywall triggers
- [ ] 14-day trial flow
- [ ] Tiered pricing ($9.99/$69.99/$199.99)
- [ ] Churn reduction tactics

### Phase 6: UX Polish (Week 11-12)
- [ ] Scroll snap physics
- [ ] Video preloading
- [ ] Animation timing optimization
- [ ] Performance benchmarking

---

## SUCCESS METRICS

### Engagement KPIs
```
Daily Active Users (DAU): Target +30% month-over-month
Avg Session Length: Target >15 minutes
Videos per Session: Target >20 videos
Completion Rate: Target >70%
Rewatch Rate: Target >15%
```

### Learning KPIs
```
Day 7 Retention: Target >60%
Day 30 Retention: Target >30%
Words Learned per Week: Target >50
Quiz Completion Rate: Target >80%
Streak Maintenance: Target >50% users with 7+ day streaks
```

### Monetization KPIs
```
Free-to-Trial Conversion: Target >15%
Trial-to-Paid Conversion: Target >40%
Annual Plan Adoption: Target >60% of paid users
Monthly Churn Rate: Target <5%
LTV/CAC Ratio: Target >3.0
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-12  
**Status:** IMPLEMENTATION READY ✅
