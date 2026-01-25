'use client'

import { useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { ro } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Reservation } from '@/lib/calendar'

// ============================================================================
// Types
// ============================================================================

interface MonthViewProps {
  month: Date
  reservations: Reservation[]
  onDayClick: (date: Date) => void
}

// ============================================================================
// Constants
// ============================================================================

// Day names in Romanian (abbreviated)
const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get reservations for a specific date
 */
function getReservationsForDate(
  reservations: Reservation[],
  date: Date
): Reservation[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  return reservations.filter(
    (r) => r.date === dateStr && r.status !== 'cancelled'
  )
}

// ============================================================================
// Component
// ============================================================================

export function MonthView({
  month,
  reservations,
  onDayClick,
}: MonthViewProps) {
  // Generate calendar days including padding from adjacent months
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [month])

  // Group days into weeks for rendering
  const weeks = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7))
    }
    return result
  }, [calendarDays])

  // Calculate days with reservations for mobile agenda view
  const daysWithReservations = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const allDays = eachDayOfInterval({ start, end })

    return allDays
      .map((day) => {
        const dayReservations = reservations.filter(
          (r) =>
            isSameDay(new Date(r.date), day) && r.status !== 'cancelled'
        )
        return { date: day, reservations: dayReservations }
      })
      .filter((d) => d.reservations.length > 0 || isToday(d.date))
  }, [month, reservations])

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Mobile Agenda View */}
      <div className="md:hidden space-y-2 p-2">
        {daysWithReservations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nicio rezervare in aceasta luna
          </div>
        ) : (
          daysWithReservations.map(({ date, reservations: dayRes }) => (
            <button
              key={date.toISOString()}
              onClick={() => onDayClick(date)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-colors min-h-[56px]',
                'hover:border-primary/50 active:scale-[0.99]',
                isToday(date) && 'border-primary bg-primary/5'
              )}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div
                    className={cn(
                      'font-medium capitalize',
                      isToday(date) && 'text-primary'
                    )}
                  >
                    {format(date, 'EEEE', { locale: ro })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(date, 'd MMMM', { locale: ro })}
                  </div>
                </div>
                {dayRes.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayRes.length} rezerv{dayRes.length === 1 ? 'are' : 'ari'}
                  </Badge>
                )}
              </div>
              {dayRes.length > 0 && (
                <div className="mt-2 space-y-1">
                  {dayRes.slice(0, 3).map((res) => (
                    <div
                      key={res.id}
                      className="text-xs text-muted-foreground truncate"
                    >
                      {res.startTime} - {res.partySize} pers.
                    </div>
                  ))}
                  {dayRes.length > 3 && (
                    <div className="text-xs text-primary">
                      +{dayRes.length - 3} mai multe
                    </div>
                  )}
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:block">
        {/* Day name headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {DAY_NAMES.map((name, index) => (
            <div
              key={index}
              className="border-r last:border-r-0 p-2 text-center text-xs font-medium text-muted-foreground sm:text-sm"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-rows-[repeat(auto-fill,minmax(80px,1fr))]">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="grid grid-cols-7 border-b last:border-b-0"
            >
              {week.map((day) => {
                const dayReservations = getReservationsForDate(
                  reservations,
                  day
                )
                const isCurrentMonth = isSameMonth(day, month)
                const isTodayDate = isToday(day)
                const reservationCount = dayReservations.length

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onDayClick(day)}
                    className={cn(
                      'border-r last:border-r-0 min-h-[80px] p-1 text-left transition-colors sm:p-2',
                      'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
                      !isCurrentMonth && 'bg-muted/30 text-muted-foreground/50',
                      isTodayDate && 'ring-2 ring-primary ring-inset'
                    )}
                  >
                    {/* Day number and reservation count */}
                    <div className="flex items-start justify-between">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isTodayDate && 'text-primary',
                          !isCurrentMonth && 'text-muted-foreground/50'
                        )}
                      >
                        {format(day, 'd')}
                      </span>

                      {reservationCount > 0 && (
                        <span
                          className={cn(
                            'rounded-full px-1.5 text-xs font-medium',
                            reservationCount >= 5
                              ? 'bg-destructive/20 text-destructive'
                              : reservationCount >= 3
                                ? 'bg-warning/20 text-warning'
                                : 'bg-primary/20 text-primary'
                          )}
                        >
                          {reservationCount}
                        </span>
                      )}
                    </div>

                    {/* Mini reservation list */}
                    {dayReservations.length > 0 && (
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {dayReservations.slice(0, 3).map((reservation) => (
                          <div
                            key={reservation.id}
                            className={cn(
                              'truncate rounded px-1 text-xs',
                              reservation.hasConflict &&
                                !reservation.conflictOverridden
                                ? 'bg-destructive/20 text-destructive'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <span className="font-medium">
                              {reservation.startTime}
                            </span>
                            <span className="hidden sm:inline">
                              {' '}
                              - {reservation.partySize} pers.
                            </span>
                          </div>
                        ))}

                        {dayReservations.length > 3 && (
                          <div className="px-1 text-xs text-muted-foreground">
                            +{dayReservations.length - 3} mai mult
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
