// 🎯 SWIPE-BASED PLACEMENT TEST API
// Backend logic for adaptive word selection and level calculation

const express = require('express');
const router = express.Router();

// Word frequency database (matches frontend)
const wordDatabase = {
    ultraBeginner: [
        { word: 'hola', rank: 1, translation: 'hello', frequency: 'ultra-high' },
        { word: 'sí', rank: 2, translation: 'yes', frequency: 'ultra-high' },
        { word: 'no', rank: 3, translation: 'no', frequency: 'ultra-high' },
        { word: 'qué', rank: 5, translation: 'what', frequency: 'ultra-high' },
        { word: 'yo', rank: 8, translation: 'I', frequency: 'ultra-high' },
        { word: 'tú', rank: 10, translation: 'you', frequency: 'ultra-high' },
        { word: 'gracias', rank: 12, translation: 'thank you', frequency: 'ultra-high' },
        { word: 'adiós', rank: 15, translation: 'goodbye', frequency: 'ultra-high' },
        { word: 'cómo', rank: 18, translation: 'how', frequency: 'ultra-high' },
        { word: 'por favor', rank: 20, translation: 'please', frequency: 'ultra-high' }
    ],
    beginner: [
        { word: 'tiempo', rank: 45, translation: 'time/weather', frequency: 'high' },
        { word: 'día', rank: 52, translation: 'day', frequency: 'high' },
        { word: 'año', rank: 58, translation: 'year', frequency: 'high' },
        { word: 'persona', rank: 68, translation: 'person', frequency: 'high' },
        { word: 'casa', rank: 75, translation: 'house', frequency: 'high' },
        { word: 'mundo', rank: 82, translation: 'world', frequency: 'high' },
        { word: 'amigo', rank: 89, translation: 'friend', frequency: 'high' },
        { word: 'vida', rank: 95, translation: 'life', frequency: 'high' },
        { word: 'comida', rank: 102, translation: 'food', frequency: 'high' },
        { word: 'agua', rank: 115, translation: 'water', frequency: 'high' },
        { word: 'hablar', rank: 128, translation: 'to speak', frequency: 'high' },
        { word: 'comer', rank: 135, translation: 'to eat', frequency: 'high' }
    ],
    intermediate: [
        { word: 'mientras', rank: 245, translation: 'while', frequency: 'medium' },
        { word: 'además', rank: 267, translation: 'besides', frequency: 'medium' },
        { word: 'aunque', rank: 289, translation: 'although', frequency: 'medium' },
        { word: 'siguiente', rank: 312, translation: 'next', frequency: 'medium' },
        { word: 'anterior', rank: 356, translation: 'previous', frequency: 'medium' },
        { word: 'desarrollar', rank: 401, translation: 'to develop', frequency: 'medium' },
        { word: 'necesidad', rank: 445, translation: 'need', frequency: 'medium' },
        { word: 'importancia', rank: 478, translation: 'importance', frequency: 'medium' },
        { word: 'diferencia', rank: 502, translation: 'difference', frequency: 'medium' },
        { word: 'experiencia', rank: 534, translation: 'experience', frequency: 'medium' }
    ],
    advanced: [
        { word: 'perspectiva', rank: 856, translation: 'perspective', frequency: 'low' },
        { word: 'estrategia', rank: 912, translation: 'strategy', frequency: 'low' },
        { word: 'concepto', rank: 967, translation: 'concept', frequency: 'low' },
        { word: 'implementar', rank: 1023, translation: 'to implement', frequency: 'low' },
        { word: 'mediante', rank: 1089, translation: 'by means of', frequency: 'low' },
        { word: 'evidencia', rank: 1145, translation: 'evidence', frequency: 'low' },
        { word: 'análisis', rank: 1201, translation: 'analysis', frequency: 'low' },
        { word: 'consecuencia', rank: 1267, translation: 'consequence', frequency: 'low' },
        { word: 'objetivo', rank: 1334, translation: 'objective', frequency: 'low' },
        { word: 'proceso', rank: 1401, translation: 'process', frequency: 'low' }
    ],
    expert: [
        { word: 'desenvolvimiento', rank: 2345, translation: 'development/unfolding', frequency: 'rare' },
        { word: 'idiosincrasia', rank: 2678, translation: 'idiosyncrasy', frequency: 'rare' },
        { word: 'paradigma', rank: 2912, translation: 'paradigm', frequency: 'rare' },
        { word: 'metamorfosis', rank: 3156, translation: 'metamorphosis', frequency: 'rare' },
        { word: 'yuxtaposición', rank: 3401, translation: 'juxtaposition', frequency: 'rare' },
        { word: 'epistemología', rank: 3678, translation: 'epistemology', frequency: 'rare' },
        { word: 'hermenéutica', rank: 3945, translation: 'hermeneutics', frequency: 'rare' },
        { word: 'cognoscitivo', rank: 4212, translation: 'cognitive', frequency: 'rare' },
        { word: 'idóneo', rank: 4489, translation: 'suitable', frequency: 'rare' },
        { word: 'menester', rank: 4756, translation: 'necessity', frequency: 'rare' }
    ]
};

// GET /api/assessment/words/:round
// Returns words for a specific round with adaptive difficulty
router.get('/words/:round', (req, res) => {
    try {
        const round = parseInt(req.params.round);
        const previousResults = req.query.results ? JSON.parse(req.query.results) : [];
        
        let words;
        
        if (round === 1) {
            // Round 1: Always ultra-beginner words
            words = selectRandomWords(wordDatabase.ultraBeginner, 5);
        } else {
            // Adaptive selection based on previous round performance
            const accuracy = calculateAccuracy(previousResults);
            words = selectAdaptiveWords(round, accuracy, previousResults);
        }
        
        res.json({
            success: true,
            round,
            words,
            totalWords: words.length
        });
    } catch (error) {
        console.error('Error getting assessment words:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/assessment/submit
// Submit test results and get level calculation
router.post('/submit', (req, res) => {
    try {
        const { wordResults } = req.body;
        
        if (!wordResults || !Array.isArray(wordResults)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid word results' 
            });
        }
        
        // Calculate user level
        const levelData = calculateLevelFromResults(wordResults);
        
        res.json({
            success: true,
            ...levelData
        });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/assessment/save
// Save assessment results to database (requires auth)
router.post('/save', async (req, res) => {
    try {
        const { userId, level, wordCount, duration, results } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'User ID required' 
            });
        }
        
        // Here you would save to your database
        // For now, just return success
        
        res.json({
            success: true,
            message: 'Assessment saved successfully',
            userId,
            level
        });
    } catch (error) {
        console.error('Error saving assessment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/assessment/retest
// Check if user is eligible for retest
router.get('/retest/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        
        // In a real app, check last test date and words learned
        // For now, always allow retest
        
        res.json({
            success: true,
            eligible: true,
            message: "You've learned enough! Time to see your progress.",
            wordsLearnedSinceLastTest: 127,
            daysSinceLastTest: 14
        });
    } catch (error) {
        console.error('Error checking retest eligibility:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper Functions

function selectRandomWords(category, count) {
    const shuffled = [...category].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, category.length));
}

function calculateAccuracy(results) {
    if (!results || results.length === 0) return 0;
    const correct = results.filter(r => r.known).length;
    return correct / results.length;
}

function selectAdaptiveWords(round, accuracy, previousResults) {
    let words;
    
    if (round === 2) {
        // After round 1: Adapt based on ultra-beginner performance
        if (accuracy >= 0.8) {
            // User knows basics well, jump to intermediate
            words = selectRandomWords(wordDatabase.intermediate, 5);
        } else if (accuracy >= 0.4) {
            // User knows some basics, go to beginner
            words = selectRandomWords(wordDatabase.beginner, 5);
        } else {
            // User struggling, mix ultra-beginner and beginner
            const ultraBeginner = selectRandomWords(wordDatabase.ultraBeginner, 3);
            const beginner = selectRandomWords(wordDatabase.beginner, 2);
            words = [...ultraBeginner, ...beginner];
        }
    } else if (round === 3) {
        // After round 2: Continue adapting
        if (accuracy >= 0.8) {
            // High accuracy, move to advanced
            words = selectRandomWords(wordDatabase.advanced, 5);
        } else if (accuracy >= 0.5) {
            // Medium accuracy, stay at intermediate
            words = selectRandomWords(wordDatabase.intermediate, 5);
        } else {
            // Low accuracy, back to beginner
            words = selectRandomWords(wordDatabase.beginner, 5);
        }
    } else if (round === 4) {
        // Final round: Test at detected level
        if (accuracy >= 0.8) {
            // Expert test
            words = selectRandomWords(wordDatabase.expert, 5);
        } else if (accuracy >= 0.6) {
            // Advanced confirmation
            words = selectRandomWords(wordDatabase.advanced, 5);
        } else {
            // Intermediate confirmation
            words = selectRandomWords(wordDatabase.intermediate, 5);
        }
    } else {
        // Fallback to intermediate
        words = selectRandomWords(wordDatabase.intermediate, 5);
    }
    
    return words;
}

function calculateLevelFromResults(wordResults) {
    // Analyze all results
    const totalWords = wordResults.length;
    const knownWords = wordResults.filter(r => r.known);
    const totalKnown = knownWords.length;
    const accuracy = totalKnown / totalWords;
    
    // Calculate average rank of known words
    const avgKnownRank = knownWords.length > 0 
        ? knownWords.reduce((sum, r) => sum + r.rank, 0) / knownWords.length 
        : 0;
    
    // Calculate highest rank known (important indicator)
    const highestKnownRank = knownWords.length > 0
        ? Math.max(...knownWords.map(r => r.rank))
        : 0;
    
    // Calculate speed metrics
    const speeds = wordResults.filter(r => r.speed > 0).map(r => r.speed);
    const avgSpeed = speeds.length > 0 
        ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length 
        : 3000;
    
    const fastSwipes = speeds.filter(s => s < 1000).length;
    const speedConfidence = speeds.length > 0 ? fastSwipes / speeds.length : 0;
    
    // Determine CEFR level with multiple factors
    let level, wordCount, frequencyRange, description, percentile, confidence;
    
    // Level determination logic (considers multiple factors)
    if (totalKnown <= 5 || avgKnownRank <= 20 || highestKnownRank < 100) {
        // Complete beginner
        level = 'A1';
        wordCount = 100;
        frequencyRange = '1-500';
        description = "You're just starting! Perfect - we'll build your foundation with the most common everyday words.";
        percentile = 25;
    } else if (totalKnown <= 8 || avgKnownRank <= 100 || highestKnownRank < 400) {
        // Elementary
        level = 'A2';
        wordCount = 300;
        frequencyRange = '1-1000';
        description = "You know the basics! You can handle simple conversations and understand common phrases.";
        percentile = 40;
    } else if (totalKnown <= 12 || avgKnownRank <= 400 || highestKnownRank < 1200) {
        // Intermediate
        level = 'B1';
        wordCount = 800;
        frequencyRange = '1-2000';
        description = "You're comfortable with Spanish! You can handle most everyday situations and understand native content.";
        percentile = 65;
    } else if (totalKnown <= 16 || avgKnownRank <= 1200 || highestKnownRank < 2500) {
        // Upper Intermediate
        level = 'B2';
        wordCount = 2000;
        frequencyRange = '1-4000';
        description = "You're fluent! You understand complex topics, nuances, and can express yourself naturally.";
        percentile = 82;
    } else {
        // Advanced
        level = 'C1';
        wordCount = 5000;
        frequencyRange = '1-8000';
        description = "You're advanced! You understand sophisticated Spanish and can handle academic or professional contexts.";
        percentile = 95;
    }
    
    // Fine-tune with speed confidence
    if (speedConfidence > 0.7) {
        confidence = 'Very High';
    } else if (speedConfidence > 0.5) {
        confidence = 'High';
    } else if (speedConfidence > 0.3) {
        confidence = 'Medium';
    } else {
        confidence = 'Growing';
    }
    
    return {
        level,
        wordCount,
        frequencyRange,
        description,
        percentile,
        confidence,
        accuracy: Math.round(accuracy * 100),
        avgSpeed: Math.round(avgSpeed),
        totalWords,
        knownWords: totalKnown,
        avgKnownRank: Math.round(avgKnownRank)
    };
}

// Export analytics for improvement
function getTestAnalytics(wordResults) {
    const rounds = {};
    
    wordResults.forEach(result => {
        if (!rounds[result.round]) {
            rounds[result.round] = {
                total: 0,
                known: 0,
                unknown: 0,
                avgSpeed: 0,
                words: []
            };
        }
        
        rounds[result.round].total++;
        if (result.known) {
            rounds[result.round].known++;
        } else {
            rounds[result.round].unknown++;
        }
        rounds[result.round].words.push(result);
    });
    
    return rounds;
}

module.exports = router;

