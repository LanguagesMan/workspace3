/**
 * API: Get Beginner Curriculum
 * Returns structured learning path for absolute beginners
 */

const BeginnerModeEngine = require('../../lib/beginner-mode-engine');
const engine = new BeginnerModeEngine();

module.exports = async (req, res) => {
    try {
        const week = parseInt(req.query.week) || 1;
        
        const curriculum = engine.getBeginnerCurriculum(week);
        
        if (!curriculum) {
            return res.status(404).json({
                success: false,
                error: 'Curriculum not found for week ' + week
            });
        }
        
        res.json({
            success: true,
            curriculum: curriculum,
            message: `Week ${week} curriculum loaded`
        });
    } catch (error) {
        console.error('Error loading beginner curriculum:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load curriculum'
        });
    }
};

