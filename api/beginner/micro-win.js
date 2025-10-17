/**
 * API: Track Micro-Win
 * Record and celebrate small achievements for confidence building
 */

const BeginnerModeEngine = require('../../lib/beginner-mode-engine');
const engine = new BeginnerModeEngine();

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed. Use POST.'
            });
        }
        
        const { userId, type, data } = req.body;
        
        if (!userId || !type) {
            return res.status(400).json({
                success: false,
                error: 'userId and type are required'
            });
        }
        
        // Track the micro-win
        const win = engine.trackMicroWin(userId, type, data);
        
        if (!win) {
            return res.status(400).json({
                success: false,
                error: 'Invalid micro-win type'
            });
        }
        
        res.json({
            success: true,
            win: win,
            message: win.message,
            xpEarned: win.xp,
            totalXP: win.totalXP
        });
    } catch (error) {
        console.error('Error tracking micro-win:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track micro-win',
            message: error.message
        });
    }
};

