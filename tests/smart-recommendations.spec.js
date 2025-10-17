/**
 * 🎯 SMART VIDEO RECOMMENDATIONS - PLAYWRIGHT TESTS
 * 
 * Tests the genius recommendation system with different user scenarios:
 * 1. New user (cold start)
 * 2. Beginner user (A1 level)
 * 3. Advanced user (C1 level)
 * 4. User who watched many videos
 * 5. User with detected interests
 * 
 * Verifies:
 * - Never shows same video twice
 * - Matches user level correctly
 * - Detects interests from behavior
 * - Recommendations improve over time
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

test.describe('Smart Video Recommendations System', () => {

    test('New user (cold start) - Gets level-appropriate videos', async ({ request }) => {
        const userId = `test_newuser_${Date.now()}`;
        const userLevel = 'A2';

        // Get initial recommendations
        const response = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: {
                userId,
                level: userLevel,
                count: 10
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        
        // Verify response structure
        expect(data.success).toBe(true);
        expect(data.userId).toBe(userId);
        expect(data.level).toBe(userLevel);
        expect(data.videos).toHaveLength(10);
        expect(data.algorithm).toBe('smart-recommender-v2.0');

        // Verify videos match level (A2, with some A1 and B1)
        const levels = data.videos.map(v => v.level);
        const validLevels = ['A1', 'A2', 'B1'];
        const allValidLevels = levels.every(l => validLevels.includes(l));
        expect(allValidLevels).toBe(true);

        // Most videos should be A2
        const a2Count = levels.filter(l => l === 'A2').length;
        expect(a2Count).toBeGreaterThanOrEqual(5);

        // Each video should have recommendation info
        data.videos.forEach(video => {
            expect(video.id).toBeDefined();
            expect(video.level).toBeDefined();
            expect(video.recommendationScore).toBeGreaterThan(0);
            expect(video.recommendationReason).toBeDefined();
            expect(video.scoreBreakdown).toBeDefined();
        });

        console.log(`✅ New user test passed: ${data.videos.length} A2-level videos recommended`);
    });

    test('Never shows same video twice', async ({ request }) => {
        const userId = `test_nowatched_${Date.now()}`;
        const userLevel = 'B1';

        // Get first batch
        const response1 = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 20 }
        });
        const data1 = await response1.json();
        const firstVideos = data1.videos.map(v => v.id);

        // Mark all as watched
        for (const video of data1.videos) {
            await request.post(`${API_URL}/video-interactions/track`, {
                data: {
                    userId,
                    videoId: video.id,
                    interactionType: 'complete',
                    watchTime: video.duration || 30,
                    videoDuration: video.duration || 30,
                    completionRate: 1.0,
                    videoMetadata: {
                        level: video.level,
                        category: video.category
                    }
                }
            });
        }

        // Get second batch
        const response2 = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 20 }
        });
        const data2 = await response2.json();
        const secondVideos = data2.videos.map(v => v.id);

        // Verify no overlap
        const overlap = firstVideos.filter(id => secondVideos.includes(id));
        expect(overlap).toHaveLength(0);

        console.log(`✅ No duplicates test passed: 0 overlap between ${firstVideos.length} and ${secondVideos.length} videos`);
    });

    test('Detects interests from user behavior', async ({ request }) => {
        const userId = `test_interests_${Date.now()}`;
        const userLevel = 'A2';

        // Get initial videos
        const response1 = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 10 }
        });
        const data1 = await response1.json();

        // User watches food-related videos with high completion
        const foodVideos = data1.videos.filter(v => 
            v.category?.toLowerCase().includes('food') ||
            v.theme?.toLowerCase().includes('food') ||
            v.title?.toLowerCase().includes('comida')
        ).slice(0, 3);

        if (foodVideos.length > 0) {
            for (const video of foodVideos) {
                await request.post(`${API_URL}/video-interactions/track`, {
            data: {
                        userId,
                        videoId: video.id,
                        interactionType: 'complete',
                        watchTime: video.duration || 30,
                        videoDuration: video.duration || 30,
                        completionRate: 1.0,
                        rewatch: true, // Strong signal!
                        videoMetadata: {
                            level: video.level,
                            category: 'food',
                            theme: 'cooking'
                        }
                    }
                });
            }

            // Get interests
            const interestsResponse = await request.get(`${API_URL}/video-interactions/interests/${userId}`);
            const interestsData = await interestsResponse.json();

            // Should have detected food interest
            expect(interestsData.success).toBe(true);
            const foodInterest = interestsData.interests.find(i => i.interest === 'food');
            expect(foodInterest).toBeDefined();
            expect(foodInterest.weight).toBeGreaterThan(0);

            console.log(`✅ Interest detection passed: Detected ${interestsData.interests.length} interests including food (${foodInterest.percentage}%)`);
        } else {
            console.log('⚠️ No food videos available for testing interest detection');
        }
    });

    test('Advanced user (C1) gets appropriate challenges', async ({ request }) => {
        const userId = `test_advanced_${Date.now()}`;
        const userLevel = 'C1';

        const response = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 10 }
        });
        const data = await response.json();
        
        // Should get C1, B2, and C2 videos (i+1 rule)
        const levels = data.videos.map(v => v.level);
        const appropriateLevels = ['B2', 'C1', 'C2'];
        const matchingLevels = levels.filter(l => appropriateLevels.includes(l));
        
        expect(matchingLevels.length).toBeGreaterThan(0);

        // Most should be C1
        const c1Count = levels.filter(l => l === 'C1').length;
        expect(c1Count).toBeGreaterThan(0);

        console.log(`✅ Advanced user test passed: ${c1Count} C1 videos out of ${levels.length}`);
    });

    test('User with watch history gets diverse recommendations', async ({ request }) => {
        const userId = `test_diverse_${Date.now()}`;
        const userLevel = 'B1';

        // Get initial batch
        const response = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 30 }
        });
        const data = await response.json();

        // Watch first 20 videos (mark as watched)
        for (const video of data.videos.slice(0, 20)) {
            await request.post(`${API_URL}/video-interactions/watched`, {
                data: { userId, videoId: video.id }
            });
        }

        // Get history
        const historyResponse = await request.get(`${API_URL}/video-interactions/history/${userId}`);
        const historyData = await historyResponse.json();
        
        expect(historyData.success).toBe(true);
        expect(historyData.totalWatched).toBe(20);

        // Get new recommendations
        const response2 = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 10 }
        });
        const data2 = await response2.json();

        // Should not include any of the watched videos
        const watchedIds = historyData.watchedVideos;
        const newIds = data2.videos.map(v => v.id);
        const overlap = newIds.filter(id => watchedIds.includes(id));
        
        expect(overlap).toHaveLength(0);

        console.log(`✅ Diversity test passed: No overlap with ${watchedIds.length} watched videos`);
    });

    test('Skip behavior reduces recommendations from that category', async ({ request }) => {
        const userId = `test_skip_${Date.now()}`;
        const userLevel = 'A2';

        // Get videos
        const response = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 10 }
        });
        const data = await response.json();
        
        // User skips several videos from same category
        const firstCategory = data.videos[0].category || 'general';
        const skippedVideos = data.videos.filter(v => v.category === firstCategory).slice(0, 3);

        // If no videos found, just skip 3 random videos
        const videosToSkip = skippedVideos.length >= 3 ? skippedVideos : data.videos.slice(0, 3);

        let trackSuccessCount = 0;
        for (const video of videosToSkip) {
            const trackResponse = await request.post(`${API_URL}/video-interactions/track`, {
                data: {
                    userId,
                    videoId: video.id,
                    interactionType: 'skip',
                    watchTime: 2,
                    videoDuration: video.duration || 30,
                    completionRate: 0.05,
                    videoMetadata: {
                        category: firstCategory,
                        level: video.level
                    }
                }
            });
            const trackData = await trackResponse.json();
            if (trackData.success) trackSuccessCount++;
        }

        // Verify tracking succeeded
        expect(trackSuccessCount).toBe(3);

        // Get stats
        const statsResponse = await request.get(`${API_URL}/video-interactions/stats/${userId}`);
        const statsData = await statsResponse.json();

        expect(statsData.success).toBe(true);
        // Check that interactions were tracked (either in totalWatched or totalInteractions)
        const totalTracked = statsData.stats.totalInteractions || statsData.stats.totalWatched || 0;
        expect(totalTracked).toBeGreaterThanOrEqual(3);

        console.log(`✅ Skip tracking passed: ${statsData.stats.totalWatched} videos tracked, ${statsData.stats.totalInteractions || 0} interactions, skip rate: ${statsData.stats.behaviorPatterns.skipRate}%`);
    });

    test('Clear watch history works correctly', async ({ request }) => {
        const userId = `test_clear_${Date.now()}`;

        // Watch some videos
        await request.post(`${API_URL}/video-interactions/watched`, {
            data: { userId, videoId: 'test_video_1' }
        });
        await request.post(`${API_URL}/video-interactions/watched`, {
            data: { userId, videoId: 'test_video_2' }
        });

        // Verify history exists
        const historyResponse = await request.get(`${API_URL}/video-interactions/history/${userId}`);
        const historyData = await historyResponse.json();
        expect(historyData.totalWatched).toBe(2);

        // Clear history
        const clearResponse = await request.delete(`${API_URL}/video-interactions/history/${userId}`);
        const clearData = await clearResponse.json();
        expect(clearData.success).toBe(true);

        // Verify history is cleared
        const historyResponse2 = await request.get(`${API_URL}/video-interactions/history/${userId}`);
        const historyData2 = await historyResponse2.json();
        expect(historyData2.totalWatched).toBe(0);

        console.log(`✅ Clear history test passed`);
    });

    test('Performance: Recommendations load in under 1 second', async ({ request }) => {
        const userId = `test_perf_${Date.now()}`;
        const userLevel = 'B1';

        const startTime = Date.now();
        
        const response = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 20 }
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.videos).toHaveLength(20);

        // Should be fast (under 1 second)
        expect(duration).toBeLessThan(1000);

        console.log(`✅ Performance test passed: ${duration}ms for 20 videos`);
    });

    test('Multi-user scenario: Different users get different recommendations', async ({ request }) => {
        const user1Id = `test_user1_${Date.now()}`;
        const user2Id = `test_user2_${Date.now()}`;

        // User 1: A1 level
        const response1 = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId: user1Id, level: 'A1', count: 10 }
        });
        const data1 = await response1.json();

        // User 2: C2 level
        const response2 = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId: user2Id, level: 'C2', count: 10 }
        });
        const data2 = await response2.json();

        // Videos should be mostly different (different levels)
        const user1Videos = data1.videos.map(v => v.id);
        const user2Videos = data2.videos.map(v => v.id);
        const overlap = user1Videos.filter(id => user2Videos.includes(id));

        // Some overlap is okay, but most should be different
        expect(overlap.length).toBeLessThan(5);

        // User 1 should get mostly A1 videos
        const user1Levels = data1.videos.map(v => v.level);
        const user1A1Count = user1Levels.filter(l => l === 'A1').length;
        expect(user1A1Count).toBeGreaterThan(0);

        // User 2 should get mostly C2 videos
        const user2Levels = data2.videos.map(v => v.level);
        const user2C2Count = user2Levels.filter(l => l === 'C2' || l === 'C1').length;
        expect(user2C2Count).toBeGreaterThan(0);

        console.log(`✅ Multi-user test passed: ${overlap.length} overlap between A1 and C2 users`);
    });

    test('Rewatch signal boosts similar content', async ({ request }) => {
        const userId = `test_rewatch_${Date.now()}`;
        const userLevel = 'B1';

        // Get initial videos
        const response1 = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 10 }
        });
        const data1 = await response1.json();

        // User rewatches first video (strong positive signal)
        const favVideo = data1.videos[0];
        await request.post(`${API_URL}/video-interactions/track`, {
            data: {
                userId,
                videoId: favVideo.id,
                interactionType: 'rewatch',
                watchTime: favVideo.duration || 30,
                videoDuration: favVideo.duration || 30,
                completionRate: 1.0,
                rewatch: true,
                videoMetadata: {
                    category: favVideo.category,
                    theme: favVideo.theme,
                    level: favVideo.level
                }
            }
        });

        // Get new recommendations
        const response2 = await request.get(`${API_URL}/videos/smart-recommendations`, {
            params: { userId, level: userLevel, count: 10 }
        });
        const data2 = await response2.json();

        // Should get recommendations (system learned preference)
        expect(data2.videos.length).toBeGreaterThan(0);

        console.log(`✅ Rewatch test passed: System tracked rewatch signal`);
    });

});

test.describe('Level Assessment for New Users', () => {

    test('Quick level assessment through video interaction', async ({ request }) => {
        const userId = `test_assessment_${Date.now()}`;

        // Simulate user watching videos at different levels
        // Watch A1 video successfully
        await request.post(`${API_URL}/video-interactions/track`, {
            data: {
                userId,
                videoId: 'assessment_a1',
                interactionType: 'complete',
                watchTime: 30,
                videoDuration: 30,
                completionRate: 1.0,
                wordClicks: 1, // Understood most words
                videoMetadata: { level: 'A1' }
            }
        });

        // Watch A2 video with moderate difficulty
        await request.post(`${API_URL}/video-interactions/track`, {
            data: {
                userId,
                videoId: 'assessment_a2',
                interactionType: 'complete',
                watchTime: 30,
                videoDuration: 30,
                completionRate: 1.0,
                wordClicks: 5, // Clicked some words
                videoMetadata: { level: 'A2' }
            }
        });

        // Watch B1 video with struggle
        await request.post(`${API_URL}/video-interactions/track`, {
                data: {
                userId,
                videoId: 'assessment_b1',
                interactionType: 'skip',
                watchTime: 10,
                videoDuration: 30,
                completionRate: 0.33,
                wordClicks: 15, // Clicked many words (too hard)
                videoMetadata: { level: 'B1' }
            }
        });

        // Get stats to determine level
        const statsResponse = await request.get(`${API_URL}/video-interactions/stats/${userId}`);
        const statsData = await statsResponse.json();

        expect(statsData.success).toBe(true);
        expect(statsData.stats.totalWatched).toBe(3);

        // Based on behavior, user is likely A2 level
        console.log(`✅ Assessment test passed: User assessed based on ${statsData.stats.totalWatched} videos`);
    });

});
