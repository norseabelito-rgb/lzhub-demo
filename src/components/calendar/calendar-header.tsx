'use client'

import { useMemo, useCallback } from 'react'
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ro } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export type CalendarView = 'day' | 'week' | 'month'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onDateChange: (date: Date) => void
  onViewChange: (view: CalendarView) => void
  onNewReservation: () => void
}

// ============================================================================
// View Buttons
// ============================================================================

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'day', label: 'Zi' },
  { value: 'week', label: 'Saptamana' },
  { value: 'month', label: 'Luna' },
]

// ============================================================================
// Component
// ============================================================================

export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onNewReservation,
}: CalendarHeaderProps) {
  // Format the date display based on view type
  const dateDisplay = useMemo(() => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, d MMMM yyyy', { locale: ro })
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        // If same month, show "22 - 28 Ianuarie 2026"
        // If different months, show "28 Ian - 3 Feb 2026"
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${format(weekStart, 'd', { locale: ro })} - ${format(weekEnd, 'd MMMM yyyy', { locale: ro })}`
        }
        return `${format(weekStart, 'd MMM', { locale: ro })} - ${format(weekEnd, 'd MMM yyyy', { locale: ro })}`
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ro })
    }
  }, [currentDate, view])

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    switch (view) {
      case 'day':
        onDateChange(subDays(currentDate, 1))
        break
      case 'week':
        onDateChange(subWeeks(currentDate, 1))
        break
      case 'month':
        onDateChange(subMonths(currentDate, 1))
        break
    }
  }, [currentDate, view, onDateChange])

  const goToNext = useCallback(() => {
    switch (view) {
      case 'day':
        onDateChange(addDays(currentDate, 1))
        break
      case 'week':
        onDateChange(addWeeks(currentDate, 1))
        break
      case 'month':
        onDateChange(addMonths(currentDate, 1))
        break
    }
  }, [currentDate, view, onDateChange])

  const goToToday = useCallback(() => {
    onDateChange(new Date())
  }, [onDateChange])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left section: Navigation and date display */}
      <div className="flex items-center gap-2">
        {/* Navigation buttons - 44px minimum touch targets */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            aria-label="Anterior"
            className="min-h-11 min-w-11"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            aria-label="Urmator"
            className="min-h-11 min-w-11"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Today button - 44px minimum height */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="hidden sm:inline-flex min-h-11"
        >
          Azi
        </Button>

        {/* Date display */}
        <h2 className="text-base font-semibold capitalize sm:text-xl min-w-0 truncate">
          {dateDisplay}
        </h2>
      </div>

      {/* Right section: View switcher and new reservation button */}
      <div className="flex items-center gap-2">
        {/* Mobile: Today button - 44px minimum */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="sm:hidden min-h-11"
        >
          Azi
        </Button>

        {/* View switcher - 44px minimum touch targets */}
        <div className="flex rounded-md border bg-muted/50 p-0.5">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onViewChange(option.value)}
              className={cn(
                'rounded px-2 sm:px-3 min-h-10 text-sm font-medium transition-colors',
                view === option.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Customers link - 44px minimum */}
        <Button variant="outline" asChild className="min-h-11">
          <Link href="/calendar/customers">
            <Users className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Clienti</span>
          </Link>
        </Button>

        {/* New reservation button - prominent with glow on mobile */}
        <Button
          variant="glow"
          onClick={onNewReservation}
          className="gap-2 min-h-11"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Rezervare Noua</span>
          <span className="sm:hidden">Nou</span>
        </Button>
      </div>
    </div>
  )
}
