/**
 * 🧪 WORD FREQUENCY ANALYZER - UNIT TESTS
 * Tests for content difficulty analysis system
 */

const analyzer = require('../lib/content-difficulty-analyzer');
const frequencyLookup = require('../lib/frequency-lookup');

describe('Word Frequency Analyzer', () => {
    
    describe('Frequency Lookup', () => {
        test('should return rank for common Spanish word', () => {
            const rank = frequencyLookup.getWordRank('de');
            expect(rank).toBe(1); // "de" is rank 1
        });

        test('should return null for unknown word', () => {
            const rank = frequencyLookup.getWordRank('xyzabc123');
            expect(rank).toBeNull();
        });

        test('should identify word in top100 band', () => {
            const isTop100 = frequencyLookup.isInBand('el', 'top100');
            expect(isTop100).toBe(true);
        });

        test('should return CEFR level for word', () => {
            const level = frequencyLookup.getCEFRLevel('que');
            expect(level).toBe('A1');
        });

        test('should get words by rank range', () => {
            const words = frequencyLookup.getWordsByRank(1, 10);
            expect(words.length).toBe(10);
        });
    });

    describe('Content Analysis', () => {
        test('should analyze simple A1 text', () => {
            const text = 'Hola. Me llamo Juan. Yo soy de España.';
            const result = analyzer.analyzeTranscription(text, false);
            
            expect(result.level).toBe('A1');
            expect(result.totalWords).toBeGreaterThan(0);
            expect(result.uniqueWordCount).toBeGreaterThan(0);
        });

        test('should analyze intermediate B1 text', () => {
            const text = `
                La situación económica ha cambiado significativamente.
                Los expertos consideran que el desarrollo sostenible
                es fundamental para el futuro de nuestra sociedad.
            `;
            const result = analyzer.analyzeTranscription(text, false);
            
            expect(['B1', 'B2']).toContain(result.level);
            expect(result.averageWordRank).toBeGreaterThan(1000);
        });

        test('should calculate frequency bands correctly', () => {
            const text = 'el la de que en y a los se del';
            const result = analyzer.analyzeTranscription(text, false);
            
            expect(result.frequencyBands.top100).toBeGreaterThan(0);
        });

        test('should handle empty text gracefully', () => {
            const text = '';
            const result = analyzer.analyzeTranscription(text, false);
            
            expect(result).toBeDefined();
        });

        test('should calculate vocabulary density', () => {
            const text = 'hola hola mundo mundo mundo';
            const result = analyzer.analyzeTranscription(text, false);
            
            // 2 unique words / 5 total words = 0.4
            expect(result.vocabularyDensity).toBeLessThan(1);
            expect(result.vocabularyDensity).toBeGreaterThan(0);
        });
    });

    describe('User-Specific Difficulty', () => {
        test('should calculate difficulty for beginner user', () => {
            const contentAnalysis = {
                uniqueWordCount: 100,
                totalWords: 300,
                frequencyBands: {
                    top100: 50,
                    top500: 30,
                    top1000: 15,
                    rare: 5
                },
                level: 'A2'
            };
            
            const beginnerWords = Array(200).fill(''); // Knows 200 words
            const result = analyzer.calculateDifficultyForUser(contentAnalysis, beginnerWords);
            
            expect(result.comprehensionRate).toBeGreaterThan(0);
            expect(result.comprehensionRate).toBeLessThanOrEqual(100);
            expect(result.goldilocksScore).toBeGreaterThanOrEqual(0);
            expect(result.goldilocksScore).toBeLessThanOrEqual(100);
            expect(['Too Easy', 'Easy', 'Perfect', 'Challenging', 'Too Hard']).toContain(result.difficulty);
        });

        test('should calculate difficulty for advanced user', () => {
            const contentAnalysis = {
                uniqueWordCount: 100,
                totalWords: 300,
                frequencyBands: {
                    top100: 30,
                    top500: 30,
                    top1000: 20,
                    rare: 20
                },
                level: 'B1'
            };
            
            const advancedWords = Array(2000).fill(''); // Knows 2000 words
            const result = analyzer.calculateDifficultyForUser(contentAnalysis, advancedWords);
            
            expect(result.comprehensionRate).toBeGreaterThan(60); // Should be high for advanced user
            expect(result.unknownWordCount).toBeLessThan(40); // Should have fewer unknown words
        });

        test('should give high goldilocks score for perfect match', () => {
            const contentAnalysis = {
                uniqueWordCount: 100,
                totalWords: 300,
                frequencyBands: {
                    top100: 40,
                    top500: 35,
                    top1000: 15,
                    rare: 10
                },
                level: 'A2'
            };
            
            // User knows exactly right amount for ~90% comprehension
            const userWords = Array(500).fill('');
            const result = analyzer.calculateDifficultyForUser(contentAnalysis, userWords);
            
            expect(result.goldilocksScore).toBeGreaterThan(70); // Should be good match
        });
    });

    describe('CEFR Level Assignment', () => {
        test('should assign A1 to very simple content', () => {
            const frequencyBands = {
                top100: 80,
                top500: 15,
                top1000: 3,
                rare: 2
            };
            const totalUnique = 100;
            const avgRank = 300;
            
            const level = analyzer.calculateCEFRLevel(frequencyBands, totalUnique, avgRank);
            expect(level).toBe('A1');
        });

        test('should assign C2 to complex content', () => {
            const frequencyBands = {
                top100: 10,
                top500: 20,
                top1000: 20,
                rare: 50
            };
            const totalUnique = 100;
            const avgRank = 8000;
            
            const level = analyzer.calculateCEFRLevel(frequencyBands, totalUnique, avgRank);
            expect(level).toBe('C2');
        });

        test('should assign intermediate levels correctly', () => {
            const frequencyBands = {
                top100: 30,
                top500: 35,
                top1000: 20,
                rare: 15
            };
            const totalUnique = 100;
            const avgRank = 1800;
            
            const level = analyzer.calculateCEFRLevel(frequencyBands, totalUnique, avgRank);
            expect(['B1', 'B2']).toContain(level);
        });
    });

    describe('SRT Parsing', () => {
        test('should extract words from SRT content', () => {
            const srt = `
1
00:00:01,000 --> 00:00:03,000
Hola, ¿cómo estás?

2
00:00:04,000 --> 00:00:06,000
¡Muy bien, gracias!
            `;
            
            const words = analyzer.extractWordsFromSRT(srt);
            expect(words.length).toBeGreaterThan(0);
            expect(words).toContain('hola');
            expect(words).toContain('cómo');
        });

        test('should handle punctuation in SRT', () => {
            const srt = '1\n00:00:01,000 --> 00:00:02,000\n¿Qué tal?';
            const words = analyzer.extractWordsFromSRT(srt);
            
            expect(words).toContain('qué');
            expect(words).toContain('tal');
            expect(words).not.toContain('¿');
        });
    });

    describe('Goldilocks Score Calculation', () => {
        test('should return high score for perfect comprehension (90%)', () => {
            const score = analyzer.calculateGoldilocksScore(0.90);
            expect(score).toBeGreaterThan(95);
        });

        test('should return lower score for too easy (98%)', () => {
            const score = analyzer.calculateGoldilocksScore(0.98);
            expect(score).toBeLessThan(95);
        });

        test('should return lower score for too hard (60%)', () => {
            const score = analyzer.calculateGoldilocksScore(0.60);
            expect(score).toBeLessThan(70);
        });

        test('should return score in valid range', () => {
            for (let comp = 0.5; comp <= 1.0; comp += 0.1) {
                const score = analyzer.calculateGoldilocksScore(comp);
                expect(score).toBeGreaterThanOrEqual(0);
                expect(score).toBeLessThanOrEqual(100);
            }
        });
    });
});

describe('Performance Tests', () => {
    test('should analyze content in under 100ms', () => {
        const text = `
            El desarrollo tecnológico ha transformado completamente
            nuestra forma de comunicarnos y trabajar. Las empresas
            modernas necesitan adaptarse constantemente a los cambios
            del mercado global.
        `.repeat(10); // Make it longer
        
        const start = Date.now();
        analyzer.analyzeTranscription(text, false);
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(100);
    });

    test('should lookup 1000 words in under 50ms', () => {
        const words = ['de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'se', 'del'];
        
        const start = Date.now();
        for (let i = 0; i < 100; i++) {
            words.forEach(word => frequencyLookup.getWordRank(word));
        }
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(50);
    });
});

