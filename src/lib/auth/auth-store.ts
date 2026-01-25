import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthStore } from './types'
import { authenticateMockUser, getMockUserById } from './mock-users'

const AUTH_STORAGE_KEY = 'laserzone-auth'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true })

        const result = await authenticateMockUser(credentials)

        if (result.success) {
          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true }
        }

        set({ isLoading: false })
        return { success: false, error: result.error }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      checkAuth: () => {
        const { user } = get()

        // If we have a user from persistence, validate it still exists
        if (user) {
          const validUser = getMockUserById(user.id)
          if (validUser) {
            set({
              user: validUser,
              isAuthenticated: true,
              isLoading: false,
            })
            return
          }
        }

        // No valid user found
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      markOnboardingComplete: (userId: string) => {
        const { user } = get()
        if (user && user.id === userId) {
          // Update current user to mark onboarding complete
          set({
            user: {
              ...user,
              isNew: false,
            },
          })
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist user data, not loading state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // After rehydration, validate the session
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.checkAuth()
        }
      },
    }
  )
)
