'use client'

/**
 * SocialCalendarHeader - Navigation and view controls for social content calendar
 * Adapts Phase 3 calendar header pattern for social media posts
 */

import { useMemo, useCallback, useRef, useEffect } from 'react'
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
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export type SocialCalendarView = 'day' | 'week' | 'month'

interface SocialCalendarHeaderProps {
  currentDate: Date
  view: SocialCalendarView
  onDateChange: (date: Date) => void
  onViewChange: (view: SocialCalendarView) => void
}

// ============================================================================
// View Options
// ============================================================================

const VIEW_OPTIONS: { value: SocialCalendarView; label: string }[] = [
  { value: 'day', label: 'Zi' },
  { value: 'week', label: 'Saptamana' },
  { value: 'month', label: 'Luna' },
]

// ============================================================================
// Component
// ============================================================================

export function SocialCalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
}: SocialCalendarHeaderProps) {
  // Debounce ref for navigation
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Debounced date change handler (100ms from Phase 3 pattern)
  const debouncedDateChange = useCallback(
    (newDate: Date) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        onDateChange(newDate)
      }, 100)
    },
    [onDateChange]
  )

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
    let newDate: Date
    switch (view) {
      case 'day':
        newDate = subDays(currentDate, 1)
        break
      case 'week':
        newDate = subWeeks(currentDate, 1)
        break
      case 'month':
        newDate = subMonths(currentDate, 1)
        break
    }
    debouncedDateChange(newDate)
  }, [currentDate, view, debouncedDateChange])

  const goToNext = useCallback(() => {
    let newDate: Date
    switch (view) {
      case 'day':
        newDate = addDays(currentDate, 1)
        break
      case 'week':
        newDate = addWeeks(currentDate, 1)
        break
      case 'month':
        newDate = addMonths(currentDate, 1)
        break
    }
    debouncedDateChange(newDate)
  }, [currentDate, view, debouncedDateChange])

  const goToToday = useCallback(() => {
    onDateChange(new Date())
  }, [onDateChange])

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left section: Navigation and date display */}
      <div className="flex items-center gap-2">
        {/* Navigation buttons */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={goToPrevious}
            aria-label="Anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={goToNext}
            aria-label="Urmator"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Today button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="hidden sm:inline-flex"
        >
          Azi
        </Button>

        {/* Date display */}
        <h2 className="text-lg font-semibold capitalize sm:text-xl">
          {dateDisplay}
        </h2>
      </div>

      {/* Right section: View switcher and new post button */}
      <div className="flex items-center gap-2">
        {/* Mobile: Today button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="sm:hidden"
        >
          Azi
        </Button>

        {/* View switcher */}
        <div className="flex rounded-md border bg-muted/50 p-1">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onViewChange(option.value)}
              className={cn(
                'rounded px-3 py-1 text-sm font-medium transition-colors',
                view === option.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* New post button */}
        <Button asChild className="gap-2">
          <Link href="/social/new">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Postare noua</span>
            <span className="sm:hidden">Nou</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
