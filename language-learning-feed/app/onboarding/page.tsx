'use client'

// Zero-friction onboarding for absolute beginners (A0 level)
// Pure immersion: visual associations, no translation

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface OnboardingCard {
  image: string
  word: string
  audio: string
  translation?: string // Hidden initially
}

// First 50 most common words with visual associations
const BEGINNER_CARDS: OnboardingCard[] = [
  { image: '🍎', word: 'manzana', audio: '/audio/manzana.mp3', translation: 'apple' },
  { image: '💧', word: 'agua', audio: '/audio/agua.mp3', translation: 'water' },
  { image: '🏠', word: 'casa', audio: '/audio/casa.mp3', translation: 'house' },
  { image: '🐕', word: 'perro', audio: '/audio/perro.mp3', translation: 'dog' },
  { image: '🐱', word: 'gato', audio: '/audio/gato.mp3', translation: 'cat' },
  // ... would include 45 more cards
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentCard, setCurrentCard] = useState(0)
  const [score, setScore] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [language, setLanguage] = useState<string | null>(null)
  const [step, setStep] = useState<'welcome' | 'language' | 'level' | 'learning'>('welcome')

  // Auto-play audio when card changes
  useEffect(() => {
    if (step === 'learning' && BEGINNER_CARDS[currentCard]) {
      const audio = new Audio(BEGINNER_CARDS[currentCard].audio)
      audio.play().catch(() => {
        // Audio autoplay blocked - user needs to interact first
      })
    }
  }, [currentCard, step])

  const handleNext = () => {
    if (currentCard < BEGINNER_CARDS.length - 1) {
      setCurrentCard(currentCard + 1)
      setShowTranslation(false)
    } else {
      // Completed onboarding
      router.push('/feed')
    }
  }

  const playAudio = () => {
    const audio = new Audio(BEGINNER_CARDS[currentCard].audio)
    audio.play()
  }

  // Welcome screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl text-center text-white"
        >
          <h1 className="text-6xl font-bold mb-6">
            Learn languages through <span className="text-yellow-300">content you love</span>
          </h1>
          <p className="text-2xl mb-8 opacity-90">
            No boring lessons. No flashcards. Just swipe, watch, and learn naturally.
          </p>
          <p className="text-xl mb-12 opacity-80">
            Get fluent in 6 months by consuming viral videos, music, news, and articles.
          </p>
          <button
            onClick={() => setStep('language')}
            className="px-12 py-6 bg-white text-purple-600 rounded-full font-bold text-2xl hover:scale-105 transition-transform shadow-2xl"
          >
            Start Your Journey
          </button>
        </motion.div>
      </div>
    )
  }

  // Language selection
  if (step === 'language') {
    const languages = [
      { code: 'es', name: 'Spanish', flag: '🇪🇸', learners: '24M' },
      { code: 'fr', name: 'French', flag: '🇫🇷', learners: '18M' },
      { code: 'de', name: 'German', flag: '🇩🇪', learners: '12M' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵', learners: '15M' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳', learners: '20M' },
      { code: 'it', name: 'Italian', flag: '🇮🇹', learners: '8M' },
      { code: 'pt', name: 'Portuguese', flag: '🇧🇷', learners: '10M' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷', learners: '11M' },
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Which language do you want to learn?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setLanguage(lang.code)
                  setStep('level')
                }}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-2xl transition-shadow"
              >
                <div className="text-6xl mb-3">{lang.flag}</div>
                <div className="text-xl font-bold text-gray-800">{lang.name}</div>
                <div className="text-sm text-gray-500 mt-1">{lang.learners} learners</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Level selection
  if (step === 'level') {
    const levels = [
      {
        level: 'A0',
        title: 'Complete Beginner',
        description: "I don't know any words yet",
        emoji: '🌱',
      },
      {
        level: 'A1',
        title: 'Beginner',
        description: 'I know some basic words and phrases',
        emoji: '🌿',
      },
      {
        level: 'A2',
        title: 'Elementary',
        description: 'I can have simple conversations',
        emoji: '🌳',
      },
      {
        level: 'B1',
        title: 'Intermediate',
        description: 'I can discuss familiar topics',
        emoji: '🏔️',
      },
      {
        level: 'B2',
        title: 'Upper Intermediate',
        description: 'I can express myself fluently',
        emoji: '🚀',
      },
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-blue-600 p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            What's your current level?
          </h2>
          <div className="space-y-4">
            {levels.map((level) => (
              <motion.button
                key={level.level}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('learning')}
                className="w-full bg-white rounded-2xl p-6 text-left hover:shadow-2xl transition-shadow flex items-center gap-6"
              >
                <div className="text-6xl">{level.emoji}</div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-800">{level.title}</div>
                  <div className="text-gray-600 mt-1">{level.description}</div>
                  <div className="text-purple-600 font-semibold text-sm mt-2">{level.level}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Learning phase (for A0 beginners)
  const card = BEGINNER_CARDS[currentCard]
  const progress = ((currentCard + 1) / BEGINNER_CARDS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex flex-col">
      {/* Progress bar */}
      <div className="h-2 bg-white/20">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-green-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-2xl w-full text-center"
          >
            {/* Visual */}
            <div className="text-9xl mb-8">{card.image}</div>

            {/* Word in target language */}
            <h2 className="text-6xl font-bold text-white mb-6">{card.word}</h2>

            {/* Play audio button */}
            <button
              onClick={playAudio}
              className="mb-8 px-8 py-4 bg-white text-purple-900 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-lg"
            >
              🔊 Listen
            </button>

            {/* Tap to reveal translation */}
            <div className="mb-8">
              {showTranslation ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl text-white/80"
                >
                  {card.translation}
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowTranslation(true)}
                  className="text-white/60 hover:text-white/90 text-lg underline"
                >
                  Tap to see meaning
                </button>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="px-12 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-lg"
            >
              {currentCard < BEGINNER_CARDS.length - 1 ? 'Next' : 'Start Exploring'}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Score */}
      <div className="p-6 text-center text-white/80">
        <div className="text-lg">
          {currentCard + 1} / {BEGINNER_CARDS.length} words
        </div>
      </div>
    </div>
  )
}


