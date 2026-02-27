/**
 * Checklist store for LaserZone Hub
 * Uses Zustand for UI state + async API calls for data
 */

import { create } from 'zustand'
import { isWithinInterval, setHours, setMinutes, startOfDay, addMinutes } from 'date-fns'
import type {
  ChecklistTemplate,
  ChecklistInstance,
  ChecklistItem,
  ItemCompletion,
} from './types'
import { api, ApiError } from '@/lib/api-client'

// ============================================================================
// API Response Types (Prisma shapes)
// ============================================================================

interface ApiTemplateItem {
  id: string
  label: string
  description: string | null
  isRequired: boolean
  order: number
}

interface ApiTemplate {
  id: string
  name: string
  description: string
  type: string
  timeWindowStartHour: number
  timeWindowStartMinute: number
  timeWindowEndHour: number
  timeWindowEndMinute: number
  allowLateCompletion: boolean
  lateWindowMinutes: number | null
  assignedTo: string
  createdBy: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  items: ApiTemplateItem[]
}

interface ApiCompletion {
  id: string
  itemId: string
  checkedById: string
  isLate: boolean
  notes: string | null
  createdAt: string
  checkedBy?: { id: string; name: string }
  item?: ApiTemplateItem
}

interface ApiInstance {
  id: string
  templateId: string
  templateName: string
  date: string
  assignedToId: string
  status: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  completions: ApiCompletion[]
  template: ApiTemplate
  assignedTo: { id: string; name: string; email: string }
}

// ============================================================================
// Data Mapping Functions
// ============================================================================

function mapApiTemplate(t: ApiTemplate): ChecklistTemplate {
  let assignedTo: ChecklistTemplate['assignedTo']
  try {
    const parsed = JSON.parse(t.assignedTo)
    if (Array.isArray(parsed)) {
      assignedTo = parsed
    } else {
      assignedTo = t.assignedTo as 'all' | 'shift'
    }
  } catch {
    assignedTo = (t.assignedTo || 'all') as 'all' | 'shift'
  }

  return {
    id: t.id,
    name: t.name,
    description: t.description,
    type: t.type as ChecklistTemplate['type'],
    items: t.items.map((item): ChecklistItem => ({
      id: item.id,
      text: item.label,
      order: item.order,
      required: item.isRequired,
    })),
    timeWindow: {
      startHour: t.timeWindowStartHour,
      startMinute: t.timeWindowStartMinute,
      endHour: t.timeWindowEndHour,
      endMinute: t.timeWindowEndMinute,
      allowLateCompletion: t.allowLateCompletion,
      lateWindowMinutes: t.lateWindowMinutes ?? undefined,
    },
    assignedTo,
    createdBy: t.createdBy,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  }
}

function mapApiInstance(inst: ApiInstance): ChecklistInstance {
  return {
    id: inst.id,
    templateId: inst.templateId,
    templateName: inst.templateName,
    date: inst.date,
    assignedTo: inst.assignedToId,
    status: inst.status as ChecklistInstance['status'],
    items: inst.template.items.map((item): ChecklistItem => ({
      id: item.id,
      text: item.label,
      order: item.order,
      required: item.isRequired,
    })),
    completions: inst.completions.map((c): ItemCompletion => ({
      itemId: c.itemId,
      completedBy: c.checkedById,
      completedAt: new Date(c.createdAt),
      wasLate: c.isLate,
      notes: c.notes ?? undefined,
    })),
    startedAt: inst.startedAt ? new Date(inst.startedAt) : undefined,
    completedAt: inst.completedAt ? new Date(inst.completedAt) : undefined,
  }
}

// ============================================================================
// Time Window Validation Helper
// ============================================================================

export interface TimeWindowResult {
  allowed: boolean
  isLate: boolean
  reason?: string
}

export function isWithinTimeWindow(
  template: ChecklistTemplate,
  currentTime: Date = new Date()
): TimeWindowResult {
  const { timeWindow } = template

  const today = startOfDay(currentTime)
  const windowStart = setMinutes(setHours(today, timeWindow.startHour), timeWindow.startMinute)
  const windowEnd = setMinutes(setHours(today, timeWindow.endHour), timeWindow.endMinute)

  const isInMainWindow = isWithinInterval(currentTime, {
    start: windowStart,
    end: windowEnd,
  })

  if (isInMainWindow) {
    return { allowed: true, isLate: false }
  }

  if (currentTime < windowStart) {
    return {
      allowed: false,
      isLate: false,
      reason: `Checklistul poate fi completat incepand cu ora ${timeWindow.startHour}:${String(timeWindow.startMinute).padStart(2, '0')}`,
    }
  }

  if (currentTime > windowEnd) {
    if (timeWindow.allowLateCompletion) {
      const graceEnd = addMinutes(windowEnd, timeWindow.lateWindowMinutes || 0)

      if (currentTime <= graceEnd) {
        return {
          allowed: true,
          isLate: true,
          reason: 'Completare tarzie - in fereastra de gratie',
        }
      }

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
  error: string | null
}

interface ChecklistActions {
  // Data fetching
  fetchTemplates: () => Promise<void>
  fetchInstances: (params?: { date?: string; userId?: string; status?: string }) => Promise<void>

  // Template CRUD
  createTemplate: (data: {
    name: string
    description?: string
    type: string
    items: { label: string; description?: string; isRequired?: boolean; order: number }[]
    timeWindowStartHour?: number
    timeWindowStartMinute?: number
    timeWindowEndHour?: number
    timeWindowEndMinute?: number
    allowLateCompletion?: boolean
    lateWindowMinutes?: number
    assignedTo?: string | string[]
  }) => Promise<string>
  updateTemplate: (id: string, data: Record<string, unknown>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  getTemplateById: (id: string) => ChecklistTemplate | undefined

  // Instance management
  createInstance: (templateId: string, assignedToId: string, date: string) => Promise<string>
  getInstanceById: (id: string) => ChecklistInstance | undefined
  getInstancesForUser: (userId: string) => ChecklistInstance[]
  getInstancesForDate: (date: string) => ChecklistInstance[]

  // Item completion
  checkItem: (
    instanceId: string,
    itemId: string,
    userId: string,
    userName: string,
    notes?: string
  ) => Promise<{ success: boolean; wasLate: boolean; error?: string }>
  uncheckItem: (
    instanceId: string,
    itemId: string,
    userId: string,
    userName: string
  ) => Promise<void>

  // Time validation
  isWithinTimeWindow: (template: ChecklistTemplate) => TimeWindowResult

  // Error handling
  clearError: () => void
}

export type ChecklistStore = ChecklistState & ChecklistActions

// ============================================================================
// Store Implementation
// ============================================================================

export const useChecklistStore = create<ChecklistStore>()((set, get) => ({
  templates: [],
  instances: [],
  isLoading: false,
  error: null,

  // ========== Data Fetching ==========

  fetchTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api<ApiTemplate[]>('/api/checklists/templates')
      set({ templates: data.map(mapApiTemplate), isLoading: false })
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la incarcarea template-urilor'
      set({ error: message, isLoading: false })
    }
  },

  fetchInstances: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params?.date) searchParams.set('date', params.date)
      if (params?.userId) searchParams.set('userId', params.userId)
      if (params?.status) searchParams.set('status', params.status)

      const qs = searchParams.toString()
      const url = `/api/checklists/instances${qs ? `?${qs}` : ''}`
      const data = await api<ApiInstance[]>(url)
      set({ instances: data.map(mapApiInstance), isLoading: false })
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la incarcarea instantelor'
      set({ error: message, isLoading: false })
    }
  },

  // ========== Template CRUD ==========

  createTemplate: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<ApiTemplate>('/api/checklists/templates', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      const template = mapApiTemplate(result)
      set((state) => ({
        templates: [template, ...state.templates],
        isLoading: false,
      }))
      return template.id
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la crearea template-ului'
      set({ error: message, isLoading: false })
      throw e
    }
  },

  updateTemplate: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<ApiTemplate>(`/api/checklists/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      const updated = mapApiTemplate(result)
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? updated : t)),
        isLoading: false,
      }))
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la actualizarea template-ului'
      set({ error: message, isLoading: false })
      throw e
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await api<{ success: boolean }>(`/api/checklists/templates/${id}`, {
        method: 'DELETE',
      })
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        isLoading: false,
      }))
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la stergerea template-ului'
      set({ error: message, isLoading: false })
      throw e
    }
  },

  getTemplateById: (id) => {
    return get().templates.find((t) => t.id === id)
  },

  // ========== Instance Management ==========

  createInstance: async (templateId, assignedToId, date) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<ApiInstance>('/api/checklists/instances', {
        method: 'POST',
        body: JSON.stringify({ templateId, assignedToId, date }),
      })
      const instance = mapApiInstance(result)
      set((state) => ({
        instances: [instance, ...state.instances],
        isLoading: false,
      }))
      return instance.id
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la crearea instantei'
      set({ error: message, isLoading: false })
      throw e
    }
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

  checkItem: async (instanceId, itemId, _userId, _userName, notes) => {
    try {
      const result = await api<{
        completion: { id: string; isLate: boolean }
        instanceStatus: string
        allRequiredDone: boolean
        wasLate: boolean
      }>(`/api/checklists/instances/${instanceId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ checked: true, notes }),
      })

      // Refetch this instance to get updated data
      try {
        const updated = await api<ApiInstance>(`/api/checklists/instances/${instanceId}`)
        const mappedInstance = mapApiInstance(updated)
        set((state) => ({
          instances: state.instances.map((i) =>
            i.id === instanceId ? mappedInstance : i
          ),
        }))
      } catch {
        // If refetch fails, do an optimistic update based on the response
        set((state) => ({
          instances: state.instances.map((i) => {
            if (i.id !== instanceId) return i
            return {
              ...i,
              status: result.instanceStatus as ChecklistInstance['status'],
              completions: [
                ...i.completions,
                {
                  itemId,
                  completedBy: _userId,
                  completedAt: new Date(),
                  wasLate: result.wasLate,
                  notes,
                },
              ],
              startedAt: i.startedAt || new Date(),
              completedAt: result.allRequiredDone ? new Date() : undefined,
            }
          }),
        }))
      }

      return { success: true, wasLate: result.wasLate }
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la bifarea elementului'
      return { success: false, wasLate: false, error: message }
    }
  },

  uncheckItem: async (instanceId, itemId) => {
    try {
      const result = await api<{
        instanceStatus: string
        unchecked: boolean
      }>(`/api/checklists/instances/${instanceId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ checked: false }),
      })

      // Refetch this instance to get updated data
      try {
        const updated = await api<ApiInstance>(`/api/checklists/instances/${instanceId}`)
        const mappedInstance = mapApiInstance(updated)
        set((state) => ({
          instances: state.instances.map((i) =>
            i.id === instanceId ? mappedInstance : i
          ),
        }))
      } catch {
        // Optimistic update
        set((state) => ({
          instances: state.instances.map((i) => {
            if (i.id !== instanceId) return i
            return {
              ...i,
              status: result.instanceStatus as ChecklistInstance['status'],
              completions: i.completions.filter((c) => c.itemId !== itemId),
              completedAt: undefined,
            }
          }),
        }))
      }
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la debifarea elementului'
      set({ error: message })
    }
  },

  // ========== Time Validation ==========

  isWithinTimeWindow: (template) => {
    return isWithinTimeWindow(template)
  },

  // ========== Error Handling ==========

  clearError: () => set({ error: null }),
}))
