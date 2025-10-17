/**
 * Seed Deterministic Test Data
 * 
 * Creates predictable test data for Playwright tests
 * - Fixed user IDs
 * - Fixed article content
 * - Fixed timestamps
 * - Repeatable across test runs
 */

require('dotenv').config();
const { supabase, isConfigured } = require('../lib/supabase-client');

// Fixed seed for deterministic data
const SEED = 42;
const TEST_USER_ID = 'test_user_playwright';
const TEST_TIMESTAMP = '2025-01-15T12:00:00.000Z';

async function seedTestData() {
    console.log('🌱 Seeding deterministic test data...\n');

    try {
        if (!isConfigured()) {
            console.log('⚠️  Supabase not configured - running in mock mode');
            return;
        }

        // 1. Clear existing test data
        await clearTestData();

        // 2. Seed test user preferences
        await seedUserPreferences();

        // 3. Seed test articles
        await seedTestArticles();

        // 4. Seed test vocabulary
        await seedTestVocabulary();

        // 5. Seed personalized articles
        await seedPersonalizedArticles();

        console.log('\n✅ Test data seeding complete!');

    } catch (error) {
        console.error('❌ Error seeding test data:', error);
        throw error;
    }
}

async function clearTestData() {
    console.log('🧹 Clearing existing test data...');

    try {
        // Delete in correct order (respecting foreign keys)
        await supabase.from('personalized_articles').delete().eq('user_id', TEST_USER_ID);
        await supabase.from('article_engagement').delete().eq('user_id', TEST_USER_ID);
        await supabase.from('user_words').delete().eq('user_id', TEST_USER_ID);
        await supabase.from('user_preferences').delete().eq('user_id', TEST_USER_ID);

        console.log('   ✅ Cleared');
    } catch (error) {
        console.warn('   ⚠️  Error clearing (may not exist yet):', error.message);
    }
}

async function seedUserPreferences() {
    console.log('👤 Seeding user preferences...');

    const prefs = {
        user_id: TEST_USER_ID,
        favorite_topics: ['technology', 'culture'],
        disliked_topics: [],
        preferred_difficulty_range: { min: 'B1', max: 'B2' },
        favorite_artists: [],
        favorite_music_genres: ['pop'],
        learning_goals: ['vocabulary', 'listening'],
        daily_time_goal: 15,
        created_at: TEST_TIMESTAMP,
        updated_at: TEST_TIMESTAMP
    };

    const { error } = await supabase
        .from('user_preferences')
        .upsert(prefs);

    if (error) {
        console.error('   ❌ Error:', error);
    } else {
        console.log('   ✅ User preferences seeded');
    }
}

async function seedTestArticles() {
    console.log('📰 Seeding test articles...');

    const articles = [
        {
            id: 'test_article_1',
            title: 'La tecnología cambia nuestras vidas',
            title_english: 'Technology changes our lives',
            content: 'La tecnología moderna ha transformado completamente la forma en que vivimos. Los smartphones, las redes sociales y la inteligencia artificial son ahora parte esencial de nuestro día a día.',
            content_english: 'Modern technology has completely transformed the way we live. Smartphones, social networks and artificial intelligence are now an essential part of our daily lives.',
            excerpt: 'La tecnología moderna ha transformado completamente la forma en que vivimos...',
            category: 'technology',
            source: 'Test Source',
            article_url: 'https://test.com/article1',
            difficulty: 'B1',
            image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
            author: 'Test Author',
            published_at: TEST_TIMESTAMP,
            fetch_time: TEST_TIMESTAMP,
            read_time: '2 min',
            verified: true
        },
        {
            id: 'test_article_2',
            title: 'La cultura española moderna',
            title_english: 'Modern Spanish culture',
            content: 'España tiene una rica historia cultural que continúa evolucionando. Desde el flamenco hasta el arte contemporáneo, la cultura española sigue siendo vibrante y relevante en el mundo moderno.',
            content_english: 'Spain has a rich cultural history that continues to evolve. From flamenco to contemporary art, Spanish culture remains vibrant and relevant in the modern world.',
            excerpt: 'España tiene una rica historia cultural que continúa evolucionando...',
            category: 'culture',
            source: 'Test Source',
            article_url: 'https://test.com/article2',
            difficulty: 'B2',
            image_url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
            author: 'Test Author',
            published_at: TEST_TIMESTAMP,
            fetch_time: TEST_TIMESTAMP,
            read_time: '3 min',
            verified: true
        }
    ];

    const { error } = await supabase
        .from('articles')
        .upsert(articles);

    if (error) {
        console.error('   ❌ Error:', error);
    } else {
        console.log(`   ✅ Seeded ${articles.length} test articles`);
    }
}

async function seedTestVocabulary() {
    console.log('📚 Seeding test vocabulary...');

    const words = [
        {
            user_id: TEST_USER_ID,
            lemma: 'tecnología',
            original_word: 'tecnología',
            translation: 'technology',
            language: 'es',
            status: 'learning',
            created_at: TEST_TIMESTAMP,
            last_reviewed: TEST_TIMESTAMP
        },
        {
            user_id: TEST_USER_ID,
            lemma: 'cultura',
            original_word: 'cultura',
            translation: 'culture',
            language: 'es',
            status: 'learning',
            created_at: TEST_TIMESTAMP,
            last_reviewed: TEST_TIMESTAMP
        },
        {
            user_id: TEST_USER_ID,
            lemma: 'moderno',
            original_word: 'moderna',
            translation: 'modern',
            language: 'es',
            status: 'learning',
            created_at: TEST_TIMESTAMP,
            last_reviewed: TEST_TIMESTAMP
        }
    ];

    const { error } = await supabase
        .from('user_words')
        .upsert(words);

    if (error) {
        console.error('   ❌ Error:', error);
    } else {
        console.log(`   ✅ Seeded ${words.length} test vocabulary words`);
    }
}

async function seedPersonalizedArticles() {
    console.log('✨ Seeding personalized articles...');

    const personalizedArticles = [
        {
            user_id: TEST_USER_ID,
            original_article_id: 'test_article_1',
            adapted_title: 'Cómo la tecnología cambia tu vida',
            adapted_content: 'La tecnología moderna cambia todo. Los teléfonos inteligentes y las redes sociales son importantes cada día. La vida es diferente ahora.',
            difficulty_level: 'B1',
            user_vocabulary_count: 1,
            score: 0.85,
            created_at: TEST_TIMESTAMP,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    const { error } = await supabase
        .from('personalized_articles')
        .upsert(personalizedArticles);

    if (error) {
        console.error('   ❌ Error:', error);
    } else {
        console.log(`   ✅ Seeded ${personalizedArticles.length} personalized articles`);
    }
}

// Run if called directly
if (require.main === module) {
    seedTestData()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { seedTestData, TEST_USER_ID };
