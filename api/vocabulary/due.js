// Get words due for review today (optimized endpoint)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { userId, limit = '20', countOnly = 'false' } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        const now = new Date();
        
        const where = {
            userId,
            saved: true,
            OR: [
                { nextReview: null },
                { nextReview: { lte: now } }
            ]
        };
        
        // If only count is needed (for badge)
        if (countOnly === 'true') {
            const count = await prisma.word.count({ where });
            return res.status(200).json({ success: true, count });
        }
        
        // Get full words for review
        const words = await prisma.word.findMany({
            where,
            orderBy: [
                { masteryLevel: 'asc' },  // Prioritize lower mastery
                { nextReview: 'asc' },    // Then by most overdue
                { reviewCount: 'asc' }    // Then by least reviewed
            ],
            take: parseInt(limit)
        });
        
        console.log(`✅ Found ${words.length} words due for review for user ${userId}`);
        return res.status(200).json({ 
            success: true, 
            words, 
            count: words.length,
            hasMore: words.length >= parseInt(limit)
        });
        
    } catch (error) {
        console.error('Error getting due words:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}

