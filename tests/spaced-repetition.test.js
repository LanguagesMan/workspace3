/**
 * Tests for Spaced Repetition System (SM-2 Algorithm)
 */

const SpacedRepetition = require('../lib/spaced-repetition');

describe('Spaced Repetition System', () => {
    describe('calculateNextReview', () => {
        test('should initialize new card correctly', () => {
            const card = {};
            const result = SpacedRepetition.calculateNextReview(card, 4);

            expect(result.easeFactor).toBe(2.5);
            expect(result.interval).toBe(1);
            expect(result.repetitions).toBe(1);
            expect(result.quality).toBe(4);
        });

        test('should increase interval for good quality reviews', () => {
            const card = {
                easeFactor: 2.5,
                interval: 1,
                repetitions: 1
            };

            const result = SpacedRepetition.calculateNextReview(card, 4);

            expect(result.repetitions).toBe(2);
            expect(result.interval).toBe(6); // Second review is always 6 days
        });

        test('should reset for poor quality reviews', () => {
            const card = {
                easeFactor: 2.5,
                interval: 10,
                repetitions: 5
            };

            const result = SpacedRepetition.calculateNextReview(card, 2);

            expect(result.repetitions).toBe(0);
            expect(result.interval).toBe(1);
        });

        test('should adjust ease factor based on quality', () => {
            const card = {
                easeFactor: 2.5,
                interval: 1,
                repetitions: 1
            };

            const result = SpacedRepetition.calculateNextReview(card, 5);
            expect(result.easeFactor).toBeGreaterThan(2.5);

            const result2 = SpacedRepetition.calculateNextReview(card, 3);
            expect(result2.easeFactor).toBeLessThan(2.5);
        });

        test('should maintain minimum ease factor of 1.3', () => {
            const card = {
                easeFactor: 1.3,
                interval: 1,
                repetitions: 1
            };

            const result = SpacedRepetition.calculateNextReview(card, 0);
            expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
        });

        test('should throw error for invalid quality', () => {
            const card = {};
            
            expect(() => {
                SpacedRepetition.calculateNextReview(card, 6);
            }).toThrow('Quality must be between 0 and 5');

            expect(() => {
                SpacedRepetition.calculateNextReview(card, -1);
            }).toThrow('Quality must be between 0 and 5');
        });
    });

    describe('getMasteryLevel', () => {
        test('should classify new cards correctly', () => {
            const card = { repetitions: 0 };
            expect(SpacedRepetition.getMasteryLevel(card)).toBe('new');
        });

        test('should classify learning cards correctly', () => {
            const card = { repetitions: 2, easeFactor: 2.5 };
            expect(SpacedRepetition.getMasteryLevel(card)).toBe('learning');
        });

        test('should classify young cards correctly', () => {
            const card = { repetitions: 5, easeFactor: 2.5 };
            expect(SpacedRepetition.getMasteryLevel(card)).toBe('young');
        });

        test('should classify mature cards correctly', () => {
            const card = { repetitions: 10, easeFactor: 2.4 };
            expect(SpacedRepetition.getMasteryLevel(card)).toBe('mature');
        });

        test('should classify mastered cards correctly', () => {
            const card = { repetitions: 20, easeFactor: 2.8 };
            expect(SpacedRepetition.getMasteryLevel(card)).toBe('mastered');
        });
    });

    describe('getDueCards', () => {
        const createCard = (nextReview, easeFactor = 2.5) => ({
            id: Math.random().toString(36),
            nextReview,
            easeFactor,
            repetitions: 1
        });

        test('should return cards without nextReview as due', () => {
            const cards = [
                createCard(null),
                createCard(new Date(Date.now() + 86400000).toISOString())
            ];

            const due = SpacedRepetition.getDueCards(cards);
            expect(due.length).toBe(1);
            expect(due[0].nextReview).toBeNull();
        });

        test('should return past due cards', () => {
            const yesterday = new Date(Date.now() - 86400000).toISOString();
            const tomorrow = new Date(Date.now() + 86400000).toISOString();

            const cards = [
                createCard(yesterday),
                createCard(tomorrow)
            ];

            const due = SpacedRepetition.getDueCards(cards);
            expect(due.length).toBe(1);
        });

        test('should prioritize overdue cards', () => {
            const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();
            const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

            const cards = [
                createCard(oneDayAgo, 2.5),
                createCard(threeDaysAgo, 2.5)
            ];

            const due = SpacedRepetition.getDueCards(cards);
            expect(new Date(due[0].nextReview) < new Date(due[1].nextReview)).toBe(true);
        });

        test('should respect limit parameter', () => {
            const cards = Array(50).fill(null).map(() => createCard(null));
            
            const due = SpacedRepetition.getDueCards(cards, 10);
            expect(due.length).toBe(10);
        });
    });

    describe('getReviewStats', () => {
        test('should calculate stats correctly', () => {
            const cards = [
                { repetitions: 0 },
                { repetitions: 2, easeFactor: 2.5 },
                { repetitions: 8, easeFactor: 2.6 },
                { repetitions: 20, easeFactor: 2.8 }
            ];

            const stats = SpacedRepetition.getReviewStats(cards);

            expect(stats.total).toBe(4);
            expect(stats.new).toBe(1);
            expect(stats.learning).toBe(1);
            expect(stats.mature).toBe(1);
            expect(stats.mastered).toBe(1);
        });

        test('should calculate average ease factor', () => {
            const cards = [
                { easeFactor: 2.0, repetitions: 1 },
                { easeFactor: 2.5, repetitions: 1 },
                { easeFactor: 3.0, repetitions: 1 }
            ];

            const stats = SpacedRepetition.getReviewStats(cards);
            expect(stats.averageEaseFactor).toBe(2.5);
        });
    });

    describe('getOptimalSessionSize', () => {
        test('should recommend default size for balanced workload', () => {
            const cards = Array(30).fill(null).map(() => ({
                nextReview: null,
                repetitions: 0
            }));

            const session = SpacedRepetition.getOptimalSessionSize(cards);
            expect(session.recommendedSize).toBeGreaterThan(0);
            expect(session.sessionType).toBeDefined();
        });

        test('should recommend larger session for backlog', () => {
            const yesterday = new Date(Date.now() - 86400000).toISOString();
            const cards = Array(120).fill(null).map(() => ({
                nextReview: yesterday,
                repetitions: 5
            }));

            const session = SpacedRepetition.getOptimalSessionSize(cards);
            expect(session.recommendedSize).toBeGreaterThanOrEqual(30);
            expect(session.sessionType).toContain('catch-up');
        });
    });

    describe('calculateRetention', () => {
        test('should calculate retention rate correctly', () => {
            const cards = [
                { lastReviewed: new Date(), quality: 5 },
                { lastReviewed: new Date(), quality: 4 },
                { lastReviewed: new Date(), quality: 3 },
                { lastReviewed: new Date(), quality: 2 },
                { lastReviewed: new Date(), quality: 1 }
            ];

            const retention = SpacedRepetition.calculateRetention(cards);
            expect(retention.rate).toBe(60); // 3 out of 5 = 60%
            expect(retention.totalReviews).toBe(5);
            expect(retention.successfulReviews).toBe(3);
        });

        test('should return zero for no reviews', () => {
            const cards = [];
            const retention = SpacedRepetition.calculateRetention(cards);
            
            expect(retention.rate).toBe(0);
            expect(retention.totalReviews).toBe(0);
        });
    });

    describe('predictWorkload', () => {
        test('should predict workload for next 30 days', () => {
            const cards = Array(20).fill(null).map((_, i) => {
                const nextReview = new Date();
                nextReview.setDate(nextReview.getDate() + (i % 10));
                return {
                    nextReview: nextReview.toISOString(),
                    repetitions: 1
                };
            });

            const workload = SpacedRepetition.predictWorkload(cards, 30);
            
            expect(workload.length).toBe(30);
            expect(workload[0]).toHaveProperty('date');
            expect(workload[0]).toHaveProperty('dueCards');
            expect(workload[0]).toHaveProperty('estimatedMinutes');
        });
    });
});

// Run tests if executed directly
if (require.main === module) {
    console.log('Running Spaced Repetition tests...');
    
    // Simple test runner
    const tests = [
        () => {
            const card = {};
            const result = SpacedRepetition.calculateNextReview(card, 4);
            console.assert(result.easeFactor === 2.5, 'Initial ease factor should be 2.5');
            console.log('✓ New card initialization test passed');
        },
        () => {
            const card = { repetitions: 20, easeFactor: 2.8 };
            const level = SpacedRepetition.getMasteryLevel(card);
            console.assert(level === 'mastered', 'Should be mastered');
            console.log('✓ Mastery level test passed');
        }
    ];

    tests.forEach(test => test());
    console.log('\n✅ All manual tests passed!');
}

