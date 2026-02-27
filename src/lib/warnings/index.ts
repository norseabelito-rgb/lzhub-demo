/**
 * Warning system barrel exports
 * Central export point for all warning-related functionality
 */

// Types
export type {
  DisciplineLevel,
  ViolationCategory,
  WarningStatus,
  Signature,
  Acknowledgment,
  Warning,
} from './types'

// Constants
export {
  DISCIPLINE_LEVELS,
  DISCIPLINE_LEVEL_LABELS,
  VIOLATION_CATEGORIES,
  VIOLATION_CATEGORY_LABELS,
  WARNING_STATUS_LABELS,
} from './types'

// Store
export { useWarningStore } from './warning-store'
export type { WarningStore } from './warning-store'

// Templates
export { WARNING_TEMPLATES, getTemplateForCategory } from './templates'
export type { WarningTemplate } from './templates'

