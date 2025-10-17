/**
 * GET /api/adaptive/perfect-content/:userId
 * Get content sorted by Goldilocks score (3-7 new words per item)
 */

const geniusAdaptive = require('../../lib/genius-adaptive-system');

module.exports = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, contentType } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    // In production, fetch actual content from database
    // For now, return mock data structure
    
    // Example: Fetch available content (replace with actual DB query)
    const availableContent = await getContentFromDatabase(contentType);
    
    // Score content using Goldilocks algorithm
    const goldilocksResult = geniusAdaptive.getGoldilocksContent(userId, availableContent);
    
    // Get beginner mode settings if applicable
    const beginnerMode = geniusAdaptive.getBeginnerModeSettings(userId);
    
    // Apply beginner protection filter
    let recommendedContent = goldilocksResult.recommended;
    if (beginnerMode.isBeginnerMode) {
      recommendedContent = recommendedContent.filter(c => 
        c.newWordCount <= beginnerMode.maxNewWordsPerItem
      );
    }
    
    // Limit results
    recommendedContent = recommendedContent.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      recommended: recommendedContent,
      challenging: goldilocksResult.challenging.slice(0, 5),
      tooEasy: goldilocksResult.tooEasy.slice(0, 5),
      beginnerMode: beginnerMode.isBeginnerMode,
      settings: beginnerMode,
      totalAvailable: availableContent.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting perfect content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Mock function - replace with actual database query
 */
async function getContentFromDatabase(contentType) {
  // This should query Supabase or your database
  // For now, return empty array
  return [];
}

