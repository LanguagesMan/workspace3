// Get user vocabulary statistics
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
    
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        const now = new Date();
        
        // Get all saved words
        const allWords = await prisma.word.findMany({
            where: {
                userId,
                saved: true
            }
        });
        
        // Calculate statistics
        const stats = {
            totalSaved: allWords.length,
            mastered: allWords.filter(w => w.masteryLevel >= 5).length,
            learning: allWords.filter(w => w.masteryLevel > 0 && w.masteryLevel < 5).length,
            new: allWords.filter(w => w.masteryLevel === 0).length,
            
            // Due today
            dueToday: allWords.filter(w => {
                if (!w.nextReview) return true; // Never reviewed
                return new Date(w.nextReview) <= now;
            }).length,
            
            // Review stats
            totalReviews: allWords.reduce((sum, w) => sum + w.reviewCount, 0),
            averageReviews: allWords.length > 0 
                ? Math.round(allWords.reduce((sum, w) => sum + w.reviewCount, 0) / allWords.length * 10) / 10
                : 0,
            
            // Mastery level breakdown
            masteryBreakdown: {
                level0: allWords.filter(w => w.masteryLevel === 0).length,
                level1: allWords.filter(w => w.masteryLevel === 1).length,
                level2: allWords.filter(w => w.masteryLevel === 2).length,
                level3: allWords.filter(w => w.masteryLevel === 3).length,
                level4: allWords.filter(w => w.masteryLevel === 4).length,
                level5: allWords.filter(w => w.masteryLevel === 5).length
            },
            
            // Streaks and activity
            lastReviewDate: allWords
                .filter(w => w.lastReviewed)
                .sort((a, b) => new Date(b.lastReviewed) - new Date(a.lastReviewed))[0]?.lastReviewed || null,
            
            // Get review sessions from last 7 days
            recentActivity: await getRecentActivity(userId, 7)
        };
        
        console.log(`✅ Retrieved stats for user ${userId}: ${stats.totalSaved} words, ${stats.dueToday} due`);
        return res.status(200).json({ success: true, stats });
        
    } catch (error) {
        console.error('Error getting vocabulary stats:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}

async function getRecentActivity(userId, days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    try {
        const sessions = await prisma.reviewSession.findMany({
            where: {
                userId,
                createdAt: { gte: startDate }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Group by day
        const activityByDay = {};
        sessions.forEach(session => {
            const day = session.createdAt.toISOString().split('T')[0];
            if (!activityByDay[day]) {
                activityByDay[day] = { count: 0, totalQuality: 0 };
            }
            activityByDay[day].count++;
            activityByDay[day].totalQuality += session.quality;
        });
        
        return Object.entries(activityByDay).map(([date, data]) => ({
            date,
            reviewCount: data.count,
            averageQuality: Math.round(data.totalQuality / data.count * 10) / 10
        }));
    } catch (error) {
        console.error('Error getting recent activity:', error);
        return [];
    }
}

