// Types
export type {
  UserRole,
  ShiftType,
  User,
  AuthState,
  LoginCredentials,
  AuthActions,
  AuthStore,
} from './types'

// Store (deprecated — thin wrapper around useAuth)
export { useAuthStore } from './auth-store'

// Hooks
export {
  useAuth,
  useCurrentUser,
  useIsAuthenticated,
  useAuthLoading,
} from './use-auth'

// NOTE: Server-only exports (auth, signIn, signOut) are in ./auth-config
// Import directly: import { auth } from '@/lib/auth/auth-config'
// Do NOT re-export them here — they pull in Prisma/pg which breaks client bundles
