'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import type { UserRole } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
  /** Required roles to access the route. If not specified, any authenticated user can access. */
  allowedRoles?: UserRole[]
  /** Path to redirect to if not authenticated */
  redirectTo?: string
  /** Custom loading component */
  loadingComponent?: React.ReactNode
}

/**
 * Client-side route protection component
 *
 * Wrap protected pages with this component to ensure
 * only authenticated users (optionally with specific roles) can access them.
 *
 * @example
 * // Protect route for any authenticated user
 * <AuthGuard>
 *   <DashboardPage />
 * </AuthGuard>
 *
 * @example
 * // Protect route for managers only
 * <AuthGuard allowedRoles={['manager']}>
 *   <AdminPage />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = '/login',
  loadingComponent,
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname)
      router.replace(`${redirectTo}?returnUrl=${returnUrl}`)
      return
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // User doesn't have required role - redirect to home or unauthorized page
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname, redirectTo])

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Not authenticated or wrong role - show nothing while redirecting
  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  // Authorized - render children
  return <>{children}</>
}

/**
 * HOC version of AuthGuard for easier page wrapping
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
