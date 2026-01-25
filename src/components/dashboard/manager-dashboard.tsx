'use client'

import { useAuth } from '@/lib/auth'
import { StatsCard } from './stats-card'
import { TodayTasks } from './today-tasks'
import { QuickActions } from './quick-actions'
import { RecentActivity } from './recent-activity'
import {
  MANAGER_STATS,
  MANAGER_TODAY_TASKS,
  MANAGER_QUICK_ACTIONS,
  RECENT_ACTIVITY,
} from '@/lib/mock-data/dashboard'

export function ManagerDashboard() {
  const { user } = useAuth()

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
        {MANAGER_STATS.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's tasks - takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <TodayTasks tasks={MANAGER_TODAY_TASKS} title="De facut azi" />
        </div>

        {/* Quick actions */}
        <div>
          <QuickActions actions={MANAGER_QUICK_ACTIONS} />
        </div>
      </div>

      {/* Recent activity - full width */}
      <RecentActivity activities={RECENT_ACTIVITY} />
    </div>
  )
}
