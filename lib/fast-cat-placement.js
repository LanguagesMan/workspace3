// 🎯 FastCAT Quick - 60-second Spanish placement test
// Uses frequency bands to estimate CEFR level and known vocabulary

class FastCATPlacement {
    constructor() {
        // 12 carefully selected words across frequency bands
        // Based on Spanish frequency lists (SUBTLEX-ESP)
        this.testWords = [
            // Band 1: Top 500 (A1)
            { word: 'hola', band: 1, cefr: 'A1', translation: 'hello' },
            { word: 'gracias', band: 1, cefr: 'A1', translation: 'thank you' },

            // Band 2: 500-1500 (A2)
            { word: 'necesitar', band: 2, cefr: 'A2', translation: 'to need' },
            { word: 'todavía', band: 2, cefr: 'A2', translation: 'still/yet' },

            // Band 3: 1500-3000 (B1)
            { word: 'aunque', band: 3, cefr: 'B1', translation: 'although' },
            { word: 'desarrollar', band: 3, cefr: 'B1', translation: 'to develop' },

            // Band 4: 3000-5000 (B2)
            { word: 'pertenecer', band: 4, cefr: 'B2', translation: 'to belong' },
            { word: 'asumir', band: 4, cefr: 'B2', translation: 'to assume' },

            // Band 5: 5000-8000 (C1)
            { word: 'subyacente', band: 5, cefr: 'C1', translation: 'underlying' },
            { word: 'ambiguo', band: 5, cefr: 'C1', translation: 'ambiguous' },

            // Band 6: 8000+ (C2)
            { word: 'menoscabar', band: 6, cefr: 'C2', translation: 'to undermine' },
            { word: 'consabido', band: 6, cefr: 'C2', translation: 'aforementioned' }
        ];
    }

    /**
     * Get test words for assessment
     * @returns {array} Array of test items
     */
    getTestWords() {
        return this.testWords.map((item, index) => ({
            id: `word-${index}`,
            ...item
        }));
    }

    /**
     * Score test results and estimate CEFR + known words
     * @param {array} responses - Array of {wordId, known: true/false}
     * @returns {object} { cefrLevel, knownWords, confidence, coverageByBand }
     */
    scoreTest(responses) {
        // Count correct by band
        const bandScores = {};
        const knownWords = [];

        responses.forEach(response => {
            const testItem = this.testWords.find(w => `word-${this.testWords.indexOf(w)}` === response.wordId);
            if (!testItem) return;

            const band = testItem.band;
            if (!bandScores[band]) {
                bandScores[band] = { known: 0, total: 0 };
            }

            bandScores[band].total++;
            if (response.known) {
                bandScores[band].known++;
                knownWords.push(testItem.word);
            }
        });

        // Determine CEFR level based on highest band where user knows 70%+
        let cefrLevel = 'A1';
        let highestBand = 0;

        for (let band = 1; band <= 6; band++) {
            if (bandScores[band]) {
                const percentage = bandScores[band].known / bandScores[band].total;
                if (percentage >= 0.7) { // 70% threshold
                    highestBand = band;
                }
            }
        }

        // Map band to CEFR
        const bandToCEFR = {
            0: 'A1',
            1: 'A1',
            2: 'A2',
            3: 'B1',
            4: 'B2',
            5: 'C1',
            6: 'C2'
        };
        cefrLevel = bandToCEFR[highestBand] || 'A1';

        // Calculate confidence based on consistency
        const totalResponses = responses.length;
        const confidence = totalResponses >= 10 ? 'high' : (totalResponses >= 6 ? 'medium' : 'low');

        // Estimate total known vocabulary based on band
        // Research shows: knowing top 1000 words = ~75% comprehension of everyday Spanish
        const estimatedVocabSize = this.estimateVocabSize(highestBand, bandScores);

        // Generate coverage curve by band (for feed ranker)
        const coverageByBand = {};
        for (let band = 1; band <= 6; band++) {
            if (bandScores[band]) {
                coverageByBand[`band${band}`] = bandScores[band].known / bandScores[band].total;
            } else {
                // Estimate for untested bands
                coverageByBand[`band${band}`] = band <= highestBand ? 0.8 : 0.2;
            }
        }

        return {
            cefrLevel,
            knownWords,
            estimatedVocabSize,
            confidence,
            coverageByBand,
            bandScores,
            highestBand
        };
    }

    /**
     * Estimate total vocabulary size based on band performance
     */
    estimateVocabSize(highestBand, bandScores) {
        // Conservative estimates based on frequency research
        const bandSizes = {
            1: 500,   // Top 500 words
            2: 1500,  // 500-1500
            3: 3000,  // 1500-3000
            4: 5000,  // 3000-5000
            5: 8000,  // 5000-8000
            6: 12000  // 8000+
        };

        let estimated = 0;
        for (let band = 1; band <= highestBand; band++) {
            if (bandScores[band]) {
                const percentage = bandScores[band].known / bandScores[band].total;
                estimated += bandSizes[band] * percentage;
            } else {
                estimated += bandSizes[band] * 0.7; // Assume 70% for passed bands
            }
        }

        return Math.round(estimated);
    }

    /**
     * Generate word list to seed user's known words
     * Based on CEFR level, return top N frequency words
     */
    generateKnownWordsList(cefrLevel) {
        // This is a starter set - in production, use full frequency list
        const wordsByLevel = {
            'A1': ['hola', 'gracias', 'por', 'favor', 'sí', 'no', 'buenos', 'días', 'adiós', 'bien'],
            'A2': ['necesitar', 'todavía', 'siempre', 'nunca', 'algo', 'nada', 'alguien', 'nadie', 'muy', 'poco'],
            'B1': ['aunque', 'desarrollar', 'conseguir', 'intentar', 'lograr', 'mejorar', 'cambiar', 'decidir'],
            'B2': ['pertenecer', 'asumir', 'plantear', 'destacar', 'comprobar', 'analizar', 'evaluar'],
            'C1': ['subyacente', 'ambiguo', 'implícito', 'inherente', 'predominante', 'sustancial'],
            'C2': ['menoscabar', 'consabido', 'inexorable', 'ubicuo', 'prístino', 'efímero']
        };

        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levels.indexOf(cefrLevel);

        let knownWords = [];
        for (let i = 0; i <= userLevelIndex; i++) {
            knownWords = [...knownWords, ...wordsByLevel[levels[i]]];
        }

        return knownWords;
    }
}

module.exports = new FastCATPlacement();
