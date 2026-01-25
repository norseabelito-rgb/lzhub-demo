'use client'

import { useMemo, useState } from 'react'
import {
  format,
  startOfWeek,
  addDays,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Reservation } from '@/lib/calendar'
import { generateTimeSlots } from '@/lib/calendar'
import { ReservationSlot } from './reservation-slot'

// ============================================================================
// Types
// ============================================================================

interface WeekViewProps {
  weekStart: Date
  reservations: Reservation[]
  onSlotClick: (date: Date, time: string) => void
  onReservationClick: (reservation: Reservation) => void
  onDayClick: (date: Date) => void
}

// ============================================================================
// Constants
// ============================================================================

// Use 1-hour intervals for week view to reduce clutter
const TIME_SLOTS = generateTimeSlots(9, 22).filter((t) => t.endsWith(':00'))

// Day names in Romanian
const DAY_NAMES = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata', 'Duminica']

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get reservations for a specific day and time slot (1-hour window)
 */
function getReservationsForDaySlot(
  reservations: Reservation[],
  dayStr: string,
  time: string
): Reservation[] {
  // Parse time to minutes
  const [hours] = time.split(':').map(Number)
  const slotStart = hours * 60
  const slotEnd = slotStart + 60 // 1-hour window

  return reservations.filter((r) => {
    if (r.date !== dayStr) return false

    const [rStartH, rStartM] = r.startTime.split(':').map(Number)
    const [rEndH, rEndM] = r.endTime.split(':').map(Number)
    const resStart = rStartH * 60 + rStartM
    const resEnd = rEndH * 60 + rEndM

    // Reservation overlaps with this slot
    return resStart < slotEnd && resEnd > slotStart
  })
}

// ============================================================================
// Internal Component for Mobile View with offset state
// ============================================================================

interface MobileWeekViewProps {
  weekDays: Date[]
  activeReservations: Reservation[]
  onSlotClick: (date: Date, time: string) => void
  onReservationClick: (reservation: Reservation) => void
  onDayClick: (date: Date) => void
}

function MobileWeekView({
  weekDays,
  activeReservations,
  onSlotClick,
  onReservationClick,
  onDayClick,
}: MobileWeekViewProps) {
  // Mobile offset for 3-day sliding view - resets when component remounts (via key prop)
  const [mobileOffset, setMobileOffset] = useState(0)

  // Calculate which 3 days to show on mobile
  const mobileDays = useMemo(() => {
    return weekDays.slice(mobileOffset, mobileOffset + 3)
  }, [weekDays, mobileOffset])

  // Mobile navigation helpers
  const canGoBack = mobileOffset > 0
  const canGoForward = mobileOffset < 4 // 7 days - 3 visible = 4 max offset

  const handleMobileBack = () => {
    if (canGoBack) setMobileOffset((prev) => prev - 1)
  }

  const handleMobileForward = () => {
    if (canGoForward) setMobileOffset((prev) => prev + 1)
  }

  // Render helper for day slot content
  const renderDaySlot = (day: Date, time: string) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const slotReservations = getReservationsForDaySlot(
      activeReservations,
      dayStr,
      time
    )
    const isCurrentDay = isToday(day)

    return (
      <button
        key={`${dayStr}-${time}`}
        onClick={() => onSlotClick(day, time)}
        className={cn(
          'border-r last:border-r-0 min-h-[56px] p-1 text-left transition-colors',
          'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
          isCurrentDay && 'bg-primary/5',
          slotReservations.length > 0 && 'bg-muted/30'
        )}
      >
        <div className="space-y-0.5 overflow-hidden">
          {slotReservations.slice(0, 2).map((reservation) => (
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
                compact
                onClick={onReservationClick}
              />
            </div>
          ))}
          {slotReservations.length > 2 && (
            <div className="px-1 text-xs text-muted-foreground">
              +{slotReservations.length - 2} mai mult
            </div>
          )}
        </div>
      </button>
    )
  }

  // Render helper for day header
  const renderDayHeader = (day: Date, dayIndex: number) => {
    const isCurrentDay = isToday(day)

    return (
      <button
        key={day.toISOString()}
        onClick={() => onDayClick(day)}
        className={cn(
          'border-r last:border-r-0 p-2 text-center transition-colors min-h-11',
          'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
          isCurrentDay && 'bg-primary/10'
        )}
      >
        <div className="text-xs text-muted-foreground sm:text-sm">
          {DAY_NAMES[dayIndex]}
        </div>
        <div
          className={cn(
            'text-sm font-medium sm:text-base',
            isCurrentDay && 'text-primary'
          )}
        >
          {format(day, 'd')}
        </div>
      </button>
    )
  }

  return (
    <div className="md:hidden">
      {/* Mobile day navigation */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMobileBack}
          disabled={!canGoBack}
          className="min-h-11 min-w-11"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium">
          {format(mobileDays[0], 'd MMM')} - {format(mobileDays[2], 'd MMM')}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMobileForward}
          disabled={!canGoForward}
          className="min-h-11 min-w-11"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile header row with 3 days */}
      <div className="grid grid-cols-[50px_repeat(3,1fr)] border-b bg-muted/30">
        {/* Empty corner cell */}
        <div className="border-r p-2" />

        {/* Day headers */}
        {mobileDays.map((day) => {
          const originalIndex = weekDays.findIndex(
            (d) => d.toISOString() === day.toISOString()
          )
          return renderDayHeader(day, originalIndex)
        })}
      </div>

      {/* Time slots grid - Mobile */}
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
        {TIME_SLOTS.map((time, timeIndex) => (
          <div
            key={time}
            className={cn(
              'grid grid-cols-[50px_repeat(3,1fr)] border-b last:border-b-0',
              timeIndex % 2 === 0 && 'bg-muted/10'
            )}
          >
            {/* Time label */}
            <div className="border-r px-1 py-3 text-xs text-muted-foreground flex items-center justify-center">
              {time}
            </div>
            {/* 3 day columns */}
            {mobileDays.map((day) => renderDaySlot(day, time))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WeekView({
  weekStart,
  reservations,
  onSlotClick,
  onReservationClick,
  onDayClick,
}: WeekViewProps) {
  // Calculate week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [weekStart])

  // Filter to non-cancelled reservations
  const activeReservations = useMemo(() => {
    return reservations.filter((r) => r.status !== 'cancelled')
  }, [reservations])

  // Render helper for day slot content (desktop)
  const renderDaySlot = (day: Date, time: string) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const slotReservations = getReservationsForDaySlot(
      activeReservations,
      dayStr,
      time
    )
    const isCurrentDay = isToday(day)

    return (
      <button
        key={`${dayStr}-${time}`}
        onClick={() => onSlotClick(day, time)}
        className={cn(
          'border-r last:border-r-0 min-h-[56px] p-1 text-left transition-colors',
          'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
          isCurrentDay && 'bg-primary/5',
          slotReservations.length > 0 && 'bg-muted/30'
        )}
      >
        <div className="space-y-0.5 overflow-hidden">
          {slotReservations.slice(0, 2).map((reservation) => (
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
                compact
                onClick={onReservationClick}
              />
            </div>
          ))}
          {slotReservations.length > 2 && (
            <div className="px-1 text-xs text-muted-foreground">
              +{slotReservations.length - 2} mai mult
            </div>
          )}
        </div>
      </button>
    )
  }

  // Render helper for day header (desktop)
  const renderDayHeader = (day: Date, dayIndex: number) => {
    const isCurrentDay = isToday(day)

    return (
      <button
        key={day.toISOString()}
        onClick={() => onDayClick(day)}
        className={cn(
          'border-r last:border-r-0 p-2 text-center transition-colors min-h-11',
          'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
          isCurrentDay && 'bg-primary/10'
        )}
      >
        <div className="text-xs text-muted-foreground sm:text-sm">
          {DAY_NAMES[dayIndex]}
        </div>
        <div
          className={cn(
            'text-sm font-medium sm:text-base',
            isCurrentDay && 'text-primary'
          )}
        >
          {format(day, 'd')}
        </div>
      </button>
    )
  }

  // Use weekStart.getTime() as key to reset mobile offset when week changes
  const weekKey = weekStart.getTime()

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Mobile View - 3 days (key resets state when week changes) */}
      <MobileWeekView
        key={weekKey}
        weekDays={weekDays}
        activeReservations={activeReservations}
        onSlotClick={onSlotClick}
        onReservationClick={onReservationClick}
        onDayClick={onDayClick}
      />

      {/* Desktop View - 7 days */}
      <div className="hidden md:block">
        {/* Header row with day names */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-muted/30">
          {/* Empty corner cell */}
          <div className="border-r p-2" />

          {/* Day headers */}
          {weekDays.map((day, index) => renderDayHeader(day, index))}
        </div>

        {/* Time grid */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          {TIME_SLOTS.map((time, timeIndex) => (
            <div
              key={time}
              className={cn(
                'grid grid-cols-[80px_repeat(7,1fr)] border-b last:border-b-0',
                timeIndex % 2 === 0 && 'bg-muted/10'
              )}
            >
              {/* Time label */}
              <div className="border-r px-3 py-3 text-sm text-muted-foreground">
                {time}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => renderDaySlot(day, time))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
