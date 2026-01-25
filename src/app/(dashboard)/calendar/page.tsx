'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { format, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from 'date-fns'
import { useReservationStore, type Reservation } from '@/lib/calendar'
import {
  CalendarHeader,
  DayView,
  WeekView,
  MonthView,
  ReservationModal,
  type CalendarView,
} from '@/components/calendar'

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'calendar-view-preference'
const DEFAULT_VIEW: CalendarView = 'day'

// Debounce delay for navigation (prevent rapid clicking)
const NAVIGATION_DEBOUNCE_MS = 100

// ============================================================================
// Custom Hook for localStorage with hydration support
// ============================================================================

function getInitialView(key: string, defaultValue: CalendarView): CalendarView {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(key)
  if (stored && ['day', 'week', 'month'].includes(stored)) {
    return stored as CalendarView
  }
  return defaultValue
}

function useLocalStorageView(key: string, defaultValue: CalendarView) {
  // Use lazy initializer to read from localStorage on first render (client only)
  const [value, setValue] = useState<CalendarView>(() =>
    getInitialView(key, defaultValue)
  )

  // Persist to localStorage when value changes
  const setPersistedValue = useCallback(
    (newValue: CalendarView) => {
      setValue(newValue)
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, newValue)
      }
    },
    [key]
  )

  return [value, setPersistedValue] as const
}

// ============================================================================
// Component
// ============================================================================

export default function CalendarPage() {
  // ---- View state with localStorage persistence ----
  const [currentView, setCurrentView] = useLocalStorageView(
    STORAGE_KEY,
    DEFAULT_VIEW
  )
  const [currentDate, setCurrentDate] = useState(() => new Date())

  // Modal state (prepared for 03-03 integration)
  const [showModal, setShowModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [initialDate, setInitialDate] = useState<Date | null>(null)
  const [initialTime, setInitialTime] = useState<string | null>(null)

  // Debounce ref for navigation
  const lastNavigationRef = useRef<number>(0)

  // ---- Store ----
  const reservations = useReservationStore((state) => state.reservations)
  const getReservationsForDateRange = useReservationStore(
    (state) => state.getReservationsForDateRange
  )

  // ---- Debounced date navigation ----
  const handleDateChange = useCallback((date: Date) => {
    const now = Date.now()
    if (now - lastNavigationRef.current < NAVIGATION_DEBOUNCE_MS) {
      return
    }
    lastNavigationRef.current = now
    setCurrentDate(date)
  }, [])

  // ---- Filter reservations based on view ----
  const filteredReservations = useMemo(() => {
    switch (currentView) {
      case 'day': {
        const dateStr = format(currentDate, 'yyyy-MM-dd')
        return reservations.filter((r) => r.date === dateStr)
      }
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        return getReservationsForDateRange(
          format(weekStart, 'yyyy-MM-dd'),
          format(weekEnd, 'yyyy-MM-dd')
        )
      }
      case 'month': {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        // Include padding days from adjacent months
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
        return getReservationsForDateRange(
          format(calendarStart, 'yyyy-MM-dd'),
          format(calendarEnd, 'yyyy-MM-dd')
        )
      }
    }
  }, [currentDate, currentView, reservations, getReservationsForDateRange])

  // ---- Slot click handler (for new reservation) ----
  const handleSlotClick = useCallback((date: Date, time: string) => {
    setInitialDate(date)
    setInitialTime(time)
    setSelectedReservation(null)
    setShowModal(true)
  }, [])

  // ---- Reservation click handler (for edit) ----
  const handleReservationClick = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation)
    setInitialDate(null)
    setInitialTime(null)
    setShowModal(true)
  }, [])

  // ---- Day click from week/month view ----
  const handleDayClick = useCallback(
    (date: Date) => {
      setCurrentDate(date)
      setCurrentView('day')
    },
    [setCurrentView]
  )

  // ---- New reservation button ----
  const handleNewReservation = useCallback(() => {
    setInitialDate(currentDate)
    setInitialTime('10:00') // Default time
    setSelectedReservation(null)
    setShowModal(true)
  }, [currentDate])

  return (
    <div className="space-y-4">
      {/* Header with navigation and view switcher */}
      <CalendarHeader
        currentDate={currentDate}
        view={currentView}
        onDateChange={handleDateChange}
        onViewChange={setCurrentView}
        onNewReservation={handleNewReservation}
      />

      {/* Calendar view */}
      <div className="min-h-[calc(100vh-200px)]">
        {currentView === 'day' && (
          <DayView
            date={currentDate}
            reservations={filteredReservations}
            onSlotClick={handleSlotClick}
            onReservationClick={handleReservationClick}
          />
        )}

        {currentView === 'week' && (
          <WeekView
            weekStart={currentDate}
            reservations={filteredReservations}
            onSlotClick={handleSlotClick}
            onReservationClick={handleReservationClick}
            onDayClick={handleDayClick}
          />
        )}

        {currentView === 'month' && (
          <MonthView
            month={currentDate}
            reservations={filteredReservations}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        open={showModal}
        onOpenChange={setShowModal}
        reservation={selectedReservation}
        initialDate={initialDate ? format(initialDate, 'yyyy-MM-dd') : null}
        initialTime={initialTime}
      />
    </div>
  )
}
