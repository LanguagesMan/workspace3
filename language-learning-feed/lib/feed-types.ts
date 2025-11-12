// Shared feed-related types used across client and server code.

export type ContentType =
  | 'VIDEO'
  | 'ARTICLE'
  | 'PODCAST'
  | 'MUSIC'
  | 'IMAGE_AUDIO'
  | 'SOCIAL_POST'

export interface CaptionSegment {
  start: number
  end: number
  text: string
  translation?: string
}

export interface FeedItem {
  id: string
  type: ContentType
  title: string
  contentUrl: string
  thumbnailUrl?: string
  transcription?: string
  durationSeconds?: number
  newWords: string[]
  knownWordsPercentage: number
  captions?: CaptionSegment[]
  learningPathId?: string
  sequenceOrder?: number
  difficultyTier?: number
  arcSummary?: string
}

export interface UserProgress {
  currentStreak: number
  wordsLearnedToday: number
  minutesImmersedToday: number
  totalXP: number
  currentLevel: string
}

