/**
 * API: Check Graduation Readiness
 * Determine if user is ready to graduate from beginner mode
 */

const BeginnerModeEngine = require('../../lib/beginner-mode-engine');
const engine = new BeginnerModeEngine();

module.exports = async (req, res) => {
    try {
        const userId = req.query.userId || req.body.userId || 'guest';
        
        // Load user progress
        const progress = engine.loadBeginnerProgress(userId);
        
        // Check graduation readiness
        const graduation = engine.checkGraduationReadiness(progress);
        
        // If ready and this is a POST, graduate the user
        if (graduation.ready && req.method === 'POST') {
            progress.graduatedFromBeginner = true;
            progress.graduationDate = new Date().toISOString();
            progress.currentLevel = 'A2';
            engine.saveBeginnerProgress(userId, progress);
            
            // Track graduation micro-win
            engine.trackMicroWin(userId, 'graduated_beginner_mode', {
                wordsKnown: progress.knownWords?.length || 0,
                daysActive: progress.daysActive || 0
            });
        }
        
        res.json({
            success: true,
            ready: graduation.ready,
            progress: graduation.progress,
            criteria: graduation.criteria,
            recommendedLevel: graduation.recommendedLevel,
            nextMilestone: graduation.nextMilestone,
            message: graduation.ready 
                ? '🎓 Congratulations! You\'re ready to graduate!' 
                : 'Keep going! You\'re making great progress.'
        });
    } catch (error) {
        console.error('Error checking graduation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check graduation',
            message: error.message
        });
    }
};

