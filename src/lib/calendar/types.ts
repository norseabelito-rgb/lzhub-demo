/**
 * Calendar/Reservation types for LaserZone Hub
 * Data foundation for phone reservation management with conflict detection and customer lookup
 */

// ============================================================================
// Time Slot Types (for capacity tracking)
// ============================================================================

/**
 * Represents a bookable time slot with capacity information
 * Used for conflict detection and capacity warnings
 */
export interface TimeSlot {
  /** Date in ISO format (YYYY-MM-DD) */
  date: string
  /** Start time in HH:mm format (30-minute intervals) */
  startTime: string
  /** End time in HH:mm format */
  endTime: string
  /** Maximum number of players for this slot */
  capacity: number
  /** Current number of booked players */
  currentBookings: number
}

// ============================================================================
// Occasion and Status Types
// ============================================================================

/**
 * Type of reservation occasion
 * Used for presets and reporting
 */
export type Occasion = 'regular' | 'birthday' | 'corporate' | 'group' | 'other'

/**
 * Current status of a reservation
 */
export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show'

// ============================================================================
// Reservation Types
// ============================================================================

/**
 * Main reservation record
 * Core entity for calendar management
 */
export interface Reservation {
  /** Unique identifier (UUID) */
  id: string
  /** Reference to Customer record */
  customerId: string
  /** Date in ISO format (YYYY-MM-DD) */
  date: string
  /** Start time in HH:mm format */
  startTime: string
  /** End time in HH:mm format (default 1 hour from start) */
  endTime: string
  /** Number of people in the party */
  partySize: number
  /** Type of occasion */
  occasion: Occasion
  /** Optional notes about the reservation */
  notes?: string
  /** Current reservation status */
  status: ReservationStatus
  /** Whether this reservation has a detected conflict */
  hasConflict: boolean
  /** Whether staff manually overrode a conflict warning */
  conflictOverridden: boolean
  /** When the reservation was created */
  createdAt: Date
  /** When the reservation was last updated */
  updatedAt: Date
  /** User ID who created the reservation */
  createdBy: string
  /** Whether this is a walk-up customer (no advance reservation) */
  isWalkup?: boolean
}

// ============================================================================
// Customer Tag Types
// ============================================================================

/**
 * Custom tag for categorizing customers
 * Staff can create their own tags (VIP, Birthday Regular, Corporate, etc.)
 */
export interface CustomerTag {
  /** Unique identifier */
  id: string
  /** Tag display name */
  name: string
  /** Hex color for badge display */
  color: string
}

// ============================================================================
// Customer Types
// ============================================================================

/**
 * Customer record for lookup and history tracking
 * Enables quick recognition when returning customers call
 */
export interface Customer {
  /** Unique identifier (UUID) */
  id: string
  /** Customer full name */
  name: string
  /** Phone number (primary contact, format: 07xx xxx xxx) */
  phone: string
  /** Optional email address */
  email?: string
  /** Tags applied to this customer */
  tags: CustomerTag[]
  /** Optional notes about customer preferences */
  notes?: string
  /** When the customer was first added */
  createdAt: Date
  /** When the customer record was last updated */
  updatedAt: Date
}

// ============================================================================
// Capacity Settings Types
// ============================================================================

/**
 * Global capacity configuration
 * Controls conflict detection thresholds
 */
export interface CapacitySettings {
  /** Maximum players per 30-minute time slot */
  defaultCapacity: number
  /** Threshold for yellow warning (0.8 = 80%) */
  warningThreshold: number
  /** Threshold for red/full status (1.0 = 100%) */
  criticalThreshold: number
}

// ============================================================================
// Conflict Detection Types
// ============================================================================

/**
 * Result of a conflict check operation
 */
export interface ConflictCheckResult {
  /** Whether a conflict exists */
  hasConflict: boolean
  /** Human-readable explanation of the conflict */
  reason?: string
  /** Severity level for UI display */
  severity?: 'warning' | 'critical'
}

/**
 * Result of a capacity check for a time slot
 */
export interface CapacityCheckResult {
  /** Current number of booked players */
  current: number
  /** Maximum capacity for the slot */
  max: number
  /** Status for UI display */
  status: 'available' | 'warning' | 'full'
  /** Percentage of capacity used */
  percentage: number
}
