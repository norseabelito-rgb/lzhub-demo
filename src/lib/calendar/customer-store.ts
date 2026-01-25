/**
 * Customer store for LaserZone Hub
 * Manages customers with tag system and visit history lookup
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Customer, CustomerTag, Reservation } from './types'
import { MOCK_CUSTOMERS, DEFAULT_TAGS } from './mock-data'
import { useReservationStore } from './reservation-store'

const CUSTOMER_STORAGE_KEY = 'laserzone-customers'

// ============================================================================
// Search Helpers
// ============================================================================

/**
 * Normalize string for searching (lowercase, remove diacritics, remove spaces)
 */
function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, '') // Remove spaces for phone number matching
}

/**
 * Check if a customer matches a search query
 */
function customerMatchesQuery(customer: Customer, query: string): boolean {
  const normalizedQuery = normalizeForSearch(query)

  // Search by name
  if (normalizeForSearch(customer.name).includes(normalizedQuery)) {
    return true
  }

  // Search by phone (normalize both to handle different formats)
  if (normalizeForSearch(customer.phone).includes(normalizedQuery)) {
    return true
  }

  // Search by email
  if (customer.email && normalizeForSearch(customer.email).includes(normalizedQuery)) {
    return true
  }

  return false
}

// ============================================================================
// Store Types
// ============================================================================

interface CustomerState {
  customers: Customer[]
  availableTags: CustomerTag[]
  isLoading: boolean
}

interface CustomerActions {
  // Customer CRUD
  createCustomer: (
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
  ) => string
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void

  // Query operations
  getCustomerById: (id: string) => Customer | undefined
  searchCustomers: (query: string) => Customer[]
  getCustomerHistory: (customerId: string) => Reservation[]

  // Tag management
  addTag: (tag: Omit<CustomerTag, 'id'>) => string
  removeTag: (tagId: string) => void
  addTagToCustomer: (customerId: string, tagId: string) => void
  removeTagFromCustomer: (customerId: string, tagId: string) => void
}

export type CustomerStore = CustomerState & CustomerActions

// ============================================================================
// Store Implementation
// ============================================================================

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      // Initial state with mock data
      customers: MOCK_CUSTOMERS,
      availableTags: DEFAULT_TAGS,
      isLoading: false,

      // ========== Customer CRUD ==========

      createCustomer: (data) => {
        const id = crypto.randomUUID()
        const now = new Date()

        const customer: Customer = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          customers: [...state.customers, customer],
        }))

        return id
      },

      updateCustomer: (id, updates) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date() }
              : c
          ),
        }))
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }))
      },

      // ========== Query Operations ==========

      getCustomerById: (id) => {
        return get().customers.find((c) => c.id === id)
      },

      searchCustomers: (query) => {
        if (!query.trim()) {
          return []
        }

        return get().customers.filter((customer) =>
          customerMatchesQuery(customer, query)
        )
      },

      getCustomerHistory: (customerId) => {
        // Access reservation store to get history
        return useReservationStore.getState().getReservationsForCustomer(customerId)
      },

      // ========== Tag Management ==========

      addTag: (tagData) => {
        const id = crypto.randomUUID()

        const tag: CustomerTag = {
          ...tagData,
          id,
        }

        set((state) => ({
          availableTags: [...state.availableTags, tag],
        }))

        return id
      },

      removeTag: (tagId) => {
        // Remove from available tags
        set((state) => ({
          availableTags: state.availableTags.filter((t) => t.id !== tagId),
          // Also remove from all customers
          customers: state.customers.map((c) => ({
            ...c,
            tags: c.tags.filter((t) => t.id !== tagId),
            updatedAt: c.tags.some((t) => t.id === tagId) ? new Date() : c.updatedAt,
          })),
        }))
      },

      addTagToCustomer: (customerId, tagId) => {
        const tag = get().availableTags.find((t) => t.id === tagId)
        if (!tag) return

        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id !== customerId) return c
            // Don't add duplicate tags
            if (c.tags.some((t) => t.id === tagId)) return c
            return {
              ...c,
              tags: [...c.tags, tag],
              updatedAt: new Date(),
            }
          }),
        }))
      },

      removeTagFromCustomer: (customerId, tagId) => {
        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id !== customerId) return c
            return {
              ...c,
              tags: c.tags.filter((t) => t.id !== tagId),
              updatedAt: new Date(),
            }
          }),
        }))
      },
    }),
    {
      name: CUSTOMER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Persist customers and tags
      partialize: (state) => ({
        customers: state.customers,
        availableTags: state.availableTags,
      }),
    }
  )
)
