/**
 * 🔥 VIRAL CONTENT ENHANCER - TikTok/Instagram 2025 Patterns
 *
 * Vision Requirement: "NEVER Dead Language Learning Content"
 * - Viral-first approach: Content must be interesting even WITHOUT learning
 * - Live world events, trending topics, popular content
 * - Multimedia rich, instant visual appeal
 * - 3-second hook requirement
 *
 * Based on 2025 Research:
 * - TikTok: First 3 seconds = 75%+ completion rate
 * - Instagram: Shares > Likes for viral distribution
 * - Watch time is #1 signal, not follower count
 * - Positive/funny/happy content performs best
 */

class ViralContentEnhancer {
    constructor() {
        // Viral patterns from research
        this.viralPatterns = {
            hooks: [
                '🚨 BREAKING:',
                '❌ You won't believe',
                '🔥 This just happened',
                '⚡ TRENDING NOW:',
                '💥 VIRAL:',
                '🎯 Everyone's talking about',
                '😱 OMG:',
                '🌟 MASSIVE:'
            ],
            emotions: ['positive', 'funny', 'surprising', 'shocking', 'inspiring'],
            visualTriggers: ['🔥', '⚡', '💥', '🚨', '😱', '🎯', '❌', '✅']
        };

        // Trending topics (mock - would come from NewsAPI in production)
        this.trendingTopics = [
            'AI breakthrough', 'space discovery', 'celebrity news',
            'tech innovation', 'sports highlight', 'meme culture',
            'travel destination', 'food trend', 'music release'
        ];

        console.log('🔥 Viral Content Enhancer initialized - TikTok/Instagram 2025 pattern');
    }

    /**
     * Check if content meets viral standards
     * Vision: "NEVER Dead Language Learning Content"
     */
    isViralWorthy(content) {
        const checks = {
            hasHook: this.hasStrongHook(content.title || ''),
            hasVisual: !!(content.image || content.videoPath),
            isTimely: this.isTimely(content),
            isEmotional: this.hasEmotionalTrigger(content.title || ''),
            notBoring: !this.isBoringLanguageLearning(content.title || '')
        };

        const score = Object.values(checks).filter(Boolean).length;
        return { score, checks, isViral: score >= 3 };
    }

    /**
     * 3-Second Hook Test (TikTok 2025 Pattern)
     */
    hasStrongHook(title) {
        const lowerTitle = title.toLowerCase();

        // Check for viral hook patterns
        const hasViralWord = this.viralPatterns.hooks.some(hook =>
            title.includes(hook) || lowerTitle.includes(hook.toLowerCase())
        );

        // Check for emotional trigger
        const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(title);

        // Check for numbers (data-driven hooks)
        const hasNumbers = /\d+/.test(title);

        return hasViralWord || (hasEmoji && hasNumbers);
    }

    /**
     * Check if content feels timely/trending
     */
    isTimely(content) {
        const title = (content.title || '').toLowerCase();
        const text = (content.text || '').toLowerCase();
        const combined = title + ' ' + text;

        // Check for trending indicators
        const timelyWords = ['today', 'now', 'breaking', 'just', 'new', '2025', 'trending', 'viral'];
        return timelyWords.some(word => combined.includes(word));
    }

    /**
     * Emotional trigger detection (TikTok: positive/funny/happy wins)
     */
    hasEmotionalTrigger(title) {
        const emotionalWords = [
            'amazing', 'incredible', 'shocking', 'hilarious', 'beautiful',
            'stunning', 'unbelievable', 'wow', 'omg', 'insane', 'crazy'
        ];

        const lowerTitle = title.toLowerCase();
        return emotionalWords.some(word => lowerTitle.includes(word));
    }

    /**
     * Anti-pattern: Boring language learning content
     * Vision: "No boring articles about food 'for the sake of language learning'"
     */
    isBoringLanguageLearning(title) {
        const boringPatterns = [
            'learn spanish',
            'spanish lesson',
            'grammar exercise',
            'vocabulary practice',
            'conjugation',
            'language learning tip'
        ];

        const lowerTitle = title.toLowerCase();
        return boringPatterns.some(pattern => lowerTitle.includes(pattern));
    }

    /**
     * Enhance content to make it viral
     * Vision: "Viral-first approach"
     */
    enhanceContent(content) {
        const viralCheck = this.isViralWorthy(content);

        if (viralCheck.isViral) {
            // Already viral - just add engagement metadata
            return {
                ...content,
                viralScore: viralCheck.score,
                viralChecks: viralCheck.checks,
                enhanced: false
            };
        }

        // Needs enhancement
        const enhanced = { ...content };

        // Add viral hook if missing
        if (!viralCheck.checks.hasHook) {
            const randomHook = this.viralPatterns.hooks[
                Math.floor(Math.random() * this.viralPatterns.hooks.length)
            ];
            enhanced.title = `${randomHook} ${content.title}`;
        }

        // Add visual trigger emoji if missing
        if (!viralCheck.checks.hasEmoji) {
            const randomEmoji = this.viralPatterns.visualTriggers[
                Math.floor(Math.random() * this.viralPatterns.visualTriggers.length)
            ];
            enhanced.title = `${randomEmoji} ${enhanced.title}`;
        }

        // Mark as enhanced
        enhanced.viralScore = viralCheck.score + 2; // Improvement points
        enhanced.viralChecks = viralCheck.checks;
        enhanced.enhanced = true;

        console.log(`🔥 Enhanced content: "${content.title}" → "${enhanced.title}"`);

        return enhanced;
    }

    /**
     * Generate viral Spanish learning content
     * Based on trending topics (not boring drills)
     */
    generateViralContent(count = 5) {
        const viralContent = [];

        for (let i = 0; i < count; i++) {
            const topic = this.trendingTopics[Math.floor(Math.random() * this.trendingTopics.length)];
            const hook = this.viralPatterns.hooks[Math.floor(Math.random() * this.viralPatterns.hooks.length)];
            const emoji = this.viralPatterns.visualTriggers[Math.floor(Math.random() * this.viralPatterns.visualTriggers.length)];

            viralContent.push({
                id: `viral-${Date.now()}-${i}`,
                type: 'article',
                title: `${hook} ${emoji} ${topic}`,
                text: `Discover the latest about ${topic} while learning Spanish naturally. This trending story has captured millions of views because it's genuinely interesting - not just another language drill.`,
                image: `https://picsum.photos/600/400?random=${i}`, // Placeholder
                timestamp: new Date().toISOString(),
                viralScore: 5,
                viralChecks: {
                    hasHook: true,
                    hasVisual: true,
                    isTimely: true,
                    isEmotional: true,
                    notBoring: true
                },
                enhanced: false,
                source: 'viral-generator'
            });
        }

        return viralContent;
    }

    /**
     * Filter out boring content
     * Vision: "NEVER Dead Language Learning Content"
     */
    filterBoringContent(contentArray) {
        return contentArray.filter(content => {
            const title = content.title || '';
            const isBoring = this.isBoringLanguageLearning(title);

            if (isBoring) {
                console.log(`🚫 Filtered boring content: "${title}"`);
            }

            return !isBoring;
        });
    }

    /**
     * Score content for feed ranking (Instagram/TikTok algorithm pattern)
     */
    scoreForAlgorithm(content, userEngagement = {}) {
        let score = 0;

        // Viral content check (base score)
        const viralCheck = this.isViralWorthy(content);
        score += viralCheck.score * 20; // 0-100 points

        // Engagement signals (Instagram 2025: shares > likes)
        score += (userEngagement.shares || 0) * 10;
        score += (userEngagement.saves || 0) * 8;
        score += (userEngagement.likes || 0) * 5;
        score += (userEngagement.comments || 0) * 7;

        // Watch time (TikTok #1 signal)
        if (userEngagement.watchTime) {
            const completionRate = userEngagement.watchTime / (content.duration || 60);
            score += completionRate * 30; // Up to 30 points
        }

        // Recency boost (trending = viral)
        const hoursOld = (Date.now() - new Date(content.timestamp || Date.now())) / (1000 * 60 * 60);
        if (hoursOld < 24) {
            score += 20; // Fresh content boost
        }

        return Math.min(score, 100); // Cap at 100
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViralContentEnhancer;
} else {
    window.ViralContentEnhancer = ViralContentEnhancer;
}
