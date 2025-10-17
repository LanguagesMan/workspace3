// Get words due for review (spaced repetition)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { userId, limit = '20' } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        const now = new Date();
        
        // Get words that are:
        // 1. Saved for review
        // 2. Either never reviewed (nextReview is null) OR due for review (nextReview <= now)
        const words = await prisma.word.findMany({
            where: {
                userId,
                saved: true,
                OR: [
                    { nextReview: null },
                    { nextReview: { lte: now } }
                ]
            },
            orderBy: [
                { nextReview: 'asc' },
                { masteryLevel: 'asc' }
            ],
            take: parseInt(limit)
        });
        
        console.log(`✅ Found ${words.length} words due for review for user ${userId}`);
        return res.status(200).json({ success: true, words, count: words.length });
        
    } catch (error) {
        console.error('Error getting review words:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}
