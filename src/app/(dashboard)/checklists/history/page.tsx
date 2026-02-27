'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, startOfWeek, subDays } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useChecklistStore } from '@/lib/checklist'
import { Button } from '@/components/ui/button'
import { HistoryCalendar } from '@/components/checklists/history-calendar'
import { HistoryDetail } from '@/components/checklists/history-detail'

/**
 * Checklist history page (CHKL-07)
 * Browse completed checklists by date
 * All authenticated users can access
 */
export default function HistoryPage() {
  const { user, isManager } = useAuth()
  const { instances, templates, isLoading, fetchTemplates, fetchInstances } = useChecklistStore()

  // Fetch data on mount
  useEffect(() => {
    fetchTemplates()
    fetchInstances()
  }, [fetchTemplates, fetchInstances])

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [showAllUsers, setShowAllUsers] = useState(isManager)

  // Filter instances based on user role and preference
  const filteredInstances = useMemo(() => {
    if (isManager && showAllUsers) {
      return instances
    }
    return instances.filter((i) => i.assignedTo === user?.id)
  }, [instances, isManager, showAllUsers, user?.id])

  // Build instancesByDate map for calendar
  const instancesByDate = useMemo(() => {
    const map = new Map<string, typeof instances>()
    filteredInstances.forEach((instance) => {
      const dateKey = instance.date
      const existing = map.get(dateKey) || []
      map.set(dateKey, [...existing, instance])
    })
    return map
  }, [filteredInstances])

  // Get instances for selected date
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')
  const instancesForSelectedDate = instancesByDate.get(selectedDateKey) || []

  // Quick date filters
  const handleQuickFilter = (filter: 'today' | 'yesterday' | 'week') => {
    const today = new Date()
    let targetDate: Date

    switch (filter) {
      case 'today':
        targetDate = today
        break
      case 'yesterday':
        targetDate = subDays(today, 1)
        break
      case 'week':
        targetDate = startOfWeek(today, { weekStartsOn: 1 })
        break
    }

    setSelectedDate(targetDate)
    setCurrentMonth(targetDate)
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se incarca...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Inapoi</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Istoric Checklisturi</h1>
            <p className="text-muted-foreground">
              Ce s-a facut marti? Verifica aici.
            </p>
          </div>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('today')}
        >
          Azi
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('yesterday')}
        >
          Ieri
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('week')}
        >
          Saptamana aceasta
        </Button>

        {/* Manager toggle */}
        {isManager && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant={showAllUsers ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAllUsers(true)}
            >
              Arata toate
            </Button>
            <Button
              variant={!showAllUsers ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAllUsers(false)}
            >
              Doar ale mele
            </Button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && instances.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Se incarca istoricul...</span>
        </div>
      )}

      {/* Main content - two column layout */}
      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Calendar */}
          <div className="order-1 lg:order-none">
            <HistoryCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              instancesByDate={instancesByDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>

          {/* Details */}
          <div className="order-2 lg:order-none">
            <HistoryDetail
              date={selectedDate}
              instances={instancesForSelectedDate}
              templates={templates}
            />
          </div>
        </div>
      )}
    </div>
  )
}
