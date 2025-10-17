// Delete a word from vocabulary
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { userId, wordId, word } = req.query;
    
    if (!userId || (!wordId && !word)) {
        return res.status(400).json({ 
            error: 'Missing required parameters: userId and (wordId or word)' 
        });
    }
    
    try {
        let deletedWord;
        
        if (wordId) {
            // Delete by ID
            deletedWord = await prisma.word.delete({
                where: { id: wordId }
            });
        } else {
            // Delete by userId + word combination
            deletedWord = await prisma.word.delete({
                where: {
                    userId_word: {
                        userId,
                        word: word.toLowerCase().trim()
                    }
                }
            });
        }
        
        console.log(`✅ Deleted word: "${deletedWord.word}" for user ${userId}`);
        return res.status(200).json({ 
            success: true, 
            message: 'Word deleted successfully',
            deletedWord
        });
        
    } catch (error) {
        console.error('Error deleting word:', error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Word not found' });
        }
        
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}

