'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Reservation } from '@/lib/calendar'
import { useReservationStore, generateTimeSlots } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import { ReservationSlot } from './reservation-slot'
import { CapacityIndicator } from './capacity-indicator'
import { WalkupForm } from './walkup-form'

// ============================================================================
// Types
// ============================================================================

interface DayViewProps {
  date: Date
  reservations: Reservation[]
  onSlotClick: (date: Date, time: string) => void
  onReservationClick: (reservation: Reservation) => void
}

// ============================================================================
// Constants
// ============================================================================

// Generate time slots from 09:00 to 22:00 (30-minute intervals)
// This gives us 26 slots: 09:00, 09:30, 10:00... 21:30, 22:00
const TIME_SLOTS = generateTimeSlots(9, 22)

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get slot background color based on capacity status
 */
function getSlotBackgroundClasses(status: 'available' | 'warning' | 'full') {
  switch (status) {
    case 'full':
      return 'bg-destructive/10 hover:bg-destructive/20'
    case 'warning':
      return 'bg-warning/10 hover:bg-warning/20'
    default:
      return 'bg-green-500/5 hover:bg-green-500/10'
  }
}

/**
 * Get reservations for a specific time slot
 */
function getReservationsForSlot(
  reservations: Reservation[],
  time: string
): Reservation[] {
  // Parse time to minutes
  const [hours, minutes] = time.split(':').map(Number)
  const slotStart = hours * 60 + minutes
  const slotEnd = slotStart + 30

  return reservations.filter((r) => {
    const [rStartH, rStartM] = r.startTime.split(':').map(Number)
    const [rEndH, rEndM] = r.endTime.split(':').map(Number)
    const resStart = rStartH * 60 + rStartM
    const resEnd = rEndH * 60 + rEndM

    // Reservation overlaps with this slot if it starts before slot ends
    // and ends after slot starts
    return resStart < slotEnd && resEnd > slotStart
  })
}

// ============================================================================
// Component
// ============================================================================

export function DayView({
  date,
  reservations,
  onSlotClick,
  onReservationClick,
}: DayViewProps) {
  const getCapacityForSlot = useReservationStore((state) => state.getCapacityForSlot)
  const [walkupSlot, setWalkupSlot] = useState<{ date: string; time: string } | null>(null)

  // Format date for display and store queries
  const dateStr = useMemo(() => format(date, 'yyyy-MM-dd'), [date])

  // Filter reservations to only show non-cancelled for capacity calculation
  const activeReservations = useMemo(() => {
    return reservations.filter((r) => r.status !== 'cancelled')
  }, [reservations])

  return (
    <div className="rounded-lg border bg-card">
      {/* Scrollable time grid */}
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
        <div className="min-w-0">
          {TIME_SLOTS.map((time, index) => {
            const capacity = getCapacityForSlot(dateStr, time)
            const backgroundClasses = getSlotBackgroundClasses(capacity.status)

            // Show all reservations including cancelled for the slot
            const allSlotReservations = getReservationsForSlot(reservations, time)

            return (
              <div
                key={time}
                className={cn(
                  'flex border-b last:border-b-0',
                  index % 2 === 0 && 'bg-muted/20'
                )}
              >
                {/* Time label */}
                <div className="w-16 shrink-0 border-r px-2 py-3 text-sm text-muted-foreground sm:w-20 sm:px-3">
                  {time}
                </div>

                {/* Slot area */}
                <div
                  className={cn(
                    'flex-1 min-h-[60px] transition-colors',
                    backgroundClasses
                  )}
                >
                  {/* Slot header with capacity bar and walk-up button */}
                  <div className="flex items-center justify-between gap-2 px-2 pt-2 sm:px-3">
                    {/* Capacity indicator bar */}
                    <div className="flex-1 max-w-[200px]">
                      <CapacityIndicator
                        current={capacity.current}
                        max={capacity.max}
                        mode="bar"
                      />
                    </div>

                    {/* Walk-up quick button */}
                    <WalkupForm
                      defaultDate={dateStr}
                      defaultTime={time}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 hover:bg-accent"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <UserPlus className="size-3" />
                          <span className="hidden sm:inline">Walk-up</span>
                        </Button>
                      }
                    />
                  </div>

                  {/* Clickable slot area for new reservation */}
                  <button
                    onClick={() => onSlotClick(date, time)}
                    className={cn(
                      'w-full min-h-[32px] p-2 text-left',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
                      allSlotReservations.length === 0 && 'hover:bg-accent/30'
                    )}
                  >
                    {/* Reservations for this slot */}
                    <div className="space-y-2">
                      {allSlotReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onReservationClick(reservation)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation()
                              onReservationClick(reservation)
                            }
                          }}
                        >
                          <ReservationSlot
                            reservation={reservation}
                            onClick={onReservationClick}
                          />
                        </div>
                      ))}
                    </div>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
