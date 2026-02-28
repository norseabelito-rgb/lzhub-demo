'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User, Clock, CheckCircle, FileText, Video, HelpCircle, Package, RotateCcw } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ro } from 'date-fns/locale'
import type { OnboardingProgress } from '@/lib/onboarding/types'
import { ONBOARDING_STEP_LABELS, useOnboardingConfig } from '@/lib/onboarding'

interface EmployeeStatusCardProps {
  progress: OnboardingProgress
  onMarkHandoff: (employeeId: string) => void
  onResetOnboarding?: (employeeId: string) => Promise<void>
}

/**
 * Calculates onboarding progress percentage
 * Employee flow has 5 main completion points:
 * - NDA signed
 * - All documents confirmed
 * - Video completed
 * - Quiz passed
 * - Handoff confirmed
 */
function calculateProgress(progress: OnboardingProgress, totalDocuments: number): number {
  let completed = 0
  const total = 5

  // NDA signed
  if (progress.nda) completed++

  // All documents confirmed
  if (totalDocuments > 0 && progress.documents.filter((d) => d.confirmed).length >= totalDocuments) {
    completed++
  }

  // Video completed
  if (progress.video?.completed) completed++

  // Quiz passed
  if (progress.quizAttempts.some((a) => a.passed)) completed++

  // Handoff confirmed
  if (progress.physicalHandoff?.confirmedByEmployee) completed++

  return Math.round((completed / total) * 100)
}

/**
 * Get badge variant based on current step
 */
function getStepBadgeVariant(step: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (step === 'complete') return 'default'
  if (step === 'handoff' || step === 'confirmation') return 'secondary'
  return 'outline'
}

export function EmployeeStatusCard({ progress, onMarkHandoff, onResetOnboarding }: EmployeeStatusCardProps) {
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const { config: onboardingConfig } = useOnboardingConfig()
  const totalDocuments = onboardingConfig?.documents?.length ?? 0
  const progressPercent = calculateProgress(progress, totalDocuments)
  const daysInOnboarding = differenceInDays(new Date(), new Date(progress.startedAt))
  const currentStepLabel = ONBOARDING_STEP_LABELS[progress.currentStep]

  // Check if employee is ready for handoff
  const isAtHandoffStep = progress.currentStep === 'handoff' || progress.currentStep === 'notification'
  const handoffNotMarked = !progress.physicalHandoff?.markedByManager
  const canMarkHandoff = isAtHandoffStep && handoffNotMarked && progress.quizAttempts.some((a) => a.passed)

  // Get quiz status
  const quizPassed = progress.quizAttempts.some((a) => a.passed)
  const quizAttempts = progress.quizAttempts.length
  const lastQuizScore = progress.quizAttempts.length > 0
    ? progress.quizAttempts[progress.quizAttempts.length - 1].score
    : null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {progress.employeeName}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Inceput: {format(new Date(progress.startedAt), 'd MMM yyyy', { locale: ro })}
              </p>
            </div>
          </div>
          <Badge variant={getStepBadgeVariant(progress.currentStep)}>
            {currentStepLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progres</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Days indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" />
          <span>
            {daysInOnboarding === 0
              ? 'Inceput azi'
              : `${daysInOnboarding} ${daysInOnboarding === 1 ? 'zi' : 'zile'} in onboarding`}
          </span>
        </div>

        {/* Step checklist */}
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pasi completati
          </p>

          <div className="grid gap-1.5 text-sm">
            {/* NDA */}
            <div className="flex items-center gap-2">
              {progress.nda ? (
                <CheckCircle className="size-4 text-green-500" />
              ) : (
                <div className="size-4 rounded-full border border-muted-foreground/30" />
              )}
              <FileText className="size-4 text-muted-foreground" />
              <span className={progress.nda ? 'text-foreground' : 'text-muted-foreground'}>
                NDA {progress.nda ? 'semnat' : 'in asteptare'}
              </span>
            </div>

            {/* Documents */}
            <div className="flex items-center gap-2">
              {totalDocuments > 0 && progress.documents.filter((d) => d.confirmed).length >= totalDocuments ? (
                <CheckCircle className="size-4 text-green-500" />
              ) : (
                <div className="size-4 rounded-full border border-muted-foreground/30" />
              )}
              <FileText className="size-4 text-muted-foreground" />
              <span className={totalDocuments > 0 && progress.documents.filter((d) => d.confirmed).length >= totalDocuments ? 'text-foreground' : 'text-muted-foreground'}>
                Documente {progress.documents.filter((d) => d.confirmed).length}/{totalDocuments} citite
              </span>
            </div>

            {/* Video */}
            <div className="flex items-center gap-2">
              {progress.video?.completed ? (
                <CheckCircle className="size-4 text-green-500" />
              ) : (
                <div className="size-4 rounded-full border border-muted-foreground/30" />
              )}
              <Video className="size-4 text-muted-foreground" />
              <span className={progress.video?.completed ? 'text-foreground' : 'text-muted-foreground'}>
                Video {progress.video?.completed
                  ? 'vizionat'
                  : progress.video
                    ? `${Math.round((progress.video.furthestReached / progress.video.totalDuration) * 100)}%`
                    : 'neinceput'}
              </span>
            </div>

            {/* Quiz */}
            <div className="flex items-center gap-2">
              {quizPassed ? (
                <CheckCircle className="size-4 text-green-500" />
              ) : (
                <div className="size-4 rounded-full border border-muted-foreground/30" />
              )}
              <HelpCircle className="size-4 text-muted-foreground" />
              <span className={quizPassed ? 'text-foreground' : 'text-muted-foreground'}>
                Quiz {quizPassed
                  ? 'trecut'
                  : quizAttempts > 0
                    ? `nereusit (${lastQuizScore}%)`
                    : 'neinceput'}
              </span>
            </div>

            {/* Handoff */}
            <div className="flex items-center gap-2">
              {progress.physicalHandoff?.confirmedByEmployee ? (
                <CheckCircle className="size-4 text-green-500" />
              ) : progress.physicalHandoff?.markedByManager ? (
                <Clock className="size-4 text-amber-500" />
              ) : (
                <div className="size-4 rounded-full border border-muted-foreground/30" />
              )}
              <Package className="size-4 text-muted-foreground" />
              <span className={progress.physicalHandoff?.confirmedByEmployee
                ? 'text-foreground'
                : 'text-muted-foreground'}>
                Predare {progress.physicalHandoff?.confirmedByEmployee
                  ? 'confirmata'
                  : progress.physicalHandoff?.markedByManager
                    ? 'asteapta confirmare'
                    : 'in asteptare'}
              </span>
            </div>
          </div>
        </div>

        {/* Mark handoff button */}
        {canMarkHandoff && (
          <Button
            onClick={() => onMarkHandoff(progress.employeeId)}
            className="w-full"
            size="sm"
          >
            Marcheaza predare
          </Button>
        )}

        {/* Show waiting state if manager marked but employee hasn't confirmed */}
        {progress.physicalHandoff?.markedByManager && !progress.physicalHandoff.confirmedByEmployee && (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-2 text-sm text-amber-500">
            <Clock className="size-4" />
            <span>Asteapta confirmarea angajatului</span>
          </div>
        )}

        {/* Reset onboarding button */}
        {onResetOnboarding && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-destructive hover:text-destructive"
              onClick={() => setResetDialogOpen(true)}
            >
              <RotateCcw className="size-4" />
              Reseteaza onboarding
            </Button>

            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reseteaza onboarding</DialogTitle>
                  <DialogDescription>
                    Esti sigur ca vrei sa resetezi onboarding-ul pentru <strong>{progress.employeeName}</strong>?
                    Tot progresul va fi sters si angajatul va trebui sa reia procesul de la inceput.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setResetDialogOpen(false)}
                    disabled={isResetting}
                  >
                    Anuleaza
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isResetting}
                    onClick={async () => {
                      setIsResetting(true)
                      try {
                        await onResetOnboarding(progress.employeeId)
                        setResetDialogOpen(false)
                      } catch {
                        // Error is handled by the store
                      } finally {
                        setIsResetting(false)
                      }
                    }}
                  >
                    {isResetting ? 'Se reseteaza...' : 'Reseteaza'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export type { EmployeeStatusCardProps }
