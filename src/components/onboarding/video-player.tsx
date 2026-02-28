'use client'

/**
 * OnboardingVideoPlayer - Native HTML5 video player cu prevenire skip-ahead
 * Foloseste <video> nativ in loc de react-player pentru compatibilitate mai buna
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, Video, Maximize } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OnboardingVideoPlayerProps {
  /** URL-ul video-ului */
  url: string
  /** Callback cand video-ul ajunge la 100% */
  onComplete?: () => void
  /** Callback pentru actualizarea progresului in store */
  onProgress?: (position: number, duration: number) => void
  /** Progres initial din store (pentru continuare) */
  initialProgress?: {
    lastPosition: number
    furthestReached: number
    completed: boolean
  }
  /** Daca video-ul este deja completat */
  isCompleted?: boolean
  /** Clasa CSS suplimentara */
  className?: string
}

/**
 * Player video cu prevenire skip-ahead
 * - Nu permite saritul inainte de furthestReached
 * - Persista progresul in store
 * - Afiseaza progres si controale
 */
export function OnboardingVideoPlayer({
  url,
  onComplete,
  onProgress,
  initialProgress,
  isCompleted = false,
  className,
}: OnboardingVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [furthestReached, setFurthestReached] = useState(initialProgress?.furthestReached ?? 0)
  const [completed, setCompleted] = useState(isCompleted || initialProgress?.completed || false)
  const [isReady, setIsReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const lastSavedPosition = useRef(0)
  const seekingRef = useRef(false)

  // Play/Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video || !isReady) return

    if (video.paused) {
      video.play().catch(() => {})
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [isReady])

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  // Restart
  const handleRestart = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    setCurrentPosition(0)
  }, [])

  // Fullscreen
  const handleFullscreen = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }, [])

  // Video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoadedMetadata = () => {
      setDuration(video.duration)
      setIsReady(true)
      setLoadError(null)

      // Seek to saved position
      if (initialProgress?.lastPosition && initialProgress.lastPosition > 0) {
        video.currentTime = initialProgress.lastPosition
      }
    }

    const onTimeUpdate = () => {
      if (seekingRef.current) return
      const pos = video.currentTime
      const dur = video.duration || 0

      setCurrentPosition(pos)

      const newFurthest = Math.max(furthestReached, pos)
      if (newFurthest > furthestReached) {
        setFurthestReached(newFurthest)
      }

      // Notify store every 5 seconds
      if (onProgress && dur > 0 && Math.abs(pos - lastSavedPosition.current) >= 5) {
        onProgress(pos, dur)
        lastSavedPosition.current = pos
      }
    }

    const onEnded = () => {
      setIsPlaying(false)
      if (!completed) {
        setCompleted(true)
        setFurthestReached(video.duration)
        onProgress?.(video.duration, video.duration)
        onComplete?.()
      }
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    const onError = () => {
      console.error('[VideoPlayer] Error loading video')
      setLoadError('Video-ul nu a putut fi incarcat. Contactati managerul pentru a re-uploada video-ul.')
    }

    // Prevent seeking past furthestReached
    const onSeeking = () => {
      seekingRef.current = true
      if (!completed && video.currentTime > furthestReached + 1) {
        video.currentTime = furthestReached
      }
    }

    const onSeeked = () => {
      seekingRef.current = false
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('error', onError)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('seeked', onSeeked)

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('error', onError)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('seeked', onSeeked)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, initialProgress?.lastPosition])

  // Update furthestReached ref for seeking handler
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onSeeking = () => {
      if (!completed && video.currentTime > furthestReached + 1) {
        video.currentTime = furthestReached
      }
    }

    video.addEventListener('seeking', onSeeking)
    return () => video.removeEventListener('seeking', onSeeking)
  }, [furthestReached, completed])

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Progress percentages
  const progressPercent = duration > 0 ? (currentPosition / duration) * 100 : 0
  const watchedPercent = duration > 0 ? (furthestReached / duration) * 100 : 0

  // Handle click on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const seekTo = percentage * duration

    // Don't allow seeking past furthestReached
    const allowedPosition = completed ? seekTo : Math.min(seekTo, furthestReached)
    video.currentTime = allowedPosition
    setCurrentPosition(allowedPosition)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Player container */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full"
          playsInline
          preload="metadata"
          onClick={togglePlay}
        />

        {/* Overlay pentru completed */}
        {completed && !isPlaying && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={togglePlay}>
            <CheckCircle2 className="h-16 w-16 text-success" />
            <span className="text-lg font-semibold text-success">Video completat!</span>
          </div>
        )}

        {/* Error indicator */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center space-y-3 p-6 max-w-md">
              <Video className="h-12 w-12 mx-auto text-destructive/70" />
              <p className="text-sm text-destructive">{loadError}</p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {!isReady && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="animate-pulse text-muted-foreground">Se incarca...</div>
          </div>
        )}

        {/* Play overlay when paused (not completed) */}
        {isReady && !isPlaying && !completed && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30" onClick={togglePlay}>
            <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary-foreground ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div
          className="relative h-3 bg-muted rounded-full cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          {/* Watched zone (furthestReached) */}
          <div
            className="absolute inset-y-0 left-0 bg-primary/30"
            style={{ width: `${watchedPercent}%` }}
          />

          {/* Current position */}
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Position indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-200"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />
        </div>

        {/* Time info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentPosition)}</span>
          <span className="text-xs">
            Maxim accesibil: {formatTime(furthestReached)} / {formatTime(duration)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRestart}
          disabled={!isReady}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={togglePlay}
          disabled={!isReady}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5" />
              Pauza
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              {currentPosition > 0 ? 'Continua' : 'Porneste'}
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          disabled={!isReady}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleFullscreen}
          disabled={!isReady}
        >
          <Maximize className="h-5 w-5" />
        </Button>
      </div>

      {/* Skip prevention info */}
      {!completed && (
        <p className="text-xs text-muted-foreground text-center">
          Nu puteti sari peste continutul nevizionat. Progresul se salveaza automat.
        </p>
      )}
    </div>
  )
}
