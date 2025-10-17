// User progress tracking and updates
// Handles streaks, XP, daily stats

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get user progress
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sessions: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if streak should be updated
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate)
      lastActive.setHours(0, 0, 0, 0)

      const daysSinceActive = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      )

      // If more than 1 day has passed, reset streak
      if (daysSinceActive > 1) {
        await prisma.user.update({
          where: { id: userId },
          data: { currentStreak: 0 },
        })
      }
    }

    // Calculate today's stats from sessions
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todaySessions = await prisma.learningSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: todayStart,
        },
      },
    })

    const wordsLearnedToday = todaySessions.reduce(
      (sum, session) => sum + session.wordsLearned,
      0
    )

    const minutesImmersedToday = todaySessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    )

    return NextResponse.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalXP: user.totalXP,
      currentLevel: user.currentLevel,
      wordsLearnedToday,
      minutesImmersedToday,
      wordsLearned: user.wordsLearned,
      minutesImmersed: user.minutesImmersed,
      contentConsumed: user.contentConsumed,
    })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// Update user progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, xpEarned, wordsLearned, sessionDuration } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user was active today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streakIncrement = 0
    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate)
      lastActive.setHours(0, 0, 0, 0)

      const daysSinceActive = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Increment streak if exactly 1 day passed
      if (daysSinceActive === 1) {
        streakIncrement = 1
      } else if (daysSinceActive === 0) {
        streakIncrement = 0 // Same day, don't increment
      } else {
        // Streak broken, reset
        await prisma.user.update({
          where: { id: userId },
          data: { currentStreak: 1 },
        })
      }
    } else {
      // First day
      streakIncrement = 1
    }

    // Update user stats
    const updates: any = {
      lastActiveDate: new Date(),
      totalXP: { increment: xpEarned || 0 },
    }

    if (streakIncrement > 0) {
      updates.currentStreak = { increment: streakIncrement }
    }

    if (wordsLearned) {
      updates.wordsLearned = { increment: wordsLearned }
    }

    if (sessionDuration) {
      updates.minutesImmersed = { increment: sessionDuration }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
    })

    // Update longest streak if needed
    if (updatedUser.currentStreak > updatedUser.longestStreak) {
      await prisma.user.update({
        where: { id: userId },
        data: { longestStreak: updatedUser.currentStreak },
      })
    }

    // Check for level up
    const currentLevel = Math.floor(updatedUser.totalXP / 1000)
    const previousLevel = Math.floor(user.totalXP / 1000)

    const leveledUp = currentLevel > previousLevel

    return NextResponse.json({
      success: true,
      currentStreak: updatedUser.currentStreak,
      totalXP: updatedUser.totalXP,
      leveledUp,
      newLevel: currentLevel,
    })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}


