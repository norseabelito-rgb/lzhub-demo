/**
 * Calendar module exports for LaserZone Hub
 * Re-exports all types, stores, and utilities for the reservation system
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  TimeSlot,
  Occasion,
  ReservationStatus,
  Reservation,
  CustomerTag,
  Customer,
  CapacitySettings,
  ConflictCheckResult,
  CapacityCheckResult,
} from './types'

// ============================================================================
// Store Exports
// ============================================================================

export { useReservationStore } from './reservation-store'
export type { ReservationStore } from './reservation-store'

export { useCustomerStore } from './customer-store'
export type { CustomerStore } from './customer-store'

// ============================================================================
// Date/Time Formatting Utilities
// ============================================================================

import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns'
import { ro } from 'date-fns/locale'

/**
 * Format a date for display (e.g., "Miercuri, 22 Ian 2026")
 */
export function formatDateFull(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE, d MMM yyyy', { locale: ro })
}

/**
 * Format a date in short form (e.g., "22 Ian")
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM', { locale: ro })
}

/**
 * Format a date relative to today (e.g., "Azi", "Maine", "22 Ian")
 */
export function formatDateRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) return 'Azi'
  if (isTomorrow(d)) return 'Maine'
  if (isYesterday(d)) return 'Ieri'

  return format(d, 'd MMM', { locale: ro })
}

/**
 * Format a time range (e.g., "14:00 - 15:30")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`
}

/**
 * Format party size for display (e.g., "8 persoane", "1 persoana")
 */
export function formatPartySize(size: number): string {
  if (size === 1) return '1 persoana'
  return `${size} persoane`
}

/**
 * Get occasion label in Romanian
 */
export function getOccasionLabel(occasion: string): string {
  const labels: Record<string, string> = {
    regular: 'Rezervare normala',
    birthday: 'Petrecere zi de nastere',
    corporate: 'Eveniment corporate',
    group: 'Grup',
    other: 'Altele',
  }
  return labels[occasion] || occasion
}

/**
 * Get status label in Romanian
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    confirmed: 'Confirmata',
    cancelled: 'Anulata',
    completed: 'Finalizata',
    no_show: 'Nu s-a prezentat',
  }
  return labels[status] || status
}

/**
 * Get status color class for styling
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    confirmed: 'text-green-500',
    cancelled: 'text-red-500',
    completed: 'text-muted-foreground',
    no_show: 'text-amber-500',
  }
  return colors[status] || 'text-muted-foreground'
}

/**
 * Generate time slots for a day (30-minute intervals)
 * Default: 09:00 - 22:00
 */
export function generateTimeSlots(
  startHour: number = 9,
  endHour: number = 22
): string[] {
  const slots: string[] = []

  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  slots.push(`${endHour.toString().padStart(2, '0')}:00`)

  return slots
}
