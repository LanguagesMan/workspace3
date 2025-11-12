import { NextRequest, NextResponse } from 'next/server'
import { getAdaptiveNext } from '@/lib/sequencer'
import { getFallbackFeed } from '@/lib/fallback-feed'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, currentContentId, feedback, excludeIds = [] } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const nextItem = await getAdaptiveNext({
      userId,
      currentContentId,
      feedback,
      excludeIds,
      useCache: false,
    })

    if (!nextItem) {
      const fallback = getFallbackFeed(1, 0)
      const item = fallback.items[0] ?? null
      return NextResponse.json({
        item,
        fallback: true,
      })
    }

    return NextResponse.json({ item: nextItem })
  } catch (error) {
    console.error('Failed to fetch next adaptive item', error)
    return NextResponse.json({ error: 'Failed to fetch next item' }, { status: 500 })
  }
}
