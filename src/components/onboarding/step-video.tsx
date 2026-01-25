'use client'

/**
 * StepVideo - Pasul pentru vizualizarea video-ului de training
 * Video-ul trebuie vizualizat complet (100%) pentru a continua
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Video,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/lib/onboarding'
import { MOCK_VIDEO_URL, MOCK_VIDEO_CHAPTERS } from '@/lib/onboarding/mock-data'
import { OnboardingVideoPlayer } from './video-player'

export interface StepVideoProps {
  /** Callback cand video-ul este completat */
  onComplete?: () => void
  /** Clasa CSS suplimentara */
  className?: string
}

/**
 * Step pentru vizualizarea video-ului de training
 * - Player video cu prevenire skip-ahead
 * - Progresul se salveaza automat
 * - Trebuie sa ajunga la 100% pentru a continua
 */
export function StepVideo({ onComplete, className }: StepVideoProps) {
  // Store actions and state
  const currentProgress = useOnboardingStore((state) => state.currentProgress)
  const updateVideoProgress = useOnboardingStore((state) => state.updateVideoProgress)
  const completeVideo = useOnboardingStore((state) => state.completeVideo)
  const goToStep = useOnboardingStore((state) => state.goToStep)

  // Get video progress from store
  const videoProgress = currentProgress?.video
  const isCompleted = videoProgress?.completed || false
  const lastPosition = videoProgress?.lastPosition || 0
  const furthestReached = videoProgress?.furthestReached || 0
  const totalDuration = videoProgress?.totalDuration || 420 // Default 7min

  // Calculate progress percentage
  const progressPercent = totalDuration > 0 ? (furthestReached / totalDuration) * 100 : 0

  // Handle video progress update
  const handleProgress = (position: number, duration: number) => {
    updateVideoProgress(position, duration)
  }

  // Handle video completion
  const handleComplete = () => {
    completeVideo()
  }

  // Continue to next step
  const handleContinue = () => {
    if (isCompleted) {
      goToStep('quiz')
      onComplete?.()
    }
  }

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Video de Training</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Vizualizati video-ul de instruire in intregime. Nu puteti sari peste continut.
          Progresul se salveaza automat.
        </p>
      </div>

      {/* Progress summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progres video</span>
            <span className="text-sm text-muted-foreground">
              {isCompleted ? (
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Completat
                </span>
              ) : (
                `${Math.round(progressPercent)}% vizualizat`
              )}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />

          {/* Stats */}
          {videoProgress && (
            <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Vizualizat: {formatTime(furthestReached)} / {formatTime(totalDuration)}
              </span>
              {lastPosition > 0 && lastPosition !== furthestReached && (
                <span>
                  Ultima pozitie: {formatTime(lastPosition)}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Video de instruire LaserZone
          </CardTitle>
          <CardDescription>
            Vizualizati intregul video pentru a invata procedurile si regulile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingVideoPlayer
            url={MOCK_VIDEO_URL}
            onProgress={handleProgress}
            onComplete={handleComplete}
            initialProgress={
              videoProgress
                ? {
                    lastPosition: videoProgress.lastPosition,
                    furthestReached: videoProgress.furthestReached,
                    completed: videoProgress.completed,
                  }
                : undefined
            }
            isCompleted={isCompleted}
          />
        </CardContent>
      </Card>

      {/* Chapters/table of contents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Capitole video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MOCK_VIDEO_CHAPTERS.map((chapter, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-2 rounded-md',
                  furthestReached >= chapter.timestamp
                    ? 'bg-primary/5'
                    : 'bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  {furthestReached >= chapter.timestamp ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={cn(
                    'text-sm',
                    furthestReached >= chapter.timestamp ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {chapter.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTime(chapter.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Continue button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          disabled={!isCompleted}
          className="gap-2"
          variant={isCompleted ? 'default' : 'outline'}
        >
          {isCompleted ? (
            <>
              Continua la Quiz
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Completati video-ul pentru a continua
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
