'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { ManagerDashboard } from '@/components/onboarding'

/**
 * Manager-only onboarding dashboard page
 * Shows all employee onboarding progress and allows handoff management
 */
export default function OnboardingAdminPage() {
  const router = useRouter()
  const { user, isManager, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    router.replace('/login')
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Redirectionare la login...</p>
      </div>
    )
  }

  // Not a manager - redirect to dashboard
  if (!isManager) {
    router.replace('/dashboard')
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Acces interzis. Redirectionare...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding Angajati</h1>
        <p className="text-muted-foreground">
          Urmareste progresul angajatilor noi si gestioneaza predarea documentelor
        </p>
      </div>
      <ManagerDashboard />
    </div>
  )
}
