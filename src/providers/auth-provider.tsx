'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@/lib/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Auth provider that initializes auth state on mount
 * Handles hydration of persisted auth state from localStorage
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Check auth state after hydration
    checkAuth()

    // Use requestAnimationFrame to avoid synchronous setState warning
    requestAnimationFrame(() => {
      setIsHydrated(true)
    })
  }, [checkAuth])

  // Show nothing while hydrating to prevent flash
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
