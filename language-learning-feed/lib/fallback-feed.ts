// Fallback feed data used when the database/cache layer is unavailable.
// Keeps the app functional locally by serving pre-bundled videos.

import type { FeedItem } from '@/lib/feed-types'

export const FALLBACK_FEED_ITEMS: FeedItem[] = [
  {
    id: 'fallback-video-1',
    type: 'VIDEO',
    title: 'Abuela gamer conquista el torneo',
    contentUrl: '/videos/langfeed/Grandma_gaming_league_202510091608_cqpyz.mp4',
    thumbnailUrl: '/screenshots/langflix-initial.png',
    transcription:
      '¡Bienvenidos al torneo de videojuegos! Nuestra abuela gamer demuestra que la edad es solo un número mientras derrota a sus rivales con una sonrisa.',
    durationSeconds: 58,
    newWords: ['abuela', 'torneo', 'rivales'],
    knownWordsPercentage: 0.94,
    learningPathId: 'a0-confidence-pilot',
    sequenceOrder: 1,
    difficultyTier: 1,
    arcSummary: 'Confianza instantánea con situaciones divertidas y vocabulario de energía positiva.',
    captions: [
      {
        start: 0,
        end: 2,
        text: '¡Bienvenidos al torneo de videojuegos!',
        translation: 'Welcome to the video game tournament!',
      },
      {
        start: 2,
        end: 5,
        text: 'Nuestra abuela gamer demuestra que la edad es solo un número.',
        translation: 'Our gamer grandma proves age is just a number.',
      },
      {
        start: 5,
        end: 8,
        text: 'Mira cómo derrota a sus rivales con una sonrisa.',
        translation: 'Watch her defeat her rivals with a smile.',
      },
    ],
  },
  {
    id: 'fallback-video-2',
    type: 'VIDEO',
    title: 'Viaje mágico en acuarela',
    contentUrl: '/videos/langfeed/Watercolor_painting_style_202510132326_zi2tm.mp4',
    thumbnailUrl: '/screenshots/langflix-bottom-nav.png',
    transcription:
      'Una historia corta sobre una viajera que descubre un pueblo encantado pintado completamente en acuarela vibrante.',
    durationSeconds: 53,
    newWords: ['viajera', 'encantado', 'acuarela'],
    knownWordsPercentage: 0.91,
    learningPathId: 'a0-confidence-pilot',
    sequenceOrder: 2,
    difficultyTier: 1,
    arcSummary: 'Historias visuales sencillas que presentan vocabulario sensorial.',
    captions: [
      {
        start: 0,
        end: 2.5,
        text: 'Una viajera cruza un puente hecho de acuarela.',
        translation: 'A traveler crosses a bridge painted in watercolor.',
      },
      {
        start: 2.5,
        end: 5,
        text: 'Cada paso despierta colores nuevos y brillantes.',
        translation: 'Every step awakens new, vibrant colors.',
      },
      {
        start: 5,
        end: 8,
        text: 'El pueblo encantado canta suavemente en español.',
        translation: 'The enchanted town softly sings in Spanish.',
      },
    ],
  },
  {
    id: 'fallback-video-3',
    type: 'VIDEO',
    title: 'Necesito un café urgente',
    contentUrl: '/videos/reels/Person_says_necesito_202509130115_xouyd.mp4',
    thumbnailUrl: '/screenshots/langflix-fab.png',
    transcription:
      'Escucha cómo Sofía explica por qué necesita café antes de comenzar su día en la ciudad.',
    durationSeconds: 42,
    newWords: ['urgente', 'explica', 'comenzar'],
    knownWordsPercentage: 0.9,
    learningPathId: 'a0-confidence-pilot',
    sequenceOrder: 3,
    difficultyTier: 1,
    arcSummary: 'Micro historias cotidianas enfocadas en necesidades básicas.',
    captions: [
      {
        start: 0,
        end: 1.2,
        text: '¡Necesito café urgente!',
        translation: 'I need coffee urgently!',
      },
      {
        start: 1.2,
        end: 3,
        text: 'Sin café no puedo empezar mi día.',
        translation: 'Without coffee I cannot start my day.',
      },
      {
        start: 3,
        end: 4.5,
        text: '¿Quién más quiere una taza?',
        translation: 'Who else wants a cup?',
      },
    ],
  },
  {
    id: 'fallback-article-1',
    type: 'ARTICLE',
    title: 'Trucos para aprender español con series',
    contentUrl: 'https://langflix.app/demo/series',
    transcription: [
      'Aprender español viendo series es una estrategia efectiva porque combina entretenimiento con exposición constante al idioma.',
      'Para aprovecharlo al máximo, activa los subtítulos en español y anota las expresiones que escuches repetidamente.',
      'Intenta repetir en voz alta las frases que te llamen la atención para fortalecer tu pronunciación.',
    ].join('\n\n'),
    durationSeconds: 180,
    newWords: ['estrategia', 'expresión', 'pronunciación'],
    knownWordsPercentage: 0.88,
    learningPathId: 'a0-confidence-pilot',
    sequenceOrder: 4,
    difficultyTier: 1,
    arcSummary: 'Consejos meta para consolidar hábitos de binge learning.',
  },
  {
    id: 'fallback-video-4',
    type: 'VIDEO',
    title: 'Subiendo nuevas metas',
    contentUrl: '/videos/langfeed/Stairs_journey_destination_202510091322_t5zx.mp4',
    thumbnailUrl: '/screenshots/langflix-coverage-badge.png',
    transcription:
      'Un joven comparte cómo subir escaleras todos los días le recuerda que cada paso cuenta para alcanzar sus metas.',
    durationSeconds: 47,
    newWords: ['metas', 'escaleras', 'alcanzar'],
    knownWordsPercentage: 0.93,
    learningPathId: 'a1-daily-wins',
    sequenceOrder: 1,
    difficultyTier: 2,
    arcSummary: 'Transiciones suaves hacia historias motivacionales nivel A1.',
    captions: [
      {
        start: 0,
        end: 2.2,
        text: 'Cada escalón es un recordatorio de que sigo avanzando.',
        translation: 'Each step is a reminder that I keep moving forward.',
      },
      {
        start: 2.2,
        end: 4.8,
        text: 'No importa lo alto que parezca el destino.',
        translation: 'No matter how high the destination may seem.',
      },
      {
        start: 4.8,
        end: 7,
        text: 'Lo importante es no detenerse.',
        translation: 'What matters is to never stop.',
      },
    ],
  },
  {
    id: 'fallback-video-5',
    type: 'VIDEO',
    title: 'Di lo que necesitas',
    contentUrl: '/videos/reels/Andheld_camera_footage_202509112217_yzrzq.mp4',
    thumbnailUrl: '/screenshots/final-check-1759650164.png',
    transcription:
      'Un reportero improvisado pregunta por la paella en una cámara en mano mientras recibe una respuesta inesperada.',
    durationSeconds: 16,
    newWords: ['paella', 'platos', 'famosos'],
    knownWordsPercentage: 0.92,
    learningPathId: 'a1-daily-wins',
    sequenceOrder: 2,
    difficultyTier: 2,
    arcSummary: 'Escenas rápidas para practicar petición y respuesta.',
    captions: [
      {
        start: 0,
        end: 3.2,
        text: 'La paella es uno de los platos más famosos de España, ¿verdad?',
        translation: 'Paella is one of the most famous dishes in Spain, right?',
      },
      {
        start: 3.2,
        end: 3.8,
        text: 'No.',
        translation: 'No.',
      },
      {
        start: 3.8,
        end: 6,
        text: 'Esperaba otra respuesta, pero está bien.',
        translation: 'I expected another answer, but that is okay.',
      },
    ],
  },
]

export function getFallbackFeed(limit: number, offset: number) {
  const items: FeedItem[] = []
  const baseLength = FALLBACK_FEED_ITEMS.length

  if (baseLength === 0) {
    return { items: [], total: 0 }
  }

  for (let i = 0; i < limit; i++) {
    const index = (offset + i) % baseLength
    const cycle = Math.floor((offset + i) / baseLength)
    const baseItem = FALLBACK_FEED_ITEMS[index]

    items.push({
      ...baseItem,
      id: cycle === 0 ? baseItem.id : `${baseItem.id}-cycle-${cycle}`,
      newWords: [...baseItem.newWords],
      captions: baseItem.captions?.map((caption) => ({ ...caption })),
    })
  }

  return {
    items,
    total: FALLBACK_FEED_ITEMS.length,
  }
}
