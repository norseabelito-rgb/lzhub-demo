/**
 * Warning store for LaserZone Hub
 * Manages warnings via API calls with loading/error states
 */

import { create } from 'zustand'
import type { Warning, DisciplineLevel, Acknowledgment, Signature } from './types'
import { DISCIPLINE_LEVELS } from './types'
import { api } from '@/lib/api-client'

// ============================================================================
// API Response Types (DB shape - flattened acknowledgment fields)
// ============================================================================

interface ApiWarning {
  id: string
  employeeId: string
  employeeName: string
  managerId: string
  managerName: string
  level: DisciplineLevel
  category: string
  description: string
  incidentDate: string
  witness: string | null
  managerSignature: Signature | Record<string, unknown>
  status: string
  employeeSignature: Signature | Record<string, unknown> | null
  acknowledgmentComment: string | null
  acknowledgedAt: string | null
  refusedToSign: boolean
  refusedAt: string | null
  refusedWitnessedBy: string | null
  isCleared: boolean
  clearedAt: string | null
  clearedById: string | null
  clearedReason: string | null
  attachments: string[]
  createdAt: string
  updatedAt: string
  employee?: { id: string; name: string; email: string; role: string }
  issuedBy?: { id: string; name: string; email: string; role: string }
  clearedBy?: { id: string; name: string; email: string; role: string } | null
}

// ============================================================================
// Mapping: API response -> Frontend Warning type
// ============================================================================

function mapApiWarning(raw: ApiWarning): Warning {
  // Reconstruct managerSignature as Signature type
  const mgrSig = raw.managerSignature as Signature

  // Reconstruct acknowledgment from flattened fields
  let acknowledgment: Acknowledgment | undefined
  if (raw.acknowledgedAt || raw.refusedToSign) {
    if (raw.refusedToSign) {
      acknowledgment = {
        refusedToSign: true,
        refusedAt: raw.refusedAt ? new Date(raw.refusedAt) : undefined,
        refusedWitnessedBy: raw.refusedWitnessedBy ?? undefined,
      }
    } else {
      const empSig = raw.employeeSignature as Signature | null
      acknowledgment = {
        signature: empSig
          ? {
              ...empSig,
              signedAt: new Date(empSig.signedAt),
            }
          : undefined,
        refusedToSign: false,
        employeeComments: raw.acknowledgmentComment ?? undefined,
        acknowledgedAt: raw.acknowledgedAt ? new Date(raw.acknowledgedAt) : undefined,
      }
    }
  }

  return {
    id: raw.id,
    employeeId: raw.employeeId,
    employeeName: raw.employeeName,
    managerId: raw.managerId,
    managerName: raw.managerName,
    level: raw.level,
    category: raw.category as Warning['category'],
    description: raw.description,
    incidentDate: new Date(raw.incidentDate),
    witness: raw.witness ?? undefined,
    managerSignature: {
      ...mgrSig,
      signedAt: new Date(mgrSig.signedAt),
    },
    acknowledgment,
    status: raw.status as Warning['status'],
    isCleared: raw.isCleared,
    clearedAt: raw.clearedAt ? new Date(raw.clearedAt) : undefined,
    clearedBy: raw.clearedById ?? undefined,
    clearedReason: raw.clearedReason ?? undefined,
    attachments: raw.attachments,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

// ============================================================================
// Store Types
// ============================================================================

interface WarningState {
  warnings: Warning[]
  isLoading: boolean
  error: string | null
}

interface WarningActions {
  // Fetch operations
  fetchWarnings: (filters?: {
    employeeId?: string
    status?: string
    level?: string
    active?: boolean
  }) => Promise<void>
  fetchPendingWarnings: () => Promise<void>

  // CRUD operations
  createWarning: (
    data: Omit<Warning, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
  updateWarning: (id: string, updates: Partial<Warning>) => Promise<void>

  // Acknowledgment flow
  acknowledgeWarning: (id: string, acknowledgment: Acknowledgment) => Promise<void>
  refuseWarning: (id: string, witnessName?: string) => Promise<void>

  // Clearance
  clearWarning: (id: string, clearedBy: string, reason: string) => Promise<void>

  // Query operations (local, from cached warnings)
  getWarningById: (id: string) => Warning | undefined
  getWarningsForEmployee: (employeeId: string) => Warning[]
  getActiveWarningsForEmployee: (employeeId: string) => Warning[]
  getPendingAcknowledgments: (employeeId: string) => Warning[]
  getAllPendingWarnings: () => Warning[]

  // Escalation helpers (WARN-09)
  getCurrentLevel: (employeeId: string) => DisciplineLevel | null
  getNextLevel: (employeeId: string) => DisciplineLevel
  canSkipLevel: (fromLevel: DisciplineLevel, toLevel: DisciplineLevel) => boolean

  // Error management
  clearError: () => void
}

export type WarningStore = WarningState & WarningActions

// ============================================================================
// Helper Functions
// ============================================================================

function getLevelIndex(level: DisciplineLevel): number {
  return DISCIPLINE_LEVELS.indexOf(level)
}

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

export const useWarningStore = create<WarningStore>()((set, get) => ({
  // Initial state - empty, loaded from API
  warnings: [],
  isLoading: false,
  error: null,

  // ========== Fetch Operations ==========

  fetchWarnings: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (filters?.employeeId) params.set('employeeId', filters.employeeId)
      if (filters?.status) params.set('status', filters.status)
      if (filters?.level) params.set('level', filters.level)
      if (filters?.active) params.set('active', 'true')

      const qs = params.toString()
      const url = `/api/warnings${qs ? `?${qs}` : ''}`
      const data = await api<ApiWarning[]>(url)
      set({ warnings: data.map(mapApiWarning), isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la incarcarea avertismentelor',
        isLoading: false,
      })
    }
  },

  fetchPendingWarnings: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api<ApiWarning[]>('/api/warnings/pending')
      set({ warnings: data.map(mapApiWarning), isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la incarcarea avertismentelor in asteptare',
        isLoading: false,
      })
    }
  },

  // ========== CRUD Operations ==========

  createWarning: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<ApiWarning>('/api/warnings', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: data.employeeId,
          level: data.level,
          category: data.category,
          description: data.description,
          incidentDate: data.incidentDate,
          witness: data.witness,
          managerSignature: data.managerSignature,
        }),
      })

      const warning = mapApiWarning(result)
      set((state) => ({
        warnings: [warning, ...state.warnings],
        isLoading: false,
      }))

      return warning.id
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la crearea avertismentului',
        isLoading: false,
      })
      throw err
    }
  },

  updateWarning: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<ApiWarning>(`/api/warnings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      const updated = mapApiWarning(result)
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? updated : w)),
        isLoading: false,
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la actualizarea avertismentului',
        isLoading: false,
      })
      throw err
    }
  },

  // ========== Acknowledgment Flow ==========

  acknowledgeWarning: async (id, acknowledgment) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<ApiWarning>(`/api/warnings/${id}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({
          signature: acknowledgment.signature,
          employeeComments: acknowledgment.employeeComments,
        }),
      })

      const updated = mapApiWarning(result)
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? updated : w)),
        isLoading: false,
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la confirmarea avertismentului',
        isLoading: false,
      })
      throw err
    }
  },

  refuseWarning: async (id, witnessName) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<ApiWarning>(`/api/warnings/${id}/refuse`, {
        method: 'POST',
        body: JSON.stringify({ witnessName }),
      })

      const updated = mapApiWarning(result)
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? updated : w)),
        isLoading: false,
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la inregistrarea refuzului',
        isLoading: false,
      })
      throw err
    }
  },

  // ========== Clearance ==========

  clearWarning: async (id, _clearedBy, reason) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<ApiWarning>(`/api/warnings/${id}/clear`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })

      const updated = mapApiWarning(result)
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? updated : w)),
        isLoading: false,
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la anularea avertismentului',
        isLoading: false,
      })
      throw err
    }
  },

  // ========== Query Operations (local) ==========

  getWarningById: (id) => {
    return get().warnings.find((w) => w.id === id)
  },

  getWarningsForEmployee: (employeeId) => {
    return get()
      .warnings
      .filter((w) => w.employeeId === employeeId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  },

  getActiveWarningsForEmployee: (employeeId) => {
    return get()
      .warnings
      .filter((w) => w.employeeId === employeeId && !w.isCleared)
      .sort(
        (a, b) =>
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
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  },

  getAllPendingWarnings: () => {
    return get()
      .warnings
      .filter((w) => w.status === 'pending_acknowledgment' && !w.isCleared)
      .sort(
        (a, b) =>
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

    if (!currentLevel) return 'verbal'

    const currentIndex = getLevelIndex(currentLevel)
    const nextIndex = Math.min(currentIndex + 1, DISCIPLINE_LEVELS.length - 1)

    return DISCIPLINE_LEVELS[nextIndex]
  },

  canSkipLevel: (_fromLevel, _toLevel) => {
    // Per CONTEXT.md: always allow skipping, the system records it
    return true
  },

  // ========== Error Management ==========

  clearError: () => {
    set({ error: null })
  },
}))
