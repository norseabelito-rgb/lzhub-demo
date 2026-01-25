'use client'

import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth'
import { AppShell } from '@/components/layout'
import { OnboardingGuard } from '@/components/onboarding'
import { ReminderBanner } from '@/components/dashboard'
import { useAuth } from '@/lib/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <AuthGuard>
      <OnboardingGuard>
        {user && (
          <AppShell
            userName={user.name}
            userRole={user.role}
            onLogout={handleLogout}
          >
            <ReminderBanner className="mx-4 mt-4 sm:mx-6" />
            {children}
          </AppShell>
        )}
      </OnboardingGuard>
    </AuthGuard>
  )
}
