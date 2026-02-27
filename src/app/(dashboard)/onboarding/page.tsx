'use client'

/**
 * Employee Onboarding Page
 *
 * The main onboarding wizard page for new employees.
 * Renders the WizardShellWithSteps which handles all step logic,
 * navigation, and renders the appropriate step components.
 *
 * This page is accessible to any authenticated user but the OnboardingGuard
 * ensures new employees are redirected here from other pages.
 */

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth'
import {
  WizardShellWithSteps,
  StepNda,
  StepDocuments,
  StepVideo,
  StepQuiz,
  StepNotification,
  StepComplete,
} from '@/components/onboarding'
import { useAuth } from '@/lib/auth'
import { useOnboardingStore } from '@/lib/onboarding'

function OnboardingContent() {
  const { user } = useAuth()
  const router = useRouter()
  const goToStep = useOnboardingStore((state) => state.goToStep)

  // Callbacks for step components
  const handleQuizComplete = useCallback(() => {
    goToStep('notification')
  }, [goToStep])

  const handleNotificationProceed = useCallback(() => {
    goToStep('handoff')
  }, [goToStep])

  const handleGoToDashboard = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const handleReviewContent = useCallback(() => {
    goToStep('video')
  }, [goToStep])

  // Wait for user to be available
  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <WizardShellWithSteps
      employeeId={user.id}
      employeeName={user.name}
      steps={{
        nda: <StepNda onComplete={() => goToStep('documents')} />,
        documents: <StepDocuments />,
        video: <StepVideo />,
        quiz: (
          <StepQuiz
            onComplete={handleQuizComplete}
            onReviewContent={handleReviewContent}
          />
        ),
        notification: <StepNotification onProceed={handleNotificationProceed} />,
        complete: <StepComplete onGoToDashboard={handleGoToDashboard} />,
        // handoff and confirmation use built-in HandoffConfirmation component
      }}
    />
  )
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <OnboardingContent />
      </div>
    </AuthGuard>
  )
}
