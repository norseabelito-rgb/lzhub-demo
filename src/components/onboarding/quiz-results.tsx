'use client'

import { CheckCircle2, XCircle, AlertTriangle, RotateCcw, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QUIZ_PASS_THRESHOLD, MAX_QUIZ_ATTEMPTS } from '@/lib/onboarding/onboarding-store'

export interface QuizResultsProps {
  /** The score achieved (0-100) */
  score: number
  /** Whether the quiz was passed */
  passed: boolean
  /** Current attempt number that just completed */
  attemptNumber: number
  /** Number of attempts remaining */
  attemptsRemaining: number
  /** Callback when user wants to retry */
  onRetry?: () => void
  /** Callback when user wants to review content (after max attempts) */
  onReviewContent?: () => void
  /** Callback to proceed to next step (after passing) */
  onProceed?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Quiz results display component
 *
 * Shows only pass/fail status per CONTEXT.md requirements:
 * - Does NOT reveal which answers were correct/incorrect
 * - Shows score percentage
 * - Shows attempts remaining
 * - Provides retry or proceed actions
 */
export function QuizResults({
  score,
  passed,
  attemptNumber,
  attemptsRemaining,
  onRetry,
  onReviewContent,
  onProceed,
  className,
}: QuizResultsProps) {
  const canRetry = attemptsRemaining > 0 && !passed
  const maxAttemptsReached = attemptsRemaining === 0 && !passed

  return (
    <Card className={cn('w-full max-w-lg mx-auto', className)}>
      <CardHeader className="text-center pb-4">
        {/* Result icon */}
        <div className="flex justify-center mb-4">
          {passed ? (
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-accent" />
            </div>
          ) : maxAttemptsReached ? (
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
          )}
        </div>

        {/* Result title */}
        <CardTitle className="text-2xl">
          {passed
            ? 'Felicitari! Ai trecut quiz-ul!'
            : maxAttemptsReached
              ? 'Quiz nereusit'
              : 'Mai incearca'}
        </CardTitle>

        {/* Result description */}
        <CardDescription className="text-base mt-2">
          {passed
            ? 'Ai demonstrat ca ai inteles regulile si procedurile.'
            : maxAttemptsReached
              ? 'Ai epuizat cele 3 incercari. Trebuie sa revizuiesti materialele.'
              : `Ai nevoie de minim ${QUIZ_PASS_THRESHOLD}% pentru a trece.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Score display */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-5xl font-bold text-foreground">{score}%</div>
          <div className="text-sm text-muted-foreground">
            Scor obtinut (minim {QUIZ_PASS_THRESHOLD}%)
          </div>
        </div>

        {/* Attempt info */}
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Incercarea:</span>
            <span className="font-medium">
              {attemptNumber} din {MAX_QUIZ_ATTEMPTS}
            </span>
          </div>
          {!passed && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Ramase:</span>
              <span
                className={cn(
                  'font-medium',
                  attemptsRemaining === 0 && 'text-destructive'
                )}
              >
                {attemptsRemaining}
              </span>
            </div>
          )}
        </div>

        {/* Note about not showing correct answers */}
        {!passed && (
          <p className="text-sm text-center text-muted-foreground italic border-t border-border pt-4">
            Pentru securitate, raspunsurile corecte nu sunt afisate.
            {canRetry && ' Revizuieste materialele inainte de a incerca din nou.'}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {passed && onProceed && (
            <Button onClick={onProceed} size="lg" className="w-full">
              Continua
            </Button>
          )}

          {canRetry && onRetry && (
            <Button onClick={onRetry} size="lg" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Incearca din nou ({attemptsRemaining} incercari ramase)
            </Button>
          )}

          {maxAttemptsReached && onReviewContent && (
            <Button
              onClick={onReviewContent}
              size="lg"
              variant="outline"
              className="w-full"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Revizuieste materialele
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
