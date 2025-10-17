/**
 * 🏆 FRIEND CHALLENGE & COMPETITION SYSTEM
 * 
 * Compete with friends through challenges, leaderboards, and social competitions
 * Inspired by: Duolingo Leagues, Strava Challenges, TikTok Challenges
 * 
 * Key Features:
 * - Friend-to-friend challenges
 * - Weekly leagues (Bronze, Silver, Gold, Diamond, Legend)
 * - Head-to-head competitions
 * - Social proof (10,000 people doing this challenge)
 * - Rewards and badges
 */

class ChallengeSystem {
    constructor() {
        this.activeChallenges = new Map(); // challengeId -> challenge data
        this.userChallenges = new Map(); // userId -> challenges array
        this.friendships = new Map(); // userId -> friends array
        this.leagues = new Map(); // leagueId -> league data
        this.leaderboards = new Map(); // type -> sorted user scores
        
        this.initializeLeagues();
    }

    /**
     * Initialize league system
     */
    initializeLeagues() {
        this.LEAGUE_TIERS = {
            bronze: {
                name: 'Bronze League',
                icon: '🥉',
                color: '#CD7F32',
                minXP: 0,
                promotion: 500,
                rewards: { xp: 50, badge: '🥉' }
            },
            silver: {
                name: 'Silver League',
                icon: '🥈',
                color: '#C0C0C0',
                minXP: 500,
                promotion: 1500,
                rewards: { xp: 100, badge: '🥈' }
            },
            gold: {
                name: 'Gold League',
                icon: '🥇',
                color: '#FFD700',
                minXP: 1500,
                promotion: 3000,
                rewards: { xp: 200, badge: '🥇' }
            },
            diamond: {
                name: 'Diamond League',
                icon: '💎',
                color: '#B9F2FF',
                minXP: 3000,
                promotion: 5000,
                rewards: { xp: 500, badge: '💎' }
            },
            legend: {
                name: 'Legend League',
                icon: '👑',
                color: '#FF69B4',
                minXP: 5000,
                promotion: null,
                rewards: { xp: 1000, badge: '👑' }
            }
        };
    }

    /**
     * Create a friend challenge
     */
    createFriendChallenge(challengerId, challengedId, challengeType, duration = 7) {
        const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const challenges = {
            words_race: {
                name: 'Word Race',
                description: 'Who can learn more words?',
                icon: '📚',
                metric: 'words_learned',
                target: 50
            },
            video_marathon: {
                name: 'Video Marathon',
                description: 'Who can watch more videos?',
                icon: '🎬',
                metric: 'videos_watched',
                target: 30
            },
            quiz_battle: {
                name: 'Quiz Battle',
                description: 'Who can score higher on quizzes?',
                icon: '🎯',
                metric: 'quiz_score',
                target: 20
            },
            streak_competition: {
                name: 'Streak Competition',
                description: 'Who can maintain longer streak?',
                icon: '🔥',
                metric: 'streak_days',
                target: 7
            },
            xp_race: {
                name: 'XP Race',
                description: 'Who can earn more XP?',
                icon: '⚡',
                metric: 'xp_earned',
                target: 1000
            }
        };

        const template = challenges[challengeType] || challenges.xp_race;

        const challenge = {
            id: challengeId,
            type: challengeType,
            name: template.name,
            description: template.description,
            icon: template.icon,
            metric: template.metric,
            target: template.target,
            challenger: {
                userId: challengerId,
                progress: 0,
                acceptedAt: null
            },
            challenged: {
                userId: challengedId,
                progress: 0,
                acceptedAt: null
            },
            status: 'pending', // pending, active, completed, expired
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
            winner: null,
            rewards: {
                winner: { xp: 500, badge: `${template.icon} Champion` },
                participant: { xp: 100 }
            }
        };

        this.activeChallenges.set(challengeId, challenge);

        // Add to user challenges
        this.addChallengeToUser(challengerId, challengeId);
        this.addChallengeToUser(challengedId, challengeId);

        return challenge;
    }

    /**
     * Accept a friend challenge
     */
    acceptChallenge(userId, challengeId) {
        const challenge = this.activeChallenges.get(challengeId);
        
        if (!challenge) {
            throw new Error('Challenge not found');
        }

        if (challenge.challenged.userId !== userId) {
            throw new Error('Not your challenge to accept');
        }

        if (challenge.status !== 'pending') {
            throw new Error('Challenge already active or completed');
        }

        challenge.challenged.acceptedAt = new Date().toISOString();
        challenge.status = 'active';

        return {
            success: true,
            challenge,
            message: `Challenge accepted! Let's compete! ${challenge.icon}`
        };
    }

    /**
     * Decline a friend challenge
     */
    declineChallenge(userId, challengeId) {
        const challenge = this.activeChallenges.get(challengeId);
        
        if (!challenge || challenge.challenged.userId !== userId) {
            throw new Error('Invalid challenge');
        }

        challenge.status = 'declined';
        
        return {
            success: true,
            message: 'Challenge declined'
        };
    }

    /**
     * Update challenge progress
     */
    updateChallengeProgress(userId, metric, amount = 1) {
        const userChallenges = this.getUserChallenges(userId, 'active');

        const updates = [];

        for (const challengeId of userChallenges) {
            const challenge = this.activeChallenges.get(challengeId);
            
            if (!challenge || challenge.status !== 'active') continue;
            if (challenge.metric !== metric) continue;

            // Update progress
            if (challenge.challenger.userId === userId) {
                challenge.challenger.progress += amount;
            } else if (challenge.challenged.userId === userId) {
                challenge.challenged.progress += amount;
            }

            // Check if challenge completed
            const completed = this.checkChallengeCompletion(challenge);
            if (completed) {
                updates.push({ challengeId, completed: true, winner: challenge.winner });
            }
        }

        return updates;
    }

    /**
     * Check if challenge is completed
     */
    checkChallengeCompletion(challenge) {
        // Check if expired
        const now = new Date();
        const expiresAt = new Date(challenge.expiresAt);
        
        if (now > expiresAt) {
            challenge.status = 'completed';
            
            // Determine winner
            if (challenge.challenger.progress > challenge.challenged.progress) {
                challenge.winner = challenge.challenger.userId;
            } else if (challenge.challenged.progress > challenge.challenger.progress) {
                challenge.winner = challenge.challenged.userId;
            } else {
                challenge.winner = 'tie';
            }

            return true;
        }

        // Check if target reached
        if (challenge.challenger.progress >= challenge.target || 
            challenge.challenged.progress >= challenge.target) {
            challenge.status = 'completed';
            challenge.winner = challenge.challenger.progress > challenge.challenged.progress
                ? challenge.challenger.userId
                : challenge.challenged.userId;
            return true;
        }

        return false;
    }

    /**
     * Get user's challenges
     */
    getUserChallenges(userId, status = 'all') {
        const userChallengeIds = this.userChallenges.get(userId) || [];
        
        const challenges = userChallengeIds
            .map(id => this.activeChallenges.get(id))
            .filter(c => c && (status === 'all' || c.status === status));

        return status === 'all' ? challenges.map(c => c.id) : challenges;
    }

    /**
     * Get challenge details with opponent info
     */
    getChallengeDetails(userId, challengeId) {
        const challenge = this.activeChallenges.get(challengeId);
        
        if (!challenge) {
            throw new Error('Challenge not found');
        }

        const isChallenger = challenge.challenger.userId === userId;
        const userProgress = isChallenger ? challenge.challenger.progress : challenge.challenged.progress;
        const opponentProgress = isChallenger ? challenge.challenged.progress : challenge.challenger.progress;
        const opponentId = isChallenger ? challenge.challenged.userId : challenge.challenger.userId;

        return {
            ...challenge,
            userProgress,
            opponentProgress,
            opponentId,
            isAhead: userProgress > opponentProgress,
            progressDiff: Math.abs(userProgress - opponentProgress),
            timeRemaining: this.getTimeRemaining(challenge.expiresAt),
            canStillWin: this.canStillWin(challenge, userId)
        };
    }

    /**
     * Add challenge to user's list
     */
    addChallengeToUser(userId, challengeId) {
        if (!this.userChallenges.has(userId)) {
            this.userChallenges.set(userId, []);
        }
        this.userChallenges.get(userId).push(challengeId);
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(type = 'weekly', limit = 50) {
        // Types: weekly, monthly, all-time, friends
        const leaderboard = this.leaderboards.get(type) || [];
        
        return {
            type,
            period: this.getLeaderboardPeriod(type),
            rankings: leaderboard.slice(0, limit).map((entry, index) => ({
                rank: index + 1,
                ...entry,
                badge: this.getLeaderboardBadge(index + 1)
            }))
        };
    }

    /**
     * Update leaderboard
     */
    updateLeaderboard(userId, userName, xp, type = 'weekly') {
        if (!this.leaderboards.has(type)) {
            this.leaderboards.set(type, []);
        }

        const board = this.leaderboards.get(type);
        const existing = board.find(entry => entry.userId === userId);

        if (existing) {
            existing.xp = xp;
            existing.lastUpdated = new Date().toISOString();
        } else {
            board.push({
                userId,
                userName,
                xp,
                lastUpdated: new Date().toISOString()
            });
        }

        // Sort by XP descending
        board.sort((a, b) => b.xp - a.xp);
    }

    /**
     * Get user's leaderboard position
     */
    getUserLeaderboardPosition(userId, type = 'weekly') {
        const board = this.leaderboards.get(type) || [];
        const position = board.findIndex(entry => entry.userId === userId);
        
        if (position === -1) {
            return {
                rank: null,
                total: board.length,
                percentile: null
            };
        }

        return {
            rank: position + 1,
            total: board.length,
            percentile: Math.round(((board.length - position) / board.length) * 100),
            badge: this.getLeaderboardBadge(position + 1),
            xp: board[position].xp,
            nextRank: position > 0 ? {
                rank: position,
                xpGap: board[position - 1].xp - board[position].xp
            } : null
        };
    }

    /**
     * Get league for user
     */
    getUserLeague(xp) {
        let currentLeague = 'bronze';
        
        for (const [tier, data] of Object.entries(this.LEAGUE_TIERS)) {
            if (xp >= data.minXP) {
                currentLeague = tier;
            } else {
                break;
            }
        }

        const league = this.LEAGUE_TIERS[currentLeague];
        const nextTier = this.getNextLeagueTier(currentLeague);

        return {
            current: {
                tier: currentLeague,
                ...league
            },
            next: nextTier ? {
                tier: nextTier,
                ...this.LEAGUE_TIERS[nextTier],
                xpNeeded: this.LEAGUE_TIERS[nextTier].minXP - xp
            } : null,
            progress: nextTier ? 
                ((xp - league.minXP) / (this.LEAGUE_TIERS[nextTier].minXP - league.minXP)) * 100 
                : 100
        };
    }

    /**
     * Get next league tier
     */
    getNextLeagueTier(currentTier) {
        const tiers = ['bronze', 'silver', 'gold', 'diamond', 'legend'];
        const currentIndex = tiers.indexOf(currentTier);
        return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
    }

    /**
     * Get leaderboard badge based on rank
     */
    getLeaderboardBadge(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 10) return '🏆';
        if (rank <= 50) return '⭐';
        return '';
    }

    /**
     * Get time remaining for challenge
     */
    getTimeRemaining(expiresAt) {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;

        if (diff <= 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    }

    /**
     * Check if user can still win challenge
     */
    canStillWin(challenge, userId) {
        const isChallenger = challenge.challenger.userId === userId;
        const userProgress = isChallenger ? challenge.challenger.progress : challenge.challenged.progress;
        const opponentProgress = isChallenger ? challenge.challenged.progress : challenge.challenger.progress;

        const timeLeft = new Date(challenge.expiresAt) - new Date();
        const canReachTarget = userProgress < challenge.target;

        return canReachTarget && (userProgress >= opponentProgress || timeLeft > 0);
    }

    /**
     * Get leaderboard period text
     */
    getLeaderboardPeriod(type) {
        const now = new Date();
        if (type === 'weekly') {
            const monday = new Date(now);
            monday.setDate(now.getDate() - now.getDay() + 1);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return `${monday.toLocaleDateString()} - ${sunday.toLocaleDateString()}`;
        }
        if (type === 'monthly') {
            return now.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        return 'All Time';
    }

    /**
     * Add friend
     */
    addFriend(userId, friendId) {
        if (!this.friendships.has(userId)) {
            this.friendships.set(userId, []);
        }
        
        const friends = this.friendships.get(userId);
        if (!friends.includes(friendId)) {
            friends.push(friendId);
        }

        // Add reciprocal friendship
        if (!this.friendships.has(friendId)) {
            this.friendships.set(friendId, []);
        }
        const friendsFriends = this.friendships.get(friendId);
        if (!friendsFriends.includes(userId)) {
            friendsFriends.push(userId);
        }

        return {
            success: true,
            message: 'Friend added! Challenge them to compete!'
        };
    }

    /**
     * Get user's friends
     */
    getFriends(userId) {
        return this.friendships.get(userId) || [];
    }

    /**
     * Get challenge stats
     */
    getChallengeStats(userId) {
        const allChallenges = this.getUserChallenges(userId, 'all');
        const completed = allChallenges.filter(c => c.status === 'completed');
        const won = completed.filter(c => c.winner === userId);
        
        return {
            total: allChallenges.length,
            active: allChallenges.filter(c => c.status === 'active').length,
            completed: completed.length,
            won: won.length,
            lost: completed.length - won.length,
            winRate: completed.length > 0 ? Math.round((won.length / completed.length) * 100) : 0
        };
    }
}

// Export singleton
const challengeSystem = new ChallengeSystem();
module.exports = challengeSystem;


