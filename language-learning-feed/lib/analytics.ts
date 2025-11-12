type AnalyticsPayload = Record<string, unknown>

const pendingEvents: Array<{ name: string; payload?: AnalyticsPayload }> = []

function emit(eventName: string, payload?: AnalyticsPayload) {
  if (typeof window === 'undefined') return

  try {
    const globalAny = window as unknown as {
      mixpanel?: { track: (name: string, props?: AnalyticsPayload) => void }
      dataLayer?: Array<Record<string, unknown>>
      webkit?: { messageHandlers?: Record<string, { postMessage: (body: unknown) => void }> }
    }

    if (globalAny.mixpanel?.track) {
      globalAny.mixpanel.track(eventName, payload)
    } else if (globalAny.dataLayer) {
      globalAny.dataLayer.push({ event: eventName, ...payload })
    } else if (globalAny.webkit?.messageHandlers?.analytics) {
      globalAny.webkit.messageHandlers.analytics.postMessage({ event: eventName, payload })
    } else {
      pendingEvents.push({ name: eventName, payload })
    }

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[analytics]', eventName, payload ?? {})
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[analytics] failed to emit event', eventName, error)
    }
  }
}

export function trackEvent(eventName: string, payload?: AnalyticsPayload) {
  emit(eventName, payload)
}

export function flushPendingEvents() {
  if (typeof window === 'undefined' || pendingEvents.length === 0) return
  const events = [...pendingEvents]
  pendingEvents.length = 0
  events.forEach((event) => emit(event.name, event.payload))
}

declare global {
  interface Window {
    __LANGFLIX_ANALYTICS_READY__?: boolean
  }
}

if (typeof window !== 'undefined') {
  if (!window.__LANGFLIX_ANALYTICS_READY__) {
    window.__LANGFLIX_ANALYTICS_READY__ = true
    setTimeout(flushPendingEvents, 0)
  }
}


