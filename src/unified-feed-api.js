// 🌍 UNIFIED FEED API - Aggregates ALL content sources
// Integrates: News, Social Media, Videos, AI Articles, LangFeed Videos

const express = require('express');
const fs = require('fs');
const path = require('path');
const RealContentAggregator = require('./real-content-aggregator.js');

const router = express.Router();
const aggregator = new RealContentAggregator();

// 🎯 MAIN UNIFIED FEED ENDPOINT
router.get('/unified-feed', async (req, res) => {
    try {
        const { page = 1, limit = 10, level = 'A2', interests = 'news,culture' } = req.query;
        const userId = req.headers['x-user-id'] || 'default_user';

        console.log(`📱 Unified feed request: Level=${level}, Interests=${interests}`);

        // Aggregate content from ALL sources
        const aggregatedContent = await aggregator.aggregateContent(userId, {
            interests: interests.split(','),
            level: level,
            limit: parseInt(limit),
            contentTypes: ['news', 'social', 'video', 'article']
        });

        // Add local LangFeed videos
        const langFeedVideos = await getLangFeedVideos(level, Math.floor(parseInt(limit) / 2));

        // Combine and shuffle for variety
        const allContent = [...aggregatedContent, ...langFeedVideos];
        const shuffled = allContent.sort(() => Math.random() - 0.5);

        res.json({
            success: true,
            videos: shuffled.slice(0, limit),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: shuffled.length,
                hasMore: true
            },
            metadata: {
                level: level,
                interests: interests.split(','),
                userId: userId,
                sources: ['NewsAPI', 'Guardian', 'Pexels', 'LangFeed', 'AI Generated'],
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Unified feed error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load unified feed',
            details: error.message
        });
    }
});

// 🎥 LANGFEED VIDEO DISCOVERY
async function getLangFeedVideos(level, limit = 5) {
    const langfeedPath = '/Users/mindful/Documents/Langfeed';

    try {
        if (!fs.existsSync(langfeedPath)) {
            console.log('⚠️ LangFeed directory not found');
            return [];
        }

        const videos = [];

        // Recursively scan for videos
        const scanDirectory = (dirPath, depth = 0) => {
            if (depth > 2) return; // Max 2 levels deep

            const items = fs.readdirSync(dirPath);

            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath, depth + 1);
                } else if (item.endsWith('.mp4')) {
                    const relativePath = fullPath.replace(langfeedPath + '/', '');

                    videos.push({
                        id: `langfeed_${Buffer.from(relativePath).toString('base64')}`,
                        type: 'video',
                        title: item.replace('.mp4', '').replace(/_/g, ' '),
                        spanish: `Video: ${item.replace('.mp4', '').replace(/_/g, ' ')}`,
                        english: `Learn Spanish with this video`,
                        videoUrl: `/api/langfeed/stream/${Buffer.from(relativePath).toString('base64')}`,
                        thumbnail: `https://img.youtube.com/vi/default/0.jpg`, // Placeholder
                        difficulty_level: level,
                        viral_score: 85 + Math.floor(Math.random() * 15),
                        duration: `${Math.floor(stat.size / 1000000)}:00`,
                        source: 'LangFeed',
                        fileSize: stat.size
                    });
                }
            }
        };

        scanDirectory(langfeedPath);

        // Randomize and limit
        return videos.sort(() => Math.random() - 0.5).slice(0, limit);

    } catch (error) {
        console.error('LangFeed video error:', error);
        return [];
    }
}

// 🎥 VIDEO STREAM ENDPOINT
router.get('/langfeed/stream/:videoId', (req, res) => {
    const { videoId } = req.params;
    const langfeedPath = '/Users/mindful/Documents/Langfeed';

    try {
        const relativePath = Buffer.from(videoId, 'base64').toString('utf-8');
        const videoPath = path.join(langfeedPath, relativePath);

        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            });

            file.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            });
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('Video stream error:', error);
        res.status(500).json({ error: 'Stream failed' });
    }
});

// 📊 USER LEVEL DETECTION
router.post('/detect-level', async (req, res) => {
    try {
        const { savedWords = [], interactions = [] } = req.body;

        // Analyze user's known words and interactions
        const level = detectUserLevel(savedWords, interactions);

        res.json({
            success: true,
            detectedLevel: level,
            confidence: 0.85,
            recommendation: `Based on your vocabulary, we recommend ${level} content`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Level detection failed'
        });
    }
});

function detectUserLevel(savedWords, interactions) {
    // Simple level detection based on word count
    const wordCount = savedWords.length;

    if (wordCount < 100) return 'A1';
    if (wordCount < 300) return 'A2';
    if (wordCount < 600) return 'B1';
    if (wordCount < 1200) return 'B2';
    if (wordCount < 2500) return 'C1';
    return 'C2';
}

// 📝 SAVE USER PREFERENCES
router.post('/preferences', (req, res) => {
    try {
        const { userId, level, interests } = req.body;

        // In production, save to database
        // For now, just acknowledge
        res.json({
            success: true,
            message: 'Preferences saved',
            userId: userId,
            level: level,
            interests: interests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to save preferences'
        });
    }
});

module.exports = router;