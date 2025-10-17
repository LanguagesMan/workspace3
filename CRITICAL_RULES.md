# 🚨 WORKSPACE3 CRITICAL RULES - READ THIS FIRST EVERY TIME

## WHAT WORKSPACE3 IS:
**ENTERTAINMENT FEED** - Like TikTok For You page but for Spanish learning
- Simple endless scroll feed
- Videos, articles, music, stories
- PORT 3002 (NOT 3001!)
- NO research bubbles
- NO complex features
- Just scroll and learn

## WHAT IT'S NOT:
- ❌ NOT a research tool
- ❌ NOT bubble interface
- ❌ NOT complex navigation
- ❌ NOT educational-looking

## ALWAYS HEADLESS TESTING:
```bash
npx playwright test --headless --reporter=list
```
NEVER open browser windows during testing - user gets FURIOUS!

## RESPONSIVE DESIGN:
- Mobile-first (narrow screens)
- Desktop adapted (wide screens)
- Looks good on both

## THE FEED:
- TikTok-style infinite scroll
- Full-screen content cards
- Swipe/scroll to next
- Click words for translations
- Simple and addictive
