import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckSquare,
  Calendar,
  GraduationCap,
  AlertTriangle,
  LogIn,
} from 'lucide-react'
import type { ActivityItem } from '@/lib/mock-data/dashboard'

interface RecentActivityProps {
  activities: ActivityItem[]
}

const typeIcons = {
  checklist: CheckSquare,
  reservation: Calendar,
  onboarding: GraduationCap,
  warning: AlertTriangle,
  login: LogIn,
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Activitate recenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground">Nicio activitate</p>
        )}

        {activities.map((activity) => {
          const Icon = typeIcons[activity.type]

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>{' '}
                  {activity.target && (
                    <span className="font-medium">{activity.target}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
