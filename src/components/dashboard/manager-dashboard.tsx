'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { StatsCard } from './stats-card'
import { QuickActions } from './quick-actions'
import { RecentActivity } from './recent-activity'
import {
  useDashboardStore,
  MANAGER_QUICK_ACTIONS,
} from '@/lib/dashboard'

export function ManagerDashboard() {
  const { user } = useAuth()
  const { stats, activities, isLoadingStats, isLoadingActivity, fetchStats, fetchActivity } =
    useDashboardStore()

  useEffect(() => {
    fetchStats()
    fetchActivity()
  }, [fetchStats, fetchActivity])

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-glow text-primary">
          Buna ziua, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Iata ce se intampla azi la LaserZone
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions - takes full width since tasks are not available from API yet */}
        <div className="lg:col-span-3">
          <QuickActions actions={MANAGER_QUICK_ACTIONS} />
        </div>
      </div>

      {/* Recent activity - full width */}
      {isLoadingActivity && activities.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          Se incarca activitatea recenta...
        </p>
      ) : (
        <RecentActivity activities={activities} />
      )}
    </div>
  )
}
