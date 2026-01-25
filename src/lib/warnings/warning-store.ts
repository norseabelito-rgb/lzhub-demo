/**
 * Warning store for LaserZone Hub
 * Manages warnings with escalation tracking and acknowledgment flow
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Warning, DisciplineLevel, Acknowledgment } from './types'
import { DISCIPLINE_LEVELS } from './types'
import { MOCK_WARNINGS } from './mock-data'

const WARNING_STORAGE_KEY = 'laserzone-warnings'

// ============================================================================
// Store Types
// ============================================================================

interface WarningState {
  warnings: Warning[]
  isLoading: boolean
}

interface WarningActions {
  // CRUD operations
  createWarning: (
    data: Omit<Warning, 'id' | 'createdAt' | 'updatedAt'>
  ) => string
  updateWarning: (id: string, updates: Partial<Warning>) => void

  // Acknowledgment flow
  acknowledgeWarning: (id: string, acknowledgment: Acknowledgment) => void
  refuseWarning: (id: string, witnessName?: string) => void

  // Clearance
  clearWarning: (id: string, clearedBy: string, reason: string) => void

  // Query operations
  getWarningById: (id: string) => Warning | undefined
  getWarningsForEmployee: (employeeId: string) => Warning[]
  getActiveWarningsForEmployee: (employeeId: string) => Warning[]
  getPendingAcknowledgments: (employeeId: string) => Warning[]
  getAllPendingWarnings: () => Warning[]

  // Escalation helpers (WARN-09)
  getCurrentLevel: (employeeId: string) => DisciplineLevel | null
  getNextLevel: (employeeId: string) => DisciplineLevel
  canSkipLevel: (fromLevel: DisciplineLevel, toLevel: DisciplineLevel) => boolean
}

export type WarningStore = WarningState & WarningActions

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the index of a discipline level (for comparison)
 */
function getLevelIndex(level: DisciplineLevel): number {
  return DISCIPLINE_LEVELS.indexOf(level)
}

/**
 * Get the highest discipline level from a list of warnings
 */
function getHighestLevel(warnings: Warning[]): DisciplineLevel | null {
  if (warnings.length === 0) return null

  let highestIndex = -1
  let highestLevel: DisciplineLevel | null = null

  for (const warning of warnings) {
    const index = getLevelIndex(warning.level)
    if (index > highestIndex) {
      highestIndex = index
      highestLevel = warning.level
    }
  }

  return highestLevel
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useWarningStore = create<WarningStore>()(
  persist(
    (set, get) => ({
      // Initial state with mock data
      warnings: MOCK_WARNINGS,
      isLoading: false,

      // ========== CRUD Operations ==========

      createWarning: (data) => {
        const id = crypto.randomUUID()
        const now = new Date()

        const warning: Warning = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          warnings: [...state.warnings, warning],
        }))

        return id
      },

      updateWarning: (id, updates) => {
        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id
              ? { ...w, ...updates, updatedAt: new Date() }
              : w
          ),
        }))
      },

      // ========== Acknowledgment Flow ==========

      acknowledgeWarning: (id, acknowledgment) => {
        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id
              ? {
                  ...w,
                  acknowledgment,
                  status: acknowledgment.refusedToSign ? 'refused' : 'acknowledged',
                  updatedAt: new Date(),
                }
              : w
          ),
        }))
      },

      refuseWarning: (id, witnessName) => {
        const now = new Date()

        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id
              ? {
                  ...w,
                  acknowledgment: {
                    refusedToSign: true,
                    refusedAt: now,
                    refusedWitnessedBy: witnessName,
                  },
                  status: 'refused' as const,
                  updatedAt: now,
                }
              : w
          ),
        }))
      },

      // ========== Clearance ==========

      clearWarning: (id, clearedBy, reason) => {
        const now = new Date()

        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id
              ? {
                  ...w,
                  isCleared: true,
                  clearedAt: now,
                  clearedBy,
                  clearedReason: reason,
                  status: 'cleared' as const,
                  updatedAt: now,
                }
              : w
          ),
        }))
      },

      // ========== Query Operations ==========

      getWarningById: (id) => {
        return get().warnings.find((w) => w.id === id)
      },

      getWarningsForEmployee: (employeeId) => {
        return get()
          .warnings
          .filter((w) => w.employeeId === employeeId)
          .sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      },

      getActiveWarningsForEmployee: (employeeId) => {
        return get()
          .warnings
          .filter((w) => w.employeeId === employeeId && !w.isCleared)
          .sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      },

      getPendingAcknowledgments: (employeeId) => {
        return get()
          .warnings
          .filter(
            (w) =>
              w.employeeId === employeeId &&
              w.status === 'pending_acknowledgment' &&
              !w.isCleared
          )
          .sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      },

      getAllPendingWarnings: () => {
        return get()
          .warnings
          .filter((w) => w.status === 'pending_acknowledgment' && !w.isCleared)
          .sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      },

      // ========== Escalation Helpers (WARN-09) ==========

      getCurrentLevel: (employeeId) => {
        const activeWarnings = get().getActiveWarningsForEmployee(employeeId)
        return getHighestLevel(activeWarnings)
      },

      getNextLevel: (employeeId) => {
        const currentLevel = get().getCurrentLevel(employeeId)

        // No warnings yet - start with verbal
        if (!currentLevel) return 'verbal'

        const currentIndex = getLevelIndex(currentLevel)
        const nextIndex = Math.min(currentIndex + 1, DISCIPLINE_LEVELS.length - 1)

        return DISCIPLINE_LEVELS[nextIndex]
      },

      canSkipLevel: (_fromLevel, _toLevel) => {
        // Per CONTEXT.md: "Poate sa sara de la verbal direct la final? Da - dar sistemul trebuie sa noteze"
        // Always allow skipping, the system records it
        return true
      },
    }),
    {
      name: WARNING_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Persist warnings only
      partialize: (state) => ({
        warnings: state.warnings,
      }),
    }
  )
)
