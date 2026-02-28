'use client'

/**
 * DocumentViewer - Viewer pentru documente cu scroll detection
 * Necesita scroll-to-bottom inainte de confirmare
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ChevronDown, ScrollText, Lock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/lib/onboarding'

export interface DocumentViewerProps {
  /** ID-ul documentului */
  documentId: string
  /** Titlul documentului */
  title: string
  /** Continutul documentului (text sau HTML) */
  content: string
  /** Minimum reading time in seconds before confirm unlocks */
  minReadingSeconds?: number
  /** Daca documentul a fost deja confirmat */
  isConfirmed?: boolean
  /** Callback pentru confirmarea documentului */
  onConfirm?: (documentId: string) => void | Promise<void>
  /** Clasa CSS suplimentara */
  className?: string
}

/**
 * Viewer pentru documente de onboarding
 * - Detecteaza scroll-to-bottom
 * - Buton de confirmare se deblocheaza cand utilizatorul a derulat pana jos
 */
export function DocumentViewer({
  documentId,
  title,
  content,
  minReadingSeconds,
  isConfirmed = false,
  onConfirm,
  className,
}: DocumentViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const storeError = useOnboardingStore((state) => state.error)

  // State pentru tracking
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Timer for minimum reading time
  useEffect(() => {
    if (!minReadingSeconds || minReadingSeconds <= 0 || isConfirmed) return
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [minReadingSeconds, isConfirmed])

  // Check if content fits without scrolling (no scroll needed = already "read")
  useEffect(() => {
    if (isConfirmed || hasScrolledToBottom) return

    // Small delay to let the browser render the content
    const timer = setTimeout(() => {
      const el = scrollContainerRef.current
      if (!el) return
      // If content fits in container, no scroll is needed
      if (el.scrollHeight <= el.clientHeight + 20) {
        console.log('[DocumentViewer] Content fits without scroll, auto-marking as read')
        setHasScrolledToBottom(true)
        setShowScrollHint(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [content, isConfirmed, hasScrolledToBottom])

  // Conditia pentru deblocarea butonului de confirmare
  const canConfirm = hasScrolledToBottom && !isConfirmed && (!minReadingSeconds || timeElapsed >= minReadingSeconds)

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

  // Local state for confirm feedback
  const [isConfirming, setIsConfirming] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Handler pentru confirmare
  const handleConfirm = async () => {
    console.log('[DocumentViewer] handleConfirm called', { canConfirm, isConfirming, documentId, hasOnConfirm: !!onConfirm })
    if (!canConfirm || isConfirming) return
    setIsConfirming(true)
    setLocalError(null)
    try {
      console.log('[DocumentViewer] calling onConfirm...')
      await onConfirm?.(documentId)
      console.log('[DocumentViewer] onConfirm completed successfully')
    } catch (err) {
      console.error('[DocumentViewer] onConfirm error:', err)
      setLocalError((err as Error).message || 'Eroare la confirmarea documentului')
    } finally {
      setIsConfirming(false)
    }
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
          <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

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
          {/* Scroll progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progres citire</span>
              <span>{hasScrolledToBottom ? '100%' : 'Deruleaza...'}</span>
            </div>
            <Progress value={hasScrolledToBottom ? 100 : 30} className="h-2" />
          </div>

          {/* Error display */}
          {(localError || storeError) && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <span className="text-sm text-destructive">{localError || storeError}</span>
            </div>
          )}

          {/* Reading timer indicator */}
          {hasScrolledToBottom && minReadingSeconds && minReadingSeconds > 0 && timeElapsed < minReadingSeconds && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Timp minim de citire</span>
                <span>{Math.max(0, minReadingSeconds - timeElapsed)}s ramase</span>
              </div>
              <Progress value={(timeElapsed / minReadingSeconds) * 100} className="h-2" />
            </div>
          )}

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirming}
            className="w-full"
            variant={canConfirm ? 'default' : 'outline'}
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Se confirma...
              </>
            ) : canConfirm ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm ca am citit si inteles
              </>
            ) : hasScrolledToBottom ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Asteptati {Math.max(0, (minReadingSeconds ?? 0) - timeElapsed)}s...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Derulati pana la sfarsitul documentului
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
