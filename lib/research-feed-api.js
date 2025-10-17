/**
 * 🧠 RESEARCH-BACKED FEED API
 * 
 * New endpoints using TikTok + Duolingo algorithms
 * Parallel to existing system - can A/B test
 */

const express = require('express');
const UnifiedLearningSystem = require('./unified-learning-system');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const learningSystem = new UnifiedLearningSystem();

/**
 * Get personalized feed using TikTok algorithm + HLR + i+1
 * NEW endpoint - research-backed
 */
router.get('/feed/research/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { type = 'videos', count = 20 } = req.query;
        
        console.log(`🧠 Generating research-backed feed for user ${userId}`);
        
        // Load available content
        const availableContent = await loadContent(type);
        
        // Get user history (simplified - in production from DB)
        const userHistory = await getUserHistory(userId);
        
        // Generate personalized feed
        const feed = await learningSystem.generatePersonalizedFeed(userId, {
            feedType: type,
            count: parseInt(count),
            availableContent,
            userHistory
        });
        
        res.json({
            success: true,
            ...feed,
            algorithm: 'research-backed',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Research feed error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate research feed' 
        });
    }
});

/**
 * Track interaction (updates all systems)
 */
router.post('/track/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const interaction = req.body;
        
        console.log(`📊 Tracking interaction: ${interaction.action} for user ${userId}`);
        
        const result = await learningSystem.trackInteraction(userId, interaction);
        
        res.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Track error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to track interaction' 
        });
    }
});

/**
 * Get comprehensive user dashboard
 */
router.get('/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const dashboard = await learningSystem.getUserDashboard(userId);
        
        res.json({
            success: true,
            dashboard,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Dashboard error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load dashboard' 
        });
    }
});

/**
 * Get practice session (weakest words)
 */
router.get('/practice/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { duration = 10 } = req.query;
        
        const session = await learningSystem.generatePracticeSession(
            userId, 
            parseInt(duration)
        );
        
        res.json({
            success: true,
            session,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Practice error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate practice' 
        });
    }
});

/**
 * Check streak status
 */
router.get('/streak/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const streakRisk = learningSystem.gamification.checkStreakAtRisk(userId);
        const streakUpdate = learningSystem.gamification.updateStreak(userId);
        
        res.json({
            success: true,
            streak: streakUpdate,
            risk: streakRisk,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Streak error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to check streak' 
        });
    }
});

/**
 * Award XP with variable rewards
 */
router.post('/xp/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { action, context = {} } = req.body;
        
        const result = learningSystem.gamification.awardXP(userId, action, context);
        
        res.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ XP error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to award XP' 
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function loadContent(type) {
    const { parseSRT } = require('./srt-parser');

    if (type === 'videos') {
        // PRIORITIZE LANGFEED: Videos with proper transcripts from user's transcription
        const langfeedDir = path.join(__dirname, '..', 'public', 'videos', 'langfeed');
        const reelsDir = path.join(__dirname, '..', 'public', 'videos', 'reels');

        let allVideos = [];

        // Load langfeed videos FIRST (687 videos with transcripts)
        if (fs.existsSync(langfeedDir)) {
            const langfeedFiles = fs.readdirSync(langfeedDir).filter(f => f.endsWith('.mp4'));
            console.log(`📹 Loading ${langfeedFiles.length} langfeed videos with transcripts`);

            const langfeedVideos = await Promise.all(langfeedFiles.map(async (filename, index) => {
                const baseFilename = filename.replace('.mp4', '');
                const srtPath = path.join(langfeedDir, `${baseFilename}.srt`);

                let subtitles = [];
                let text = '';

                if (fs.existsSync(srtPath)) {
                    try {
                        const srtContent = fs.readFileSync(srtPath, 'utf-8');
                        subtitles = parseSRT(srtContent);
                        text = subtitles.map(s => s.spanish || s.text || '').filter(t => t).join(' ');
                    } catch (err) {
                        console.warn(`⚠️ Error loading ${srtPath}`);
                    }
                }

                // Only include if has transcript
                if (text) {
                    return {
                        id: `langfeed_${index}`,
                        videoUrl: `/videos/langfeed/${filename}`,
                        title: baseFilename.replace(/_/g, ' '),
                        spanish: text,
                        text: text,
                        type: 'video',
                        source: 'langfeed',
                        level: 'B1', // Will be calculated by difficulty engine
                        metrics: {
                            views: Math.floor(Math.random() * 1000),
                            likes: Math.floor(Math.random() * 100),
                            shares: Math.floor(Math.random() * 20),
                            comments: Math.floor(Math.random() * 30),
                            completions: Math.floor(Math.random() * 800),
                            rewatches: Math.floor(Math.random() * 50)
                        }
                    };
                }
                return null;
            }));

            allVideos = langfeedVideos.filter(v => v !== null);
            console.log(`✅ Loaded ${allVideos.length} langfeed videos with transcripts`);
        }

        // Add reels as fallback (only if needed)
        if (allVideos.length < 50 && fs.existsSync(reelsDir)) {
            const reelsFiles = fs.readdirSync(reelsDir).filter(f => f.endsWith('.mp4'));
            const reelsVideos = await Promise.all(reelsFiles.slice(0, 20).map(async (filename, index) => {
                const baseFilename = filename.replace('.mp4', '');
                const srtPath = path.join(reelsDir, `${baseFilename}.srt`);

                let subtitles = [];
                let text = '';

                if (fs.existsSync(srtPath)) {
                    try {
                        const srtContent = fs.readFileSync(srtPath, 'utf-8');
                        subtitles = parseSRT(srtContent);
                        text = subtitles.map(s => s.spanish || s.text || '').filter(t => t).join(' ');
                    } catch (err) {
                        console.warn(`⚠️ Error loading ${srtPath}`);
                    }
                }

                if (text) {
                    return {
                        id: `reel_${index}`,
                        videoUrl: `/videos/reels/${filename}`,
                        title: baseFilename.replace(/_/g, ' '),
                        spanish: text,
                        text: text,
                        type: 'video',
                        source: 'reels',
                        level: 'B1',
                        metrics: {
                            views: Math.floor(Math.random() * 1000),
                            likes: Math.floor(Math.random() * 100),
                            shares: Math.floor(Math.random() * 20),
                            comments: Math.floor(Math.random() * 30),
                            completions: Math.floor(Math.random() * 800),
                            rewatches: Math.floor(Math.random() * 50)
                        }
                    };
                }
                return null;
            }));

            allVideos.push(...reelsVideos.filter(v => v !== null));
        }

        return allVideos;
    }

    return [];
}

async function getUserHistory(userId) {
    // In production, load from database
    // For now, return empty array (cold start)
    return [];
}

module.exports = router;
