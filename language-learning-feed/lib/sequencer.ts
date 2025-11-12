import { prisma } from '@/lib/prisma'
import { feedCache } from '@/lib/redis'
import { isAppropriateLevel } from '@/lib/srs-algorithm'
import type { FeedItem } from '@/lib/feed-types'

export type DifficultyFeedback = 'too_easy' | 'too_hard' | 'perfect'

interface AdaptiveFeedOptions {
  userId: string
  limit?: number
  offset?: number
  feedback?: DifficultyFeedback
  currentContentId?: string
  excludeIds?: string[]
  useCache?: boolean
}

interface AdaptiveFeedResult {
  items: FeedItem[]
  total: number
  fromCache: boolean
  context: {
    targetDifficultyTier: number
    learningPathId?: string | null
    sequenceOrder?: number | null
  }
}

const CEFR_TO_TIER: Record<string, number> = {
  A0: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
}

function clampTier(value: number) {
  return Math.max(0, Math.min(6, value))
}

function computeKnownPercentage(words: { word: string }[], knownWords: Set<string>) {
  if (words.length === 0) return 0
  const knownCount = words.filter((word) => knownWords.has(word.word.toLowerCase())).length
  return knownCount / words.length
}

function computeScore(params: {
  content: any
  knownPercentage: number
  targetDifficultyTier: number
  targetPathId?: string | null
  nextSequenceOrder?: number | null
  dueWordBoost: boolean
  preferredDifficulty: number
}) {
  const {
    content,
    knownPercentage,
    targetDifficultyTier,
    targetPathId,
    nextSequenceOrder,
    dueWordBoost,
    preferredDifficulty,
  } = params

  const itemTier = typeof content.difficultyTier === 'number' ? content.difficultyTier : targetDifficultyTier
  const difficultyDelta = Math.abs(itemTier - targetDifficultyTier)
  const difficultyScore = 1 - Math.min(1, difficultyDelta / 3)

  const { appropriate } = isAppropriateLevel(knownPercentage, preferredDifficulty)
  const comprehensionScore = appropriate ? 1 : 0.45

  const pathScore = content.learningPathId && targetPathId && content.learningPathId === targetPathId ? 1 : 0.6

  let sequenceScore = 0.6
  if (
    typeof nextSequenceOrder === 'number' &&
    typeof content.sequenceOrder === 'number'
  ) {
    const delta = Math.abs(content.sequenceOrder - nextSequenceOrder)
    sequenceScore = 1 / (1 + delta)
  }

  const dopamineScore = content.dopamineScore ?? 0.5

  const total =
    difficultyScore * 0.35 +
    comprehensionScore * 0.25 +
    pathScore * 0.15 +
    sequenceScore * 0.15 +
    dopamineScore * 0.08 +
    (dueWordBoost ? 0.07 : 0)

  return total
}

export async function getAdaptiveFeed(options: AdaptiveFeedOptions): Promise<AdaptiveFeedResult> {
  const {
    userId,
    limit = 10,
    offset = 0,
    feedback,
    currentContentId,
    excludeIds = [],
    useCache = true,
  } = options

  if (!userId) {
    throw new Error('userId is required for adaptive feed')
  }

  if (useCache && offset === 0 && !feedback) {
    const cachedIds = await feedCache.getUserFeed(userId)
    if (cachedIds && cachedIds.length) {
      const cachedContent = await prisma.content.findMany({
        where: { id: { in: cachedIds.slice(0, limit + offset) } },
        include: { words: { select: { word: true } } },
      })

      const items = cachedIds
        .slice(offset, offset + limit)
        .map((id) => cachedContent.find((content) => content.id === id))
        .filter(Boolean)
        .map((content) => serializeContent(content!, new Set(), new Set()))

      if (items.length) {
        return {
          items,
          total: cachedIds.length,
          fromCache: true,
          context: {
            targetDifficultyTier: 0,
          },
        }
      }
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      wordKnowledge: {
        where: { confidenceScore: { gte: 0.1 } },
        select: { word: true, confidenceScore: true, nextReviewAt: true },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const preferences = user.preferences ?? null
  const knownWords = new Set(
    user.wordKnowledge
      .filter((word) => word.confidenceScore >= 0.6)
      .map((word) => word.word.toLowerCase())
  )

  const dueWords = new Set(
    user.wordKnowledge
      .filter((word) => word.nextReviewAt && word.nextReviewAt <= new Date())
      .map((word) => word.word.toLowerCase())
  )

  let baseTier = CEFR_TO_TIER[user.currentLevel] ?? 0
  let difficultyBias = preferences?.difficultyBias ?? 0

  if (feedback === 'too_easy') difficultyBias += 1
  if (feedback === 'too_hard') difficultyBias -= 1

  difficultyBias = Math.max(-3, Math.min(3, difficultyBias))

  let targetDifficultyTier = clampTier(baseTier + difficultyBias)
  if (feedback === 'too_easy') targetDifficultyTier = clampTier(targetDifficultyTier + 1)
  if (feedback === 'too_hard') targetDifficultyTier = clampTier(targetDifficultyTier - 1)

  // Determine learning path context
  let targetPathId = preferences?.currentPathId ?? null
  let nextSequenceOrder = preferences?.currentSequenceOrder ?? null

  if (currentContentId) {
    const currentContent = await prisma.content.findUnique({
      where: { id: currentContentId },
      select: { learningPathId: true, sequenceOrder: true, difficultyTier: true },
    })

    if (currentContent) {
      if (currentContent.learningPathId) {
        targetPathId = currentContent.learningPathId
      }

      if (typeof currentContent.sequenceOrder === 'number') {
        nextSequenceOrder = currentContent.sequenceOrder + 1
      }

      if (typeof currentContent.difficultyTier === 'number' && !feedback) {
        targetDifficultyTier = clampTier(currentContent.difficultyTier)
      }
    }
  }

  // Expand search radius for difficulty tiers
  const tierLowerBound = clampTier(targetDifficultyTier - 1)
  const tierUpperBound = clampTier(targetDifficultyTier + 1)

  const candidateContent = await prisma.content.findMany({
    where: {
      language: user.targetLanguage,
      difficultyTier: {
        gte: tierLowerBound,
        lte: tierUpperBound,
      },
      id: {
        notIn: [currentContentId, ...excludeIds].filter(Boolean) as string[],
      },
    },
    include: {
      words: {
        select: { word: true },
      },
    },
    orderBy: [
      { learningPathId: 'asc' },
      { sequenceOrder: 'asc' },
      { dopamineScore: 'desc' },
    ],
    take: 250,
  })

  const preferredDifficulty = preferences?.preferredDifficulty ?? 0.96

  const scored = candidateContent
    .map((content) => {
      const knownPercentage = computeKnownPercentage(content.words, knownWords)
      const dueWordBoost = content.words.some((word) => dueWords.has(word.word.toLowerCase()))
      const score = computeScore({
        content,
        knownPercentage,
        targetDifficultyTier,
        targetPathId,
        nextSequenceOrder,
        dueWordBoost,
        preferredDifficulty,
      })

      return {
        content,
        score,
        knownPercentage,
      }
    })
    .filter(({ score }) => score > 0.25)
    .sort((a, b) => b.score - a.score)

  const selected = scored.slice(offset, offset + limit)
  const items = selected.map(({ content, knownPercentage }) =>
    serializeContent(content, knownWords, dueWords, knownPercentage)
  )

  const selectedPathId = items.find((item) => item.learningPathId)?.learningPathId ?? targetPathId
  const selectedSequenceOrder = items.find((item) => typeof item.sequenceOrder === 'number')?.sequenceOrder ?? nextSequenceOrder

  await persistPreferenceState({
    userId,
    hasPreferences: Boolean(preferences),
    difficultyBias,
    feedback,
    selectedPathId,
    selectedSequenceOrder,
  })

  if (useCache && offset === 0 && !feedback && items.length) {
    await feedCache.setUserFeed(
      userId,
      scored.slice(0, 50).map(({ content }) => content.id),
      1800
    )
  }

  return {
    items,
    total: scored.length,
    fromCache: false,
    context: {
      targetDifficultyTier,
      learningPathId: selectedPathId,
      sequenceOrder: selectedSequenceOrder ?? null,
    },
  }
}

export async function getAdaptiveNext(options: AdaptiveFeedOptions) {
  const result = await getAdaptiveFeed({
    ...options,
    limit: 1,
    offset: 0,
    useCache: false,
  })

  return result.items[0] ?? null
}

function serializeContent(
  content: any,
  knownWords: Set<string>,
  dueWords: Set<string>,
  knownPercentageOverride?: number
): FeedItem {
  const words = Array.isArray(content.words) ? content.words : []
  const knownPercentage =
    typeof knownPercentageOverride === 'number'
      ? knownPercentageOverride
      : computeKnownPercentage(words, knownWords)

  const newWords = words
    .map((word) => word.word.toLowerCase())
    .filter((word) => !knownWords.has(word))
    .slice(0, 10)

  return {
    id: content.id,
    type: content.type,
    title: content.title,
    contentUrl: content.contentUrl,
    thumbnailUrl: content.thumbnailUrl ?? undefined,
    transcription: content.transcription ?? undefined,
    durationSeconds: content.durationSeconds ?? undefined,
    newWords,
    knownWordsPercentage: knownPercentage,
    captions: content.captions ?? undefined,
    learningPathId: content.learningPathId ?? undefined,
    sequenceOrder: content.sequenceOrder ?? undefined,
    difficultyTier: content.difficultyTier ?? undefined,
    arcSummary: content.arcSummary ?? undefined,
  }
}

async function persistPreferenceState(params: {
  userId: string
  hasPreferences: boolean
  difficultyBias: number
  feedback?: DifficultyFeedback
  selectedPathId?: string | null
  selectedSequenceOrder?: number | null
}) {
  const { userId, hasPreferences, difficultyBias, feedback, selectedPathId, selectedSequenceOrder } = params

  const recentEvent = feedback
    ? {
        type: feedback,
        at: new Date().toISOString(),
        pathId: selectedPathId ?? null,
      }
    : null

  if (hasPreferences) {
    const currentPrefs = await prisma.userPreference.findUnique({
      where: { userId },
      select: { recentFeedback: true },
    })

    const feedbackLog = Array.isArray(currentPrefs?.recentFeedback)
      ? [...currentPrefs!.recentFeedback]
      : []

    if (recentEvent) {
      feedbackLog.push(recentEvent)
      while (feedbackLog.length > 12) feedbackLog.shift()
    }

    await prisma.userPreference.update({
      where: { userId },
      data: {
        difficultyBias,
        currentPathId: selectedPathId ?? undefined,
        currentSequenceOrder: selectedSequenceOrder ?? undefined,
        recentFeedback: feedbackLog,
      },
    })
  } else {
    await prisma.userPreference.create({
      data: {
        userId,
        difficultyBias,
        currentPathId: selectedPathId ?? undefined,
        currentSequenceOrder: selectedSequenceOrder ?? undefined,
        recentFeedback: recentEvent ? [recentEvent] : [],
      },
    })
  }
}
