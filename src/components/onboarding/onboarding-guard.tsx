'use client'

/**
 * OnboardingGuard - Route protection for new employees
 * Redirects new employees to onboarding wizard until complete
 *
 * Wrap around protected routes to enforce onboarding completion.
 * Does NOT affect /onboarding routes (allows wizard access).
 * Does NOT affect managers (they don't need onboarding gate).
 */

import { useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useOnboardingStore } from '@/lib/onboarding'

export interface OnboardingGuardProps {
  children: React.ReactNode
}

/**
 * Redirecteaza angajatii noi la wizard-ul de onboarding
 * Permite acces doar dupa completarea tuturor pasilor
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading: isAuthLoading } = useAuth()
  const allProgress = useOnboardingStore((state) => state.allProgress)

  // Compute access decision synchronously based on current state
  const { shouldRedirect, isLoading, canRender } = useMemo(() => {
    // Still loading auth - wait
    if (isAuthLoading) {
      return { shouldRedirect: false, isLoading: true, canRender: false }
    }

    // No user - AuthGuard handles, allow render
    if (!user) {
      return { shouldRedirect: false, isLoading: false, canRender: true }
    }

    // Managers skip onboarding guard
    if (user.role === 'manager') {
      return { shouldRedirect: false, isLoading: false, canRender: true }
    }

    // Already on onboarding page - allow access
    if (pathname.startsWith('/onboarding')) {
      return { shouldRedirect: false, isLoading: false, canRender: true }
    }

    // User not marked as new - allow access
    if (!user.isNew) {
      return { shouldRedirect: false, isLoading: false, canRender: true }
    }

    // User is new - check onboarding progress from store
    const progress = allProgress.find((p) => p.employeeId === user.id)

    // No progress or not complete - need redirect
    if (!progress || !progress.isComplete) {
      return { shouldRedirect: true, isLoading: false, canRender: false }
    }

    // Onboarding complete - allow access
    return { shouldRedirect: false, isLoading: false, canRender: true }
  }, [isAuthLoading, user, pathname, allProgress])

  // Handle redirect in effect (side effect only)
  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/onboarding')
    }
  }, [shouldRedirect, router])

  // Show loading while auth loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Se verifica statusul...</p>
        </div>
      </div>
    )
  }

  // Redirect pending - show nothing
  if (shouldRedirect) {
    return null
  }

  // Can render children
  if (canRender) {
    return <>{children}</>
  }

  return null
}
