'use client'

import { useState, useRef, useCallback } from 'react'
import { useOnboardingStore, useOnboardingConfig, generateAndDownloadNdaPdf } from '@/lib/onboarding'
import { useAuth } from '@/lib/auth'
import { SignatureCanvas } from '@/components/warnings/signature-canvas'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Download, CheckCircle, ScrollText, ChevronDown } from 'lucide-react'

export interface StepNdaProps {
  /** Additional CSS classes */
  className?: string
  /** Callback when NDA is signed and PDF is generated */
  onComplete?: () => void
}

/**
 * NDA signing step component
 * - Shows full NDA document text in scrollable area
 * - Signature area only activates after scrolling to bottom
 * - Generates downloadable PDF after signing
 */
export function StepNda({ className, onComplete }: StepNdaProps) {
  // Config from DB
  const { config, isLoading: configLoading } = useOnboardingConfig()

  // Store state
  const signNda = useOnboardingStore((state) => state.signNda)
  const saveNdaPdf = useOnboardingStore((state) => state.saveNdaPdf)
  const goToStep = useOnboardingStore((state) => state.goToStep)
  const currentProgress = useOnboardingStore((state) => state.currentProgress)
  const storeError = useOnboardingStore((state) => state.error)
  const { user } = useAuth()

  // Derive signed state from store (not local state)
  const isAlreadySigned = !!currentProgress?.nda
  const hasPdfGenerated = !!currentProgress?.nda?.pdfDataUrl

  // Local state only for things not persisted in store
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(isAlreadySigned)
  const [pendingSignature, setPendingSignature] = useState<string | null>(null)
  const [justSigned, setJustSigned] = useState(false) // Track signing in this session
  const [justDownloaded, setJustDownloaded] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  /**
   * Handle scroll event to detect when user reaches bottom
   */
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    // Consider "at bottom" when within 20px of actual bottom
    const atBottom = scrollHeight - scrollTop - clientHeight <= 20

    if (atBottom) {
      setHasScrolledToBottom(true)
    }
  }, [])

  /**
   * Scroll to bottom programmatically (helper button)
   */
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  /**
   * Handle signature capture
   */
  const handleSignatureSave = useCallback((dataUrl: string) => {
    setPendingSignature(dataUrl)
  }, [])

  /**
   * Handle signature clear
   */
  const handleSignatureClear = useCallback(() => {
    setPendingSignature(null)
  }, [])

  /**
   * Submit the signed NDA
   */
  const handleSubmitSignature = useCallback(async () => {
    if (!pendingSignature || !user) return

    // Sign the NDA in the store
    await signNda(pendingSignature, user.id, user.name)

    // Only show success if signing actually persisted
    const updatedProgress = useOnboardingStore.getState().currentProgress
    if (updatedProgress?.nda) {
      setPendingSignature(null)
      setJustSigned(true)
    }
    // If failed, storeError will be set and displayed
  }, [pendingSignature, user, signNda])

  /**
   * Generate and download PDF, then advance to next step
   */
  const handleDownloadPdf = useCallback((andContinue: boolean = true) => {
    if (!currentProgress?.nda || !user) return

    // Generate PDF with NDA data
    const pdfDataUrl = generateAndDownloadNdaPdf({
      employeeName: user.name,
      signedAt: new Date(currentProgress.nda.signedAt),
      signatureDataUrl: currentProgress.nda.signatureDataUrl,
    })

    // Save PDF reference in store
    saveNdaPdf(pdfDataUrl)
    setJustDownloaded(true)

    // Advance to next step
    if (andContinue) {
      goToStep('documents')
      onComplete?.()
    }
  }, [currentProgress, user, saveNdaPdf, goToStep, onComplete])

  // Loading skeleton
  if (configLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-4 bg-muted rounded w-full" /><div className="h-4 bg-muted rounded w-5/6" /></div>
  }

  // If already completed, show success state
  if (isAlreadySigned && currentProgress?.nda) {
    const signedDate = new Date(currentProgress.nda.signedAt)

    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg">
          <CheckCircle className="w-6 h-6 text-accent shrink-0" />
          <div>
            <p className="font-semibold text-foreground">NDA Semnat</p>
            <p className="text-sm text-muted-foreground">
              Semnat de {currentProgress.nda.signedByName} pe{' '}
              {signedDate.toLocaleDateString('ro-RO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleDownloadPdf(false)}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Descarca PDF NDA
          </Button>
          <Button
            onClick={() => { goToStep('documents'); onComplete?.() }}
            className="flex-1"
          >
            Continua
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Instructions */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg">
        <ScrollText className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Citeste si semneaza acordul NDA</p>
          <p>
            Deruleaza documentul pana la sfarsit pentru a activa zona de semnatura.
            Dupa semnare vei putea descarca o copie PDF.
          </p>
        </div>
      </div>

      {/* NDA Document - Scrollable */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={cn(
            'h-[400px] overflow-y-auto border border-border rounded-lg p-6 bg-muted/20',
            'prose prose-sm prose-invert max-w-none',
            'scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground/30'
          )}
        >
          <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: config?.ndaContent ?? '' }} />
        </div>

        {/* Scroll indicator when not at bottom */}
        {!hasScrolledToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-accent/90 text-accent-foreground rounded-full text-sm font-medium hover:bg-accent transition-colors animate-bounce"
          >
            <ChevronDown className="w-4 h-4" />
            Deruleaza pentru a continua
          </button>
        )}
      </div>

      {/* Scroll progress indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            hasScrolledToBottom ? 'bg-accent' : 'bg-muted-foreground/30'
          )}
        />
        <span className={cn(hasScrolledToBottom ? 'text-accent' : 'text-muted-foreground')}>
          {hasScrolledToBottom ? 'Document citit complet' : 'Deruleaza pentru a citi tot documentul'}
        </span>
      </div>

      {/* Error display */}
      {storeError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <span className="text-sm text-destructive">{storeError}</span>
        </div>
      )}

      {/* Signature Section */}
      <div
        className={cn(
          'space-y-4 pt-6 border-t border-border transition-opacity',
          hasScrolledToBottom ? 'opacity-100' : 'opacity-50 pointer-events-none'
        )}
      >
        <h3 className="font-semibold text-foreground">Semnatura</h3>

        {!isAlreadySigned && !justSigned ? (
          <>
            <SignatureCanvas
              onSave={handleSignatureSave}
              onClear={handleSignatureClear}
              label="Deseneaza semnatura ta"
              disabled={!hasScrolledToBottom}
            />

            {pendingSignature && (
              <Button
                onClick={handleSubmitSignature}
                className="w-full"
                size="lg"
              >
                Semneaza NDA
              </Button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-accent shrink-0" />
              <span className="text-sm">NDA semnat cu succes!</span>
            </div>

            <Button
              onClick={() => handleDownloadPdf()}
              variant={hasPdfGenerated || justDownloaded ? 'outline' : 'default'}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              {hasPdfGenerated || justDownloaded ? 'Descarca din nou PDF' : 'Descarca PDF si continua'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
