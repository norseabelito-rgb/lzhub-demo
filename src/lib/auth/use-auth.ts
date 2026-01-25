import { useAuthStore } from './auth-store'

/**
 * Primary auth hook for components
 * Provides auth state and actions with role helpers
 */
export function useAuth() {
  const store = useAuthStore()

  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,

    // Actions
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,

    // Role helpers
    isManager: store.user?.role === 'manager',
    isAngajat: store.user?.role === 'angajat',
    isNewEmployee: store.user?.isNew ?? false,
  }
}

/**
 * Hook to get just the current user
 */
export function useCurrentUser() {
  return useAuthStore((state) => state.user)
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated)
}

/**
 * Hook to get auth loading state
 */
export function useAuthLoading() {
  return useAuthStore((state) => state.isLoading)
}
