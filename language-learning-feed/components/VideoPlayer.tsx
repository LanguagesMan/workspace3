'use client'

// Optimized video player with preloading, subtitles, and error recovery

import { useRef, useState, useEffect } from 'react'
import type { CaptionSegment } from '@/lib/feed-types'

interface VideoPlayerProps {
  src: string
  thumbnail?: string
  autoPlay?: boolean
  captions?: CaptionSegment[]
}

export default function VideoPlayer({
  src,
  thumbnail,
  autoPlay = false,
  captions = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(autoPlay)
  const [hasError, setHasError] = useState(false)
  const [activeCaption, setActiveCaption] = useState<CaptionSegment | null>(null)
  const [captionsVisible, setCaptionsVisible] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(true)
  const lastCaptionIndex = useRef<number>(-1)

  useEffect(() => {
    lastCaptionIndex.current = -1
    setActiveCaption(null)
  }, [captions])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!video.duration) return
      const percent = Math.min(100, (video.currentTime / video.duration) * 100)
      setProgress(percent)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsBuffering(false)
    }

    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => {
      setIsBuffering(false)
      setHasError(false)
    }
    const handleError = () => {
      setHasError(true)
      setIsPlaying(false)
      setIsBuffering(false)
    }
    const handleTimeUpdateWithCaptions = () => {
      handleTimeUpdate()

      if (!captions.length) return
      const currentTime = video.currentTime

      const currentIndex = lastCaptionIndex.current
      const currentActive =
        currentIndex >= 0 && currentIndex < captions.length ? captions[currentIndex] : null

      if (
        currentActive &&
        currentTime >= currentActive.start &&
        currentTime <= currentActive.end
      ) {
        return
      }

      const nextIndex = captions.findIndex(
        (caption) => currentTime >= caption.start && currentTime <= caption.end
      )

      if (nextIndex !== -1) {
        lastCaptionIndex.current = nextIndex
        setActiveCaption(captions[nextIndex])
      } else if (activeCaption) {
        lastCaptionIndex.current = -1
        setActiveCaption(null)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdateWithCaptions)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('loadeddata', handleCanPlay)
    video.addEventListener('error', handleError)

    // Auto-hide controls
    const timer = setTimeout(() => setShowControls(false), 3000)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdateWithCaptions)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('loadeddata', handleCanPlay)
      video.removeEventListener('error', handleError)
      clearTimeout(timer)
    }
  }, [captions, activeCaption])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (autoPlay) {
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setShowControls(true)
        })
      }
    }
  }, [autoPlay])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = isMuted
  }, [isMuted])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setShowControls(true)
        })
      }
    }
  }

  const cycleSpeed = () => {
    const nextRate = playbackRate === 1 ? 0.75 : playbackRate === 0.75 ? 1.25 : 1
    setPlaybackRate(nextRate)
  }

  const toggleMuted = () => {
    setIsMuted((prev) => !prev)
  }

  const toggleCaptions = () => {
    setCaptionsVisible((prev) => !prev)
  }

  const handleDownload = () => {
    if (!src) return
    const link = document.createElement('a')
    link.href = src
    link.download = ''
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleVideoClick = () => {
    if (hasError) {
      const video = videoRef.current
      if (!video) return
      setHasError(false)
      setIsBuffering(true)
      video.load()
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setShowControls(true)
        })
      }
      return
    }

    togglePlay()
    setShowControls(true)
    setTimeout(() => setShowControls(false), 3000)
  }

  return (
    <div
      className="relative w-full h-full bg-black"
      onClick={handleVideoClick}
      role="region"
      aria-label="Immersive language video player"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        poster={thumbnail}
        autoPlay={autoPlay}
        loop
        playsInline
        preload="auto"
        muted
      />

      {/* Captions */}
      {captionsVisible && activeCaption && (
        <div className="absolute bottom-24 left-1/2 w-[90%] max-w-2xl -translate-x-1/2" aria-live="polite">
          <div className="rounded-2xl bg-black/65 px-6 py-3 text-center text-white shadow-xl backdrop-blur">
            <p className="text-lg font-semibold leading-snug">{activeCaption.text}</p>
            {activeCaption.translation && (
              <p className="mt-1 text-sm text-white/80">{activeCaption.translation}</p>
            )}
          </div>
        </div>
      )}

      {/* Buffering spinner */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-center px-6">
          <p className="text-lg font-semibold mb-2">No pudimos cargar el video</p>
          <p className="text-sm opacity-80">Toca para reintentar la reproducción.</p>
        </div>
      )}

      {/* Play/Pause overlay */}
      {showControls && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
          <button
            className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Accessibility controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/50 backdrop-blur text-white text-xs">
        <button
          className={`px-3 py-1 rounded-full border border-white/40 transition ${captionsVisible ? 'bg-white text-purple-900' : 'bg-transparent'}`}
          onClick={(e) => {
            e.stopPropagation()
            toggleCaptions()
          }}
          aria-pressed={captionsVisible}
          aria-label="Toggle bilingual captions"
        >
          CC
        </button>
        <button
          className="px-3 py-1 rounded-full border border-white/40 transition hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            cycleSpeed()
          }}
          aria-label={`Change playback speed. Current speed ${playbackRate}x`}
        >
          {playbackRate.toFixed(2)}x
        </button>
        <button
          className={`px-3 py-1 rounded-full border border-white/40 transition ${!isMuted ? 'bg-white text-purple-900' : 'hover:bg-white/20'}`}
          onClick={(e) => {
            e.stopPropagation()
            toggleMuted()
          }}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          className="px-3 py-1 rounded-full border border-white/40 transition hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
          aria-label="Download episode for offline practice"
        >
          ⬇️
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-purple-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
