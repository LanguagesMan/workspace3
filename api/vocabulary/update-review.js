// Update word after review using SM-2 algorithm
import { PrismaClient } from '@prisma/client';
import { SpacedRepetitionEngine } from '../../lib/spaced-repetition-engine.js';

const prisma = new PrismaClient();
const srEngine = new SpacedRepetitionEngine();

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { userId, word, quality } = req.body;
    
    if (!userId || !word || quality === undefined) {
        return res.status(400).json({ 
            error: 'Missing required fields: userId, word, quality (0-5)' 
        });
    }
    
    // Validate quality rating
    const qualityNum = parseInt(quality);
    if (qualityNum < 0 || qualityNum > 5) {
        return res.status(400).json({ error: 'Quality must be between 0 and 5' });
    }
    
    try {
        // Get current word data
        const currentWord = await prisma.word.findUnique({
            where: {
                userId_word: {
                    userId,
                    word: word.toLowerCase().trim()
                }
            }
        });
        
        if (!currentWord) {
            return res.status(404).json({ error: 'Word not found' });
        }
        
        // Calculate next review using SM-2 algorithm
        const updatedData = srEngine.calculateNextReview(currentWord, qualityNum);
        
        const reviewStartTime = Date.now();
        
        // Update in database
        const vocabulary = await prisma.word.update({
            where: {
                userId_word: {
                    userId,
                    word: word.toLowerCase().trim()
                }
            },
            data: {
                masteryLevel: updatedData.masteryLevel,
                easiness: updatedData.easiness,
                interval: updatedData.interval,
                repetitions: updatedData.repetitions,
                nextReview: updatedData.nextReview,
                lastReviewed: new Date(),
                reviewCount: { increment: 1 },
                mastered: updatedData.masteryLevel >= 5
            }
        });
        
        const timeSpent = Math.round((Date.now() - reviewStartTime) / 1000);
        
        // Create review session record
        await prisma.reviewSession.create({
            data: {
                userId,
                wordId: currentWord.id,
                quality: qualityNum,
                timeSpent: timeSpent > 0 ? timeSpent : 1
            }
        });
        
        // Track interaction
        await prisma.userInteraction.create({
            data: {
                userId,
                type: 'word_review',
                contentId: word,
                correct: qualityNum >= 3,
                difficulty: currentWord.level,
                metadata: JSON.stringify({ 
                    quality: qualityNum, 
                    masteryLevel: updatedData.masteryLevel,
                    interval: updatedData.interval,
                    nextReviewIn: updatedData.interval + ' days'
                })
            }
        });
        
        console.log(`✅ Word reviewed: "${word}" (quality: ${qualityNum}, next: ${updatedData.interval}d)`);
        return res.status(200).json({ 
            success: true, 
            vocabulary,
            nextReviewIn: updatedData.interval,
            masteryLevel: updatedData.masteryLevel
        });
        
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}
