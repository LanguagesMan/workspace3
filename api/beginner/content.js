/**
 * API: Get Beginner-Friendly Content
 * Returns videos filtered for beginners (max 3 new words, short duration)
 */

const BeginnerModeEngine = require('../../lib/beginner-mode-engine');
const path = require('path');
const fs = require('fs');

const engine = new BeginnerModeEngine();

module.exports = async (req, res) => {
    try {
        const userId = req.query.userId || 'guest';
        const limit = parseInt(req.query.limit) || 20;
        
        // Load user's known words
        const userProgress = engine.loadBeginnerProgress(userId);
        const knownWords = userProgress.knownWords || [];
        
        // Load all available content
        const videosDir = path.join(__dirname, '../../public/videos');
        const allContent = await loadVideoContent(videosDir);
        
        // Filter for beginner-appropriate content
        const beginnerContent = engine.filterBeginnerContent(allContent, knownWords);
        
        // Return limited results
        const results = beginnerContent.slice(0, limit);
        
        res.json({
            success: true,
            content: results,
            total: beginnerContent.length,
            returned: results.length,
            userKnownWords: knownWords.length,
            message: 'Beginner-friendly content loaded'
        });
    } catch (error) {
        console.error('Error loading beginner content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load content',
            message: error.message
        });
    }
};

async function loadVideoContent(videosDir) {
    const content = [];
    
    try {
        // Check different video directories
        const langfeedDir = path.join(videosDir, 'langfeed');
        const reelsDir = path.join(videosDir, 'reels');
        
        // Load from langfeed
        if (fs.existsSync(langfeedDir)) {
            const videos = fs.readdirSync(langfeedDir).filter(f => f.endsWith('.mp4'));
            for (const video of videos) {
                const videoPath = path.join(langfeedDir, video);
                const srtPath = videoPath.replace('.mp4', '.srt');
                
                if (fs.existsSync(srtPath)) {
                    const transcription = parseSRT(fs.readFileSync(srtPath, 'utf8'));
                    const stats = fs.statSync(videoPath);
                    
                    content.push({
                        id: video.replace('.mp4', ''),
                        path: `/videos/langfeed/${video}`,
                        transcription: transcription,
                        duration: Math.round(stats.size / 100000), // Rough estimate
                        source: 'langfeed'
                    });
                }
            }
        }
        
        // Load from reels
        if (fs.existsSync(reelsDir)) {
            const videos = fs.readdirSync(reelsDir).filter(f => f.endsWith('.mp4'));
            for (const video of videos.slice(0, 50)) { // Limit for performance
                const videoPath = path.join(reelsDir, video);
                const srtPath = videoPath.replace('.mp4', '.srt');
                
                if (fs.existsSync(srtPath)) {
                    const transcription = parseSRT(fs.readFileSync(srtPath, 'utf8'));
                    const stats = fs.statSync(videoPath);
                    
                    content.push({
                        id: video.replace('.mp4', ''),
                        path: `/videos/reels/${video}`,
                        transcription: transcription,
                        duration: Math.round(stats.size / 100000),
                        source: 'reels'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading video content:', error);
    }
    
    return content;
}

function parseSRT(srtContent) {
    const lines = [];
    const blocks = srtContent.trim().split('\n\n');
    
    for (const block of blocks) {
        const blockLines = block.split('\n');
        if (blockLines.length >= 3) {
            const spanish = blockLines[2].trim();
            const english = blockLines[3]?.trim() || '';
            
            lines.push({
                spanish: spanish,
                english: english,
                timestamp: blockLines[1]
            });
        }
    }
    
    return { lines: lines };
}

