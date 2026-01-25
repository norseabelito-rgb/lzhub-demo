'use client'

/**
 * ReminderBanner - Banner de reminder pentru onboarding incomplet
 *
 * Afiseaza un banner persistent pentru angajatii noi care nu au
 * finalizat procesul de onboarding. Nu poate fi inchis - ramane
 * vizibil pana la completarea onboarding-ului.
 */

import { useMemo } from 'react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useOnboardingStore, ONBOARDING_STEP_LABELS } from '@/lib/onboarding'

export interface ReminderBannerProps {
  /** Clasa CSS suplimentara */
  className?: string
}

/**
 * Banner pentru onboarding incomplet
 * - Afisare doar pentru angajati noi cu onboarding incomplet
 * - Nu apare pentru manageri
 * - Nu apare pe pagina de onboarding
 * - Persistent - nu poate fi inchis
 */
export function ReminderBanner({ className }: ReminderBannerProps) {
  const { user } = useAuth()
  const allProgress = useOnboardingStore((state) => state.allProgress)

  // Compute visibility and message
  const bannerData = useMemo(() => {
    // No user or is manager - don't show
    if (!user || user.role === 'manager') {
      return { show: false }
    }

    // User is not new - don't show
    if (!user.isNew) {
      return { show: false }
    }

    // Check onboarding progress
    const progress = allProgress.find((p) => p.employeeId === user.id)

    // No progress - show banner with first step
    if (!progress) {
      return {
        show: true,
        currentStep: 'nda',
        stepLabel: ONBOARDING_STEP_LABELS.nda,
      }
    }

    // Progress complete - don't show
    if (progress.isComplete) {
      return { show: false }
    }

    // Show banner with current step
    return {
      show: true,
      currentStep: progress.currentStep,
      stepLabel: ONBOARDING_STEP_LABELS[progress.currentStep],
    }
  }, [user, allProgress])

  // Don't render if banner shouldn't show
  if (!bannerData.show) {
    return null
  }

  return (
    <Alert
      variant="default"
      className={`mb-4 border-amber-500/50 bg-amber-500/10 ${className || ''}`}
    >
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500">Onboarding incomplet</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Completeaza procesul de onboarding pentru acces complet la platforma.
          </p>
          <p className="text-xs text-muted-foreground">
            Esti la pasul: <span className="font-medium text-foreground">{bannerData.stepLabel}</span>
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/onboarding">
            Continua onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
