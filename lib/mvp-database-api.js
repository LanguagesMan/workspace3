// 🚀 MVP DATABASE API - Production Ready
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MVPDatabaseAPI {
    // 👤 USER MANAGEMENT
    async getOrCreateUser(identifier = 'anonymous') {
        let user = await prisma.user.findFirst({
            where: { OR: [{ email: identifier }, { username: identifier }] }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    username: identifier,
                    currentLevel: 'A1',
                    streak: 0,
                    totalXP: 0
                }
            });
            console.log(`✅ Created new user: ${identifier}`);
        }

        return user;
    }

    // 🎯 DAILY GOAL SYSTEM
    async getDailyGoal(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let goal = await prisma.dailyGoal.findUnique({
            where: { userId_date: { userId, date: today } }
        });

        if (!goal) {
            goal = await prisma.dailyGoal.create({
                data: { userId, date: today, goal: 5, completed: 0 }
            });
        }

        return goal;
    }

    async incrementDailyGoal(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const goal = await prisma.dailyGoal.upsert({
            where: { userId_date: { userId, date: today } },
            update: { completed: { increment: 1 } },
            create: { userId, date: today, goal: 5, completed: 1 }
        });

        // Check if goal achieved
        if (goal.completed >= goal.goal && !goal.achieved) {
            await prisma.dailyGoal.update({
                where: { id: goal.id },
                data: { achieved: true, xpBonus: 50 }
            });

            await this.addXP(userId, 50, 'Daily goal complete');
            console.log(`🎉 User ${userId} completed daily goal!`);
        }

        return goal;
    }

    // 🧠 QUIZ SYSTEM
    async saveQuizResult(data) {
        const { userId, videoId, question, userAnswer, correctAnswer, topic } = data;
        const isCorrect = userAnswer === correctAnswer;
        const xpEarned = isCorrect ? 30 : 10;

        const result = await prisma.quizResult.create({
            data: {
                userId,
                videoId,
                question,
                userAnswer,
                correctAnswer,
                isCorrect,
                topic,
                xpEarned
            }
        });

        // Award XP
        if (userId) {
            await this.addXP(userId, xpEarned, isCorrect ? 'Quiz correct' : 'Quiz attempt');
        }

        // Unlock topic if correct
        if (isCorrect && userId && topic) {
            await this.unlockTopic(userId, topic);
        }

        return result;
    }

    // 🔓 UNLOCK SYSTEM
    async unlockTopic(userId, topic) {
        const unlock = await prisma.unlockedTopic.upsert({
            where: { userId_topic: { userId, topic } },
            update: { videoCount: { increment: 1 } },
            create: { userId, topic, videoCount: 1 }
        });

        console.log(`🔓 Unlocked ${topic} for user ${userId}`);
        return unlock;
    }

    async getUnlockedTopics(userId) {
        return await prisma.unlockedTopic.findMany({
            where: { userId },
            orderBy: { unlockedAt: 'desc' }
        });
    }

    // ⭐ XP & PROGRESSION
    async addXP(userId, amount, reason) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { totalXP: { increment: amount } }
        });

        console.log(`⭐ User ${userId}: +${amount} XP (${reason})`);
        return user;
    }

    async updateStreak(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const today = new Date();
        const lastActivity = new Date(user.lastActivity);

        const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

        let newStreak = user.streak;
        if (daysDiff === 1) {
            newStreak += 1;
            console.log(`🔥 Streak increased to ${newStreak}`);
        } else if (daysDiff > 1) {
            console.log(`💔 Streak broken! Was ${user.streak}`);
            newStreak = 1;
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                streak: newStreak,
                longestStreak: Math.max(newStreak, user.longestStreak),
                lastActivity: today
            }
        });

        return newStreak;
    }

    // 🎴 FLASHCARD SYSTEM (Spaced Repetition - SM2)
    async createFlashcard(userId, data) {
        const { front, back, context, topic } = data;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await prisma.flashcard.create({
            data: {
                userId,
                front,
                back,
                context,
                topic,
                nextReview: tomorrow
            }
        });
    }

    async getFlashcardsDue(userId) {
        const now = new Date();
        return await prisma.flashcard.findMany({
            where: {
                userId,
                nextReview: { lte: now }
            },
            orderBy: { nextReview: 'asc' },
            take: 5 // Max 5 cards per session (NOT spammy)
        });
    }

    async reviewFlashcard(flashcardId, quality) {
        // SM-2 Algorithm implementation
        const card = await prisma.flashcard.findUnique({ where: { id: flashcardId } });

        let { easeFactor, interval, repetitions } = card;

        // Calculate new values based on SM-2
        if (quality >= 3) {
            // Correct answer
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions += 1;
        } else {
            // Wrong answer - reset
            repetitions = 0;
            interval = 1;
        }

        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        easeFactor = Math.max(1.3, easeFactor);

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        return await prisma.flashcard.update({
            where: { id: flashcardId },
            data: {
                easeFactor,
                interval,
                repetitions,
                nextReview,
                lastReviewed: new Date()
            }
        });
    }

    // 📊 USER STATS
    async getUserStats(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const dailyGoal = await this.getDailyGoal(userId);
        const unlockedTopics = await this.getUnlockedTopics(userId);
        const flashcardsDue = await this.getFlashcardsDue(userId);

        return {
            user: {
                level: user.currentLevel,
                xp: user.totalXP,
                streak: user.streak,
                longestStreak: user.longestStreak
            },
            dailyGoal: {
                completed: dailyGoal.completed,
                goal: dailyGoal.goal,
                achieved: dailyGoal.achieved
            },
            unlocked: unlockedTopics.length,
            flashcardsDue: flashcardsDue.length,
            topics: unlockedTopics.map(t => t.topic)
        };
    }
}

module.exports = new MVPDatabaseAPI();
