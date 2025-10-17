// Track word click and save to database
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
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { userId, word, translation, context, source, sourceId, level } = req.body;
    
    if (!userId || !word || !translation) {
        return res.status(400).json({ error: 'Missing required fields: userId, word, translation' });
    }
    
    try {
        // Upsert word (create or increment click count)
        const vocabulary = await prisma.word.upsert({
            where: {
                userId_word: {
                    userId,
                    word: word.toLowerCase().trim()
                }
            },
            update: {
                clickCount: { increment: 1 },
                lastSeen: new Date(),
                translation,
                context: context || undefined,
                source: source || undefined,
                sourceId: sourceId || undefined
            },
            create: {
                userId,
                word: word.toLowerCase().trim(),
                translation,
                context,
                source: source || 'article',
                sourceId,
                level: level || 'A2',
                clickCount: 1
            }
        });
        
        // Track interaction
        await prisma.userInteraction.create({
            data: {
                userId,
                type: 'word_click',
                contentId: sourceId || word,
                difficulty: level,
                metadata: JSON.stringify({ word, source })
            }
        });
        
        console.log(`✅ Word clicked: "${word}" by user ${userId}`);
        return res.status(200).json({ success: true, vocabulary });
        
    } catch (error) {
        console.error('Error tracking word click:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}
