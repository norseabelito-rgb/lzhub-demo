'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { StatsCard } from './stats-card'
import { QuickActions } from './quick-actions'
import {
  useDashboardStore,
  EMPLOYEE_QUICK_ACTIONS,
} from '@/lib/dashboard'

export function EmployeeDashboard() {
  const { user } = useAuth()
  const { stats, isLoadingStats, fetchStats } = useDashboardStore()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-glow text-primary">
          Buna ziua, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Iata task-urile tale pentru azi
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingStats && stats.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-4">
            Se incarca statisticile...
          </p>
        ) : (
          stats.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))
        )}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <QuickActions actions={EMPLOYEE_QUICK_ACTIONS} />
      </div>
    </div>
  )
}
