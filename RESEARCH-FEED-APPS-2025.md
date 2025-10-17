# Feed Apps Research 2025 - Design Patterns

**Research Date**: 2025-10-06
**Purpose**: Improve articles feed design per user command (human_feedback.md:47)
**Method**: WebSearch for Flipboard + Apple News 2025 patterns

## Flipboard 2025 Patterns

### Card-Based Layout
- **Primary Pattern**: Scrolling tabs that users can slide
- **Secondary Pattern**: Card flipping for content interaction
- **Card Design**: Rectangular shape, simple clickable elements
- **Information Architecture**: Each card = digestible piece of related information

### Smart Magazines
- Personalized reading spaces for topics (news, travel, climate, music)
- User selects story types → Flipboard curates content automatically
- Pattern: AI-driven content curation matching user interests

### Technology Stack (2025)
- **78% of magazine apps**: React Native or Flutter
- **Flutter advantage**: Superior rendering for image-heavy apps
- **Our choice**: Vanilla JS (already built, matches TikTok performance)

### UX Benefits of Cards
1. **Familiarity**: Users understand rectangular clickable cards
2. **Scanability**: Small snippets let users quickly skim
3. **Adaptability**: Cards scale/rearrange across screen sizes
4. **Consistent UX**: Works on mobile, tablet, desktop

## Apple News 2025 Patterns

### "Liquid Glass" Design
- **New design language** (June 2025): Expressive, delightful apps
- **Visual**: Elegant layouts with beautiful typography
- **Rich media**: Photo galleries, videos, animations
- **Optimized for**: iPhone, iPad, Mac

### Typography Hierarchy
- **Legible text**: Clear font sizes and weights
- **Information hierarchy**: Headlines > subheads > body
- **Spacing**: Generous whitespace for readability
- **Adaptive**: Column-based layouts that reflow

### Layout Principles
- **Planning**: Design article structure before content
- **Positioning**: Align content with column grid
- **Adaptive**: Content adapts to different screen contexts
- **Consistency**: Maintain brand identity across platforms

## Implementation Recommendations

### For Articles Feed (workspace3)

**Priority 1: Card Design** (Flipboard pattern)
```css
.article-card {
    /* Flipboard: Rectangular, simple clickable */
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.article-card:hover {
    /* Flipboard: Clear interactive feedback */
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.15);
}
```

**Priority 2: Typography** (Apple News pattern)
```css
.article-title {
    /* Apple News: Legible hierarchy */
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 8px;
}

.article-summary {
    /* Apple News: Readable body text */
    font-size: 16px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
}
```

**Priority 3: Smart Curation** (Flipboard pattern)
- Use existing `/api/news/spanish` endpoints
- Filter by user level (A1-C2)
- Personalize based on engagement tracking
- Mix content types (news, music, stories)

**Priority 4: Rich Media** (Apple News pattern)
- Featured images with gradient overlays
- Video thumbnails with play indicators
- Smooth loading animations
- Lazy loading for performance

## Next Steps

1. ✅ Research completed (Flipboard + Apple News)
2. ⏳ Apply card design patterns to unified-infinite-feed.html
3. ⏳ Improve typography hierarchy
4. ⏳ Verify real APIs working (NewsAPI, Guardian, WorldNews)
5. ⏳ Test visual comparison with Flipboard/Apple News

## Evidence Sources

- **Flipboard Research**: https://www.researchgate.net/figure/Design-patterns-of-Flipboard-15-tab-menu-16-cards-17-assisted-navigation_fig3_333588206
- **Flipboard Medium**: https://medium.com/flipboard-design/designing-the-new-flipboard-9e4eca6705d0
- **Apple News Format**: https://developer.apple.com/documentation/apple_news/apple_news_format/planning_the_layout_for_your_article
- **Apple Typography**: https://developer.apple.com/design/human-interface-guidelines/typography
- **Apple 2025 Design**: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/

---

**Pattern**: Copying proven billion-dollar app designs (CLAUDE.md principle)
**Next Session**: Apply these patterns to improve articles feed design
