'use client'

/**
 * DocumentViewer - Viewer pentru documente cu scroll detection si timer unlock
 * Necesita scroll-to-bottom si timp minim de citire inainte de confirmare
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, ChevronDown, ScrollText, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DocumentViewerProps {
  /** ID-ul documentului */
  documentId: string
  /** Titlul documentului */
  title: string
  /** Continutul documentului (text sau HTML) */
  content: string
  /** Timpul minim de citire in secunde */
  minimumReadingSeconds: number
  /** Daca documentul a fost deja confirmat */
  isConfirmed?: boolean
  /** Callback pentru actualizarea timpului petrecut */
  onTimeUpdate?: (documentId: string, seconds: number) => void
  /** Callback pentru confirmarea documentului */
  onConfirm?: (documentId: string) => void
  /** Clasa CSS suplimentara */
  className?: string
}

/**
 * Viewer pentru documente de onboarding
 * - Detecteaza scroll-to-bottom
 * - Timer pentru timp minim de citire
 * - Buton de confirmare se deblocheaza cand ambele conditii sunt indeplinite
 */
export function DocumentViewer({
  documentId,
  title,
  content,
  minimumReadingSeconds,
  isConfirmed = false,
  onTimeUpdate,
  onConfirm,
  className,
}: DocumentViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  // Refs to avoid infinite loop - store callback and last notified time
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const lastNotifiedTimeRef = useRef(0)

  // Keep ref updated with latest callback
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate
  }, [onTimeUpdate])

  // State pentru tracking
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [showScrollHint, setShowScrollHint] = useState(true)

  // Conditii pentru deblocarea butonului de confirmare
  const hasMinimumTime = timeSpent >= minimumReadingSeconds
  const canConfirm = hasScrolledToBottom && hasMinimumTime && !isConfirmed

  // Porneste timer-ul cand componenta devine vizibila
  // Only increments local state - store notification happens in separate effect
  useEffect(() => {
    if (isConfirmed) return

    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isConfirmed])

  // Notify store of time updates (every 5 seconds)
  // Uses ref to avoid infinite loop from callback recreation
  useEffect(() => {
    if (isConfirmed) return
    // Only notify if we've passed a new 5-second threshold since last notification
    const currentThreshold = Math.floor(timeSpent / 5) * 5
    if (currentThreshold > 0 && currentThreshold > lastNotifiedTimeRef.current) {
      lastNotifiedTimeRef.current = currentThreshold
      onTimeUpdateRef.current?.(documentId, 5)
    }
  }, [timeSpent, documentId, isConfirmed])

  // Detecteaza scroll-to-bottom
  const handleScroll = () => {
    if (!scrollContainerRef.current || isConfirmed) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20 // 20px tolerance

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
      setShowScrollHint(false)
    }
  }

  // Handler pentru confirmare
  const handleConfirm = () => {
    if (canConfirm) {
      // Opreste timer-ul
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      onConfirm?.(documentId)
    }
  }

  // Calcul procent timp
  const timePercent = Math.min(100, (timeSpent / minimumReadingSeconds) * 100)

  // Formatare timp ramas
  const formatTimeRemaining = () => {
    const remaining = Math.max(0, minimumReadingSeconds - timeSpent)
    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  if (isConfirmed) {
    return (
      <Card className={cn('border-success/50 bg-success/5', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-success" />
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="outline" className="border-success text-success">
              Confirmat
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ati citit si confirmat acest document.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScrollText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            {/* Indicator scroll */}
            <div className="flex items-center gap-2 text-sm">
              {hasScrolledToBottom ? (
                <Badge variant="outline" className="border-success text-success gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Citit complet
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <ChevronDown className="h-3 w-3" />
                  Deruleaza pana jos
                </Badge>
              )}
            </div>

            {/* Indicator timp */}
            <div className="flex items-center gap-2 text-sm">
              {hasMinimumTime ? (
                <Badge variant="outline" className="border-success text-success gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Timp minim atins
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining()} ramase
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Document content area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-[400px] overflow-y-auto p-6 relative"
        >
          {/* Document text */}
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {content}
          </div>

          {/* Scroll hint overlay */}
          {showScrollHint && !hasScrolledToBottom && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none flex items-end justify-center pb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-bounce pointer-events-auto">
                <ChevronDown className="h-4 w-4" />
                <span>Deruleaza pentru a continua</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>

        {/* Progress and confirm section */}
        <div className="border-t p-4 space-y-4">
          {/* Progress bars */}
          <div className="grid grid-cols-2 gap-4">
            {/* Scroll progress - simple indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progres citire</span>
                <span>{hasScrolledToBottom ? '100%' : 'Deruleaza...'}</span>
              </div>
              <Progress value={hasScrolledToBottom ? 100 : 30} className="h-2" />
            </div>

            {/* Time progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Timp de citire</span>
                <span>{Math.floor(timeSpent)}s / {minimumReadingSeconds}s</span>
              </div>
              <Progress value={timePercent} className="h-2" />
            </div>
          </div>

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full"
            variant={canConfirm ? 'default' : 'outline'}
          >
            {canConfirm ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm ca am citit si inteles
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                {!hasScrolledToBottom && !hasMinimumTime
                  ? 'Cititi documentul complet si asteptati timer-ul'
                  : !hasScrolledToBottom
                    ? 'Derulati pana la sfarsitul documentului'
                    : `Asteptati inca ${formatTimeRemaining()}`}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
