/**
 * 🎙️ ARTICLE AUDIO GENERATION API
 * 
 * Endpoint: GET /api/articles/audio
 * 
 * Generates professional audio narration for articles
 * Supports multiple voices, speeds, and caching
 */

const TextToSpeechEngine = require('../../lib/text-to-speech-engine');

const ttsEngine = new TextToSpeechEngine();

module.exports = async (req, res) => {
    try {
        const {
            articleId,
            text,
            voice = 'spain_female',
            speed = 1.0,
            format = 'mp3',
            cache = 'true'
        } = req.query;

        // Validation
        if (!text && !articleId) {
            return res.status(400).json({
                success: false,
                error: 'Either text or articleId is required'
            });
        }

        // Get article text if articleId provided
        let articleText = text;
        if (articleId && !text) {
            // TODO: Fetch article from database
            articleText = await getArticleText(articleId);
        }

        if (!articleText) {
            return res.status(404).json({
                success: false,
                error: 'Article not found or text is empty'
            });
        }

        // Validate voice
        const availableVoices = Object.values(ttsEngine.getAvailableVoices()).flat();
        const voiceIds = availableVoices.map(v => v.id);
        if (!voiceIds.includes(voice)) {
            return res.status(400).json({
                success: false,
                error: `Invalid voice. Available: ${voiceIds.join(', ')}`
            });
        }

        // Validate speed
        const speedNum = parseFloat(speed);
        if (isNaN(speedNum) || speedNum < 0.5 || speedNum > 1.5) {
            return res.status(400).json({
                success: false,
                error: 'Speed must be between 0.5 and 1.5'
            });
        }

        // Generate audio
        console.log(`🎙️ Generating audio for article ${articleId || 'custom'}`);
        console.log(`   Voice: ${voice}, Speed: ${speedNum}x`);
        
        const audioData = await ttsEngine.generateAudio(articleText, {
            voice: voice,
            speed: speedNum,
            format: format,
            useCache: cache === 'true'
        });

        // Return audio data
        res.json({
            success: true,
            audio: audioData,
            metadata: {
                articleId: articleId,
                voice: voice,
                speed: speedNum,
                duration: audioData.duration,
                provider: audioData.provider,
                sentenceCount: audioData.sentences.length,
                cached: !!audioData.cached
            }
        });

    } catch (error) {
        console.error('❌ Audio generation error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to generate audio',
            message: error.message,
            fallback: {
                provider: 'browser',
                text: req.query.text,
                voice: req.query.voice || 'spain_female'
            }
        });
    }
};

/**
 * Helper function to get article text from database
 */
async function getArticleText(articleId) {
    // This would integrate with your actual database
    // For now, return mock data
    try {
        // TODO: Implement actual database lookup
        // const article = await db.articles.findById(articleId);
        // return article.content;
        
        return null; // Return null to use text parameter instead
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

