'use client'

/**
 * OnboardingVideoPlayer - Video player cu prevenire skip-ahead
 * Wrapper pentru react-player care impiedica saritul peste continut nevizionat
 */

import { useState, useRef, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamic import for react-player to avoid SSR issues and type problems
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

/** Progress state from react-player onProgress callback */
interface OnProgressState {
  played: number
  playedSeconds: number
  loaded: number
  loadedSeconds: number
}

const VIDEO_STORAGE_KEY = 'laserzone-video-progress'

interface VideoPlayerProgress {
  lastPosition: number
  furthestReached: number
  totalDuration: number
  completed: boolean
}

export interface OnboardingVideoPlayerProps {
  /** URL-ul video-ului (YouTube, Vimeo, etc.) */
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

// Module-level cache for useSyncExternalStore
// This prevents infinite loops by ensuring getSnapshot returns the same reference
// when localStorage hasn't changed (Object.is comparison)
let cachedRawString: string | null = null
let cachedProgress: VideoPlayerProgress | null = null

function saveStoredProgress(progress: VideoPlayerProgress): void {
  try {
    const json = JSON.stringify(progress)
    localStorage.setItem(VIDEO_STORAGE_KEY, json)
    // Update cache when we save
    cachedRawString = json
    cachedProgress = progress
  } catch {
    // Ignore storage errors
  }
}

// Dummy subscribe for useSyncExternalStore (localStorage is not subscribable)
const subscribe = () => () => {}

const getSnapshot = (): VideoPlayerProgress | null => {
  if (typeof window === 'undefined') return null

  const rawString = localStorage.getItem(VIDEO_STORAGE_KEY)

  // Return cached if raw string unchanged (reference equality check)
  if (rawString === cachedRawString) {
    return cachedProgress
  }

  // Cache miss - parse and store
  cachedRawString = rawString
  if (rawString) {
    try {
      cachedProgress = JSON.parse(rawString) as VideoPlayerProgress
    } catch {
      cachedProgress = null
    }
  } else {
    cachedProgress = null
  }

  return cachedProgress
}

const getServerSnapshot = () => null

/**
 * Player video cu prevenire skip-ahead
 * - Nu permite saritul inainte de furthestReached
 * - Persista progresul in localStorage si store
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)

  // Citeste progresul initial din localStorage folosind useSyncExternalStore
  const storedProgress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Determina valorile initiale (prioritate: initialProgress > storedProgress > default)
  const initialPosition = initialProgress?.lastPosition ?? storedProgress?.lastPosition ?? 0
  const initialFurthest = initialProgress?.furthestReached ?? storedProgress?.furthestReached ?? 0
  const initialCompleted = isCompleted || initialProgress?.completed || storedProgress?.completed || false

  // State local pentru player
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(initialPosition)
  const [furthestReached, setFurthestReached] = useState(initialFurthest)
  const [completed, setCompleted] = useState(initialCompleted)
  const [isReady, setIsReady] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Ref pentru a evita actualizari duplicate
  const lastSavedPosition = useRef(0)

  // Salveaza progresul in localStorage (backup)
  const saveProgress = (position: number, furthest: number, done: boolean) => {
    saveStoredProgress({
      lastPosition: position,
      furthestReached: furthest,
      totalDuration: duration,
      completed: done,
    })
  }

  // Handler pentru progres - chemat la fiecare secunda
  const handleProgress = (state: OnProgressState) => {
    if (isSeeking) return

    const position = state.playedSeconds
    const newFurthest = Math.max(furthestReached, position)

    setCurrentPosition(position)
    setFurthestReached(newFurthest)

    // Notifica store-ul la fiecare 5 secunde sau cand furthest se schimba
    if (onProgress && (Math.abs(position - lastSavedPosition.current) >= 5 || newFurthest > furthestReached)) {
      onProgress(position, duration)
      lastSavedPosition.current = position
    }

    // Salveaza local
    saveProgress(position, newFurthest, completed)
  }

  // Handler pentru click pe progress bar - prevenire skip-ahead
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const seekTo = percentage * duration

    // Nu permite saritul peste furthestReached
    const allowedPosition = Math.min(seekTo, furthestReached)

    setIsSeeking(true)
    setCurrentPosition(allowedPosition)
    playerRef.current.seekTo(allowedPosition, 'seconds')

    // Reset seeking flag dupa un scurt delay
    setTimeout(() => setIsSeeking(false), 100)
  }

  // Handler cand video-ul ajunge la sfarsit
  const handleEnded = () => {
    if (!completed) {
      setCompleted(true)
      saveProgress(duration, duration, true)
      onComplete?.()
    }
    setIsPlaying(false)
  }

  // Handler pentru durata totala
  const handleDuration = (dur: number) => {
    setDuration(dur)
  }

  // Handler pentru ready
  const handleReady = () => {
    setIsReady(true)
    setLoadError(null)

    // Seek la pozitia salvata
    const seekPosition = initialProgress?.lastPosition ?? storedProgress?.lastPosition
    if (seekPosition && playerRef.current) {
      playerRef.current.seekTo(seekPosition, 'seconds')
    }
  }

  // Handler pentru eroare la incarcare video
  const handleError = (error: unknown) => {
    console.error('[VideoPlayer] Error loading video:', error)
    setLoadError('Video-ul nu a putut fi incarcat. Verificati ca fisierul exista si formatul este suportat.')
    setIsReady(false)
  }

  // Formatare timp (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calcul procente
  const progressPercent = duration > 0 ? (currentPosition / duration) * 100 : 0
  const watchedPercent = duration > 0 ? (furthestReached / duration) * 100 : 0

  // Handler restart
  const handleRestart = () => {
    playerRef.current?.seekTo(0, 'seconds')
    setCurrentPosition(0)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Player container */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={isPlaying}
          muted={isMuted}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={handleEnded}
          onReady={handleReady}
          onError={handleError}
          progressInterval={1000}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
          }}
        />

        {/* Overlay pentru completed */}
        {completed && !isPlaying && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="h-16 w-16 text-success" />
            <span className="text-lg font-semibold text-success">Video completat!</span>
          </div>
        )}

        {/* Loading / Error indicator */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            {loadError ? (
              <div className="text-center space-y-3 p-6 max-w-md">
                <Video className="h-12 w-12 mx-auto text-destructive/70" />
                <p className="text-sm text-destructive">{loadError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoadError(null)
                    // Force re-render by toggling a state
                    setIsReady(false)
                  }}
                >
                  Reincearca
                </Button>
              </div>
            ) : (
              <div className="animate-pulse text-muted-foreground">Se incarca...</div>
            )}
          </div>
        )}
      </div>

      {/* Progress bar cu vizualizare zona permisa */}
      <div className="space-y-2">
        <div
          className="relative h-3 bg-muted rounded-full cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          {/* Zona permisa (furthestReached) */}
          <div
            className="absolute inset-y-0 left-0 bg-primary/30"
            style={{ width: `${watchedPercent}%` }}
          />

          {/* Pozitia curenta */}
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Indicator pozitie */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-100"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />
        </div>

        {/* Timp si info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentPosition)}</span>
          <span className="text-xs">
            Maxim accesibil: {formatTime(furthestReached)} / {formatTime(duration)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controale */}
      <div className="flex items-center justify-center gap-4">
        {/* Restart */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRestart}
          disabled={!isReady}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="default"
          size="lg"
          onClick={() => setIsPlaying(!isPlaying)}
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

        {/* Mute/Unmute */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          disabled={!isReady}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Info skip prevention */}
      <p className="text-xs text-muted-foreground text-center">
        Nu puteti sari peste continutul nevizionat. Progresul se salveaza automat.
      </p>
    </div>
  )
}
