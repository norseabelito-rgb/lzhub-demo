'use client'

import { useAuth } from '@/lib/auth'
import { ManagerDashboard } from '@/components/dashboard'
import { EmployeeDashboard } from '@/components/dashboard'

export default function DashboardPage() {
  const { user, isManager } = useAuth()

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se incarca...</p>
      </div>
    )
  }

  return isManager ? <ManagerDashboard /> : <EmployeeDashboard />
}
