// SuperMemo SM-2 Algorithm with modifications for contextual learning
// More forgiving than traditional SRS - focuses on long-term retention

export interface SRSReview {
  quality: number // 0-5 rating of recall quality
  responseTime: number // milliseconds
}

export interface SRSCardState {
  easeFactor: number
  interval: number // days
  repetitions: number
}

/**
 * Calculate next review parameters using modified SM-2 algorithm
 * @param currentState Current SRS card state
 * @param review User's review performance
 * @returns Updated SRS state and next review date
 */
export function calculateNextReview(
  currentState: SRSCardState,
  review: SRSReview
): { state: SRSCardState; nextReviewAt: Date } {
  const { quality } = review
  let { easeFactor, interval, repetitions } = currentState

  // Modified ease factor calculation (more forgiving)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  // Calculate new interval based on quality
  if (quality < 3) {
    // Failed review - reduce interval but don't reset completely (forgiveness)
    repetitions = 0
    interval = Math.max(1, Math.floor(interval * 0.5))
  } else {
    // Successful review - increase interval
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 3
    } else {
      interval = Math.ceil(interval * easeFactor)
    }
  }

  // Cap maximum interval at 180 days
  interval = Math.min(interval, 180)

  // Calculate next review date
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + interval)

  return {
    state: {
      easeFactor,
      interval,
      repetitions,
    },
    nextReviewAt,
  }
}

/**
 * Convert response time and accuracy to SM-2 quality rating
 * Fast correct answers = higher quality
 */
export function inferQuality(correct: boolean, responseTimeMs: number): number {
  if (!correct) {
    // Failed - but give partial credit for slow attempts
    return responseTimeMs > 10000 ? 1 : 0
  }

  // Correct answer - quality based on speed
  if (responseTimeMs < 1500) return 5 // Perfect recall
  if (responseTimeMs < 3000) return 4 // Good recall
  if (responseTimeMs < 5000) return 3 // Acceptable recall
  return 3 // Slow but correct
}

/**
 * Calculate word confidence score based on exposure and performance
 * Used for adaptive difficulty matching
 */
export function calculateConfidence(
  exposureCount: number,
  correctReviews: number,
  incorrectReviews: number,
  lookupCount: number
): number {
  const totalReviews = correctReviews + incorrectReviews
  
  if (totalReviews === 0) {
    // No reviews yet - confidence based on exposure
    return Math.min(0.3, exposureCount * 0.05)
  }

  const accuracy = correctReviews / totalReviews
  const exposureFactor = Math.min(1, exposureCount / 10)
  const lookupPenalty = Math.max(0, 1 - lookupCount * 0.1)

  return Math.min(1, accuracy * exposureFactor * lookupPenalty)
}

/**
 * Determine if content is at appropriate difficulty for user
 * Based on i+1 principle: 96% known words, 4% new
 */
export function isAppropriateLevel(
  knownWordsPercentage: number,
  targetPercentage: number = 0.96
): {
  appropriate: boolean
  difficulty: 'too_easy' | 'perfect' | 'too_hard'
} {
  const tolerance = 0.05 // 5% tolerance

  if (knownWordsPercentage >= targetPercentage + tolerance) {
    return { appropriate: false, difficulty: 'too_easy' }
  } else if (knownWordsPercentage < targetPercentage - tolerance * 2) {
    return { appropriate: false, difficulty: 'too_hard' }
  } else {
    return { appropriate: true, difficulty: 'perfect' }
  }
}

/**
 * Calculate optimal review time based on circadian rhythm and user patterns
 * Peak learning times: morning (9-11am) and evening (7-9pm)
 */
export function getOptimalReviewTime(nextReviewDate: Date, userTimeZone: string = 'UTC'): Date {
  // For now, default to 9 AM in user's timezone
  // In production, this would analyze user's historical engagement patterns
  const optimalTime = new Date(nextReviewDate)
  optimalTime.setHours(9, 0, 0, 0)
  return optimalTime
}


