'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { QuizQuestion } from './quiz-question'
import { QuizResults } from './quiz-results'
import { useOnboardingStore, useOnboardingConfig } from '@/lib/onboarding'

export interface StepQuizProps {
  /** Callback when quiz is passed and user proceeds to next step */
  onComplete: () => void
  /** Callback to go back to review content (after max attempts) */
  onReviewContent?: () => void
  /** Additional CSS classes */
  className?: string
}

type QuizState = 'quiz' | 'results'

/**
 * Quiz step component for onboarding wizard
 *
 * Requirements per CONTEXT.md:
 * - 80% pass threshold (8/10 questions)
 * - Maximum 3 attempts before requiring content review
 * - Shows only pass/fail result, NOT which answers were wrong
 * - Questions displayed one at a time
 */
export function StepQuiz({ onComplete, onReviewContent, className }: StepQuizProps) {
  const { currentProgress, submitQuizAttempt, canRetryQuiz, getQuizAttemptsRemaining, goToStep } =
    useOnboardingStore()
  const loadProgress = useOnboardingStore((state) => state.loadProgress)

  // Config from DB
  const { config: onboardingConfig } = useOnboardingConfig()
  const QUIZ_PASS_THRESHOLD = onboardingConfig?.quizPassThreshold ?? 80
  const MAX_QUIZ_ATTEMPTS = onboardingConfig?.quizMaxAttempts ?? 3

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>('quiz')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [lastResult, setLastResult] = useState<{ score: number; passed: boolean } | null>(null)

  // Questions from config (without correctAnswer since it's public config)
  const questions = (onboardingConfig?.questions ?? []).map(q => ({ ...q, correctAnswer: '' as string | string[] }))
  const totalQuestions = questions.length
  const currentQuestion = questions[currentQuestionIndex]

  // Calculate progress
  const answeredCount = Object.keys(answers).length
  const progressPercent = (answeredCount / totalQuestions) * 100

  // Check if current question is answered
  const isCurrentAnswered = useMemo(() => {
    const answer = answers[currentQuestion.id]
    if (answer === undefined || answer === null) return false
    if (Array.isArray(answer)) return answer.length > 0
    return answer !== ''
  }, [answers, currentQuestion.id])

  // Check if all questions are answered
  const allAnswered = answeredCount === totalQuestions

  // Get attempts info
  const attemptNumber = currentProgress?.quizAttempts.length ?? 0
  const attemptsRemaining = getQuizAttemptsRemaining()

  // Handle answer change
  const handleAnswerChange = useCallback(
    (answer: string | string[]) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }))
    },
    [currentQuestion.id]
  )

  // Navigate to next question
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }, [currentQuestionIndex, totalQuestions])

  // Navigate to previous question
  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex])

  // Submit quiz - server-side scoring
  const handleSubmit = useCallback(async () => {
    const res = await fetch(`/api/onboarding/${currentProgress?.employeeId}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    if (!res.ok) return
    const data = await res.json()
    const quizResult = data._quizResult
    // Reload progress
    if (currentProgress?.employeeId) {
      await loadProgress(currentProgress.employeeId)
    }
    setLastResult({ score: quizResult.score, passed: quizResult.passed })
    setQuizState('results')
  }, [answers, currentProgress, loadProgress])

  // Retry quiz
  const handleRetry = useCallback(() => {
    setAnswers({})
    setCurrentQuestionIndex(0)
    setLastResult(null)
    setQuizState('quiz')
  }, [])

  // Handle review content (go back to documents/video)
  const handleReviewContent = useCallback(() => {
    if (onReviewContent) {
      onReviewContent()
    } else {
      // Default: go back to documents step
      goToStep('documents')
    }
  }, [onReviewContent, goToStep])

  // Loading state - config not yet loaded
  if (!onboardingConfig || questions.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // If already passed, show results
  const hasPassed = currentProgress?.quizAttempts.some((a) => a.passed)
  if (hasPassed && quizState === 'quiz') {
    const passedAttempt = currentProgress?.quizAttempts.find((a) => a.passed)
    return (
      <div className={cn('flex flex-col items-center gap-6', className)}>
        <QuizResults
          score={passedAttempt?.score ?? 100}
          passed={true}
          attemptNumber={passedAttempt?.attemptNumber ?? 1}
          attemptsRemaining={0}
          onProceed={onComplete}
        />
      </div>
    )
  }

  // Show results after quiz submission
  if (quizState === 'results' && lastResult) {
    return (
      <div className={cn('flex flex-col items-center gap-6', className)}>
        <QuizResults
          score={lastResult.score}
          passed={lastResult.passed}
          attemptNumber={attemptNumber}
          attemptsRemaining={attemptsRemaining}
          onRetry={canRetryQuiz() ? handleRetry : undefined}
          onReviewContent={!canRetryQuiz() && !lastResult.passed ? handleReviewContent : undefined}
          onProceed={lastResult.passed ? onComplete : undefined}
        />
      </div>
    )
  }

  // Quiz in progress
  return (
    <div className={cn('flex flex-col gap-6 max-w-2xl mx-auto', className)}>
      {/* Header with progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quiz Verificare Cunostinte</CardTitle>
            <div className="text-sm text-muted-foreground">
              Incercarea {attemptNumber + 1} din {MAX_QUIZ_ATTEMPTS}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {answeredCount} / {totalQuestions} raspunse
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Question card */}
      <Card>
        <CardContent className="pt-6">
          <QuizQuestion
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id] ?? null}
            onAnswerChange={handleAnswerChange}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
          />
        </CardContent>
      </Card>

      {/* Navigation and submit */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Inapoi
        </Button>

        {/* Question dots navigation */}
        <div className="flex items-center gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined
            const isCurrent = idx === currentQuestionIndex

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all',
                  isCurrent && 'ring-2 ring-offset-2 ring-offset-background ring-accent',
                  isAnswered ? 'bg-accent' : 'bg-muted-foreground/30',
                  !isCurrent && 'hover:scale-110'
                )}
                aria-label={`Intrebarea ${idx + 1}`}
              />
            )
          })}
        </div>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <Button onClick={goToNextQuestion} disabled={!isCurrentAnswered}>
            Urmatoarea
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!allAnswered}>
            Trimite Quiz
          </Button>
        )}
      </div>

      {/* Pass threshold info */}
      <p className="text-sm text-center text-muted-foreground">
        Trebuie sa obtii minim {QUIZ_PASS_THRESHOLD}% pentru a trece.
      </p>
    </div>
  )
}
