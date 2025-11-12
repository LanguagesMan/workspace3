'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useFeedStore } from '@/lib/store'
import type { FeedItem } from '@/lib/feed-types'

function formatDifficulty(tier?: number) {
  if (tier === undefined || tier === null) return 'Adaptive mix'
  if (tier <= 1) return 'Gentle'
  if (tier === 2) return 'Steady'
  if (tier === 3) return 'Stretch'
  if (tier === 4) return 'Challenge'
  return 'Hero'
}

function formatPath(pathId?: string) {
  if (!pathId) return 'Freestyle'
  return pathId
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export default function NextUpRail() {
  const { feedItems, currentIndex, jumpToIndex } = useFeedStore()

  const upcoming = useMemo(() => {
    return feedItems.slice(currentIndex + 1, currentIndex + 4)
  }, [feedItems, currentIndex])

  if (upcoming.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-32 left-0 right-0 px-4 z-20 pointer-events-none">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pointer-events-auto" role="list" aria-label="Upcoming episodes">
        {upcoming.map((item, idx) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.97 }}
            className="min-w-[160px] bg-white/15 backdrop-blur text-white rounded-2xl px-4 py-3 text-left border border-white/20 hover:bg-white/25 transition"
            onClick={() => jumpToIndex(currentIndex + idx + 1)}
            aria-label={`Jump to ${item.title}`}
          >
            <div className="text-[11px] uppercase tracking-wide text-white/60">Next up</div>
            <div className="text-sm font-semibold line-clamp-2">{item.title}</div>
            <div className="mt-1 text-white/60 text-xs">{formatPath(item.learningPathId)}</div>
            <div className="mt-1 flex items-center justify-between text-xs font-medium">
              <span>{formatDifficulty(item.difficultyTier)}</span>
              {item.durationSeconds && (
                <span>{Math.round(item.durationSeconds / 60)}m</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
