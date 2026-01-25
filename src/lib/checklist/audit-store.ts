/**
 * Audit log store for checklist system (CHKL-03)
 * CRITICAL: This is an append-only store - no delete or update methods
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuditEntry, AuditAction, AuditEntityType } from './types'
import { MOCK_AUDIT_LOG } from './mock-data'

const AUDIT_STORAGE_KEY = 'laserzone-audit'

interface AuditState {
  entries: AuditEntry[]
}

interface AuditActions {
  /**
   * Add a new audit entry (generates ID and timestamp automatically)
   * This is the ONLY way to modify the audit log - append only
   */
  addEntry: (
    entry: Omit<AuditEntry, 'id' | 'timestamp'>
  ) => void

  /**
   * Get entries for a specific entity (template, instance, or item)
   */
  getEntriesForEntity: (entityType: AuditEntityType, entityId: string) => AuditEntry[]

  /**
   * Get all entries for a specific user
   */
  getEntriesForUser: (userId: string) => AuditEntry[]

  /**
   * Get entries within a date range
   */
  getEntriesByDateRange: (start: Date, end: Date) => AuditEntry[]

  /**
   * Get entries by action type
   */
  getEntriesByAction: (action: AuditAction) => AuditEntry[]

  /**
   * Get recent entries (for dashboard/activity feed)
   */
  getRecentEntries: (limit?: number) => AuditEntry[]
}

export type AuditStore = AuditState & AuditActions

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      // Initialize with mock data
      entries: MOCK_AUDIT_LOG,

      // APPEND ONLY - no delete or update methods
      addEntry: (entryData) => {
        const entry: AuditEntry = {
          ...entryData,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }

        set((state) => ({
          entries: [...state.entries, entry],
        }))
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
    }),
    {
      name: AUDIT_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Persist all entries
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
)
