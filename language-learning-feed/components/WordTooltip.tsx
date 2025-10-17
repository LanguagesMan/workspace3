'use client'

// Interactive word translation tooltip
// Tap any word to see instant translation

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WordTooltipProps {
  word: string
  isNew?: boolean
  onLookup: (word: string) => void
}

export default function WordTooltip({ word, isNew, onLookup }: WordTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [translation, setTranslation] = useState<string | null>(null)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (showTooltip) {
      setShowTooltip(false)
      return
    }

    onLookup(word)
    setShowTooltip(true)

    // Fetch translation (mock for now)
    // In production, this would call translation API
    setTimeout(() => {
      setTranslation(`Translation of "${word}"`)
    }, 200)
  }

  return (
    <span className="relative inline-block">
      <span
        className={`cursor-pointer hover:bg-white/10 px-1 rounded transition-colors ${
          isNew ? 'text-purple-300 font-semibold underline decoration-purple-400 decoration-2' : ''
        }`}
        onClick={handleClick}
      >
        {word}{' '}
      </span>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
          >
            <div className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-xl text-sm whitespace-nowrap">
              <div className="font-semibold">{word}</div>
              {translation && <div className="text-gray-600 text-xs mt-1">{translation}</div>}
              {isNew && (
                <div className="text-purple-600 text-xs mt-1 font-medium">✨ New word!</div>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-8 border-transparent border-t-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}


