'use client'

import { useMemo, useState } from 'react'
import {
  format,
  addDays,
  setHours,
  setMinutes,
  startOfDay,
  isAfter,
} from 'date-fns'
import { ro } from 'date-fns/locale'
import { CalendarIcon, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

interface SchedulePickerProps {
  /** Currently scheduled date/time as ISO string or null for draft */
  value: string | null
  /** Callback when schedule changes */
  onChange: (value: string | null) => void
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate time options in 30-minute intervals
 */
function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, '0')
      const minStr = minute.toString().padStart(2, '0')
      const value = `${hourStr}:${minStr}`
      const label = `${hourStr}:${minStr}`
      options.push({ value, label })
    }
  }

  return options
}

/**
 * Build a simple calendar grid for a month
 */
function buildCalendarMonth(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Get day of week for first day (0 = Sunday)
  // Convert to Monday = 0
  let startDayOfWeek = firstDay.getDay()
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const weeks: (Date | null)[][] = []
  let currentWeek: (Date | null)[] = []

  // Add padding for days before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null)
  }

  // Add all days of month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month, day))

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // Add padding for days after last day
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  return weeks
}

// ============================================================================
// Constants
// ============================================================================

const TIME_OPTIONS = generateTimeOptions()
const DAYS_OF_WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
]

// ============================================================================
// Component
// ============================================================================

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  // Minimum date is tomorrow
  const minDate = addDays(startOfDay(new Date()), 1)

  // Parse current value
  const currentDate = value ? new Date(value) : null
  const currentTime = currentDate
    ? `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`
    : '12:00'

  // Calendar navigation state
  const [viewYear, setViewYear] = useState(currentDate?.getFullYear() ?? new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(currentDate?.getMonth() ?? new Date().getMonth())

  // Calculate calendar weeks
  const weeks = useMemo(
    () => buildCalendarMonth(viewYear, viewMonth),
    [viewYear, viewMonth]
  )

  // Is scheduling mode active?
  const isScheduled = value !== null

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    // Combine with current time or default
    const [hours, minutes] = currentTime.split(':').map(Number)
    const scheduledDate = setMinutes(setHours(date, hours), minutes)
    onChange(scheduledDate.toISOString())
  }

  // Handle time selection
  const handleTimeChange = (time: string) => {
    if (!currentDate) return

    const [hours, minutes] = time.split(':').map(Number)
    const newDate = setMinutes(setHours(currentDate, hours), minutes)
    onChange(newDate.toISOString())
  }

  // Handle clear / switch to draft
  const handleClear = () => {
    onChange(null)
  }

  // Navigate months
  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  return (
    <div className="space-y-3">
      {/* Mode selection */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={!isScheduled ? 'default' : 'outline'}
          size="sm"
          onClick={handleClear}
          className="flex-1"
        >
          Salveaza ca ciorna
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={isScheduled ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
            >
              <CalendarIcon className="size-4" />
              Programeaza
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              {/* Month/year navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-1 hover:bg-muted rounded"
                >
                  &lt;
                </button>
                <span className="font-medium">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-1 hover:bg-muted rounded"
                >
                  &gt;
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS_OF_WEEK.map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs text-muted-foreground font-medium py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {weeks.flat().map((date, i) => {
                  if (!date) {
                    return <div key={`empty-${i}`} className="h-8" />
                  }

                  const isDisabled = !isAfter(date, addDays(minDate, -1))
                  const isSelected =
                    currentDate &&
                    date.toDateString() === currentDate.toDateString()

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled}
                      className={cn(
                        'h-8 w-8 rounded text-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSelected && 'bg-accent text-accent-foreground',
                        !isSelected && !isDisabled && 'hover:bg-muted',
                        isDisabled && 'text-muted-foreground/40 cursor-not-allowed'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>

              {/* Time picker */}
              {currentDate && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <Select value={currentTime} onValueChange={handleTimeChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Display selected schedule */}
      {isScheduled && currentDate && (
        <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
          <span className="text-sm">
            Programat pentru:{' '}
            <span className="font-medium">
              {format(currentDate, "d MMMM yyyy 'la' HH:mm", { locale: ro })}
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="size-7"
          >
            <X className="size-4" />
            <span className="sr-only">Anuleaza programarea</span>
          </Button>
        </div>
      )}
    </div>
  )
}
