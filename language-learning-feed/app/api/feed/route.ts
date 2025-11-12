// Feed generation endpoint
// Generates personalized content feed using recommendation algorithm

import { NextRequest, NextResponse } from 'next/server'
import { getAdaptiveFeed } from '@/lib/sequencer'
import { getFallbackFeed } from '@/lib/fallback-feed'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    const result = await getAdaptiveFeed({
      userId,
      limit,
      offset,
      useCache: true,
    })

    if (result.items.length === 0) {
      const fallback = getFallbackFeed(limit, offset)
      return NextResponse.json({
        items: fallback.items,
        cached: false,
        total: fallback.total,
        fallback: true,
      })
    }

    return NextResponse.json({
      items: result.items,
      cached: result.fromCache,
      total: result.total,
      context: result.context,
    })
  } catch (error) {
    console.error('Feed generation error:', error)
    const fallback = getFallbackFeed(limit, offset)
    return NextResponse.json({
      items: fallback.items,
      cached: false,
      total: fallback.total,
      fallback: true,
    })
  }
}

