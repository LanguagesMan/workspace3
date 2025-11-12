'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface TrayButton {
  id: string
  icon: ReactNode
  label?: string
  onPress?: () => void
  badge?: string
}

export interface ActionTrayProps {
  className?: string
  primaryLabel?: string
  primaryIcon?: ReactNode
  onPrimaryPress?: () => void
  streakCount?: number
  onStreakPress?: () => void
  questLabel?: string
  questProgress?: number
  onQuestPress?: () => void
  buttons?: TrayButton[]
}

export default function ActionTray({
  className = '',
  primaryLabel = 'Keep Learning',
  primaryIcon,
  onPrimaryPress,
  streakCount,
  onStreakPress,
  questLabel,
  questProgress,
  onQuestPress,
  buttons = [],
}: ActionTrayProps) {
  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-surface flex w-full items-center gap-3 rounded-3xl px-4 py-3 shadow-lg ${className}`}
    >
      {typeof streakCount === 'number' && (
        <button
          type="button"
          onClick={onStreakPress}
          className="flex min-w-[72px] flex-col items-center rounded-2xl bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          <span className="text-lg">🔥</span>
          <span>{streakCount}d</span>
          <span className="text-[10px] text-white/60">Streak</span>
        </button>
      )}

      <div className="flex flex-1 items-center justify-center gap-2">
        {buttons.map((button) => (
          <button
            key={button.id}
            type="button"
            onClick={button.onPress}
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-lg text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            <span>{button.icon}</span>
            {button.badge && (
              <span className="absolute -top-1 -right-1 rounded-full bg-brand-warning px-1.5 py-0.5 text-[10px] font-bold text-black">
                {button.badge}
              </span>
            )}
          </button>
        ))}

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onPrimaryPress}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-accent px-5 py-3 text-sm font-semibold text-black shadow-neon transition hover:bg-brand-accentSoft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-glow"
        >
          {primaryIcon ?? <span className="text-lg">▶️</span>}
          <span>{primaryLabel}</span>
        </motion.button>
      </div>

      {questLabel && (
        <button
          type="button"
          onClick={onQuestPress}
          className="flex w-[100px] flex-col gap-1 rounded-2xl bg-white/5 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          <span className="font-semibold uppercase tracking-wide text-white/80">{questLabel}</span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-success to-brand-glow transition-all"
              style={{ width: `${Math.min(Math.max(questProgress ?? 0, 0), 1) * 100}%` }}
            />
          </div>
        </button>
      )}
    </motion.nav>
  )
}


