'use client'

import { useState, useMemo, useSyncExternalStore, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useCustomerStore,
  useReservationStore,
  formatDateRelative,
  type Customer,
} from '@/lib/calendar'

// ============================================================================
// Types
// ============================================================================

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer) => void
  className?: string
}

interface CustomerWithStats extends Customer {
  visitCount: number
  lastVisitDate: string | null
}

// ============================================================================
// Debounce Hook
// ============================================================================

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  // Use a ref-based approach to avoid the setState-in-effect issue
  useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        const timer = setTimeout(() => {
          setDebouncedValue(value)
          onStoreChange()
        }, delay)
        return () => clearTimeout(timer)
      },
      [value, delay]
    ),
    () => debouncedValue,
    () => value
  )

  return debouncedValue
}

// ============================================================================
// Component
// ============================================================================

export function CustomerSearch({ onSelectCustomer, className }: CustomerSearchProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)

  const searchCustomers = useCustomerStore((state) => state.searchCustomers)
  const reservations = useReservationStore((state) => state.reservations)

  // Get visit stats for a customer
  const getVisitStats = useCallback(
    (customerId: string) => {
      const customerReservations = reservations.filter(
        (r) => r.customerId === customerId && r.status !== 'cancelled'
      )

      const sortedByDate = customerReservations.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      return {
        visitCount: customerReservations.length,
        lastVisitDate: sortedByDate[0]?.date || null,
      }
    },
    [reservations]
  )

  // Compute results from debounced query
  const results = useMemo<CustomerWithStats[]>(() => {
    if (!debouncedQuery.trim()) {
      return []
    }

    const searchResults = searchCustomers(debouncedQuery)
    return searchResults.slice(0, 20).map((customer) => ({
      ...customer,
      ...getVisitStats(customer.id),
    }))
  }, [debouncedQuery, searchCustomers, getVisitStats])

  // Loading state: query changed but debounced hasn't caught up
  const isSearching = query.trim() !== '' && query !== debouncedQuery

  // Clear search
  const handleClear = () => {
    setQuery('')
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cauta dupa nume, telefon sau email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 pl-11 pr-10 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-9 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="size-4" />
            <span className="sr-only">Sterge cautarea</span>
          </Button>
        )}
      </div>

      {/* Search Results */}
      <div className="mt-4 flex-1 overflow-y-auto">
        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Se cauta...</span>
          </div>
        )}

        {/* No Results */}
        {!isSearching && debouncedQuery && results.length === 0 && (
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-muted-foreground">Niciun client gasit</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Incercati cu alt nume, telefon sau email
            </p>
          </div>
        )}

        {/* Results List */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-2">
            {results.map((customer) => (
              <button
                key={customer.id}
                className="w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/50"
                onClick={() => onSelectCustomer(customer)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Name */}
                    <p className="truncate font-semibold">{customer.name}</p>

                    {/* Phone & Email */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{customer.phone}</span>
                      {customer.email && (
                        <>
                          <span className="text-border">|</span>
                          <span className="truncate">{customer.email}</span>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    {customer.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {customer.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: `${tag.color}50`,
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Visit Stats */}
                  <div className="shrink-0 text-right text-sm">
                    <p className="font-medium">
                      {customer.visitCount} {customer.visitCount === 1 ? 'vizita' : 'vizite'}
                    </p>
                    {customer.lastVisitDate && (
                      <p className="text-muted-foreground">
                        Ultima: {formatDateRelative(customer.lastVisitDate)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Initial State - Show hint */}
        {!isSearching && !debouncedQuery && (
          <div className="rounded-lg border border-dashed bg-card/50 p-6 text-center">
            <Search className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Cautati un client pentru a vedea profilul si istoricul vizitelor
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
