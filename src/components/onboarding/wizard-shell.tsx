'use client'

import { ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useOnboardingStore, ONBOARDING_STEP_LABELS, type OnboardingStep } from '@/lib/onboarding'
import { WizardProgress } from './wizard-progress'
import { HandoffConfirmation } from './handoff-confirmation'

export interface WizardShellProps {
  /** The current step component to render */
  children: ReactNode
  /** Additional CSS classes for the shell container */
  className?: string
}

/**
 * Map step names to their components
 * Each step component will be rendered in the content area
 */
export interface StepComponents {
  nda: ReactNode
  documents: ReactNode
  video: ReactNode
  quiz: ReactNode
  notification: ReactNode
  handoff: ReactNode
  confirmation: ReactNode
  complete: ReactNode
}

export interface WizardShellWithStepsProps {
  /** Step components to render */
  steps: Partial<StepComponents>
  /** Employee ID to initialize/load progress for */
  employeeId: string
  /** Employee name for display */
  employeeName: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Main wizard container that displays progress indicator and current step content
 * Use this component directly with children for simple cases
 */
export function WizardShell({ children, className }: WizardShellProps) {
  const currentProgress = useOnboardingStore((state) => state.currentProgress)
  const currentStep = currentProgress?.currentStep || 'nda'
  const stepLabel = ONBOARDING_STEP_LABELS[currentStep]

  return (
    <div className={cn('flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-full', className)}>
      {/* Progress sidebar - hidden on mobile, visible on larger screens */}
      <aside className="hidden lg:block lg:w-64 shrink-0">
        <div className="sticky top-6 bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
          <h2 className="text-sm font-semibold text-primary text-glow mb-4 uppercase tracking-wide">
            Progres Onboarding
          </h2>
          <WizardProgress />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        {/* Mobile progress indicator */}
        <div className="lg:hidden mb-6">
          <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
            <h2 className="text-xs font-semibold text-primary text-glow mb-3 uppercase tracking-wide">
              Progres
            </h2>
            <WizardProgress compact />
          </div>
        </div>

        {/* Current step header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-primary text-glow">
            {stepLabel}
          </h1>
          {currentProgress && (
            <p className="text-sm text-muted-foreground mt-1">
              Pas {(['nda', 'documents', 'video', 'quiz', 'notification', 'handoff', 'confirmation', 'complete'].indexOf(currentStep) + 1)} din 8
            </p>
          )}
        </header>

        {/* Step content */}
        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors">
          {children}
        </div>
      </main>
    </div>
  )
}

/**
 * Wizard shell that automatically renders the correct step component
 * based on current progress. Handles initialization automatically.
 */
export function WizardShellWithSteps({
  steps,
  employeeId,
  employeeName,
  className,
}: WizardShellWithStepsProps) {
  const initializeOnboarding = useOnboardingStore((state) => state.initializeOnboarding)
  const currentProgress = useOnboardingStore((state) => state.currentProgress)

  // Initialize onboarding on mount
  useEffect(() => {
    initializeOnboarding(employeeId, employeeName)
  }, [employeeId, employeeName, initializeOnboarding])

  const currentStep = currentProgress?.currentStep || 'nda'

  // Get step component from props or use default for handoff/confirmation steps
  const getStepComponent = () => {
    // If steps prop has component for current step, use it
    if (steps[currentStep]) {
      return steps[currentStep]
    }

    // Default handling for handoff and confirmation steps
    if (currentStep === 'handoff' || currentStep === 'confirmation') {
      return <HandoffConfirmation />
    }

    // Placeholder for steps without components
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Componenta pentru pasul &quot;{ONBOARDING_STEP_LABELS[currentStep]}&quot; nu este implementata.</p>
      </div>
    )
  }

  return (
    <WizardShell className={className}>
      {getStepComponent()}
    </WizardShell>
  )
}

/**
 * Hook to get the current step for external components
 */
export function useCurrentStep(): OnboardingStep {
  const currentProgress = useOnboardingStore((state) => state.currentProgress)
  return currentProgress?.currentStep || 'nda'
}
