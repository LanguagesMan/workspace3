// Save word for spaced repetition review
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
    
    const { userId, word } = req.body;
    
    if (!userId || !word) {
        return res.status(400).json({ error: 'Missing required fields: userId, word' });
    }
    
    try {
        const vocabulary = await prisma.word.update({
            where: {
                userId_word: {
                    userId,
                    word: word.toLowerCase().trim()
                }
            },
            data: {
                saved: true,
                masteryLevel: 0,
                nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
            }
        });
        
        console.log(`✅ Word saved: "${word}" by user ${userId}`);
        return res.status(200).json({ success: true, vocabulary });
        
    } catch (error) {
        console.error('Error saving word:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Word not found. Click the word first before saving.' });
        }
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}
