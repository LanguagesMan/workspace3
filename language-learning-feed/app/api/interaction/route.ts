// Track user interactions with content
// Fuels recommendation algorithm and comprehension inference

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { feedCache } from '@/lib/redis'
import { calculateConfidence } from '@/lib/srs-algorithm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      contentId,
      interactionType,
      timeSpentSeconds,
      completionRate,
      wordsLookedUp,
      replayCount,
    } = body

    if (!userId || !contentId || !interactionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Infer comprehension from behavior
    const inferredComprehension = inferComprehension(
      timeSpentSeconds,
      completionRate,
      wordsLookedUp,
      replayCount
    )

    // Record interaction
    const interaction = await prisma.contentInteraction.create({
      data: {
        userId,
        contentId,
        interactionType,
        timeSpentSeconds,
        completionRate,
        wordsLookedUp,
        replayCount,
        inferredComprehension,
      },
    })

    // Update content engagement metrics
    await updateContentMetrics(contentId, interactionType, timeSpentSeconds)

    // Update user's word knowledge based on exposure
    if (interactionType === 'COMPLETED' || completionRate >= 0.7) {
      await updateWordExposure(userId, contentId)
    }

    // Adjust user's comprehension and engagement scores
    await updateUserScores(userId, inferredComprehension, interactionType)

    // Award XP based on interaction
    const xpEarned = calculateXP(interactionType, completionRate)

    // Invalidate feed cache to trigger re-ranking
    if (interactionType === 'SWIPE_LEFT' || interactionType === 'SWIPE_RIGHT') {
      await feedCache.invalidateUserFeed(userId)
    }

    return NextResponse.json({
      success: true,
      interactionId: interaction.id,
      xpEarned,
      inferredComprehension,
    })
  } catch (error) {
    console.error('Interaction tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    )
  }
}

// Infer comprehension from behavioral signals
function inferComprehension(
  timeSpent?: number,
  completion?: number,
  lookups?: number,
  replays?: number
): number {
  let score = 0.5 // Start neutral

  // Completion rate is strong signal
  if (completion !== undefined) {
    score = completion * 0.6
  }

  // Time spent (relative to content duration)
  // Too fast = skipped, too slow = struggling, medium = good
  if (timeSpent !== undefined) {
    // This would compare to content duration in production
    score += 0.2
  }

  // Word lookups indicate difficulty
  if (lookups !== undefined) {
    score -= lookups * 0.05
  }

  // Replays can indicate both interest and difficulty
  if (replays !== undefined && replays > 0) {
    score += replays <= 2 ? 0.1 : -0.1
  }

  return Math.max(0, Math.min(1, score))
}

// Update content engagement metrics
async function updateContentMetrics(
  contentId: string,
  interactionType: string,
  timeSpent?: number
) {
  const updates: Record<string, unknown> = {}

  switch (interactionType) {
    case 'DOUBLE_TAP':
      updates.likeCount = { increment: 1 }
      updates.dopamineScore = { increment: 0.01 }
      break
    case 'SWIPE_RIGHT':
      updates.saveCount = { increment: 1 }
      updates.dopamineScore = { increment: 0.015 }
      break
    case 'SKIP':
      updates.skipCount = { increment: 1 }
      updates.dopamineScore = { decrement: 0.005 }
      break
    case 'SWIPE_UP':
    case 'COMPLETED':
      updates.viewCount = { increment: 1 }
      break
  }

  if (timeSpent) {
    // Update average time spent (rolling average)
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { averageTimeSpent: true, viewCount: true },
    })

    if (content) {
      const newAverage =
        (content.averageTimeSpent * content.viewCount + timeSpent) /
        (content.viewCount + 1)
      updates.averageTimeSpent = newAverage
    }
  }

  await prisma.content.update({
    where: { id: contentId },
    data: updates,
  })
}

// Update user's word knowledge based on content exposure
async function updateWordExposure(userId: string, contentId: string) {
  // Get all words in the content
  const contentWords = await prisma.contentWord.findMany({
    where: { contentId },
  })

  // Update or create word knowledge entries
  for (const contentWord of contentWords) {
    const existing = await prisma.wordKnowledge.findUnique({
      where: {
        userId_word_language: {
          userId,
          word: contentWord.word,
          language: contentWord.word, // Would get from content
        },
      },
    })

    if (existing) {
      // Increment exposure, update confidence
      const newConfidence = calculateConfidence(
        existing.exposureCount + 1,
        existing.correctReviews,
        existing.incorrectReviews,
        existing.lookupCount
      )

      await prisma.wordKnowledge.update({
        where: { id: existing.id },
        data: {
          exposureCount: { increment: 1 },
          lastSeenAt: new Date(),
          confidenceScore: newConfidence,
        },
      })
    } else {
      // Create new word knowledge entry
      await prisma.wordKnowledge.create({
        data: {
          userId,
          word: contentWord.word,
          lemma: contentWord.lemma,
          language: contentWord.word, // Would get from content
          exposureCount: 1,
          confidenceScore: 0.1,
        },
      })
    }
  }
}

// Update user's adaptive scores
async function updateUserScores(
  userId: string,
  comprehension: number,
  interactionType: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { comprehensionScore: true, engagementScore: true },
  })

  if (!user) return

  // Update comprehension score (rolling average)
  const newComprehension = user.comprehensionScore * 0.9 + comprehension * 0.1

  // Update engagement score based on interaction type
  let engagementDelta = 0
  if (interactionType === 'DOUBLE_TAP' || interactionType === 'SWIPE_RIGHT') {
    engagementDelta = 0.01
  } else if (interactionType === 'SKIP' || interactionType === 'SWIPE_LEFT') {
    engagementDelta = -0.005
  }

  const newEngagement = Math.max(
    0,
    Math.min(1, user.engagementScore + engagementDelta)
  )

  await prisma.user.update({
    where: { id: userId },
    data: {
      comprehensionScore: newComprehension,
      engagementScore: newEngagement,
    },
  })
}

// Calculate XP rewards
function calculateXP(interactionType: string, completionRate?: number): number {
  const baseXP: Record<string, number> = {
    COMPLETED: 10,
    SWIPE_UP: 5,
    DOUBLE_TAP: 3,
    SWIPE_RIGHT: 5,
    REPLAY: 2,
  }

  let xp = baseXP[interactionType] || 0

  // Bonus for high completion
  if (completionRate && completionRate >= 0.9) {
    xp += 5
  }

  return xp
}

