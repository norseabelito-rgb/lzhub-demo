/**
 * Reservation store for LaserZone Hub
 * Manages reservations with conflict detection and capacity tracking
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { isWithinInterval, parseISO, addMinutes, format } from 'date-fns'
import type {
  Reservation,
  CapacitySettings,
  ConflictCheckResult,
  CapacityCheckResult,
} from './types'
import { MOCK_RESERVATIONS, DEFAULT_CAPACITY_SETTINGS } from './mock-data'

const RESERVATION_STORAGE_KEY = 'laserzone-reservations'

// ============================================================================
// Time Parsing Helpers
// ============================================================================

/**
 * Parse a time string (HH:mm) into minutes from midnight
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Check if two time ranges overlap
 */
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

  // Overlap exists if one range starts before the other ends
  return s1 < e2 && s2 < e1
}

// ============================================================================
// Store Types
// ============================================================================

interface ReservationState {
  reservations: Reservation[]
  capacitySettings: CapacitySettings
  isLoading: boolean
}

interface ReservationActions {
  // CRUD operations
  createReservation: (
    data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'hasConflict' | 'conflictOverridden'>
  ) => { id: string; hasConflict: boolean; conflictReason?: string }
  updateReservation: (id: string, updates: Partial<Reservation>) => void
  cancelReservation: (id: string) => void
  deleteReservation: (id: string) => void

  // Query operations
  getReservationById: (id: string) => Reservation | undefined
  getReservationsForDate: (date: string) => Reservation[]
  getReservationsForDateRange: (startDate: string, endDate: string) => Reservation[]
  getReservationsForCustomer: (customerId: string) => Reservation[]

  // Conflict and capacity operations
  checkConflicts: (
    date: string,
    startTime: string,
    endTime: string,
    partySize: number,
    excludeId?: string
  ) => ConflictCheckResult
  getCapacityForSlot: (date: string, startTime: string) => CapacityCheckResult
  updateCapacitySettings: (settings: Partial<CapacitySettings>) => void
}

export type ReservationStore = ReservationState & ReservationActions

// ============================================================================
// Store Implementation
// ============================================================================

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      // Initial state with mock data
      reservations: MOCK_RESERVATIONS,
      capacitySettings: DEFAULT_CAPACITY_SETTINGS,
      isLoading: false,

      // ========== CRUD Operations ==========

      createReservation: (data) => {
        const id = crypto.randomUUID()
        const now = new Date()

        // Check for conflicts before creating
        const conflictCheck = get().checkConflicts(
          data.date,
          data.startTime,
          data.endTime,
          data.partySize
        )

        const reservation: Reservation = {
          ...data,
          id,
          hasConflict: conflictCheck.hasConflict,
          conflictOverridden: false,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          reservations: [...state.reservations, reservation],
        }))

        return {
          id,
          hasConflict: conflictCheck.hasConflict,
          conflictReason: conflictCheck.reason,
        }
      },

      updateReservation: (id, updates) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date() }
              : r
          ),
        }))
      },

      cancelReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id
              ? { ...r, status: 'cancelled' as const, updatedAt: new Date() }
              : r
          ),
        }))
      },

      deleteReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
        }))
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
        return get().reservations
          .filter((r) => r.customerId === customerId)
          .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      },

      // ========== Conflict and Capacity Operations ==========

      checkConflicts: (date, startTime, endTime, partySize, excludeId) => {
        const { reservations, capacitySettings } = get()

        // Get all active reservations for the date (excluding the one being edited)
        const dayReservations = reservations.filter(
          (r) =>
            r.date === date &&
            r.status !== 'cancelled' &&
            r.id !== excludeId
        )

        // Find overlapping reservations
        const overlapping = dayReservations.filter((r) =>
          timeRangesOverlap(startTime, endTime, r.startTime, r.endTime)
        )

        if (overlapping.length === 0) {
          return { hasConflict: false }
        }

        // Calculate total people in overlapping slots
        const totalExistingPeople = overlapping.reduce(
          (sum, r) => sum + r.partySize,
          0
        )
        const totalWithNew = totalExistingPeople + partySize
        const capacityUsed = totalWithNew / capacitySettings.defaultCapacity

        // Check capacity thresholds
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

        // Calculate end time (30 min slot)
        const startMinutes = parseTimeToMinutes(startTime)
        const endMinutes = startMinutes + 30
        const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`

        // Get active reservations overlapping this slot
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

      updateCapacitySettings: (settings) => {
        set((state) => ({
          capacitySettings: { ...state.capacitySettings, ...settings },
        }))
      },
    }),
    {
      name: RESERVATION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Persist reservations and settings
      partialize: (state) => ({
        reservations: state.reservations,
        capacitySettings: state.capacitySettings,
      }),
    }
  )
)
