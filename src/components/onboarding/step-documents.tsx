'use client'

/**
 * StepDocuments - Pasul pentru revizuirea documentelor de instruire
 * Afiseaza lista de documente cu status si permite citirea/confirmarea fiecaruia
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  BookOpen,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboardingStore, useOnboardingConfig } from '@/lib/onboarding'
import { DocumentViewer } from './document-viewer'

export interface StepDocumentsProps {
  /** Callback cand toate documentele sunt confirmate */
  onComplete?: () => void
  /** Clasa CSS suplimentara */
  className?: string
}

interface LocalTrainingDocument {
  id: string
  title: string
  content: string
  minimumReadingSeconds: number
}

interface DocumentStatus {
  document: LocalTrainingDocument
  isStarted: boolean
  isConfirmed: boolean
  timeSpent: number
}

/**
 * Step pentru revizuirea documentelor
 * - Lista de documente cu status (not started, in progress, confirmed)
 * - Click pe document deschide viewer-ul
 * - Toate documentele trebuie confirmate pentru a continua
 */
export function StepDocuments({ onComplete, className }: StepDocumentsProps) {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)

  // Config from DB
  const { config: onboardingConfig } = useOnboardingConfig()
  const trainingDocuments: LocalTrainingDocument[] = (onboardingConfig?.documents ?? []).map(d => ({ id: d.id, title: d.title, content: d.content, minimumReadingSeconds: d.minReadingSeconds }))

  // Store actions and state
  const currentProgress = useOnboardingStore((state) => state.currentProgress)
  const startDocument = useOnboardingStore((state) => state.startDocument)
  const confirmDocument = useOnboardingStore((state) => state.confirmDocument)
  const goToStep = useOnboardingStore((state) => state.goToStep)
  const storeError = useOnboardingStore((state) => state.error)

  // Get document statuses from store
  const getDocumentStatuses = (): DocumentStatus[] => {
    return trainingDocuments.map((doc) => {
      const progress = currentProgress?.documents.find((d) => d.documentId === doc.id)
      return {
        document: doc,
        isStarted: !!progress,
        isConfirmed: progress?.confirmed || false,
        timeSpent: progress?.timeSpentSeconds || 0,
      }
    })
  }

  const documentStatuses = getDocumentStatuses()
  const confirmedCount = documentStatuses.filter((d) => d.isConfirmed).length
  const totalCount = trainingDocuments.length
  const progressPercent = totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0
  const allConfirmed = trainingDocuments.length > 0 && currentProgress?.documents.length === trainingDocuments.length && currentProgress.documents.every(d => d.confirmed)

  // Open document viewer
  const handleOpenDocument = (documentId: string) => {
    startDocument(documentId)
    setActiveDocumentId(documentId)
  }

  // Close document viewer
  const handleCloseDocument = () => {
    setActiveDocumentId(null)
  }

  // Handle document confirmation
  const handleConfirmDocument = async (documentId: string) => {
    await confirmDocument(documentId)

    // Verify confirmation actually persisted in store
    const updatedProgress = useOnboardingStore.getState().currentProgress
    const docConfirmed = updatedProgress?.documents.find(
      (d) => d.documentId === documentId
    )?.confirmed

    if (!docConfirmed) {
      throw new Error(
        useOnboardingStore.getState().error || 'Eroare la confirmarea documentului. Incercati din nou.'
      )
    }

    handleCloseDocument()
  }

  // Continue to next step
  const handleContinue = () => {
    if (allConfirmed) {
      goToStep('video')
      onComplete?.()
    }
  }

  // Get active document
  const activeDocument = activeDocumentId
    ? trainingDocuments.find((d) => d.id === activeDocumentId)
    : null
  const activeStatus = activeDocumentId
    ? documentStatuses.find((d) => d.document.id === activeDocumentId)
    : null

  // If viewing a document, show the viewer
  if (activeDocument && activeStatus) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={handleCloseDocument}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Inapoi la lista
        </Button>

        {/* Document viewer */}
        <DocumentViewer
          documentId={activeDocument.id}
          title={activeDocument.title}
          content={activeDocument.content}
          minReadingSeconds={activeDocument.minimumReadingSeconds}
          isConfirmed={activeStatus.isConfirmed}
          onConfirm={handleConfirmDocument}
        />
      </div>
    )
  }

  // Document list view
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Documente de instruire</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Cititi si confirmati fiecare document inainte de a continua. Fiecare document
          necesita sa derulati pana la sfarsit.
        </p>
      </div>

      {/* Progress summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progres documente</span>
            <span className="text-sm text-muted-foreground">
              {confirmedCount} din {totalCount} confirmate
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Document list */}
      <div className="space-y-3">
        {documentStatuses.map((status) => (
          <Card
            key={status.document.id}
            className={cn(
              'cursor-pointer transition-all hover:border-primary/50',
              status.isConfirmed && 'border-success/50 bg-success/5',
            )}
            onClick={() => !status.isConfirmed && handleOpenDocument(status.document.id)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    status.isConfirmed
                      ? 'bg-success/10 text-success'
                      : status.isStarted
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {status.isConfirmed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>

                {/* Title and info */}
                <div>
                  <h3 className="font-medium">{status.document.title}</h3>
                  {status.isStarted && !status.isConfirmed && (
                    <p className="text-sm text-muted-foreground">In progres</p>
                  )}
                </div>
              </div>

              {/* Status badge and action */}
              <div className="flex items-center gap-3">
                {status.isConfirmed ? (
                  <Badge className="bg-success text-success-foreground">
                    Confirmat
                  </Badge>
                ) : status.isStarted ? (
                  <Badge variant="outline" className="border-primary text-primary">
                    In progres
                  </Badge>
                ) : (
                  <Badge variant="outline">Necitit</Badge>
                )}

                {!status.isConfirmed && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error display */}
      {storeError && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <span className="text-sm text-destructive">{storeError}</span>
        </div>
      )}

      {/* Continue button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          disabled={!allConfirmed}
          className="gap-2"
          variant={allConfirmed ? 'default' : 'outline'}
        >
          {allConfirmed ? (
            <>
              Continua la Video
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Confirmati toate documentele pentru a continua
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
