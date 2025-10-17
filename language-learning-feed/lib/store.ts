// Global state management using Zustand
// Handles feed state, user progress, and dopamine-driven interactions

import { create } from 'zustand'
import { getFallbackFeed } from '@/lib/fallback-feed'
import type { FeedItem, UserProgress } from '@/lib/feed-types'

interface FeedState {
  // Feed items
  feedItems: FeedItem[]
  currentIndex: number
  isLoading: boolean
  
  // User progress
  progress: UserProgress
  
  // Session tracking
  sessionStartTime: Date | null
  currentSessionXP: number
  
  // Actions
  setFeedItems: (items: FeedItem[], options?: { resetIndex?: boolean }) => void
  nextItem: () => void
  previousItem: () => void
  addXP: (amount: number) => void
  incrementWordsLearned: (count: number) => void
  startSession: () => void
  endSession: () => void
  updateProgress: (progress: Partial<UserProgress>) => void
}

export const useFeedStore = create<FeedState>((set, get) => ({
  // Initial state
  feedItems: getFallbackFeed(10, 0).items,
  currentIndex: 0,
  isLoading: false,
  
  progress: {
    currentStreak: 0,
    wordsLearnedToday: 0,
    minutesImmersedToday: 0,
    totalXP: 0,
    currentLevel: 'A1',
  },
  
  sessionStartTime: null,
  currentSessionXP: 0,
  
  // Actions
  setFeedItems: (items, options = {}) =>
    set((state) => {
      const shouldReset =
        options.resetIndex ?? state.feedItems.length === 0
      const nextIndex = shouldReset
        ? 0
        : Math.min(state.currentIndex, Math.max(items.length - 1, 0))

      return {
        feedItems: [...items],
        currentIndex: nextIndex,
        isLoading: false,
      }
    }),
  
  nextItem: () => {
    const { currentIndex, feedItems } = get()
    if (currentIndex < feedItems.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    } else {
      // Trigger loading more items
      set({ isLoading: true })
    }
  },
  
  previousItem: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
    }
  },
  
  addXP: (amount) => {
    set((state) => ({
      progress: {
        ...state.progress,
        totalXP: state.progress.totalXP + amount,
      },
      currentSessionXP: state.currentSessionXP + amount,
    }))
  },
  
  incrementWordsLearned: (count) => {
    set((state) => ({
      progress: {
        ...state.progress,
        wordsLearnedToday: state.progress.wordsLearnedToday + count,
      },
    }))
  },
  
  startSession: () => {
    set({ sessionStartTime: new Date(), currentSessionXP: 0 })
  },
  
  endSession: () => {
    const { sessionStartTime } = get()
    if (sessionStartTime) {
      const minutesImmersed = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)
      set((state) => ({
        sessionStartTime: null,
        progress: {
          ...state.progress,
          minutesImmersedToday: state.progress.minutesImmersedToday + minutesImmersed,
        },
      }))
    }
  },
  
  updateProgress: (newProgress) => {
    set((state) => ({
      progress: {
        ...state.progress,
        ...newProgress,
      },
    }))
  },
}))

// Celebration animations state
interface CelebrationState {
  showConfetti: boolean
  celebrationMessage: string | null
  triggerConfetti: (message: string) => void
  clearCelebration: () => void
}

export const useCelebrationStore = create<CelebrationState>((set) => ({
  showConfetti: false,
  celebrationMessage: null,
  
  triggerConfetti: (message) => {
    set({ showConfetti: true, celebrationMessage: message })
    // Auto-clear after 3 seconds
    setTimeout(() => {
      set({ showConfetti: false, celebrationMessage: null })
    }, 3000)
  },
  
  clearCelebration: () => {
    set({ showConfetti: false, celebrationMessage: null })
  },
}))
