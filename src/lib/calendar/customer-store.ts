/**
 * Customer store for LaserZone Hub
 * Manages customers with tag system and visit history lookup
 * Data is fetched from/persisted to the API
 */

import { create } from 'zustand'
import type { Customer, CustomerTag, Reservation } from './types'
import { api } from '@/lib/api-client'

// ============================================================================
// Store Types
// ============================================================================

interface CustomerState {
  customers: Customer[]
  availableTags: CustomerTag[]
  isLoading: boolean
  error: string | null
}

interface CustomerActions {
  // Data fetching
  fetchCustomers: () => Promise<void>
  fetchTags: () => Promise<void>

  // Customer CRUD
  createCustomer: (
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>

  // Query operations (local, from fetched data)
  getCustomerById: (id: string) => Customer | undefined
  searchCustomers: (query: string) => Customer[]

  // Tag management
  addTag: (tag: Omit<CustomerTag, 'id'>) => Promise<string>
  removeTag: (tagId: string) => void
  addTagToCustomer: (customerId: string, tagId: string) => Promise<void>
  removeTagFromCustomer: (customerId: string, tagId: string) => Promise<void>

  // Error handling
  clearError: () => void
}

export type CustomerStore = CustomerState & CustomerActions

// ============================================================================
// Search Helpers
// ============================================================================

function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
}

function customerMatchesQuery(customer: Customer, query: string): boolean {
  const normalizedQuery = normalizeForSearch(query)
  if (normalizeForSearch(customer.name).includes(normalizedQuery)) return true
  if (normalizeForSearch(customer.phone).includes(normalizedQuery)) return true
  if (customer.email && normalizeForSearch(customer.email).includes(normalizedQuery)) return true
  return false
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useCustomerStore = create<CustomerStore>()((set, get) => ({
  customers: [],
  availableTags: [],
  isLoading: false,
  error: null,

  // ========== Data Fetching ==========

  fetchCustomers: async () => {
    set({ isLoading: true, error: null })
    try {
      const customers = await api<Customer[]>('/api/calendar/customers')
      set({ customers, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },

  fetchTags: async () => {
    try {
      const tags = await api<CustomerTag[]>('/api/calendar/tags')
      set({ availableTags: tags })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  // ========== Customer CRUD ==========

  createCustomer: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const customer = await api<Customer>('/api/calendar/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          notes: data.notes || undefined,
        }),
      })
      // Add to local state
      set((state) => ({
        customers: [...state.customers, customer],
        isLoading: false,
      }))
      return customer.id
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
      throw err
    }
  },

  updateCustomer: async (id, updates) => {
    set({ error: null })
    try {
      const updated = await api<Customer>(`/api/calendar/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updated : c)),
      }))
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  deleteCustomer: async (id) => {
    set({ error: null })
    try {
      await api(`/api/calendar/customers/${id}`, { method: 'DELETE' })
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
      }))
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  // ========== Query Operations ==========

  getCustomerById: (id) => {
    return get().customers.find((c) => c.id === id)
  },

  searchCustomers: (query) => {
    if (!query.trim()) return []
    return get().customers.filter((customer) =>
      customerMatchesQuery(customer, query)
    )
  },

  // ========== Tag Management ==========

  addTag: async (tagData) => {
    set({ error: null })
    try {
      const tag = await api<CustomerTag>('/api/calendar/tags', {
        method: 'POST',
        body: JSON.stringify(tagData),
      })
      set((state) => ({
        availableTags: [...state.availableTags, tag],
      }))
      return tag.id
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  removeTag: (tagId) => {
    // Remove from available tags locally (API call for tag deletion would be separate)
    set((state) => ({
      availableTags: state.availableTags.filter((t) => t.id !== tagId),
      customers: state.customers.map((c) => ({
        ...c,
        tags: c.tags.filter((t) => t.id !== tagId),
      })),
    }))
  },

  addTagToCustomer: async (customerId, tagId) => {
    set({ error: null })
    try {
      await api(`/api/calendar/customers/${customerId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tagId }),
      })
      // Update local state
      const tag = get().availableTags.find((t) => t.id === tagId)
      if (tag) {
        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id !== customerId) return c
            if (c.tags.some((t) => t.id === tagId)) return c
            return { ...c, tags: [...c.tags, tag] }
          }),
        }))
      }
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  removeTagFromCustomer: async (customerId, tagId) => {
    set({ error: null })
    try {
      await api(`/api/calendar/customers/${customerId}/tags`, {
        method: 'DELETE',
        body: JSON.stringify({ tagId }),
      })
      set((state) => ({
        customers: state.customers.map((c) => {
          if (c.id !== customerId) return c
          return { ...c, tags: c.tags.filter((t) => t.id !== tagId) }
        }),
      }))
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  // ========== Error Handling ==========

  clearError: () => set({ error: null }),
}))
