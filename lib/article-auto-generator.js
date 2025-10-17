/**
 * Article Auto-Generator (Background Worker)
 * 
 * Runs periodically to pre-generate personalized articles for active users
 * Smart approach: Only generate for users who need fresh content
 * 
 * Execution: Every 4 hours via cron or manual trigger
 */

const personalizationEngine = require('./article-personalization-engine');
const { supabase, isConfigured } = require('./supabase-client');

class ArticleAutoGenerator {
    constructor() {
        this.isRunning = false;
        this.lastRun = null;
        this.stats = {
            usersProcessed: 0,
            articlesGenerated: 0,
            totalCost: 0,
            errors: 0
        };
    }

    /**
     * Main entry point: Generate articles for all active users
     */
    async generateForAllUsers() {
        if (this.isRunning) {
            console.log('⚠️  Auto-generator already running, skipping...');
            return;
        }

        this.isRunning = true;
        this.resetStats();
        
        console.log('\n🚀 Starting auto-generation for all active users...\n');

        try {
            // Get list of active users
            const activeUsers = await this.getActiveUsers();
            console.log(`📊 Found ${activeUsers.length} active users\n`);

            // Process each user
            for (const user of activeUsers) {
                try {
                    await this.generateForUser(user.user_id);
                    this.stats.usersProcessed++;
                } catch (error) {
                    console.error(`❌ Error processing user ${user.user_id}:`, error.message);
                    this.stats.errors++;
                }

                // Small delay to avoid overwhelming the system
                await this.sleep(1000);
            }

            this.lastRun = new Date();
            this.printSummary();

        } catch (error) {
            console.error('❌ Fatal error in auto-generator:', error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Generate personalized articles for a single user
     */
    async generateForUser(userId) {
        try {
            console.log(`\n👤 Generating for user: ${userId}`);

            // Check if user already has fresh personalized articles
            const existing = await this.getExistingPersonalizedCount(userId);
            
            if (existing >= 15) {
                console.log(`   ✅ User already has ${existing} fresh articles, skipping`);
                return;
            }

            // Generate personalized feed
            const articles = await personalizationEngine.generatePersonalizedFeed(userId, {
                limit: 20,
                forceRefresh: true
            });

            this.stats.articlesGenerated += articles.length;
            
            // Estimate cost (rough calculation)
            const estimatedCost = articles.length * 0.002;
            this.stats.totalCost += estimatedCost;

            console.log(`   ✅ Generated ${articles.length} articles (est. cost: $${estimatedCost.toFixed(4)})`);

        } catch (error) {
            console.error(`   ❌ Error generating for ${userId}:`, error.message);
            throw error;
        }
    }

    /**
     * Get list of active users (logged in within 24 hours)
     */
    async getActiveUsers() {
        try {
            if (!isConfigured()) {
                console.log('⚠️  Supabase not configured, using test users');
                return [
                    { user_id: 'test_user_1' },
                    { user_id: 'test_user_2' }
                ];
            }

            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            // Get users with recent preferences or engagement
            const { data: users, error } = await supabase
                .from('user_preferences')
                .select('user_id, updated_at')
                .gte('updated_at', oneDayAgo)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Error fetching active users:', error);
                return [];
            }

            return users || [];

        } catch (error) {
            console.error('Error in getActiveUsers:', error);
            return [];
        }
    }

    /**
     * Get count of existing fresh personalized articles for user
     */
    async getExistingPersonalizedCount(userId) {
        try {
            if (!isConfigured()) return 0;

            const now = new Date().toISOString();

            const { count, error } = await supabase
                .from('personalized_articles')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gt('expires_at', now);

            if (error) {
                console.error('Error counting personalized articles:', error);
                return 0;
            }

            return count || 0;

        } catch (error) {
            console.error('Error in getExistingPersonalizedCount:', error);
            return 0;
        }
    }

    /**
     * Clean up expired articles (housekeeping)
     */
    async cleanupExpiredArticles() {
        try {
            if (!isConfigured()) return;

            const now = new Date().toISOString();

            const { error } = await supabase
                .from('personalized_articles')
                .delete()
                .lt('expires_at', now);

            if (error) {
                console.error('Error cleaning up expired articles:', error);
            } else {
                console.log('✅ Cleaned up expired personalized articles');
            }

        } catch (error) {
            console.error('Error in cleanupExpiredArticles:', error);
        }
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            usersProcessed: 0,
            articlesGenerated: 0,
            totalCost: 0,
            errors: 0
        };
    }

    /**
     * Print summary
     */
    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 AUTO-GENERATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Users Processed:     ${this.stats.usersProcessed}`);
        console.log(`Articles Generated:  ${this.stats.articlesGenerated}`);
        console.log(`Total Cost:          $${this.stats.totalCost.toFixed(4)}`);
        console.log(`Errors:              ${this.stats.errors}`);
        console.log(`Completed At:        ${new Date().toISOString()}`);
        console.log('='.repeat(60) + '\n');
    }

    /**
     * Get status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            stats: this.stats
        };
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton
const generator = new ArticleAutoGenerator();

// If run directly (node lib/article-auto-generator.js)
if (require.main === module) {
    console.log('🔧 Running auto-generator directly...\n');
    generator.generateForAllUsers()
        .then(() => {
            console.log('\n✅ Auto-generation complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Auto-generation failed:', error);
            process.exit(1);
        });
}

module.exports = generator;
module.exports.ArticleAutoGenerator = ArticleAutoGenerator;


