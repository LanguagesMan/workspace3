/**
 * 🔍 RESEARCH API
 * 
 * AI-powered research using Perplexity
 */

const express = require('express');
const router = express.Router();
const perplexityResearch = require('../lib/perplexity-research');

/**
 * POST /api/research/topic
 * Research a Spanish learning topic
 */
router.post('/topic', async (req, res) => {
    try {
        const { topic, level = 'B1' } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                error: 'Topic is required'
            });
        }

        const result = await perplexityResearch.researchSpanishTopic(topic, level);
        res.json(result);

    } catch (error) {
        console.error('Error researching topic:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/research/news
 * Research Spanish news
 */
router.post('/news', async (req, res) => {
    try {
        const { country = 'Spain', level = 'B1' } = req.body;

        const result = await perplexityResearch.researchSpanishNews(country, level);
        res.json(result);

    } catch (error) {
        console.error('Error researching news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/research/culture
 * Research Spanish culture
 */
router.post('/culture', async (req, res) => {
    try {
        const { topic, country = 'Spain' } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                error: 'Topic is required'
            });
        }

        const result = await perplexityResearch.researchSpanishCulture(topic, country);
        res.json(result);

    } catch (error) {
        console.error('Error researching culture:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/research/grammar
 * Research Spanish grammar
 */
router.post('/grammar', async (req, res) => {
    try {
        const { grammarPoint, level = 'B1' } = req.body;

        if (!grammarPoint) {
            return res.status(400).json({
                success: false,
                error: 'Grammar point is required'
            });
        }

        const result = await perplexityResearch.researchSpanishGrammar(grammarPoint, level);
        res.json(result);

    } catch (error) {
        console.error('Error researching grammar:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

