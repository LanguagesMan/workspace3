/**
 * 🧪 A/B TESTING ENGINE
 * Test everything to optimize engagement
 * 
 * Experiments we'll run:
 * - Auto-advance (on vs off)
 * - Reward frequency (5, 10, 15 items)
 * - Article snap scrolling (mandatory vs proximity)
 * - Sound default (on vs off)
 * - Celebration frequency
 * - Feed algorithm weights
 */

class ABTestingEngine {
    constructor() {
        this.experiments = new Map();
        this.userAssignments = new Map(); // userId -> experiment assignments
        this.experimentResults = new Map(); // experimentId -> results
        
        // Define active experiments
        this.defineExperiments();
        
        console.log('🧪 A/B Testing Engine initialized with', this.experiments.size, 'experiments');
    }
    
    /**
     * Define all active experiments
     */
    defineExperiments() {
        // Experiment 1: Auto-advance after video
        this.createExperiment({
            id: 'auto_advance',
            name: 'Auto-advance to next video',
            variants: ['off', 'on'],
            metric: 'session_time',
            description: 'Does auto-advance increase session time?',
            traffic: 50 // 50% of users
        });
        
        // Experiment 2: Reward frequency
        this.createExperiment({
            id: 'reward_frequency',
            name: 'Variable reward frequency',
            variants: [5, 10, 15], // Items between rewards
            metric: 'retention',
            description: 'Optimal reward frequency for retention',
            traffic: 100 // All users (multi-variant)
        });
        
        // Experiment 3: Article scroll snap
        this.createExperiment({
            id: 'article_snap',
            name: 'Article scroll snap behavior',
            variants: ['mandatory', 'proximity'],
            metric: 'read_rate',
            description: 'Does mandatory snap increase article completion?',
            traffic: 50
        });
        
        // Experiment 4: Sound default
        this.createExperiment({
            id: 'sound_default',
            name: 'Default sound setting',
            variants: ['on', 'off'],
            metric: 'watch_time',
            description: 'Does sound-on by default increase engagement?',
            traffic: 50
        });
        
        // Experiment 5: Celebration intensity
        this.createExperiment({
            id: 'celebration_intensity',
            name: 'Celebration animation intensity',
            variants: ['minimal', 'standard', 'intense'],
            metric: 'engagement',
            description: 'How much celebration is too much?',
            traffic: 100
        });
        
        // Experiment 6: Feed algorithm weight
        this.createExperiment({
            id: 'feed_weights',
            name: 'Feed scoring weights',
            variants: ['engagement_first', 'level_first', 'balanced'],
            metric: 'scroll_depth',
            description: 'Which scoring prioritization works best?',
            traffic: 100
        });
        
        // Experiment 7: Social proof frequency
        this.createExperiment({
            id: 'social_proof_frequency',
            name: 'Social proof message frequency',
            variants: ['low', 'medium', 'high'], // 10%, 30%, 50% of time
            metric: 'session_time',
            description: 'How often should we show social proof?',
            traffic: 100
        });
    }
    
    /**
     * Create an experiment
     */
    createExperiment(config) {
        const {
            id,
            name,
            variants,
            metric,
            description,
            traffic = 100
        } = config;
        
        this.experiments.set(id, {
            id,
            name,
            variants,
            metric,
            description,
            traffic,
            startedAt: Date.now(),
            status: 'active'
        });
        
        // Initialize results tracking
        this.experimentResults.set(id, {
            variants: variants.reduce((acc, variant) => {
                acc[variant] = {
                    users: 0,
                    metrics: {},
                    events: []
                };
                return acc;
            }, {})
        });
    }
    
    /**
     * Assign user to experiment variant
     * Uses consistent hashing for stable assignments
     */
    assignVariant(userId, experimentId) {
        const experiment = this.experiments.get(experimentId);
        
        if (!experiment) {
            console.warn(`Experiment ${experimentId} not found`);
            return null;
        }
        
        // Check if user already assigned
        if (!this.userAssignments.has(userId)) {
            this.userAssignments.set(userId, {});
        }
        
        const userExperiments = this.userAssignments.get(userId);
        
        if (userExperiments[experimentId]) {
            return userExperiments[experimentId];
        }
        
        // Check traffic allocation
        const hash = this.hashUserId(userId);
        const allocation = hash % 100;
        
        if (allocation >= experiment.traffic) {
            // User not in experiment
            userExperiments[experimentId] = 'control';
            return 'control';
        }
        
        // Assign variant based on consistent hash
        const variantIndex = hash % experiment.variants.length;
        const variant = experiment.variants[variantIndex];
        
        userExperiments[experimentId] = variant;
        
        // Track assignment
        const results = this.experimentResults.get(experimentId);
        if (results.variants[variant]) {
            results.variants[variant].users++;
        }
        
        console.log(`🧪 User ${userId} assigned to ${experimentId}: ${variant}`);
        
        return variant;
    }
    
    /**
     * Get user's variant for an experiment
     */
    getVariant(userId, experimentId) {
        return this.assignVariant(userId, experimentId);
    }
    
    /**
     * Track metric for experiment
     */
    trackMetric(userId, experimentId, metricName, value) {
        const experiment = this.experiments.get(experimentId);
        
        if (!experiment) return;
        
        const variant = this.getVariant(userId, experimentId);
        
        if (variant === 'control') return;
        
        const results = this.experimentResults.get(experimentId);
        const variantData = results.variants[variant];
        
        if (!variantData) return;
        
        if (!variantData.metrics[metricName]) {
            variantData.metrics[metricName] = {
                values: [],
                sum: 0,
                count: 0,
                avg: 0
            };
        }
        
        const metric = variantData.metrics[metricName];
        metric.values.push(value);
        metric.sum += value;
        metric.count++;
        metric.avg = metric.sum / metric.count;
        
        // Keep only last 1000 values
        if (metric.values.length > 1000) {
            metric.values.shift();
        }
    }
    
    /**
     * Track event for experiment
     */
    trackEvent(userId, experimentId, eventType, metadata = {}) {
        const experiment = this.experiments.get(experimentId);
        
        if (!experiment) return;
        
        const variant = this.getVariant(userId, experimentId);
        
        if (variant === 'control') return;
        
        const results = this.experimentResults.get(experimentId);
        const variantData = results.variants[variant];
        
        if (!variantData) return;
        
        variantData.events.push({
            userId,
            eventType,
            timestamp: Date.now(),
            metadata
        });
        
        // Keep only last 5000 events
        if (variantData.events.length > 5000) {
            variantData.events.shift();
        }
    }
    
    /**
     * Get experiment results
     */
    getResults(experimentId) {
        const experiment = this.experiments.get(experimentId);
        const results = this.experimentResults.get(experimentId);
        
        if (!experiment || !results) {
            return null;
        }
        
        const summary = {
            experimentId,
            name: experiment.name,
            status: experiment.status,
            variants: {}
        };
        
        // Calculate statistics for each variant
        Object.entries(results.variants).forEach(([variant, data]) => {
            summary.variants[variant] = {
                users: data.users,
                metrics: {},
                eventCounts: {}
            };
            
            // Aggregate metrics
            Object.entries(data.metrics).forEach(([metricName, metric]) => {
                summary.variants[variant].metrics[metricName] = {
                    avg: metric.avg,
                    count: metric.count,
                    latest: metric.values[metric.values.length - 1]
                };
            });
            
            // Count events
            const eventTypes = {};
            data.events.forEach(event => {
                eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
            });
            summary.variants[variant].eventCounts = eventTypes;
        });
        
        // Determine winner (simple comparison)
        summary.winner = this.determineWinner(summary.variants, experiment.metric);
        
        return summary;
    }
    
    /**
     * Determine winning variant
     */
    determineWinner(variants, primaryMetric) {
        let winner = null;
        let bestValue = -Infinity;
        
        Object.entries(variants).forEach(([variant, data]) => {
            const metricValue = data.metrics[primaryMetric]?.avg || 0;
            
            if (metricValue > bestValue) {
                bestValue = metricValue;
                winner = variant;
            }
        });
        
        return {
            variant: winner,
            value: bestValue,
            confidence: this.calculateConfidence(variants, primaryMetric)
        };
    }
    
    /**
     * Calculate statistical confidence
     * Simplified t-test approximation
     */
    calculateConfidence(variants, metric) {
        const variantData = Object.values(variants);
        
        if (variantData.length < 2) return 'low';
        
        // Get sample sizes
        const totalSamples = variantData.reduce((sum, v) => sum + (v.metrics[metric]?.count || 0), 0);
        
        if (totalSamples < 100) return 'low';
        if (totalSamples < 500) return 'medium';
        return 'high';
    }
    
    /**
     * Hash user ID for consistent assignment
     */
    hashUserId(userId) {
        let hash = 0;
        const str = userId.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash);
    }
    
    /**
     * Get all active experiments
     */
    getActiveExperiments() {
        return Array.from(this.experiments.values())
            .filter(exp => exp.status === 'active');
    }
    
    /**
     * End experiment
     */
    endExperiment(experimentId) {
        const experiment = this.experiments.get(experimentId);
        
        if (!experiment) return;
        
        experiment.status = 'completed';
        experiment.completedAt = Date.now();
        
        console.log(`🧪 Experiment ${experimentId} completed`);
        
        return this.getResults(experimentId);
    }
    
    /**
     * Get user's experiment config
     * Returns all variants assigned to this user
     */
    getUserExperiments(userId) {
        const config = {};
        
        this.experiments.forEach((experiment, experimentId) => {
            config[experimentId] = this.getVariant(userId, experimentId);
        });
        
        return config;
    }
}

// Export singleton
const abTestingEngine = new ABTestingEngine();
module.exports = abTestingEngine;


