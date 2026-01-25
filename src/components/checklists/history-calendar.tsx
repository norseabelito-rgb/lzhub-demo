'use client'

import { useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns'
import { ro } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChecklistInstance } from '@/lib/checklist'

// ============================================================================
// Types
// ============================================================================

interface HistoryCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  instancesByDate: Map<string, ChecklistInstance[]>
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

// Days of week in Romanian (starting Monday)
const DAYS_OF_WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// ============================================================================
// Component
// ============================================================================

export function HistoryCalendar({
  selectedDate,
  onDateSelect,
  instancesByDate,
  currentMonth,
  onMonthChange,
}: HistoryCalendarProps) {
  // Generate calendar days for current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    // We want Monday = 0, so adjust
    const startDayOfWeek = getDay(monthStart)
    // Convert Sunday (0) to 6, and shift others down by 1
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    // Add padding days at start
    const paddingDays: (Date | null)[] = Array(adjustedStartDay).fill(null)

    return [...paddingDays, ...days]
  }, [currentMonth])

  // Navigate to previous month
  const goToPreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1))
  }

  // Go to today
  const goToToday = () => {
    const today = new Date()
    onMonthChange(today)
    onDateSelect(today)
  }

  // Get activity indicators for a date
  const getDateActivity = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const instances = instancesByDate.get(dateKey) || []

    if (instances.length === 0) return null

    const hasCompleted = instances.some((i) => i.status === 'completed')
    const hasOverdue = instances.some((i) => i.status === 'overdue')
    const hasInProgress = instances.some((i) => i.status === 'in_progress')
    const hasPending = instances.some((i) => i.status === 'pending')

    return { hasCompleted, hasOverdue, hasInProgress, hasPending, count: instances.length }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Header with navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="size-8"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Luna anterioara</span>
        </Button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ro })}
          </h2>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="size-8"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Luna urmatoare</span>
        </Button>
      </div>

      {/* Today button */}
      <div className="mb-4 flex justify-center">
        <Button variant="outline" size="sm" onClick={goToToday}>
          <CalendarDays className="mr-2 size-4" />
          Azi
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={index}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          if (!date) {
            // Empty padding cell
            return <div key={`padding-${index}`} className="h-10" />
          }

          const activity = getDateActivity(date)
          const isSelected = isSameDay(date, selectedDate)
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isTodayDate = isToday(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={cn(
                'relative flex h-10 flex-col items-center justify-center rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                !isCurrentMonth && 'text-muted-foreground/50',
                isTodayDate && !isSelected && 'border border-primary'
              )}
            >
              <span className="text-sm">{format(date, 'd')}</span>

              {/* Activity indicators */}
              {activity && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {activity.hasCompleted && (
                    <span className="size-1 rounded-full bg-success" />
                  )}
                  {activity.hasOverdue && (
                    <span className="size-1 rounded-full bg-destructive" />
                  )}
                  {(activity.hasInProgress || activity.hasPending) &&
                    !activity.hasCompleted &&
                    !activity.hasOverdue && (
                      <span className="size-1 rounded-full bg-primary" />
                    )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-success" />
          <span>Completat</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-destructive" />
          <span>Depasit</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-primary" />
          <span>In curs</span>
        </div>
      </div>
    </div>
  )
}
