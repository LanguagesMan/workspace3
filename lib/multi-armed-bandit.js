/**
 * 🎰 MULTI-ARMED BANDIT SYSTEM
 * Contextual bandit algorithm for adaptive weight tuning
 * Learns optimal content weights for each user in real-time
 */

class MultiArmedBandit {
    constructor() {
        // Store arm statistics per user
        this.userArms = new Map(); // userId -> { arm: { pulls, rewards, avgReward } }
        
        // Exploration rate (epsilon-greedy)
        this.epsilon = 0.1; // 10% exploration, 90% exploitation
        
        // Available arms (content scoring weights)
        this.arms = {
            levelMatch: { min: 0.2, max: 0.4, default: 0.30 },
            interestMatch: { min: 0.15, max: 0.35, default: 0.25 },
            vocabularyMatch: { min: 0.1, max: 0.3, default: 0.20 },
            novelty: { min: 0.05, max: 0.25, default: 0.15 },
            engagement: { min: 0.05, max: 0.2, default: 0.10 }
        };
    }

    /**
     * Initialize arms for a new user
     */
    initializeUser(userId) {
        if (this.userArms.has(userId)) return;

        const arms = {};
        for (const [armName, config] of Object.entries(this.arms)) {
            arms[armName] = {
                pulls: 0,
                rewards: 0,
                avgReward: 0,
                weight: config.default,
                // UCB1 statistics
                confidence: 0
            };
        }

        this.userArms.set(userId, {
            arms,
            totalPulls: 0,
            sessionStart: Date.now()
        });
    }

    /**
     * Get optimal weights for user using UCB1 (Upper Confidence Bound)
     * @param {string} userId - User ID
     * @returns {Object} - Optimal weights for content scoring
     */
    getWeights(userId) {
        this.initializeUser(userId);
        const userData = this.userArms.get(userId);

        // Epsilon-greedy: sometimes explore, usually exploit
        const shouldExplore = Math.random() < this.epsilon;

        if (shouldExplore || userData.totalPulls < 50) {
            // Exploration: try different weight combinations
            return this.exploreWeights(userId);
        } else {
            // Exploitation: use best known weights
            return this.exploitWeights(userId);
        }
    }

    /**
     * Exploration: Generate varied weights to test
     */
    exploreWeights(userId) {
        const userData = this.userArms.get(userId);
        const weights = {};

        for (const [armName, config] of Object.entries(this.arms)) {
            // Generate random weight within bounds
            const range = config.max - config.min;
            weights[armName] = config.min + (Math.random() * range);
        }

        // Normalize to sum to 1.0
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        for (const key in weights) {
            weights[key] = weights[key] / sum;
        }

        return weights;
    }

    /**
     * Exploitation: Use best performing weights
     */
    exploitWeights(userId) {
        const userData = this.userArms.get(userId);
        const weights = {};

        // Use UCB1 to select arms
        for (const [armName, armData] of Object.entries(userData.arms)) {
            // UCB1 formula: avg_reward + sqrt(2 * ln(total_pulls) / arm_pulls)
            const exploration = armData.pulls > 0 
                ? Math.sqrt((2 * Math.log(userData.totalPulls)) / armData.pulls)
                : Infinity;

            const ucb = armData.avgReward + exploration;
            armData.confidence = ucb;

            // Use stored optimal weight
            weights[armName] = armData.weight;
        }

        // Normalize to sum to 1.0
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        for (const key in weights) {
            weights[key] = weights[key] / sum;
        }

        return weights;
    }

    /**
     * Update bandit with reward signal
     * @param {string} userId - User ID
     * @param {Object} weights - Weights used for this pull
     * @param {number} reward - Reward signal (0-1)
     */
    updateReward(userId, weights, reward) {
        this.initializeUser(userId);
        const userData = this.userArms.get(userId);

        userData.totalPulls++;

        // Update each arm based on its contribution
        for (const [armName, weight] of Object.entries(weights)) {
            const arm = userData.arms[armName];
            
            arm.pulls++;
            arm.rewards += reward * weight; // Weight the reward by contribution
            arm.avgReward = arm.rewards / arm.pulls;

            // Update optimal weight using gradient
            // If reward is good, move weight towards this value
            const learningRate = 0.1;
            arm.weight = arm.weight + learningRate * (weight - arm.weight) * reward;

            // Clamp to bounds
            const config = this.arms[armName];
            arm.weight = Math.max(config.min, Math.min(config.max, arm.weight));
        }

        return {
            success: true,
            totalPulls: userData.totalPulls,
            avgRewards: Object.entries(userData.arms).reduce((acc, [name, arm]) => {
                acc[name] = arm.avgReward;
                return acc;
            }, {})
        };
    }

    /**
     * Calculate reward from user interaction
     * @param {Object} interaction - User interaction data
     * @returns {number} - Reward score 0-1
     */
    calculateReward(interaction) {
        let reward = 0;

        // Positive signals
        if (interaction.completed) reward += 0.4;
        if (interaction.liked) reward += 0.3;
        if (interaction.saved) reward += 0.2;
        if (interaction.shared) reward += 0.15;

        // Time spent signal (normalize to 0-0.2)
        if (interaction.timeSpent && interaction.duration) {
            const completionRatio = Math.min(1, interaction.timeSpent / interaction.duration);
            reward += completionRatio * 0.2;
        }

        // Negative signals
        if (interaction.skipped) reward -= 0.5;
        if (interaction.tooHard) reward -= 0.3;
        if (interaction.tooEasy) reward -= 0.2;

        // Clamp to 0-1
        return Math.max(0, Math.min(1, reward));
    }

    /**
     * Get user's bandit statistics
     */
    getUserStats(userId) {
        this.initializeUser(userId);
        const userData = this.userArms.get(userId);

        const stats = {
            totalPulls: userData.totalPulls,
            sessionStart: userData.sessionStart,
            arms: {}
        };

        for (const [armName, armData] of Object.entries(userData.arms)) {
            stats.arms[armName] = {
                pulls: armData.pulls,
                avgReward: armData.avgReward,
                currentWeight: armData.weight,
                confidence: armData.confidence
            };
        }

        return stats;
    }

    /**
     * Thompson Sampling variant (Bayesian approach)
     * Alternative to UCB1 for more adaptive learning
     */
    getWeightsThompson(userId) {
        this.initializeUser(userId);
        const userData = this.userArms.get(userId);

        const weights = {};

        for (const [armName, armData] of Object.entries(userData.arms)) {
            // Beta distribution sampling
            const alpha = armData.rewards + 1; // Success count + 1 (prior)
            const beta = (armData.pulls - armData.rewards) + 1; // Failure count + 1 (prior)

            // Sample from beta distribution (simplified)
            weights[armName] = this.sampleBeta(alpha, beta);
        }

        // Normalize
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        for (const key in weights) {
            weights[key] = weights[key] / sum;
        }

        return weights;
    }

    /**
     * Sample from Beta distribution (simplified approximation)
     */
    sampleBeta(alpha, beta) {
        // Using method of moments approximation
        const mean = alpha / (alpha + beta);
        const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
        
        // Add noise proportional to variance
        const noise = (Math.random() - 0.5) * Math.sqrt(variance) * 2;
        return Math.max(0, Math.min(1, mean + noise));
    }

    /**
     * Adaptive epsilon decay (reduce exploration over time)
     */
    updateEpsilon(userId) {
        this.initializeUser(userId);
        const userData = this.userArms.get(userId);

        // Decay epsilon as user gets more pulls
        const initialEpsilon = 0.3;
        const minEpsilon = 0.05;
        const decayRate = 0.995;

        const newEpsilon = Math.max(
            minEpsilon,
            initialEpsilon * Math.pow(decayRate, userData.totalPulls)
        );

        this.epsilon = newEpsilon;
        return newEpsilon;
    }

    /**
     * Contextual bandit: Adjust weights based on user context
     */
    getContextualWeights(userId, context) {
        const baseWeights = this.getWeights(userId);

        // Adjust based on context
        if (context.timeOfDay === 'morning') {
            // Morning: prefer shorter, easier content
            baseWeights.engagement *= 1.2;
            baseWeights.levelMatch *= 0.9;
        } else if (context.timeOfDay === 'evening') {
            // Evening: prefer interesting, engaging content
            baseWeights.interestMatch *= 1.3;
            baseWeights.novelty *= 1.1;
        }

        if (context.sessionLength > 30) {
            // Long session: user is engaged, show harder content
            baseWeights.levelMatch *= 1.2;
            baseWeights.vocabularyMatch *= 1.1;
        } else {
            // Short session: keep it easy and engaging
            baseWeights.engagement *= 1.3;
        }

        if (context.recentSkips > 3) {
            // Too many skips: prioritize better matching
            baseWeights.levelMatch *= 1.4;
            baseWeights.interestMatch *= 1.3;
        }

        // Normalize
        const sum = Object.values(baseWeights).reduce((a, b) => a + b, 0);
        for (const key in baseWeights) {
            baseWeights[key] = baseWeights[key] / sum;
        }

        return baseWeights;
    }

    /**
     * Reset user bandit (for testing or if user profile changes dramatically)
     */
    resetUser(userId) {
        this.userArms.delete(userId);
        this.initializeUser(userId);
    }

    /**
     * Export user bandit data (for persistence)
     */
    exportUserData(userId) {
        return this.userArms.get(userId);
    }

    /**
     * Import user bandit data (from persistence)
     */
    importUserData(userId, data) {
        this.userArms.set(userId, data);
    }
}

// Export singleton
const multiArmedBandit = new MultiArmedBandit();
module.exports = multiArmedBandit;


