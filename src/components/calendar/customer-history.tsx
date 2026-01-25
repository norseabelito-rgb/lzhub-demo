'use client'

import { useState, useMemo } from 'react'
import {
  Calendar,
  Users,
  Clock,
  ChevronDown,
  ChevronRight,
  Cake,
  Briefcase,
  Users2,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useReservationStore,
  formatDateFull,
  formatTimeRange,
  formatPartySize,
  getOccasionLabel,
  getStatusLabel,
  getStatusColor,
  type Occasion,
} from '@/lib/calendar'

// ============================================================================
// Types
// ============================================================================

interface CustomerHistoryProps {
  customerId: string
  className?: string
}

type StatusFilter = 'all' | 'completed' | 'cancelled'

// Occasion icons mapping
const OCCASION_ICONS: Record<Occasion, React.ComponentType<{ className?: string }>> = {
  regular: Clock,
  birthday: Cake,
  corporate: Briefcase,
  group: Users2,
  other: FileText,
}

// ============================================================================
// Component
// ============================================================================

export function CustomerHistory({ customerId, className }: CustomerHistoryProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const reservations = useReservationStore((state) => state.reservations)

  // Get customer reservations
  const customerReservations = useMemo(() => {
    return reservations
      .filter((r) => r.customerId === customerId)
      .sort((a, b) => {
        // Sort by date descending, then by start time descending
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
        if (dateCompare !== 0) return dateCompare
        return b.startTime.localeCompare(a.startTime)
      })
  }, [reservations, customerId])

  // Filter reservations based on status filter
  const filteredReservations = useMemo(() => {
    if (filter === 'all') return customerReservations
    if (filter === 'completed') {
      return customerReservations.filter((r) => r.status === 'completed')
    }
    if (filter === 'cancelled') {
      return customerReservations.filter(
        (r) => r.status === 'cancelled' || r.status === 'no_show'
      )
    }
    return customerReservations
  }, [customerReservations, filter])

  // Calculate summary stats
  const stats = useMemo(() => {
    const completedReservations = customerReservations.filter(
      (r) => r.status === 'completed' || r.status === 'confirmed'
    )

    // Total visits (excluding cancelled)
    const totalVisits = completedReservations.length

    // First visit date
    const sortedByDateAsc = [...completedReservations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const firstVisitDate = sortedByDateAsc[0]?.date || null

    // Most common occasion
    const occasionCounts = completedReservations.reduce(
      (acc, r) => {
        acc[r.occasion] = (acc[r.occasion] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const mostCommonOccasion = Object.entries(occasionCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] as Occasion | undefined

    // Average party size
    const totalGuests = completedReservations.reduce((sum, r) => sum + r.partySize, 0)
    const avgPartySize =
      completedReservations.length > 0
        ? Math.round(totalGuests / completedReservations.length)
        : 0

    return {
      totalVisits,
      firstVisitDate,
      mostCommonOccasion,
      avgPartySize,
    }
  }, [customerReservations])

  // Toggle expanded state
  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id))
  }

  // Empty state
  if (customerReservations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="size-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nicio rezervare in istoric
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rezumat vizite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalVisits}</p>
              <p className="text-sm text-muted-foreground">Total vizite</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.firstVisitDate ? formatDateFull(stats.firstVisitDate).split(',')[1] : '-'}
              </p>
              <p className="text-sm text-muted-foreground">Prima vizita</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.mostCommonOccasion
                  ? getOccasionLabel(stats.mostCommonOccasion).split(' ')[0]
                  : '-'}
              </p>
              <p className="text-sm text-muted-foreground">Tip frecvent</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgPartySize || '-'}</p>
              <p className="text-sm text-muted-foreground">Medie persoane</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={customerReservations.length}
        >
          Toate
        </FilterButton>
        <FilterButton
          active={filter === 'completed'}
          onClick={() => setFilter('completed')}
          count={customerReservations.filter((r) => r.status === 'completed').length}
        >
          Completate
        </FilterButton>
        <FilterButton
          active={filter === 'cancelled'}
          onClick={() => setFilter('cancelled')}
          count={
            customerReservations.filter(
              (r) => r.status === 'cancelled' || r.status === 'no_show'
            ).length
          }
        >
          Anulate
        </FilterButton>
      </div>

      {/* Visit List */}
      <div className="space-y-2">
        {filteredReservations.map((reservation) => {
          const isExpanded = expandedId === reservation.id
          const OccasionIcon = OCCASION_ICONS[reservation.occasion]

          return (
            <Card key={reservation.id} className="overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => toggleExpanded(reservation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Main Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDateFull(reservation.date)}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{formatTimeRange(reservation.startTime, reservation.endTime)}</span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {formatPartySize(reservation.partySize)}
                        </span>
                        <span className="flex items-center gap-1">
                          <OccasionIcon className="size-3" />
                          {getOccasionLabel(reservation.occasion)}
                        </span>
                      </div>
                    </div>

                    {/* Status & Expand */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          getStatusColor(reservation.status),
                          'bg-transparent'
                        )}
                      >
                        {getStatusLabel(reservation.status)}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="size-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <CardContent className="border-t bg-muted/30 px-4 py-3">
                  <div className="space-y-2 text-sm">
                    {reservation.notes && (
                      <div>
                        <p className="text-muted-foreground">Note:</p>
                        <p className="mt-0.5">{reservation.notes}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      <span>
                        Creat:{' '}
                        {new Date(reservation.createdAt).toLocaleDateString('ro-RO')}
                      </span>
                      {reservation.hasConflict && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                          Avea conflict
                        </Badge>
                      )}
                      {reservation.conflictOverridden && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                          Conflict suprascris
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Empty filtered state */}
      {filteredReservations.length === 0 && (
        <div className="rounded-lg border bg-card py-8 text-center">
          <p className="text-muted-foreground">
            Nicio rezervare cu acest filtru
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Filter Button Component
// ============================================================================

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}

function FilterButton({ active, onClick, count, children }: FilterButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className="gap-1"
    >
      {children}
      <span
        className={cn(
          'rounded-full px-1.5 text-xs',
          active ? 'bg-primary-foreground/20' : 'bg-muted'
        )}
      >
        {count}
      </span>
    </Button>
  )
}
