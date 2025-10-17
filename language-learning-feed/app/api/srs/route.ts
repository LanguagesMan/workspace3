// SRS review scheduling and processing
// Invisible flashcard system integrated into feed

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateNextReview, inferQuality } from '@/lib/srs-algorithm'
import { feedCache } from '@/lib/redis'

// Get due SRS reviews for user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Check cache first
    const cachedQueue = await feedCache.getSRSQueue(userId)
    if (cachedQueue) {
      const cards = await prisma.sRSCard.findMany({
        where: { id: { in: cachedQueue } },
      })
      return NextResponse.json({ cards, cached: true })
    }

    // Get cards due for review
    const dueCards = await prisma.sRSCard.findMany({
      where: {
        userId,
        nextReviewAt: {
          lte: new Date(),
        },
        status: {
          in: ['NEW', 'LEARNING', 'REVIEWING'],
        },
      },
      orderBy: {
        nextReviewAt: 'asc',
      },
      take: limit,
    })

    // Cache the queue
    const cardIds = dueCards.map((c) => c.id)
    await feedCache.setSRSQueue(userId, cardIds, 3600)

    return NextResponse.json({ cards: dueCards, cached: false })
  } catch (error) {
    console.error('SRS queue error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SRS queue' },
      { status: 500 }
    )
  }
}

// Process SRS review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId, correct, responseTimeMs } = body

    if (!cardId || correct === undefined || !responseTimeMs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current card state
    const card = await prisma.sRSCard.findUnique({
      where: { id: cardId },
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Calculate quality rating from performance
    const quality = inferQuality(correct, responseTimeMs)

    // Calculate next review using SM-2
    const { state, nextReviewAt } = calculateNextReview(
      {
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
      },
      { quality, responseTime: responseTimeMs }
    )

    // Update card
    const updatedCard = await prisma.sRSCard.update({
      where: { id: cardId },
      data: {
        easeFactor: state.easeFactor,
        interval: state.interval,
        repetitions: state.repetitions,
        nextReviewAt,
        lastReviewedAt: new Date(),
        correctCount: correct ? { increment: 1 } : undefined,
        incorrectCount: !correct ? { increment: 1 } : undefined,
        averageResponseTime: responseTimeMs,
        status:
          state.repetitions >= 3 ? 'REVIEWING' : state.repetitions > 0 ? 'LEARNING' : 'NEW',
      },
    })

    // Update word knowledge
    await prisma.wordKnowledge.update({
      where: {
        userId_word_language: {
          userId: card.userId,
          word: card.word,
          language: card.language,
        },
      },
      data: {
        lastReviewedAt: new Date(),
        nextReviewAt,
        reviewInterval: state.interval,
        easeFactor: state.easeFactor,
        correctReviews: correct ? { increment: 1 } : undefined,
        incorrectReviews: !correct ? { increment: 1 } : undefined,
      },
    })

    // Award XP
    const xpEarned = correct ? (quality >= 4 ? 15 : 10) : 3

    // Invalidate SRS cache
    await feedCache.invalidateUserFeed(card.userId)

    return NextResponse.json({
      success: true,
      nextReviewAt,
      interval: state.interval,
      xpEarned,
      quality,
    })
  } catch (error) {
    console.error('SRS review error:', error)
    return NextResponse.json(
      { error: 'Failed to process review' },
      { status: 500 }
    )
  }
}

// Create new SRS card from content interaction
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, word, lemma, language, contentId } = body

    if (!userId || !word || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if card already exists
    const existing = await prisma.sRSCard.findFirst({
      where: {
        userId,
        word,
        language,
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Card already exists', cardId: existing.id },
        { status: 200 }
      )
    }

    // Get context from content if provided
    let exampleSentence = null
    if (contentId) {
      const contentWord = await prisma.contentWord.findFirst({
        where: {
          contentId,
          word,
        },
      })
      exampleSentence = contentWord?.context
    }

    // Create new card
    const card = await prisma.sRSCard.create({
      data: {
        userId,
        word,
        lemma: lemma || word,
        language,
        frontText: exampleSentence || word,
        backText: '', // Would translate in production
        exampleSentence,
        nextReviewAt: new Date(), // Review immediately
        status: 'NEW',
      },
    })

    return NextResponse.json({
      success: true,
      cardId: card.id,
    })
  } catch (error) {
    console.error('SRS card creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}


