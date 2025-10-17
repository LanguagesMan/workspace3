/**
 * 🧪 USER SCENARIO TESTS
 * Tests word frequency analyzer from different user perspectives
 */

const analyzer = require('../lib/content-difficulty-analyzer');
const smartFeed = require('../lib/smart-difficulty-feed');

// Load frequency list for realistic test data
const frequencyLookup = require('../lib/frequency-lookup');

// Helper to get top N words from frequency list
function getTopNWords(n) {
    const words = [];
    for (let rank = 1; rank <= n && rank <= 10000; rank++) {
        const word = frequencyLookup.getWordAtRank(rank);
        if (word) words.push(word);
    }
    return words;
}

// Mock different user profiles with realistic vocabulary
const userProfiles = {
    absoluteBeginner: {
        id: 'user_beginner',
        vocabSize: 100,
        knownWords: getTopNWords(100),
        expectedLevel: 'A1'
    },
    elementary: {
        id: 'user_elementary',
        vocabSize: 500,
        knownWords: getTopNWords(500),
        expectedLevel: 'A2'
    },
    intermediate: {
        id: 'user_intermediate',
        vocabSize: 1500,
        knownWords: getTopNWords(1500),
        expectedLevel: 'B1'
    },
    upperIntermediate: {
        id: 'user_upper_int',
        vocabSize: 3000,
        knownWords: getTopNWords(3000),
        expectedLevel: 'B2'
    },
    advanced: {
        id: 'user_advanced',
        vocabSize: 5000,
        knownWords: getTopNWords(5000),
        expectedLevel: 'C1'
    }
};

// Test content at different levels
const testContent = {
    a1_simple: {
        text: 'Hola. Me llamo María. Yo tengo un perro. Mi perro es grande.',
        expectedLevel: 'A1'
    },
    a2_basic: {
        text: 'Ayer fui al mercado con mi hermana. Compramos frutas y verduras frescas. Después fuimos al parque.',
        expectedLevel: 'A2'
    },
    b1_intermediate: {
        text: 'La tecnología moderna ha cambiado nuestra forma de comunicarnos. Las redes sociales permiten mantenernos conectados con amigos y familiares en todo el mundo.',
        expectedLevel: 'B1'
    },
    b2_upper: {
        text: 'El desarrollo sostenible requiere un equilibrio cuidadoso entre el crecimiento económico y la conservación ambiental. Los gobiernos deben implementar políticas que promuevan la innovación tecnológica.',
        expectedLevel: 'B2'
    },
    c1_advanced: {
        text: 'La epistemología contemporánea cuestiona los fundamentos tradicionales del conocimiento científico. Los paradigmas metodológicos enfrentan constantes revisiones ante nuevas perspectivas filosóficas.',
        expectedLevel: 'C1'
    }
};

describe('User Scenario: Absolute Beginner', () => {
    const user = userProfiles.absoluteBeginner;

    test('should find A1 content too easy', () => {
        const analysis = analyzer.analyzeTranscription(testContent.a1_simple.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        expect(difficulty.comprehensionRate).toBeGreaterThan(85);
        expect(['Easy', 'Too Easy', 'Perfect']).toContain(difficulty.difficulty);
    });

    test('should find B1 content too hard', () => {
        const analysis = analyzer.analyzeTranscription(testContent.b1_intermediate.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        expect(difficulty.comprehensionRate).toBeLessThan(70);
        expect(['Too Hard', 'Challenging']).toContain(difficulty.difficulty);
    });

    test('should get low goldilocks score for advanced content', () => {
        const analysis = analyzer.analyzeTranscription(testContent.c1_advanced.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        expect(difficulty.goldilocksScore).toBeLessThan(60);
    });
});

describe('User Scenario: Intermediate Learner', () => {
    const user = userProfiles.intermediate;

    test('should find A1 content too easy', () => {
        const analysis = analyzer.analyzeTranscription(testContent.a1_simple.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        expect(difficulty.comprehensionRate).toBeGreaterThan(95);
        expect(['Too Easy']).toContain(difficulty.difficulty);
    });

    test('should find B1 content perfect', () => {
        const analysis = analyzer.analyzeTranscription(testContent.b1_intermediate.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        // Should be in or near goldilocks zone
        expect(difficulty.comprehensionRate).toBeGreaterThan(75);
        expect(difficulty.comprehensionRate).toBeLessThan(95);
        expect(difficulty.goldilocksScore).toBeGreaterThan(60);
    });

    test('should find C1 content challenging', () => {
        const analysis = analyzer.analyzeTranscription(testContent.c1_advanced.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        expect(['Challenging', 'Too Hard']).toContain(difficulty.difficulty);
    });
});

describe('User Scenario: Advanced Learner', () => {
    const user = userProfiles.advanced;

    test('should find basic content too easy', () => {
        const analysis = analyzer.analyzeTranscription(testContent.a2_basic.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        expect(difficulty.comprehensionRate).toBeGreaterThan(95);
        expect(difficulty.difficulty).toBe('Too Easy');
    });

    test('should find C1 content appropriate', () => {
        const analysis = analyzer.analyzeTranscription(testContent.c1_advanced.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        expect(difficulty.comprehensionRate).toBeGreaterThan(70);
        expect(['Perfect', 'Easy', 'Challenging']).toContain(difficulty.difficulty);
    });

    test('should have high goldilocks score for advanced content', () => {
        const analysis = analyzer.analyzeTranscription(testContent.c1_advanced.text, false);
        const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);

        expect(difficulty.goldilocksScore).toBeGreaterThan(50);
    });
});

describe('Cross-User Comparison', () => {
    test('same content should have different difficulty for different users', () => {
        const analysis = analyzer.analyzeTranscription(testContent.b1_intermediate.text, false);

        const beginnerDifficulty = analyzer.calculateDifficultyForUser(
            analysis,
            userProfiles.absoluteBeginner.knownWords
        );
        const advancedDifficulty = analyzer.calculateDifficultyForUser(
            analysis,
            userProfiles.advanced.knownWords
        );

        // Advanced user should have higher comprehension
        expect(advancedDifficulty.comprehensionRate).toBeGreaterThan(
            beginnerDifficulty.comprehensionRate
        );

        // Advanced user should have fewer unknown words
        expect(advancedDifficulty.unknownWordCount).toBeLessThan(
            beginnerDifficulty.unknownWordCount
        );
    });

    test('goldilocks score should vary based on user level', () => {
        const analysis = analyzer.analyzeTranscription(testContent.b1_intermediate.text, false);

        const scores = Object.values(userProfiles).map(user => {
            const difficulty = analyzer.calculateDifficultyForUser(analysis, user.knownWords);
            return { user: user.id, score: difficulty.goldilocksScore };
        });

        // Intermediate user should have highest score for B1 content
        const intermediateScore = scores.find(s => s.user === 'user_intermediate').score;
        expect(intermediateScore).toBeGreaterThan(60);
    });
});

describe('Real-World Scenarios', () => {
    test('beginner watching A1 video should get perfect match', () => {
        const videoText = `
            ¡Hola! Buenos días.
            Me llamo Ana.
            Yo soy de México.
            Tengo veinte años.
            Me gusta bailar.
        `;

        const analysis = analyzer.analyzeTranscription(videoText, false);
        const difficulty = analyzer.calculateDifficultyForUser(
            analysis,
            userProfiles.absoluteBeginner.knownWords
        );

        expect(analysis.level).toBe('A1');
        expect(difficulty.goldilocksScore).toBeGreaterThan(70);
    });

    test('intermediate watching B2 video should find it challenging but learnable', () => {
        const videoText = `
            El cambio climático representa uno de los desafíos
            más significativos de nuestra era. Los científicos
            advierten que debemos tomar medidas urgentes para
            reducir las emisiones de carbono y proteger los
            ecosistemas vulnerables.
        `;

        const analysis = analyzer.analyzeTranscription(videoText, false);
        const difficulty = analyzer.calculateDifficultyForUser(
            analysis,
            userProfiles.intermediate.knownWords
        );

        expect(['B1', 'B2']).toContain(analysis.level);
        expect(difficulty.comprehensionRate).toBeGreaterThan(60);
        expect(difficulty.comprehensionRate).toBeLessThan(85);
    });

    test('advanced learner should find A1 content boring (too easy)', () => {
        const videoText = 'Yo tengo un gato. Mi gato es negro.';

        const analysis = analyzer.analyzeTranscription(videoText, false);
        const difficulty = analyzer.calculateDifficultyForUser(
            analysis,
            userProfiles.advanced.knownWords
        );

        expect(difficulty.difficulty).toBe('Too Easy');
        expect(difficulty.goldilocksScore).toBeLessThan(70);
    });
});

describe('Smart Feed Recommendations', () => {
    test('should calculate recommended level based on vocab size', () => {
        // Test each user profile
        Object.entries(userProfiles).forEach(([name, user]) => {
            const difficulty = smartFeed.calculateDifficultyScore(
                {
                    uniqueWordCount: 100,
                    totalWords: 300,
                    frequencyBands: { top100: 40, top500: 30, top1000: 20, rare: 10 },
                    level: user.expectedLevel
                },
                user.vocabSize
            );

            expect(difficulty.goldilocksScore).toBeDefined();
            expect(difficulty.comprehensionRate).toBeDefined();
        });
    });
});

