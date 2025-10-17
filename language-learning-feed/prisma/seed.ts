// Seed database with initial data for development and testing

import { PrismaClient, CEFRLevel, ContentType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@langflow.app' },
    update: {},
    create: {
      email: 'demo@langflow.app',
      name: 'Demo User',
      nativeLanguage: 'en',
      targetLanguage: 'es',
      currentLevel: CEFRLevel.A2,
      totalXP: 450,
      currentStreak: 7,
      longestStreak: 15,
      wordsLearned: 234,
      minutesImmersed: 180,
      contentConsumed: 87,
      preferences: {
        create: {
          videoPreference: 0.8,
          articlePreference: 0.5,
          podcastPreference: 0.4,
          musicPreference: 0.7,
          topicInterests: JSON.stringify([
            { topic: 'technology', score: 0.9 },
            { topic: 'travel', score: 0.8 },
            { topic: 'food', score: 0.7 },
          ]),
        },
      },
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Seed word frequency data (top 100 most common Spanish words)
  const commonWords = [
    { word: 'el', lemma: 'el', cefrLevel: CEFRLevel.A1, frequency: 1 },
    { word: 'la', lemma: 'la', cefrLevel: CEFRLevel.A1, frequency: 2 },
    { word: 'de', lemma: 'de', cefrLevel: CEFRLevel.A1, frequency: 3 },
    { word: 'que', lemma: 'que', cefrLevel: CEFRLevel.A1, frequency: 4 },
    { word: 'y', lemma: 'y', cefrLevel: CEFRLevel.A1, frequency: 5 },
    { word: 'a', lemma: 'a', cefrLevel: CEFRLevel.A1, frequency: 6 },
    { word: 'en', lemma: 'en', cefrLevel: CEFRLevel.A1, frequency: 7 },
    { word: 'un', lemma: 'un', cefrLevel: CEFRLevel.A1, frequency: 8 },
    { word: 'ser', lemma: 'ser', cefrLevel: CEFRLevel.A1, frequency: 9 },
    { word: 'se', lemma: 'se', cefrLevel: CEFRLevel.A1, frequency: 10 },
    // ... would include 90 more
  ]

  for (const word of commonWords) {
    await prisma.wordFrequency.upsert({
      where: { word_language: { word: word.word, language: 'es' } },
      update: {},
      create: {
        word: word.word,
        lemma: word.lemma,
        language: 'es',
        cefrLevel: word.cefrLevel,
        frequency: word.frequency,
      },
    })
  }

  console.log('✅ Seeded word frequency data')

  // Create sample content
  const sampleContent = [
    {
      type: ContentType.VIDEO,
      title: 'Cómo hacer tacos auténticos',
      description: 'Aprende a hacer tacos deliciosos en casa',
      language: 'es',
      contentUrl: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://i.ytimg.com/vi/example/maxresdefault.jpg',
      cefrLevel: CEFRLevel.A2,
      difficultyScore: 0.35,
      uniqueWordCount: 150,
      totalWordCount: 500,
      durationSeconds: 300,
      dopamineScore: 0.85,
      topics: JSON.stringify(['food', 'cooking', 'mexican']),
      transcription: 'Hoy vamos a aprender cómo hacer tacos auténticos mexicanos. Primero, necesitamos tortillas de maíz frescas...',
    },
    {
      type: ContentType.ARTICLE,
      title: 'La tecnología en 2024',
      description: 'Las últimas tendencias tecnológicas',
      language: 'es',
      contentUrl: 'https://example.com/article1',
      thumbnailUrl: 'https://example.com/tech.jpg',
      cefrLevel: CEFRLevel.B1,
      difficultyScore: 0.55,
      uniqueWordCount: 300,
      totalWordCount: 1200,
      dopamineScore: 0.75,
      topics: JSON.stringify(['technology', 'innovation', 'future']),
      transcription: 'La inteligencia artificial está transformando todos los aspectos de nuestra vida. En 2024, vemos cómo...',
    },
    {
      type: ContentType.MUSIC,
      title: 'Despacito - Luis Fonsi',
      description: 'Popular Spanish song',
      language: 'es',
      contentUrl: 'https://example.com/music1.mp3',
      thumbnailUrl: 'https://i.scdn.co/image/example',
      cefrLevel: CEFRLevel.A2,
      difficultyScore: 0.4,
      uniqueWordCount: 80,
      totalWordCount: 300,
      durationSeconds: 240,
      dopamineScore: 0.95,
      topics: JSON.stringify(['music', 'romance', 'latin']),
      transcription: 'Sí, sabes que ya llevo un rato mirándote...',
    },
  ]

  for (const content of sampleContent) {
    const created = await prisma.content.create({
      data: content,
    })

    // Add some words to this content
    const words = ['hacer', 'tacos', 'aprender', 'casa', 'mexicano']
    for (let i = 0; i < words.length; i++) {
      await prisma.contentWord.create({
        data: {
          contentId: created.id,
          word: words[i],
          lemma: words[i],
          frequency: Math.floor(Math.random() * 10) + 1,
          cefrLevel: CEFRLevel.A2,
          position: i,
          context: `Example sentence with ${words[i]}`,
        },
      })
    }
  }

  console.log('✅ Created sample content')

  // Create some word knowledge for demo user
  const knownWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un']
  for (const word of knownWords) {
    await prisma.wordKnowledge.create({
      data: {
        userId: user.id,
        word,
        lemma: word,
        language: 'es',
        confidenceScore: 0.8,
        exposureCount: 10,
        firstSeenAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        lastSeenAt: new Date(),
      },
    })
  }

  console.log('✅ Created word knowledge entries')

  // Create sample SRS cards
  const srsWords = ['hacer', 'aprender', 'casa']
  for (const word of srsWords) {
    await prisma.sRSCard.create({
      data: {
        userId: user.id,
        word,
        lemma: word,
        language: 'es',
        frontText: `¿Qué significa "${word}"?`,
        backText: `Translation of ${word}`,
        nextReviewAt: new Date(),
        status: 'LEARNING',
      },
    })
  }

  console.log('✅ Created SRS cards')

  // Create learning session
  await prisma.learningSession.create({
    data: {
      userId: user.id,
      startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      endedAt: new Date(),
      durationMinutes: 30,
      contentViewed: 15,
      wordsEncountered: 45,
      wordsLearned: 8,
      srsReviewsCompleted: 5,
      xpEarned: 120,
      averageEngagement: 0.85,
      completionRate: 0.9,
    },
  })

  console.log('✅ Created sample learning session')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


