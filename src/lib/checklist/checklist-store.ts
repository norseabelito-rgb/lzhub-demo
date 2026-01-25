/**
 * Checklist store for LaserZone Hub
 * Manages templates and instances with audit logging for every action
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { isWithinInterval, setHours, setMinutes, startOfDay, addMinutes } from 'date-fns'
import type {
  ChecklistTemplate,
  ChecklistInstance,
  ChecklistItem,
  ItemCompletion,
} from './types'
import { MOCK_TEMPLATES, MOCK_INSTANCES } from './mock-data'
import { useAuditStore } from './audit-store'

const CHECKLIST_STORAGE_KEY = 'laserzone-checklists'

// ============================================================================
// Time Window Validation Helper
// ============================================================================

export interface TimeWindowResult {
  allowed: boolean
  isLate: boolean
  reason?: string
}

/**
 * Check if current time is within the template's time window
 */
export function isWithinTimeWindow(
  template: ChecklistTemplate,
  currentTime: Date = new Date()
): TimeWindowResult {
  const { timeWindow } = template

  const today = startOfDay(currentTime)
  const windowStart = setMinutes(setHours(today, timeWindow.startHour), timeWindow.startMinute)
  const windowEnd = setMinutes(setHours(today, timeWindow.endHour), timeWindow.endMinute)

  // Check if within main window
  const isInMainWindow = isWithinInterval(currentTime, {
    start: windowStart,
    end: windowEnd,
  })

  if (isInMainWindow) {
    return { allowed: true, isLate: false }
  }

  // Before window starts
  if (currentTime < windowStart) {
    return {
      allowed: false,
      isLate: false,
      reason: `Checklistul poate fi completat incepand cu ora ${timeWindow.startHour}:${String(timeWindow.startMinute).padStart(2, '0')}`,
    }
  }

  // After window ends - check for late completion allowance
  if (currentTime > windowEnd) {
    if (timeWindow.allowLateCompletion) {
      // Check if within grace period
      const graceEnd = addMinutes(windowEnd, timeWindow.lateWindowMinutes || 0)

      if (currentTime <= graceEnd) {
        return {
          allowed: true,
          isLate: true,
          reason: 'Completare tarzie - in fereastra de gratie',
        }
      }

      // If grace period is very long or undefined, still allow but mark as late
      if (!timeWindow.lateWindowMinutes) {
        return {
          allowed: true,
          isLate: true,
          reason: 'Completare tarzie - inregistrata in audit log',
        }
      }
    }

    return {
      allowed: false,
      isLate: true,
      reason: `Fereastra de completare s-a inchis la ${timeWindow.endHour}:${String(timeWindow.endMinute).padStart(2, '0')}`,
    }
  }

  return { allowed: true, isLate: false }
}

// ============================================================================
// Store Types
// ============================================================================

interface ChecklistState {
  templates: ChecklistTemplate[]
  instances: ChecklistInstance[]
  isLoading: boolean
}

interface ChecklistActions {
  // Template CRUD
  createTemplate: (
    template: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => string
  updateTemplate: (id: string, updates: Partial<ChecklistTemplate>) => void
  deleteTemplate: (id: string) => void
  getTemplateById: (id: string) => ChecklistTemplate | undefined

  // Instance management
  createInstance: (templateId: string, assignedTo: string, date: string) => string
  getInstanceById: (id: string) => ChecklistInstance | undefined
  getInstancesForUser: (userId: string) => ChecklistInstance[]
  getInstancesForDate: (date: string) => ChecklistInstance[]

  // Item completion
  checkItem: (
    instanceId: string,
    itemId: string,
    userId: string,
    userName: string
  ) => { success: boolean; wasLate: boolean; error?: string }
  uncheckItem: (
    instanceId: string,
    itemId: string,
    userId: string,
    userName: string
  ) => void

  // Time validation
  isWithinTimeWindow: (template: ChecklistTemplate) => TimeWindowResult
}

export type ChecklistStore = ChecklistState & ChecklistActions

// ============================================================================
// Store Implementation
// ============================================================================

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, get) => ({
      // Initial state with mock data
      templates: MOCK_TEMPLATES,
      instances: MOCK_INSTANCES,
      isLoading: false,

      // ========== Template CRUD ==========

      createTemplate: (templateData) => {
        const id = crypto.randomUUID()
        const now = new Date()

        const template: ChecklistTemplate = {
          ...templateData,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          templates: [...state.templates, template],
        }))

        // Log to audit
        useAuditStore.getState().addEntry({
          userId: templateData.createdBy,
          userName: 'Manager', // Will be resolved from auth context in real implementation
          action: 'template_created',
          entityType: 'template',
          entityId: id,
          details: {
            templateName: template.name,
            itemCount: template.items.length,
            type: template.type,
          },
          wasWithinTimeWindow: true,
        })

        return id
      },

      updateTemplate: (id, updates) => {
        const existingTemplate = get().templates.find((t) => t.id === id)
        if (!existingTemplate) return

        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date() }
              : t
          ),
        }))

        // Log to audit
        useAuditStore.getState().addEntry({
          userId: updates.createdBy || existingTemplate.createdBy,
          userName: 'Manager',
          action: 'template_updated',
          entityType: 'template',
          entityId: id,
          details: {
            templateName: existingTemplate.name,
            updatedFields: Object.keys(updates),
          },
          wasWithinTimeWindow: true,
        })
      },

      deleteTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id)
        if (!template) return

        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }))

        // Log to audit
        useAuditStore.getState().addEntry({
          userId: template.createdBy,
          userName: 'Manager',
          action: 'template_deleted',
          entityType: 'template',
          entityId: id,
          details: {
            templateName: template.name,
          },
          wasWithinTimeWindow: true,
        })
      },

      getTemplateById: (id) => {
        return get().templates.find((t) => t.id === id)
      },

      // ========== Instance Management ==========

      createInstance: (templateId, assignedTo, date) => {
        const template = get().templates.find((t) => t.id === templateId)
        if (!template) {
          throw new Error(`Template ${templateId} not found`)
        }

        const id = crypto.randomUUID()

        // Copy items from template (denormalized to prevent corruption)
        const instanceItems: ChecklistItem[] = template.items.map((item) => ({
          ...item,
        }))

        const instance: ChecklistInstance = {
          id,
          templateId,
          templateName: template.name, // Copy at creation time
          date,
          assignedTo,
          status: 'pending',
          items: instanceItems,
          completions: [],
        }

        set((state) => ({
          instances: [...state.instances, instance],
        }))

        // Log to audit
        useAuditStore.getState().addEntry({
          userId: template.createdBy,
          userName: 'Manager',
          action: 'instance_created',
          entityType: 'instance',
          entityId: id,
          details: {
            templateName: template.name,
            assignedTo,
            date,
          },
          wasWithinTimeWindow: true,
        })

        return id
      },

      getInstanceById: (id) => {
        return get().instances.find((i) => i.id === id)
      },

      getInstancesForUser: (userId) => {
        return get().instances.filter((i) => i.assignedTo === userId)
      },

      getInstancesForDate: (date) => {
        return get().instances.filter((i) => i.date === date)
      },

      // ========== Item Completion ==========

      checkItem: (instanceId, itemId, userId, userName) => {
        const instance = get().instances.find((i) => i.id === instanceId)
        if (!instance) {
          return { success: false, wasLate: false, error: 'Instance not found' }
        }

        const item = instance.items.find((i) => i.id === itemId)
        if (!item) {
          return { success: false, wasLate: false, error: 'Item not found' }
        }

        // Check if already completed
        const alreadyCompleted = instance.completions.some((c) => c.itemId === itemId)
        if (alreadyCompleted) {
          return { success: false, wasLate: false, error: 'Item already completed' }
        }

        // Get template for time window validation
        const template = get().templates.find((t) => t.id === instance.templateId)
        const timeResult = template
          ? isWithinTimeWindow(template)
          : { allowed: true, isLate: false }

        if (!timeResult.allowed) {
          // Log attempted action even if blocked
          useAuditStore.getState().addEntry({
            userId,
            userName,
            action: 'item_checked',
            entityType: 'item',
            entityId: itemId,
            details: {
              instanceId,
              itemText: item.text,
              blocked: true,
              reason: timeResult.reason,
            },
            wasWithinTimeWindow: false,
          })

          return {
            success: false,
            wasLate: timeResult.isLate,
            error: timeResult.reason,
          }
        }

        const completion: ItemCompletion = {
          itemId,
          completedBy: userId,
          completedAt: new Date(),
          wasLate: timeResult.isLate,
          notes: timeResult.isLate ? timeResult.reason : undefined,
        }

        // Update instance
        const now = new Date()
        const newCompletions = [...instance.completions, completion]
        const allRequiredComplete = instance.items
          .filter((i) => i.required)
          .every((i) => newCompletions.some((c) => c.itemId === i.id))

        const newStatus = allRequiredComplete ? 'completed' : 'in_progress'

        set((state) => ({
          instances: state.instances.map((i) =>
            i.id === instanceId
              ? {
                  ...i,
                  status: newStatus,
                  completions: newCompletions,
                  startedAt: i.startedAt || now,
                  completedAt: newStatus === 'completed' ? now : undefined,
                }
              : i
          ),
        }))

        // Log to audit
        useAuditStore.getState().addEntry({
          userId,
          userName,
          action: 'item_checked',
          entityType: 'item',
          entityId: itemId,
          details: {
            instanceId,
            itemText: item.text,
            wasLate: timeResult.isLate,
          },
          wasWithinTimeWindow: !timeResult.isLate,
        })

        // If checklist just completed, log that too
        if (newStatus === 'completed') {
          useAuditStore.getState().addEntry({
            userId,
            userName,
            action: 'instance_completed',
            entityType: 'instance',
            entityId: instanceId,
            details: {
              templateName: instance.templateName,
              completedItemsCount: newCompletions.length,
              totalItemsCount: instance.items.length,
            },
            wasWithinTimeWindow: !timeResult.isLate,
          })
        }

        return { success: true, wasLate: timeResult.isLate }
      },

      uncheckItem: (instanceId, itemId, userId, userName) => {
        const instance = get().instances.find((i) => i.id === instanceId)
        if (!instance) return

        const item = instance.items.find((i) => i.id === itemId)
        if (!item) return

        const completion = instance.completions.find((c) => c.itemId === itemId)
        if (!completion) return // Not completed, nothing to uncheck

        // Remove completion
        const newCompletions = instance.completions.filter((c) => c.itemId !== itemId)
        const newStatus = newCompletions.length > 0 ? 'in_progress' : 'pending'

        set((state) => ({
          instances: state.instances.map((i) =>
            i.id === instanceId
              ? {
                  ...i,
                  status: newStatus,
                  completions: newCompletions,
                  completedAt: undefined, // Reset completion time
                }
              : i
          ),
        }))

        // Log to audit
        useAuditStore.getState().addEntry({
          userId,
          userName,
          action: 'item_unchecked',
          entityType: 'item',
          entityId: itemId,
          details: {
            instanceId,
            itemText: item.text,
          },
          wasWithinTimeWindow: true, // Unchecking is always allowed
        })
      },

      // ========== Time Validation ==========

      isWithinTimeWindow: (template) => {
        return isWithinTimeWindow(template)
      },
    }),
    {
      name: CHECKLIST_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Persist templates and instances
      partialize: (state) => ({
        templates: state.templates,
        instances: state.instances,
      }),
    }
  )
)
