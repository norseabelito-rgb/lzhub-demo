/**
 * Authentication types for LaserZone Hub
 */

export type UserRole = 'manager' | 'angajat'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  /** New employee flag - used for onboarding flows */
  isNew?: boolean
  /** Data inceperii (pentru pre-boarding - ONBD-13) */
  startDate?: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkAuth: () => void
  /** Marcheaza onboarding-ul ca finalizat pentru un angajat */
  markOnboardingComplete: (userId: string) => void
}

export type AuthStore = AuthState & AuthActions
