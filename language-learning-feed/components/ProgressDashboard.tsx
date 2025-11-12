'use client'

// Gamification dashboard with streaks, XP, and celebrations
// Never says "study" - always positive framing

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFeedStore, useCelebrationStore } from '@/lib/store'

export default function ProgressDashboard() {
  const { progress } = useFeedStore()
  const { showConfetti, celebrationMessage } = useCelebrationStore()
  const [xpProgress, setXpProgress] = useState(0)

  // Calculate level and progress
  const level = Math.floor(progress.totalXP / 1000) + 1
  const xpInLevel = progress.totalXP % 1000
  const xpForNextLevel = 1000

  useEffect(() => {
    // Animate XP bar
    setTimeout(() => {
      setXpProgress((xpInLevel / xpForNextLevel) * 100)
    }, 100)
  }, [xpInLevel, xpForNextLevel])

  return (
    <>
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
          {celebrationMessage && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-purple-900 px-8 py-4 rounded-2xl shadow-2xl font-bold text-xl"
            >
              {celebrationMessage}
            </motion.div>
          )}
        </div>
      )}

      {/* Top bar dashboard */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          {/* Streak */}
          <div className="flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="text-2xl font-bold">{progress.currentStreak}</div>
              <div className="text-xs opacity-80">day streak</div>
            </div>
          </div>

          {/* Level */}
          <div className="text-center">
            <div className="text-sm opacity-80">Level</div>
            <div className="text-3xl font-bold">{level}</div>
          </div>

          {/* Words learned today */}
          <div className="text-right">
            <div className="text-2xl font-bold">{progress.wordsLearnedToday}</div>
            <div className="text-xs opacity-80">discoveries today</div>
          </div>
        </div>

        {/* XP Progress bar */}
        <div>
          <div className="flex justify-between text-xs mb-1 opacity-80">
            <span>{xpInLevel} XP</span>
            <span>{xpForNextLevel} XP</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Immersion time */}
        <div className="mt-3 text-center">
          <span className="text-sm opacity-80">
            {progress.minutesImmersedToday} minutes immersed today
          </span>
        </div>
      </div>

      {/* Mini stats cards */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatCard
          icon="⚡"
          value={progress.totalXP.toLocaleString()}
          label="Total XP"
          color="from-yellow-400 to-orange-500"
        />
        <StatCard
          icon="🎯"
          value={progress.currentLevel}
          label="Current Level"
          color="from-blue-400 to-purple-500"
        />
        <StatCard
          icon="📚"
          value={Math.floor(progress.wordsLearnedToday * 7).toLocaleString()}
          label="Words Known"
          color="from-green-400 to-teal-500"
        />
      </div>
    </>
  )
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string
  value: string | number
  label: string
  color: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} p-4 rounded-xl text-white shadow-lg text-center`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </motion.div>
  )
}


