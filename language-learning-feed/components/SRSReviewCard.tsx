'use client'

// Invisible SRS review component
// Appears as casual quiz (like TikTok stickers) after content

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

interface SRSReviewCardProps {
  cardId: string
  word: string
  exampleSentence: string
  onComplete: (correct: boolean) => void
}

export default function SRSReviewCard({
  cardId,
  word,
  exampleSentence,
  onComplete,
}: SRSReviewCardProps) {
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [startTime] = useState(Date.now())

  // Generate multiple choice options (mock translations)
  useEffect(() => {
    // In production, fetch real translations from API
    const mockOptions = [
      'to make, to do',  // Correct for "hacer"
      'to eat, to consume',
      'to walk, to go',
      'to speak, to talk',
    ]
    setOptions(mockOptions.sort(() => Math.random() - 0.5))
  }, [word])

  const handleSelect = async (option: string) => {
    if (selectedOption) return // Already selected

    setSelectedOption(option)
    const responseTime = Date.now() - startTime

    // Check if correct (simplified - would use real translation)
    const correct = option === options[0] // Assume first is correct

    setIsCorrect(correct)

    // Track with API
    try {
      await axios.post('/api/srs', {
        cardId,
        correct,
        responseTimeMs: responseTime,
      })
    } catch (error) {
      console.error('Failed to track SRS review:', error)
    }

    // Auto-dismiss after showing result
    setTimeout(() => {
      onComplete(correct)
    }, 1500)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed inset-0 z-50 flex items-end justify-center p-6 pointer-events-none"
      >
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 max-w-lg w-full shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-sm text-white/80 mb-2">Quick check! 🎯</div>
            <div className="text-2xl font-bold text-white mb-3">
              What does <span className="text-yellow-300">&ldquo;{word}&rdquo;</span> mean?
            </div>
            <div className="text-white/70 text-sm italic">
              &ldquo;{exampleSentence}&rdquo;
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedOption === option
              const showResult = isSelected && isCorrect !== null

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: selectedOption ? 1 : 1.02 }}
                  whileTap={{ scale: selectedOption ? 1 : 0.98 }}
                  onClick={() => handleSelect(option)}
                  disabled={!!selectedOption}
                  className={`w-full p-4 rounded-2xl font-semibold text-left transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : isSelected
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  } ${selectedOption && !isSelected ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-2xl"
                      >
                        {isCorrect ? '✓' : '✗'}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Result message */}
          {isCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <div className={`text-lg font-bold ${isCorrect ? 'text-green-200' : 'text-red-200'}`}>
                {isCorrect ? '🎉 Awesome!' : '💪 Keep going!'}
              </div>
              {!isCorrect && (
                <div className="text-white/80 text-sm mt-1">
                  You&apos;ll see this word again soon
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

