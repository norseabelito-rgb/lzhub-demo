/**
 * Reservation store for LaserZone Hub
 * Manages reservations with conflict detection and capacity tracking
 * Data is fetched from/persisted to the API
 */

import { create } from 'zustand'
import { isWithinInterval, parseISO } from 'date-fns'
import type {
  Reservation,
  CapacitySettings,
  ConflictCheckResult,
  CapacityCheckResult,
} from './types'
import { api } from '@/lib/api-client'

// ============================================================================
// Time Parsing Helpers
// ============================================================================

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTimeToMinutes(start1)
  const e1 = parseTimeToMinutes(end1)
  const s2 = parseTimeToMinutes(start2)
  const e2 = parseTimeToMinutes(end2)
  return s1 < e2 && s2 < e1
}

// ============================================================================
// Store Types
// ============================================================================

interface ReservationState {
  reservations: Reservation[]
  capacitySettings: CapacitySettings
  isLoading: boolean
  error: string | null
}

interface ReservationActions {
  // Data fetching
  fetchReservations: (date: string) => Promise<void>
  fetchCapacitySettings: () => Promise<void>

  // CRUD operations
  createReservation: (
    data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'hasConflict' | 'conflictOverridden'>
  ) => Promise<{ id: string; hasConflict: boolean; conflictReason?: string }>
  updateReservation: (id: string, updates: Partial<Reservation>) => Promise<void>
  cancelReservation: (id: string) => Promise<void>
  deleteReservation: (id: string) => Promise<void>

  // Query operations (local, from fetched data)
  getReservationById: (id: string) => Reservation | undefined
  getReservationsForDate: (date: string) => Reservation[]
  getReservationsForDateRange: (startDate: string, endDate: string) => Reservation[]
  getReservationsForCustomer: (customerId: string) => Reservation[]

  // Conflict and capacity operations (local from fetched data)
  checkConflicts: (
    date: string,
    startTime: string,
    endTime: string,
    partySize: number,
    excludeId?: string
  ) => ConflictCheckResult
  getCapacityForSlot: (date: string, startTime: string) => CapacityCheckResult
  updateCapacitySettings: (settings: Partial<CapacitySettings>) => Promise<void>

  // Error handling
  clearError: () => void
}

export type ReservationStore = ReservationState & ReservationActions

// ============================================================================
// Store Implementation
// ============================================================================

export const useReservationStore = create<ReservationStore>()((set, get) => ({
  reservations: [],
  capacitySettings: {
    defaultCapacity: 40,
    warningThreshold: 0.8,
    criticalThreshold: 1.0,
  },
  isLoading: false,
  error: null,

  // ========== Data Fetching ==========

  fetchReservations: async (date) => {
    set({ isLoading: true, error: null })
    try {
      const reservations = await api<Reservation[]>(`/api/calendar/reservations?date=${date}`)
      set((state) => {
        // Merge new reservations with existing ones (replace for the same date, keep others)
        const otherDateReservations = state.reservations.filter(
          (r) => r.date !== date
        )
        return {
          reservations: [...otherDateReservations, ...reservations],
          isLoading: false,
        }
      })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },

  fetchCapacitySettings: async () => {
    try {
      const settings = await api<CapacitySettings>('/api/calendar/capacity/settings')
      set({ capacitySettings: settings })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  // ========== CRUD Operations ==========

  createReservation: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<Reservation & { conflict?: { hasConflict: boolean; reason?: string; severity?: string } }>(
        '/api/calendar/reservations',
        {
          method: 'POST',
          body: JSON.stringify({
            customerId: data.customerId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            partySize: data.partySize,
            occasion: data.occasion,
            notes: data.notes,
            isWalkup: data.isWalkup,
            conflictOverridden: (data as { conflictOverridden?: boolean }).conflictOverridden,
          }),
        }
      )
      const conflict = result.conflict
      // Add reservation to local state
      set((state) => ({
        reservations: [...state.reservations, result],
        isLoading: false,
      }))
      return {
        id: result.id,
        hasConflict: conflict?.hasConflict ?? false,
        conflictReason: conflict?.reason,
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
      throw err
    }
  },

  updateReservation: async (id, updates) => {
    set({ error: null })
    try {
      const updated = await api<Reservation>(`/api/calendar/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
      }))
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  cancelReservation: async (id) => {
    set({ error: null })
    try {
      await api(`/api/calendar/reservations/${id}`, { method: 'DELETE' })
      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.id === id ? { ...r, status: 'cancelled' as const } : r
        ),
      }))
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  deleteReservation: async (id) => {
    set({ error: null })
    try {
      await api(`/api/calendar/reservations/${id}`, { method: 'DELETE' })
      set((state) => ({
        reservations: state.reservations.filter((r) => r.id !== id),
      }))
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  // ========== Query Operations ==========

  getReservationById: (id) => {
    return get().reservations.find((r) => r.id === id)
  },

  getReservationsForDate: (date) => {
    return get().reservations.filter(
      (r) => r.date === date && r.status !== 'cancelled'
    )
  },

  getReservationsForDateRange: (startDate, endDate) => {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    return get().reservations.filter((r) => {
      if (r.status === 'cancelled') return false
      const resDate = parseISO(r.date)
      return isWithinInterval(resDate, { start, end })
    })
  },

  getReservationsForCustomer: (customerId) => {
    return get()
      .reservations.filter((r) => r.customerId === customerId)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
  },

  // ========== Conflict and Capacity Operations ==========

  checkConflicts: (date, startTime, endTime, partySize, excludeId) => {
    const { reservations, capacitySettings } = get()

    const dayReservations = reservations.filter(
      (r) =>
        r.date === date &&
        r.status !== 'cancelled' &&
        r.id !== excludeId
    )

    const overlapping = dayReservations.filter((r) =>
      timeRangesOverlap(startTime, endTime, r.startTime, r.endTime)
    )

    if (overlapping.length === 0) {
      return { hasConflict: false }
    }

    const totalExistingPeople = overlapping.reduce(
      (sum, r) => sum + r.partySize,
      0
    )
    const totalWithNew = totalExistingPeople + partySize
    const capacityUsed = totalWithNew / capacitySettings.defaultCapacity

    if (capacityUsed >= capacitySettings.criticalThreshold) {
      return {
        hasConflict: true,
        reason: `Capacitate depasita: ${totalWithNew}/${capacitySettings.defaultCapacity} jucatori (${Math.round(capacityUsed * 100)}%)`,
        severity: 'critical' as const,
      }
    }

    if (capacityUsed >= capacitySettings.warningThreshold) {
      return {
        hasConflict: true,
        reason: `Capacitate aproape plina: ${totalWithNew}/${capacitySettings.defaultCapacity} jucatori (${Math.round(capacityUsed * 100)}%)`,
        severity: 'warning' as const,
      }
    }

    return { hasConflict: false }
  },

  getCapacityForSlot: (date, startTime) => {
    const { reservations, capacitySettings } = get()

    const startMinutes = parseTimeToMinutes(startTime)
    const endMinutes = startMinutes + 30
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`

    const overlapping = reservations.filter(
      (r) =>
        r.date === date &&
        r.status !== 'cancelled' &&
        timeRangesOverlap(startTime, endTime, r.startTime, r.endTime)
    )

    const currentBookings = overlapping.reduce(
      (sum, r) => sum + r.partySize,
      0
    )
    const percentage = currentBookings / capacitySettings.defaultCapacity

    let status: 'available' | 'warning' | 'full' = 'available'
    if (percentage >= capacitySettings.criticalThreshold) {
      status = 'full'
    } else if (percentage >= capacitySettings.warningThreshold) {
      status = 'warning'
    }

    return {
      current: currentBookings,
      max: capacitySettings.defaultCapacity,
      status,
      percentage,
    }
  },

  updateCapacitySettings: async (settings) => {
    set({ error: null })
    try {
      const updated = await api<CapacitySettings>('/api/calendar/capacity/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      })
      set({ capacitySettings: updated })
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  // ========== Error Handling ==========

  clearError: () => set({ error: null }),
}))
