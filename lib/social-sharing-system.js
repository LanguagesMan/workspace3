/**
 * 📱 ENHANCED SOCIAL SHARING SYSTEM
 * 
 * Share achievements, streaks, learned words, and progress
 * Generate beautiful share cards for social media
 * 
 * Inspired by: Duolingo streak sharing, Strava activity cards, Instagram stories
 * 
 * Key Features:
 * - Share achievements with custom cards
 * - Streak celebrations
 * - Word collection showcases
 * - Level-up announcements
 * - Referral system
 */

class SocialSharingSystem {
    constructor() {
        this.shareTemplates = this.initializeTemplates();
        this.sharedContent = new Map(); // contentId -> share stats
        this.userShares = new Map(); // userId -> shares array
    }

    /**
     * Initialize share card templates
     */
    initializeTemplates() {
        return {
            streak: {
                id: 'streak_share',
                name: 'Streak Achievement',
                gradient: ['#FF6B6B', '#FFE66D'],
                icon: '🔥',
                template: (data) => ({
                    title: `${data.days} Day Streak! 🔥`,
                    subtitle: `Learning Spanish every day on Langflix`,
                    stats: [
                        { label: 'Current Streak', value: `${data.days} days` },
                        { label: 'XP Earned', value: data.xp },
                        { label: 'Words Learned', value: data.wordsLearned }
                    ],
                    message: `I've been learning Spanish for ${data.days} days straight! Join me on Langflix! 🚀`,
                    hashtags: ['#SpanishLearning', '#Langflix', '#LanguageLearning', '#Streak']
                })
            },
            
            achievement: {
                id: 'achievement_share',
                name: 'Achievement Unlocked',
                gradient: ['#667eea', '#764ba2'],
                icon: '🏆',
                template: (data) => ({
                    title: `Achievement Unlocked! ${data.icon}`,
                    subtitle: data.achievementName,
                    description: data.achievementDescription,
                    stats: [
                        { label: 'XP Earned', value: data.xpEarned },
                        { label: 'Total Achievements', value: data.totalAchievements }
                    ],
                    message: `Just unlocked "${data.achievementName}" on Langflix! ${data.icon}`,
                    hashtags: ['#Achievement', '#Langflix', '#SpanishLearning']
                })
            },

            level_up: {
                id: 'level_up_share',
                name: 'Level Up',
                gradient: ['#56CCF2', '#2F80ED'],
                icon: '⬆️',
                template: (data) => ({
                    title: `Level ${data.newLevel} Achieved! ⬆️`,
                    subtitle: `From ${data.oldLevel} to ${data.newLevel}`,
                    stats: [
                        { label: 'Total XP', value: data.totalXP },
                        { label: 'Words Learned', value: data.wordsLearned },
                        { label: 'Videos Watched', value: data.videosWatched }
                    ],
                    message: `Just reached Level ${data.newLevel} in Spanish! 🎉 Learning with Langflix!`,
                    hashtags: ['#LevelUp', '#Langflix', '#SpanishLearning', '#Progress']
                })
            },

            word_milestone: {
                id: 'word_milestone_share',
                name: 'Word Milestone',
                gradient: ['#F093FB', '#F5576C'],
                icon: '📚',
                template: (data) => ({
                    title: `${data.wordCount} Words Learned! 📚`,
                    subtitle: `Building my Spanish vocabulary`,
                    recentWords: data.recentWords || [],
                    stats: [
                        { label: 'Total Words', value: data.wordCount },
                        { label: 'Current Level', value: data.level },
                        { label: 'Days Learning', value: data.daysLearning }
                    ],
                    message: `I've learned ${data.wordCount} Spanish words on Langflix! 📚🚀`,
                    hashtags: ['#Vocabulary', '#Langflix', '#Spanish', '#LanguageLearning']
                })
            },

            quiz_perfect: {
                id: 'quiz_perfect_share',
                name: 'Perfect Quiz',
                gradient: ['#FFD89B', '#19547B'],
                icon: '⭐',
                template: (data) => ({
                    title: `100% Perfect Score! ⭐`,
                    subtitle: data.quizName || 'Spanish Quiz',
                    stats: [
                        { label: 'Questions', value: `${data.correctAnswers}/${data.totalQuestions}` },
                        { label: 'XP Earned', value: data.xpEarned },
                        { label: 'Time Taken', value: data.timeTaken }
                    ],
                    message: `Just aced a Spanish quiz with 100%! 💯 Learning is fun on Langflix!`,
                    hashtags: ['#PerfectScore', '#Langflix', '#SpanishQuiz', '#Learning']
                })
            },

            challenge_won: {
                id: 'challenge_won_share',
                name: 'Challenge Victory',
                gradient: ['#FA8BFF', '#2BD2FF'],
                icon: '👑',
                template: (data) => ({
                    title: `Challenge Won! 👑`,
                    subtitle: `${data.challengeName}`,
                    opponent: data.opponentName,
                    stats: [
                        { label: 'Your Score', value: data.yourScore },
                        { label: 'Opponent Score', value: data.opponentScore },
                        { label: 'XP Earned', value: data.xpEarned }
                    ],
                    message: `I just won the "${data.challengeName}" challenge on Langflix! Who wants to challenge me next? 💪`,
                    hashtags: ['#Challenge', '#Langflix', '#Competition', '#Winner']
                })
            },

            study_session: {
                id: 'study_session_share',
                name: 'Study Session Complete',
                gradient: ['#4158D0', '#C850C0'],
                icon: '📖',
                template: (data) => ({
                    title: `${data.duration} Study Session Complete! 📖`,
                    subtitle: `Focused learning time`,
                    stats: [
                        { label: 'Videos Watched', value: data.videosWatched },
                        { label: 'Words Reviewed', value: data.wordsReviewed },
                        { label: 'XP Earned', value: data.xpEarned }
                    ],
                    message: `Just completed a ${data.duration} study session on Langflix! Consistency is key! 💪`,
                    hashtags: ['#StudySession', '#Langflix', '#Consistent', '#Learning']
                })
            }
        };
    }

    /**
     * Generate shareable content
     */
    generateShareContent(userId, shareType, data) {
        const template = this.shareTemplates[shareType];
        
        if (!template) {
            throw new Error('Invalid share type');
        }

        const shareContent = template.template(data);
        const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create share card data
        const shareCard = {
            id: shareId,
            type: shareType,
            userId,
            template: template,
            content: shareContent,
            createdAt: new Date().toISOString(),
            shareUrl: this.generateShareUrl(shareId),
            referralCode: this.generateReferralCode(userId),
            platforms: ['twitter', 'facebook', 'instagram', 'whatsapp', 'copy'],
            stats: {
                views: 0,
                clicks: 0,
                conversions: 0
            }
        };

        // Store share
        this.sharedContent.set(shareId, shareCard);
        
        // Track user share
        if (!this.userShares.has(userId)) {
            this.userShares.set(userId, []);
        }
        this.userShares.get(userId).push({
            shareId,
            type: shareType,
            createdAt: shareCard.createdAt
        });

        return shareCard;
    }

    /**
     * Generate share URL
     */
    generateShareUrl(shareId) {
        return `https://langflix.app/share/${shareId}`;
    }

    /**
     * Generate referral code for user
     */
    generateReferralCode(userId) {
        // Simple referral code based on userId
        const code = `LANG${userId.substring(0, 8).toUpperCase()}`;
        return code;
    }

    /**
     * Get social media share links
     */
    getSocialShareLinks(shareCard, platform) {
        const url = encodeURIComponent(shareCard.shareUrl);
        const text = encodeURIComponent(shareCard.content.message);
        const hashtags = shareCard.content.hashtags?.join(',') || '';

        const links = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            instagram: `https://www.instagram.com/`, // Instagram requires mobile sharing
            whatsapp: `https://wa.me/?text=${text}%20${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            copy: shareCard.shareUrl
        };

        return platform ? links[platform] : links;
    }

    /**
     * Track share event
     */
    trackShare(shareId, platform) {
        const share = this.sharedContent.get(shareId);
        
        if (!share) {
            return { error: 'Share not found' };
        }

        // Track share event
        if (!share.shareEvents) {
            share.shareEvents = [];
        }

        share.shareEvents.push({
            platform,
            sharedAt: new Date().toISOString()
        });

        return {
            success: true,
            shareUrl: this.getSocialShareLinks(share, platform),
            message: 'Share tracked successfully'
        };
    }

    /**
     * Track share view
     */
    trackShareView(shareId, referrer = null) {
        const share = this.sharedContent.get(shareId);
        
        if (!share) {
            return { error: 'Share not found' };
        }

        share.stats.views++;
        
        // Track referrer
        if (!share.viewSources) {
            share.viewSources = new Map();
        }
        const source = referrer || 'direct';
        share.viewSources.set(source, (share.viewSources.get(source) || 0) + 1);

        return {
            success: true,
            content: share.content,
            stats: share.stats
        };
    }

    /**
     * Track share click (clicked "Join Langflix" button)
     */
    trackShareClick(shareId) {
        const share = this.sharedContent.get(shareId);
        
        if (!share) {
            return { error: 'Share not found' };
        }

        share.stats.clicks++;

        return {
            success: true,
            referralCode: share.referralCode,
            downloadUrl: 'https://langflix.app/download'
        };
    }

    /**
     * Track conversion (user signed up via referral)
     */
    trackConversion(shareId, newUserId) {
        const share = this.sharedContent.get(shareId);
        
        if (!share) {
            return { error: 'Share not found' };
        }

        share.stats.conversions++;

        // Reward the sharer
        const rewards = {
            xp: 500,
            badge: '🎁 Referral Master',
            message: 'Someone joined Langflix through your share! +500 XP'
        };

        return {
            success: true,
            sharerUserId: share.userId,
            newUserId,
            rewards
        };
    }

    /**
     * Get user's share history
     */
    getUserShares(userId, limit = 20) {
        const shares = this.userShares.get(userId) || [];
        
        return shares.slice(-limit).reverse().map(share => {
            const fullShare = this.sharedContent.get(share.shareId);
            return {
                ...share,
                stats: fullShare?.stats,
                url: fullShare?.shareUrl
            };
        });
    }

    /**
     * Get user's share stats
     */
    getUserShareStats(userId) {
        const shares = this.userShares.get(userId) || [];
        
        let totalViews = 0;
        let totalClicks = 0;
        let totalConversions = 0;

        for (const share of shares) {
            const fullShare = this.sharedContent.get(share.shareId);
            if (fullShare) {
                totalViews += fullShare.stats.views;
                totalClicks += fullShare.stats.clicks;
                totalConversions += fullShare.stats.conversions;
            }
        }

        return {
            totalShares: shares.length,
            totalViews,
            totalClicks,
            totalConversions,
            conversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 100) : 0,
            referralEarnings: {
                xp: totalConversions * 500,
                referrals: totalConversions
            }
        };
    }

    /**
     * Get trending shares
     */
    getTrendingShares(limit = 10) {
        const allShares = Array.from(this.sharedContent.values());
        
        // Sort by engagement score (views + clicks*5 + conversions*20)
        allShares.sort((a, b) => {
            const scoreA = a.stats.views + (a.stats.clicks * 5) + (a.stats.conversions * 20);
            const scoreB = b.stats.views + (b.stats.clicks * 5) + (b.stats.conversions * 20);
            return scoreB - scoreA;
        });

        return allShares.slice(0, limit).map(share => ({
            id: share.id,
            type: share.type,
            content: share.content,
            stats: share.stats,
            createdAt: share.createdAt
        }));
    }

    /**
     * Generate share card HTML/SVG for preview
     */
    generateShareCardHTML(shareCard) {
        const { template, content } = shareCard;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta property="og:title" content="${content.title}">
    <meta property="og:description" content="${content.message}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${shareCard.shareUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, ${template.gradient[0]}, ${template.gradient[1]});
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .share-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 18px;
            color: #666;
            margin-bottom: 30px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: ${template.gradient[0]};
        }
        .stat-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            margin-top: 5px;
        }
        .cta {
            background: linear-gradient(135deg, ${template.gradient[0]}, ${template.gradient[1]});
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            font-weight: 600;
            font-size: 16px;
        }
        .footer {
            margin-top: 30px;
            color: #999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="share-card">
        <div class="icon">${template.icon}</div>
        <div class="title">${content.title}</div>
        <div class="subtitle">${content.subtitle || ''}</div>
        
        ${content.stats ? `
        <div class="stats">
            ${content.stats.map(stat => `
                <div class="stat">
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <a href="https://langflix.app?ref=${shareCard.referralCode}" class="cta">
            Join Me on Langflix! 🚀
        </a>
        
        <div class="footer">
            Learn Spanish with TikTok-style videos
        </div>
    </div>
</body>
</html>
        `;
    }
}

// Export singleton
const socialSharingSystem = new SocialSharingSystem();
module.exports = socialSharingSystem;


