'use client'

import { useAuth } from '@/lib/auth'
import { StatsCard } from './stats-card'
import { TodayTasks } from './today-tasks'
import { QuickActions } from './quick-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  EMPLOYEE_STATS,
  EMPLOYEE_TODAY_TASKS,
  EMPLOYEE_QUICK_ACTIONS,
} from '@/lib/mock-data/dashboard'

export function EmployeeDashboard() {
  const { user } = useAuth()

  // Calculate progress for tasks
  const completedTasks = EMPLOYEE_TODAY_TASKS.filter((t) => t.completed).length
  const totalTasks = EMPLOYEE_TODAY_TASKS.length
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

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

      {/* Progress card */}
      <Card className="border-glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">Progresul tau azi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Task-uri completate</span>
              <span className="font-medium">
                {completedTasks} / {totalTasks}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EMPLOYEE_STATS.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's tasks */}
        <TodayTasks tasks={EMPLOYEE_TODAY_TASKS} title="Checklisturi de azi" />

        {/* Quick actions */}
        <QuickActions actions={EMPLOYEE_QUICK_ACTIONS} />
      </div>
    </div>
  )
}
