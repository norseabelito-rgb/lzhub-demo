// Types
export type {
  UserRole,
  User,
  AuthState,
  LoginCredentials,
  AuthActions,
  AuthStore,
} from './types'

// Store
export { useAuthStore } from './auth-store'

// Hooks
export {
  useAuth,
  useCurrentUser,
  useIsAuthenticated,
  useAuthLoading,
} from './use-auth'

// Mock data (for development)
export { authenticateMockUser, getMockUserById, mockUsers } from './mock-users'
