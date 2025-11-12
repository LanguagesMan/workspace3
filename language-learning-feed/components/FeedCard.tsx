'use client'

// TikTok-style content card with swipe gestures
// The core dopamine-delivery mechanism

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { FeedItem } from '@/lib/feed-types'
import VideoPlayer from './VideoPlayer'
import WordTooltip from './WordTooltip'
import Image from 'next/image'

interface FeedCardProps {
  item: FeedItem
  onSwipeUp: () => void
  onSwipeDown: () => void
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onDoubleTap: () => void
  onComplete: (timeSpent: number) => void
}

export default function FeedCard({
  item,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
  onComplete,
}: FeedCardProps) {
  const [, setSelectedWord] = useState<string | null>(null)
  const startTimeRef = useRef(Date.now())
  const lastTap = useRef(0)

  const formatPathLabel = useCallback((pathId?: string) => {
    if (!pathId) return 'Freestyle discovery'
    return pathId
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ')
  }, [])

  const formatDifficultyLabel = useCallback((tier?: number) => {
    if (tier === undefined || tier === null) return 'Adaptive mix'
    if (tier <= 1) return 'Gentle A0-A1'
    if (tier === 2) return 'Steady A1'
    if (tier === 3) return 'Stretch A2'
    if (tier === 4) return 'Challenge B1'
    return 'Hero mode'
  }, [])

  // Swipe gesture handling
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-300, 300], [10, -10])
  const rotateY = useTransform(x, [-300, 300], [-10, 10])
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0])

  // Handle drag end
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100

    // Horizontal swipes
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        onSwipeRight() // Save
      } else {
        onSwipeLeft() // Too hard
      }
    }

    // Vertical swipes
    if (Math.abs(info.offset.y) > threshold) {
      if (info.offset.y > 0) {
        onSwipeDown() // Previous
      } else {
        onSwipeUp() // Next
      }
    }
  }

  // Double tap detection
  const handleTap = () => {
    const now = Date.now()
    const timeSince = now - lastTap.current

    if (timeSince < 300 && timeSince > 0) {
      onDoubleTap()
      // Show heart animation
      const heart = document.createElement('div')
      heart.innerHTML = '❤️'
      heart.className = 'absolute text-6xl animate-ping'
      heart.style.left = '50%'
      heart.style.top = '50%'
      heart.style.transform = 'translate(-50%, -50%)'
      document.getElementById('feed-card-container')?.appendChild(heart)
      setTimeout(() => heart.remove(), 1000)
    }

    lastTap.current = now
  }

  // Track completion
  useEffect(() => {
    const startTime = startTimeRef.current

    return () => {
      const timeSpent = (Date.now() - startTime) / 1000
      onComplete(timeSpent)
    }
  }, [onComplete])

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [item.id])

  return (
    <motion.div
      id="feed-card-container"
      className="absolute inset-0 flex items-center justify-center"
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        opacity,
      }}
      onClick={handleTap}
    >
      <div
        className="relative w-full max-w-md h-[80vh] bg-black rounded-3xl overflow-hidden shadow-2xl"
        role="article"
        aria-label={`${item.title} learning episode`}
      >
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
              {formatPathLabel(item.learningPathId)}
            </div>
            {typeof item.sequenceOrder === 'number' && (
              <div className="text-lg font-bold">Episode {item.sequenceOrder}</div>
            )}
          </div>
          <div className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
            {formatDifficultyLabel(item.difficultyTier)}
          </div>
        </div>

        {item.arcSummary && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[85%] text-center text-white/80 text-xs bg-black/40 backdrop-blur rounded-2xl px-4 py-2 pointer-events-none">
            {item.arcSummary}
          </div>
        )}

        {/* Content based on type */}
        {item.type === 'VIDEO' && (
          <VideoPlayer
            src={item.contentUrl}
            thumbnail={item.thumbnailUrl}
            captions={item.captions}
          />
        )}

        {item.type === 'ARTICLE' && (
          <div className="h-full overflow-y-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
            <div className="text-lg leading-relaxed space-y-4">
              {item.transcription?.split('\n').map((paragraph, i) => (
                <p key={i} className="hover:bg-slate-700/30 p-2 rounded transition-colors">
                  {paragraph.split(' ').map((word, j) => (
                    <WordTooltip
                      key={j}
                      word={word}
                      isNew={item.newWords.includes(word.toLowerCase())}
                      onLookup={(w) => setSelectedWord(w)}
                    />
                  ))}
                </p>
              ))}
            </div>
          </div>
        )}

        {item.type === 'IMAGE_AUDIO' && (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
            <div className="text-center">
              {item.thumbnailUrl && (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  width={256}
                  height={256}
                  className="w-64 h-64 object-cover rounded-2xl mb-6 shadow-lg"
                />
              )}
              <h3 className="text-4xl font-bold text-white mb-4">{item.title}</h3>
              <button
                className="px-8 py-4 bg-white text-purple-900 rounded-full font-semibold text-xl hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation()
                  // Play audio
                }}
              >
                🔊 Listen
              </button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" aria-hidden="true">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: `${item.knownWordsPercentage * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        {/* New words indicator */}
        {item.newWords.length > 0 && (
          <div className="absolute top-6 right-6 bg-purple-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
            +{item.newWords.length} new words
          </div>
        )}

        {/* Swipe hints (fade after first use) */}
        <div className="absolute inset-x-0 bottom-20 flex justify-between px-8 pointer-events-none">
          <div className="text-white/50 text-sm">
            ← Too hard
          </div>
          <div className="text-white/50 text-sm">
            Save →
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 text-center pointer-events-none">
          <div className="text-white/50 text-sm">
            Swipe up for next
          </div>
          {item.learningPathId && (
            <div className="mt-1 text-white/40 text-xs">
              Next milestone unlocking {formatPathLabel(item.learningPathId)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
