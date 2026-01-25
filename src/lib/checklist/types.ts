/**
 * Checklist types for LaserZone Hub
 * Supports time-window enforcement (CHKL-08) and audit trail (CHKL-03)
 */

// ============================================================================
// Time Window Types (for CHKL-08 time enforcement)
// ============================================================================

export interface TimeWindow {
  /** Start hour (0-23) */
  startHour: number
  /** Start minute (0-59) */
  startMinute: number
  /** End hour (0-23) */
  endHour: number
  /** End minute (0-59) */
  endMinute: number
  /** Allow completion after window closes */
  allowLateCompletion: boolean
  /** Grace period in minutes after window closes (if allowLateCompletion is true) */
  lateWindowMinutes?: number
}

// ============================================================================
// Checklist Item Types
// ============================================================================

export interface ChecklistItem {
  id: string
  /** Item text in Romanian */
  text: string
  /** Display order */
  order: number
  /** Whether this item must be completed */
  required: boolean
}

// ============================================================================
// Checklist Template Types (CHKL-04)
// ============================================================================

export type ChecklistType = 'deschidere' | 'inchidere' | 'custom'

export interface ChecklistTemplate {
  id: string
  /** Template name (e.g., "Checklist Deschidere") */
  name: string
  /** Description of the checklist purpose */
  description: string
  /** Type of checklist */
  type: ChecklistType
  /** Items in this template */
  items: ChecklistItem[]
  /** Time window for completion */
  timeWindow: TimeWindow
  /** Assignment target: 'all', 'shift', or array of employee IDs */
  assignedTo: 'all' | 'shift' | string[]
  /** User ID of creator */
  createdBy: string
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

// ============================================================================
// Item Completion Tracking
// ============================================================================

export interface ItemCompletion {
  /** ID of the completed item */
  itemId: string
  /** User ID who completed the item */
  completedBy: string
  /** Completion timestamp */
  completedAt: Date
  /** Whether completion was after time window */
  wasLate: boolean
  /** Optional notes about completion */
  notes?: string
}

// ============================================================================
// Checklist Instance Types (created from template)
// ============================================================================

export type ChecklistStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export interface ChecklistInstance {
  id: string
  /** Reference to source template */
  templateId: string
  /** Copy of template name at creation time (denormalized for display) */
  templateName: string
  /** Date this instance is for (ISO date: YYYY-MM-DD) */
  date: string
  /** User ID this instance is assigned to */
  assignedTo: string
  /** Current status */
  status: ChecklistStatus
  /** Copied items from template (denormalized to prevent template change corruption) */
  items: ChecklistItem[]
  /** Completion records for each item */
  completions: ItemCompletion[]
  /** When employee started working on this checklist */
  startedAt?: Date
  /** When all required items were completed */
  completedAt?: Date
}

// ============================================================================
// Audit Types (CHKL-03 - immutable audit log)
// ============================================================================

export type AuditAction =
  | 'template_created'
  | 'template_updated'
  | 'template_deleted'
  | 'instance_created'
  | 'instance_assigned'
  | 'item_checked'
  | 'item_unchecked'
  | 'instance_completed'
  | 'instance_overdue'

export type AuditEntityType = 'template' | 'instance' | 'item'

export interface AuditEntry {
  /** Unique entry ID */
  id: string
  /** When this action occurred */
  timestamp: Date
  /** User ID who performed the action */
  userId: string
  /** User name at time of action (for display) */
  userName: string
  /** Action type */
  action: AuditAction
  /** Entity type affected */
  entityType: AuditEntityType
  /** Entity ID affected */
  entityId: string
  /** Additional action-specific details */
  details: Record<string, unknown>
  /** Whether action was within allowed time window */
  wasWithinTimeWindow: boolean
}
