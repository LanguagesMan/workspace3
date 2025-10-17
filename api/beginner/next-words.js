/**
 * API: Get Next Words to Learn
 * Returns progressive word introduction based on user's current level
 */

const BeginnerModeEngine = require('../../lib/beginner-mode-engine');
const engine = new BeginnerModeEngine();

module.exports = async (req, res) => {
    try {
        const userId = req.query.userId || 'guest';
        const count = parseInt(req.query.count) || 3;
        
        // Load user progress
        const progress = engine.loadBeginnerProgress(userId);
        
        // Get next words to learn
        const nextWords = engine.getNextWordsToLearn(progress, count);
        
        res.json({
            success: true,
            words: nextWords,
            currentKnownWords: progress.knownWords?.length || 0,
            recommendedCount: count,
            message: `${nextWords.length} words ready to learn`
        });
    } catch (error) {
        console.error('Error getting next words:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get next words',
            message: error.message
        });
    }
};

