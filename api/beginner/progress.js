/**
 * API: Get/Update Beginner Progress
 * Tracks user's learning journey
 */

const BeginnerModeEngine = require('../../lib/beginner-mode-engine');
const engine = new BeginnerModeEngine();

module.exports = async (req, res) => {
    try {
        const userId = req.params.userId || req.query.userId || 'guest';
        
        if (req.method === 'GET') {
            // Get progress
            const progress = engine.loadBeginnerProgress(userId);
            
            // Check graduation readiness
            const graduation = engine.checkGraduationReadiness(progress);
            
            res.json({
                success: true,
                progress: progress,
                graduation: graduation,
                isAbsoluteBeginner: engine.isAbsoluteBeginner(progress)
            });
        } else if (req.method === 'POST' || req.method === 'PUT') {
            // Update progress
            const updates = req.body;
            const updatedProgress = engine.saveBeginnerProgress(userId, updates);
            
            res.json({
                success: true,
                progress: updatedProgress,
                message: 'Progress updated successfully'
            });
        } else {
            res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }
    } catch (error) {
        console.error('Error managing beginner progress:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to manage progress',
            message: error.message
        });
    }
};

