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
  appendFeedItems: (items: FeedItem[]) => void
  insertAfterCurrent: (item: FeedItem) => void
  removeItemById: (id: string) => void
  setLoading: (loading: boolean) => void
  jumpToIndex: (index: number) => void
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
  
  appendFeedItems: (items) =>
    set((state) => {
      if (items.length === 0) return state
      const existingIds = new Set(state.feedItems.map((item) => item.id))
      const deduped = items.filter((item) => !existingIds.has(item.id))
      return deduped.length
        ? {
            ...state,
            feedItems: [...state.feedItems, ...deduped],
            isLoading: false,
          }
        : state
    }),
  
  insertAfterCurrent: (item) =>
    set((state) => {
      const items = [...state.feedItems]
      const existingIndex = items.findIndex((entry) => entry.id === item.id)
      if (existingIndex !== -1) {
        items.splice(existingIndex, 1)
      }

      const insertIndex = Math.min(state.currentIndex + 1, items.length)
      items.splice(insertIndex, 0, item)

      return {
        ...state,
        feedItems: items,
      }
    }),
  
  removeItemById: (id) =>
    set((state) => {
      const updatedItems = state.feedItems.filter((item) => item.id !== id)
      const nextIndex = Math.min(state.currentIndex, Math.max(updatedItems.length - 1, 0))
      return {
        ...state,
        feedItems: updatedItems,
        currentIndex: nextIndex,
      }
    }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  jumpToIndex: (index) =>
    set((state) => {
      if (index < 0 || index >= state.feedItems.length) return state
      return {
        ...state,
        currentIndex: index,
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
