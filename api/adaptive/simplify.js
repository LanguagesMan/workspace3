/**
 * POST /api/adaptive/simplify
 * Simplify Spanish text to target level using GPT-4 or rule-based system
 */

const geniusAdaptive = require('../../lib/genius-adaptive-system');

// Simple in-memory cache (use Redis in production)
const simplificationCache = new Map();

module.exports = async (req, res) => {
  try {
    const { text, targetLevel = 'A2', useGPT = false } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }
    
    // Check cache first
    const cacheKey = `${text.substring(0, 100)}_${targetLevel}`;
    if (simplificationCache.has(cacheKey)) {
      const cached = simplificationCache.get(cacheKey);
      return res.json({
        ...cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Simplify content
    const result = await geniusAdaptive.simplifyContent(text, targetLevel);
    
    // Count words changed
    const originalWords = text.split(/\s+/);
    const simplifiedWords = result.simplified.split(/\s+/);
    let wordsChanged = 0;
    
    originalWords.forEach((word, i) => {
      if (simplifiedWords[i] && word.toLowerCase() !== simplifiedWords[i].toLowerCase()) {
        wordsChanged++;
      }
    });
    
    const response = {
      success: true,
      original: result.original,
      simplified: result.simplified,
      targetLevel,
      wordsChanged,
      percentageChanged: ((wordsChanged / originalWords.length) * 100).toFixed(1),
      method: result.method || 'rule-based',
      canToggle: true,
      timestamp: new Date().toISOString()
    };
    
    // Cache result (expire after 1 hour in production)
    simplificationCache.set(cacheKey, response);
    
    // Limit cache size (keep only last 100 items)
    if (simplificationCache.size > 100) {
      const firstKey = simplificationCache.keys().next().value;
      simplificationCache.delete(firstKey);
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error simplifying content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

