// Feed generation endpoint
// Generates personalized content feed using recommendation algorithm

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { feedCache } from '@/lib/redis'
import { isAppropriateLevel } from '@/lib/srs-algorithm'
import { getFallbackFeed } from '@/lib/fallback-feed'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    // Check cache first
    const cachedFeed = await feedCache.getUserFeed(userId)
    if (cachedFeed && offset === 0) {
      const contentIds = cachedFeed.slice(0, limit)
      const content = await prisma.content.findMany({
        where: { id: { in: contentIds } },
        include: {
          words: true,
        },
      })
      
      return NextResponse.json({ items: content, cached: true })
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        wordKnowledge: true,
      },
    })

    if (!user) {
      const fallback = getFallbackFeed(limit, offset)
      return NextResponse.json({
        items: fallback.items,
        cached: false,
        total: fallback.total,
        fallback: true,
        reason: 'user_not_found',
      })
    }

    // Get user's word knowledge map
    const knownWords = new Set(
      user.wordKnowledge
        .filter((w) => w.confidenceScore >= 0.6)
        .map((w) => w.word)
    )

    // Get words due for SRS review
    const dueWords = user.wordKnowledge
      .filter(
        (w) =>
          w.nextReviewAt &&
          w.nextReviewAt <= new Date() &&
          w.confidenceScore < 0.9
      )
      .map((w) => w.word)

    // Fetch candidate content
    const candidateContent = await prisma.content.findMany({
      where: {
        language: user.targetLanguage,
        cefrLevel: {
          in: getAdjacentLevels(user.currentLevel),
        },
      },
      include: {
        words: true,
      },
      take: 100, // Get large pool for ranking
      orderBy: {
        dopamineScore: 'desc', // Pre-filter by engagement
      },
    })

    // Score and rank content
    const scoredContent = candidateContent
      .map((content) => {
        // Calculate known words percentage
        const contentWords = content.words.map((w) => w.word)
        const knownCount = contentWords.filter((w) => knownWords.has(w)).length
        const knownPercentage = contentWords.length > 0 ? knownCount / contentWords.length : 0

        // Check if appropriate difficulty
        const { appropriate, difficulty } = isAppropriateLevel(
          knownPercentage,
          user.preferences?.preferredDifficulty || 0.96
        )

        // Calculate SRS reinforcement score
        const hasReviewWords = content.words.some((w) => dueWords.includes(w.word))
        const srsScore = hasReviewWords ? 1 : 0

        // Calculate interest alignment (simplified - would use ML in production)
        const interestScore = content.dopamineScore * (user.engagementScore || 0.5)

        // Calculate variety score based on recent interactions
        // (Would query last N interactions in production)
        const varietyScore = 0.5

        // Combined score (weighted)
        const difficultyScore = appropriate ? 1 : difficulty === 'too_easy' ? 0.3 : 0.2
        const totalScore =
          difficultyScore * 0.4 +
          interestScore * 0.3 +
          varietyScore * 0.15 +
          srsScore * 0.15

        return {
          content,
          score: totalScore,
          knownPercentage,
          difficulty,
        }
      })
      .filter((item) => item.score > 0.3) // Minimum threshold
      .sort((a, b) => b.score - a.score)

    // Get top items
    const feedItems = scoredContent.slice(offset, offset + limit).map((item) => ({
      ...item.content,
      knownWordsPercentage: item.knownPercentage,
      newWords: item.content.words
        .filter((w) => !knownWords.has(w.word))
        .slice(0, 10)
        .map((w) => w.word),
    }))

    // Cache the feed
    if (offset === 0) {
      const contentIds = scoredContent.slice(0, 50).map((item) => item.content.id)
      await feedCache.setUserFeed(userId, contentIds, 3600) // 1 hour cache
    }

    return NextResponse.json({
      items: feedItems,
      cached: false,
      total: scoredContent.length,
    })
  } catch (error) {
    console.error('Feed generation error:', error)
    const fallback = getFallbackFeed(limit, offset)
    if (fallback.items.length > 0) {
      return NextResponse.json({
        items: fallback.items,
        cached: false,
        total: fallback.total,
        fallback: true,
      })
    }

    return NextResponse.json(
      { error: 'Failed to generate feed' },
      { status: 500 }
    )
  }
}

// Helper: Get adjacent CEFR levels for content variety
function getAdjacentLevels(level: string): string[] {
  const levels = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const index = levels.indexOf(level)
  const adjacent = []

  if (index > 0) adjacent.push(levels[index - 1])
  adjacent.push(level)
  if (index < levels.length - 1) adjacent.push(levels[index + 1])

  return adjacent
}

