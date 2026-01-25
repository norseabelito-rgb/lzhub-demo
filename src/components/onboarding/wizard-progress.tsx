'use client'

import { cn } from '@/lib/utils'
import {
  useOnboardingStore,
  STEP_ORDER,
  ONBOARDING_STEP_LABELS,
  type OnboardingStep,
  type StepStatus,
} from '@/lib/onboarding'
import { Check, Lock } from 'lucide-react'

export interface WizardProgressProps {
  /** Additional CSS classes */
  className?: string
  /** Compact mode for mobile */
  compact?: boolean
}

/**
 * Get color classes for a step based on its status
 */
function getStepColorClasses(status: StepStatus): { circle: string; text: string; line: string } {
  switch (status) {
    case 'completed':
      return {
        circle: 'bg-success text-success-foreground border-success glow-success',
        text: 'text-foreground',
        line: 'bg-success',
      }
    case 'in_progress':
      return {
        circle: 'bg-primary/20 text-primary border-primary glow-subtle animate-pulse',
        text: 'text-primary font-semibold',
        line: 'bg-muted',
      }
    case 'available':
      return {
        circle: 'bg-muted text-muted-foreground border-muted-foreground/30',
        text: 'text-muted-foreground',
        line: 'bg-muted',
      }
    case 'locked':
    default:
      return {
        circle: 'bg-muted/50 text-muted-foreground/50 border-muted-foreground/20',
        text: 'text-muted-foreground/50',
        line: 'bg-muted/50',
      }
  }
}

/**
 * Render the appropriate icon for a step status
 */
function StepIcon({ status, size }: { status: StepStatus; size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }
  const className = sizeClasses[size]

  if (status === 'completed') {
    return <Check className={className} />
  }
  if (status === 'locked') {
    return <Lock className={className} />
  }
  return null
}

/**
 * Single step in the progress indicator
 */
function ProgressStep({
  step,
  index,
  status,
  isLast,
  compact,
  onStepClick,
  canAccess,
}: {
  step: OnboardingStep
  index: number
  status: StepStatus
  isLast: boolean
  compact?: boolean
  onStepClick?: (step: OnboardingStep) => void
  canAccess?: boolean
}) {
  const colors = getStepColorClasses(status)
  const label = ONBOARDING_STEP_LABELS[step]
  const stepNumber = index + 1
  const showIcon = status === 'completed' || status === 'locked'
  const isClickable = canAccess && onStepClick && status !== 'locked'

  const handleClick = () => {
    if (isClickable) {
      onStepClick(step)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onStepClick(step)
    }
  }

  if (compact) {
    // Compact horizontal layout for mobile
    return (
      <div className="flex flex-col items-center flex-1">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2',
            colors.circle,
            isClickable && 'cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all'
          )}
          onClick={handleClick}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onKeyDown={isClickable ? handleKeyDown : undefined}
        >
          {showIcon ? (
            <StepIcon status={status} size={status === 'completed' ? 'md' : 'sm'} />
          ) : (
            stepNumber
          )}
        </div>
        {!isLast && (
          <div className={cn('h-0.5 w-full mt-4', colors.line)} />
        )}
      </div>
    )
  }

  // Full vertical layout
  return (
    <div className="flex items-start gap-3">
      {/* Step indicator */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 shrink-0',
            colors.circle,
            isClickable && 'cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all'
          )}
          onClick={handleClick}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onKeyDown={isClickable ? handleKeyDown : undefined}
        >
          {showIcon ? (
            <StepIcon status={status} size={status === 'completed' ? 'lg' : 'md'} />
          ) : (
            stepNumber
          )}
        </div>

        {/* Connector line */}
        {!isLast && (
          <div className={cn('w-0.5 h-8 mt-2', colors.line)} />
        )}
      </div>

      {/* Step label */}
      <div className="pt-2">
        <span className={cn('text-sm', colors.text)}>
          {stepNumber}. {label}
        </span>
      </div>
    </div>
  )
}

/**
 * Wizard progress indicator showing all steps with their status
 * Displays numbered steps with names: 1. NDA, 2. Documents, etc.
 * Completed and available steps are clickable for navigation.
 */
export function WizardProgress({ className, compact = false }: WizardProgressProps) {
  const getStepStatus = useOnboardingStore((state) => state.getStepStatus)
  const goToStep = useOnboardingStore((state) => state.goToStep)

  if (compact) {
    // Horizontal compact layout
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {STEP_ORDER.map((step, index) => {
          const status = getStepStatus(step)
          const isLast = index === STEP_ORDER.length - 1

          return (
            <ProgressStep
              key={step}
              step={step}
              index={index}
              status={status}
              isLast={isLast}
              compact
              onStepClick={goToStep}
              canAccess={status !== 'locked'}
            />
          )
        })}
      </div>
    )
  }

  // Vertical full layout
  return (
    <nav className={cn('flex flex-col', className)} aria-label="Progress wizard">
      {STEP_ORDER.map((step, index) => {
        const status = getStepStatus(step)
        const isLast = index === STEP_ORDER.length - 1

        return (
          <ProgressStep
            key={step}
            step={step}
            index={index}
            status={status}
            isLast={isLast}
            onStepClick={goToStep}
            canAccess={status !== 'locked'}
          />
        )
      })}
    </nav>
  )
}
