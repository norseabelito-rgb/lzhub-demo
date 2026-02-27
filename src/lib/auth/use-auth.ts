'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import type { User, LoginCredentials } from './types'

/**
 * Primary auth hook for components
 * Provides auth state and actions with role helpers
 */
export function useAuth() {
  const { data: session, status, update } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        role: session.user.role,
        avatar: session.user.image ?? undefined,
        isNew: session.user.isNew,
        shiftType: session.user.shiftType,
      }
    : null

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      // v5 beta may return an object with error instead of throwing
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        return { success: false, error: 'Email sau parola incorectă' }
      }

      // Verify session was actually created
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()

      if (!sessionData?.user) {
        return { success: false, error: 'Email sau parola incorectă' }
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Email sau parola incorectă' }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  const checkAuth = () => {
    // No-op — NextAuth handles session checking via useSession
  }

  const markOnboardingComplete = async (userId: string) => {
    // Update the DB
    await fetch(`/api/users/${userId}/onboarding-complete`, { method: 'POST' })
    // Update the session token so UI reflects the change immediately
    await update({ isNew: false })
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    logout,
    checkAuth,
    markOnboardingComplete,

    // Role helpers
    isManager: user?.role === 'manager',
    isAngajat: user?.role === 'angajat',
    isNewEmployee: user?.isNew ?? false,
  }
}

/**
 * Hook to get just the current user
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth()
  return user
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { status } = useSession()
  return status === 'authenticated'
}

/**
 * Hook to get auth loading state
 */
export function useAuthLoading(): boolean {
  const { status } = useSession()
  return status === 'loading'
}
