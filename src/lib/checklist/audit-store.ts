/**
 * Audit log store for checklist system (CHKL-03)
 * Fetches audit entries from the API
 */

import { create } from 'zustand'
import type { AuditEntry, AuditAction, AuditEntityType } from './types'
import { api, ApiError } from '@/lib/api-client'

// ============================================================================
// API Response Type
// ============================================================================

interface ApiAuditEntry {
  id: string
  userId: string
  userName: string
  action: string
  entityType: string
  entityId: string
  details: Record<string, unknown>
  wasWithinTimeWindow: boolean
  createdAt: string
  user?: { id: string; name: string; email: string }
}

function mapApiAuditEntry(e: ApiAuditEntry): AuditEntry {
  return {
    id: e.id,
    timestamp: new Date(e.createdAt),
    userId: e.userId,
    userName: e.userName || e.user?.name || '',
    action: e.action as AuditAction,
    entityType: e.entityType as AuditEntityType,
    entityId: e.entityId,
    details: e.details,
    wasWithinTimeWindow: e.wasWithinTimeWindow,
  }
}

// ============================================================================
// Store Types
// ============================================================================

interface AuditState {
  entries: AuditEntry[]
  isLoading: boolean
  error: string | null
}

interface AuditActions {
  fetchEntries: (filters?: {
    entityType?: AuditEntityType
    entityId?: string
    userId?: string
    from?: string
    to?: string
    action?: AuditAction
    limit?: number
  }) => Promise<void>

  addEntry: (
    entry: Omit<AuditEntry, 'id' | 'timestamp'>
  ) => Promise<void>

  getEntriesForEntity: (entityType: AuditEntityType, entityId: string) => AuditEntry[]
  getEntriesForUser: (userId: string) => AuditEntry[]
  getEntriesByDateRange: (start: Date, end: Date) => AuditEntry[]
  getEntriesByAction: (action: AuditAction) => AuditEntry[]
  getRecentEntries: (limit?: number) => AuditEntry[]
  clearError: () => void
}

export type AuditStore = AuditState & AuditActions

// ============================================================================
// Store Implementation
// ============================================================================

export const useAuditStore = create<AuditStore>()((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (filters?.entityType) searchParams.set('entityType', filters.entityType)
      if (filters?.entityId) searchParams.set('entityId', filters.entityId)
      if (filters?.userId) searchParams.set('userId', filters.userId)
      if (filters?.from) searchParams.set('from', filters.from)
      if (filters?.to) searchParams.set('to', filters.to)
      if (filters?.action) searchParams.set('action', filters.action)
      if (filters?.limit) searchParams.set('limit', String(filters.limit))

      const qs = searchParams.toString()
      const url = `/api/checklists/audit${qs ? `?${qs}` : ''}`
      const data = await api<ApiAuditEntry[]>(url)
      set({ entries: data.map(mapApiAuditEntry), isLoading: false })
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la incarcarea audit log-ului'
      set({ error: message, isLoading: false })
    }
  },

  addEntry: async (entryData) => {
    try {
      await api<ApiAuditEntry>('/api/checklists/audit', {
        method: 'POST',
        body: JSON.stringify({
          action: entryData.action,
          entityType: entryData.entityType,
          entityId: entryData.entityId,
          details: entryData.details,
          wasWithinTimeWindow: entryData.wasWithinTimeWindow,
        }),
      })
      // Refetch entries after adding
      await get().fetchEntries()
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Eroare la adaugarea in audit log'
      set({ error: message })
    }
  },

  getEntriesForEntity: (entityType, entityId) => {
    return get().entries.filter(
      (e) => e.entityType === entityType && e.entityId === entityId
    )
  },

  getEntriesForUser: (userId) => {
    return get().entries.filter((e) => e.userId === userId)
  },

  getEntriesByDateRange: (start, end) => {
    return get().entries.filter((e) => {
      const timestamp = new Date(e.timestamp)
      return timestamp >= start && timestamp <= end
    })
  },

  getEntriesByAction: (action) => {
    return get().entries.filter((e) => e.action === action)
  },

  getRecentEntries: (limit = 10) => {
    const sorted = [...get().entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    return sorted.slice(0, limit)
  },

  clearError: () => set({ error: null }),
}))
