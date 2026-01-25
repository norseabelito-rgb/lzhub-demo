/**
 * Mock data for checklist system
 * Provides sample templates, instances, and audit entries for development
 */

import type {
  ChecklistTemplate,
  ChecklistInstance,
  ChecklistItem,
  ItemCompletion,
  AuditEntry,
} from './types'

// ============================================================================
// Mock Checklist Templates (CHKL-04)
// ============================================================================

const OPENING_ITEMS: ChecklistItem[] = [
  { id: 'open-1', text: 'Verifica functionarea sistemului de iluminat', order: 1, required: true },
  { id: 'open-2', text: 'Porneste sistemele audio', order: 2, required: true },
  { id: 'open-3', text: 'Verifica echipamentele laser (baterii, veste)', order: 3, required: true },
  { id: 'open-4', text: 'Curata zonele de joc', order: 4, required: true },
  { id: 'open-5', text: 'Verifica stocul de consumabile', order: 5, required: false },
  { id: 'open-6', text: 'Pregateste casa de marcat', order: 6, required: true },
  { id: 'open-7', text: 'Verifica conexiunea internet', order: 7, required: true },
  { id: 'open-8', text: 'Actualizeaza tabla de rezervari', order: 8, required: false },
]

const CLOSING_ITEMS: ChecklistItem[] = [
  { id: 'close-1', text: 'Opreste sistemele audio', order: 1, required: true },
  { id: 'close-2', text: 'Incarca echipamentele laser', order: 2, required: true },
  { id: 'close-3', text: 'Verifica si inchide usile', order: 3, required: true },
  { id: 'close-4', text: 'Opreste iluminatul din zonele de joc', order: 4, required: true },
  { id: 'close-5', text: 'Inchide casa de marcat si verifica raportul', order: 5, required: true },
  { id: 'close-6', text: 'Activeaza sistemul de alarma', order: 6, required: true },
]

export const MOCK_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'template-deschidere',
    name: 'Checklist Deschidere',
    description: 'Verificari obligatorii la deschiderea locatiei in fiecare zi',
    type: 'deschidere',
    items: OPENING_ITEMS,
    timeWindow: {
      startHour: 9,
      startMinute: 0,
      endHour: 11,
      endMinute: 0,
      allowLateCompletion: true,
      lateWindowMinutes: 30,
    },
    assignedTo: 'shift', // Morning shift employees
    createdBy: '1', // Alexandru Popescu (manager)
    createdAt: new Date('2026-01-15T10:00:00Z'),
    updatedAt: new Date('2026-01-15T10:00:00Z'),
  },
  {
    id: 'template-inchidere',
    name: 'Checklist Inchidere',
    description: 'Proceduri de inchidere pentru securizarea locatiei',
    type: 'inchidere',
    items: CLOSING_ITEMS,
    timeWindow: {
      startHour: 21,
      startMinute: 0,
      endHour: 23,
      endMinute: 0,
      allowLateCompletion: false,
    },
    assignedTo: 'shift', // Evening shift employees
    createdBy: '1', // Alexandru Popescu (manager)
    createdAt: new Date('2026-01-15T10:30:00Z'),
    updatedAt: new Date('2026-01-15T10:30:00Z'),
  },
]

// ============================================================================
// Mock Checklist Instances
// ============================================================================

// Get today's date in ISO format
const TODAY = new Date().toISOString().split('T')[0]

// Instance 1: Opening checklist for Ion Vasile - COMPLETED
const instance1Completions: ItemCompletion[] = OPENING_ITEMS.map((item, index) => ({
  itemId: item.id,
  completedBy: '3', // Ion Vasile
  completedAt: new Date(`${TODAY}T09:${15 + index * 5}:00Z`),
  wasLate: false,
}))

// Instance 3: Opening checklist for Andrei Marin - IN PROGRESS (3 items done)
const instance3Completions: ItemCompletion[] = OPENING_ITEMS.slice(0, 3).map((item, index) => ({
  itemId: item.id,
  completedBy: '5', // Andrei Marin
  completedAt: new Date(`${TODAY}T10:${30 + index * 5}:00Z`),
  wasLate: true, // Late (after 11:00)
}))

export const MOCK_INSTANCES: ChecklistInstance[] = [
  {
    id: 'instance-1',
    templateId: 'template-deschidere',
    templateName: 'Checklist Deschidere',
    date: TODAY,
    assignedTo: '3', // Ion Vasile
    status: 'completed',
    items: [...OPENING_ITEMS],
    completions: instance1Completions,
    startedAt: new Date(`${TODAY}T09:15:00Z`),
    completedAt: new Date(`${TODAY}T09:50:00Z`),
  },
  {
    id: 'instance-2',
    templateId: 'template-inchidere',
    templateName: 'Checklist Inchidere',
    date: TODAY,
    assignedTo: '4', // Elena Dumitrescu
    status: 'pending',
    items: [...CLOSING_ITEMS],
    completions: [],
    startedAt: undefined,
    completedAt: undefined,
  },
  {
    id: 'instance-3',
    templateId: 'template-deschidere',
    templateName: 'Checklist Deschidere',
    date: TODAY,
    assignedTo: '5', // Andrei Marin
    status: 'in_progress',
    items: [...OPENING_ITEMS],
    completions: instance3Completions,
    startedAt: new Date(`${TODAY}T10:30:00Z`),
    completedAt: undefined,
  },
]

// ============================================================================
// Mock Audit Log
// ============================================================================

export const MOCK_AUDIT_LOG: AuditEntry[] = [
  // Template creation entries
  {
    id: 'audit-1',
    timestamp: new Date('2026-01-15T10:00:00Z'),
    userId: '1',
    userName: 'Alexandru Popescu',
    action: 'template_created',
    entityType: 'template',
    entityId: 'template-deschidere',
    details: {
      templateName: 'Checklist Deschidere',
      itemCount: 8,
    },
    wasWithinTimeWindow: true,
  },
  {
    id: 'audit-2',
    timestamp: new Date('2026-01-15T10:30:00Z'),
    userId: '1',
    userName: 'Alexandru Popescu',
    action: 'template_created',
    entityType: 'template',
    entityId: 'template-inchidere',
    details: {
      templateName: 'Checklist Inchidere',
      itemCount: 6,
    },
    wasWithinTimeWindow: true,
  },
  // Instance creation
  {
    id: 'audit-3',
    timestamp: new Date(`${TODAY}T08:00:00Z`),
    userId: '1',
    userName: 'Alexandru Popescu',
    action: 'instance_created',
    entityType: 'instance',
    entityId: 'instance-1',
    details: {
      templateName: 'Checklist Deschidere',
      assignedTo: 'Ion Vasile',
      date: TODAY,
    },
    wasWithinTimeWindow: true,
  },
  // Item check entries - within time window
  {
    id: 'audit-4',
    timestamp: new Date(`${TODAY}T09:15:00Z`),
    userId: '3',
    userName: 'Ion Vasile',
    action: 'item_checked',
    entityType: 'item',
    entityId: 'open-1',
    details: {
      instanceId: 'instance-1',
      itemText: 'Verifica functionarea sistemului de iluminat',
    },
    wasWithinTimeWindow: true,
  },
  {
    id: 'audit-5',
    timestamp: new Date(`${TODAY}T09:20:00Z`),
    userId: '3',
    userName: 'Ion Vasile',
    action: 'item_checked',
    entityType: 'item',
    entityId: 'open-2',
    details: {
      instanceId: 'instance-1',
      itemText: 'Porneste sistemele audio',
    },
    wasWithinTimeWindow: true,
  },
  // Instance completed
  {
    id: 'audit-6',
    timestamp: new Date(`${TODAY}T09:50:00Z`),
    userId: '3',
    userName: 'Ion Vasile',
    action: 'instance_completed',
    entityType: 'instance',
    entityId: 'instance-1',
    details: {
      templateName: 'Checklist Deschidere',
      completedItemsCount: 8,
      totalItemsCount: 8,
    },
    wasWithinTimeWindow: true,
  },
  // Late completion entry (demonstrates time enforcement logging)
  {
    id: 'audit-7',
    timestamp: new Date(`${TODAY}T10:30:00Z`),
    userId: '5',
    userName: 'Andrei Marin',
    action: 'item_checked',
    entityType: 'item',
    entityId: 'open-1',
    details: {
      instanceId: 'instance-3',
      itemText: 'Verifica functionarea sistemului de iluminat',
      note: 'Completare tarzie - in fereastra de gratie',
    },
    wasWithinTimeWindow: false, // Late but allowed due to lateWindowMinutes
  },
  // Instance for evening shift created
  {
    id: 'audit-8',
    timestamp: new Date(`${TODAY}T08:00:00Z`),
    userId: '1',
    userName: 'Alexandru Popescu',
    action: 'instance_created',
    entityType: 'instance',
    entityId: 'instance-2',
    details: {
      templateName: 'Checklist Inchidere',
      assignedTo: 'Elena Dumitrescu',
      date: TODAY,
    },
    wasWithinTimeWindow: true,
  },
]

// ============================================================================
// Helper functions for mock data
// ============================================================================

/**
 * Get template by ID
 */
export function getMockTemplateById(id: string): ChecklistTemplate | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id)
}

/**
 * Get instance by ID
 */
export function getMockInstanceById(id: string): ChecklistInstance | undefined {
  return MOCK_INSTANCES.find((i) => i.id === id)
}

/**
 * Get instances for a specific date
 */
export function getMockInstancesForDate(date: string): ChecklistInstance[] {
  return MOCK_INSTANCES.filter((i) => i.date === date)
}

/**
 * Get instances for a specific user
 */
export function getMockInstancesForUser(userId: string): ChecklistInstance[] {
  return MOCK_INSTANCES.filter((i) => i.assignedTo === userId)
}
