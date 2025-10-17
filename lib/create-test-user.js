// Create test user for API testing
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser(userId) {
    try {
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                username: `test_user_${Date.now()}`,
                currentLevel: 'A2'
            }
        });
        console.log(`✅ Test user created/verified: ${user.id}`);
        return user;
    } catch (error) {
        console.error('Error creating test user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// If run directly
if (require.main === module) {
    const userId = process.argv[2] || 'test123';
    createTestUser(userId);
}

module.exports = { createTestUser };
