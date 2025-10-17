// Get user's vocabulary
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
    
    const { userId, saved, limit = '100' } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        const where = { userId };
        
        if (saved === 'true') {
            where.saved = true;
        }
        
        const words = await prisma.word.findMany({
            where,
            orderBy: { lastSeen: 'desc' },
            take: parseInt(limit)
        });
        
        console.log(`✅ Retrieved ${words.length} words for user ${userId}`);
        return res.status(200).json({ success: true, words, total: words.length });
        
    } catch (error) {
        console.error('Error getting vocabulary:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}
