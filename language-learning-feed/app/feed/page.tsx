'use client'

// Main feed page - The core infinite scroll experience
// TikTok-style vertical feed with invisible learning

import { useEffect, useState, useCallback, useRef } from 'react'
import { useFeedStore, useCelebrationStore } from '@/lib/store'
import FeedCard from '@/components/FeedCard'
import ProgressDashboard from '@/components/ProgressDashboard'
import axios from 'axios'

export default function FeedPage() {
  const { feedItems, currentIndex, setFeedItems, nextItem, previousItem, addXP, incrementWordsLearned, startSession } = useFeedStore()
  const { triggerConfetti } = useCelebrationStore()
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId] = useState('demo-user-id') // Would come from auth
  const preloadedVideos = useRef<Set<string>>(new Set())

  // Load initial feed
  const loadFeed = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/feed', {
        params: {
          userId: currentUserId,
          limit: 10,
          offset: 0,
        },
      })

      setFeedItems(response.data.items, { resetIndex: true })
    } catch (error) {
      console.error('Failed to load feed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId, setFeedItems])

  useEffect(() => {
    loadFeed()
    startSession()
  }, [loadFeed, startSession])

const loadMoreItems = useCallback(async () => {
  try {
    const response = await axios.get('/api/feed', {
      params: {
        userId: currentUserId,
        limit: 10,
        offset: feedItems.length,
      },
    })

    setFeedItems([...feedItems, ...response.data.items])
  } catch (error) {
    console.error('Failed to load more items:', error)
  }
}, [currentUserId, feedItems, setFeedItems])

// Preload next items when getting close to end
useEffect(() => {
  if (currentIndex >= feedItems.length - 3 && !isLoading) {
    loadMoreItems()
  }
}, [currentIndex, feedItems.length, isLoading, loadMoreItems])

// Preload current and upcoming videos to eliminate loading hitches
useEffect(() => {
  if (typeof document === 'undefined') return
  const head = document.head
  if (!head) return

  feedItems
    .filter((item, index) => item.type === 'VIDEO' && index <= currentIndex + 3)
    .forEach((item) => {
      if (preloadedVideos.current.has(item.contentUrl)) return
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'video'
      link.href = item.contentUrl
      head.appendChild(link)
      preloadedVideos.current.add(item.contentUrl)
    })
}, [feedItems, currentIndex])

  // Track interaction with API
  const trackInteraction = useCallback(
    async (
      interactionType: string,
      timeSpent?: number,
      completionRate?: number,
      wordsLookedUp?: number
    ) => {
      const currentItem = feedItems[currentIndex]
      if (!currentItem) return

      try {
        const response = await axios.post('/api/interaction', {
          userId: currentUserId,
          contentId: currentItem.id,
          interactionType,
          timeSpentSeconds: timeSpent,
          completionRate,
          wordsLookedUp,
        })

        // Award XP
        if (response.data.xpEarned) {
          addXP(response.data.xpEarned)

          // Celebrate milestones
          if (response.data.xpEarned >= 10) {
            triggerConfetti(`+${response.data.xpEarned} XP!`)
          }
        }
      } catch (error) {
        console.error('Failed to track interaction:', error)
      }
    },
    [currentUserId, currentIndex, feedItems, addXP, triggerConfetti]
  )

  const handleSwipeUp = () => {
    trackInteraction('SWIPE_UP')
    nextItem()
  }

  const handleSwipeDown = () => {
    previousItem()
  }

  const handleSwipeLeft = () => {
    trackInteraction('SWIPE_LEFT')
    nextItem()
  }

  const handleSwipeRight = () => {
    trackInteraction('SWIPE_RIGHT')
    
    // Add new words to SRS
    const currentItem = feedItems[currentIndex]
    if (currentItem?.newWords) {
      incrementWordsLearned(currentItem.newWords.length)
      triggerConfetti(`+${currentItem.newWords.length} words saved!`)
    }
    
    nextItem()
  }

  const handleDoubleTap = () => {
    trackInteraction('DOUBLE_TAP')
    addXP(3)
  }

  const handleComplete = (timeSpent: number) => {
    const currentItem = feedItems[currentIndex]
    if (!currentItem) return

    const completionRate = timeSpent / (currentItem.durationSeconds || 60)
    trackInteraction('COMPLETED', timeSpent, Math.min(completionRate, 1))
  }

  if (isLoading && feedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Loading your feed...
        </div>
      </div>
    )
  }

  const currentItem = feedItems[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Progress Dashboard */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4">
        <ProgressDashboard />
      </div>

      {/* Feed Container */}
      <div className="relative h-screen flex items-center justify-center pt-48">
        {currentItem ? (
          <FeedCard
            key={currentItem.id}
            item={currentItem}
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onDoubleTap={handleDoubleTap}
            onComplete={handleComplete}
          />
        ) : (
          <div className="text-white text-xl">No more content</div>
        )}

        {/* Preload next video */}
        {feedItems[currentIndex + 1]?.type === 'VIDEO' && (
          <video
            src={feedItems[currentIndex + 1].contentUrl}
            preload="auto"
            className="hidden"
          />
        )}
      </div>

      {/* Bottom navigation hints */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-8 z-30 pointer-events-none">
        <div className="text-white/50 text-sm">← Skip if too hard</div>
        <div className="text-white/50 text-sm">Save & learn →</div>
      </div>
    </div>
  )
}
