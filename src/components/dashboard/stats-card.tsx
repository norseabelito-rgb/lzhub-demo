import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DashboardStats } from '@/lib/mock-data/dashboard'

interface StatsCardProps {
  stat: DashboardStats
}

export function StatsCard({ stat }: StatsCardProps) {
  return (
    <Card className="hover:border-primary/50 hover:glow-subtle transition-all duration-200">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <p className="mt-1 text-2xl font-bold">{stat.value}</p>
        {stat.change && (
          <p
            className={cn(
              'mt-1 text-xs',
              stat.changeType === 'positive' && 'text-green-500',
              stat.changeType === 'negative' && 'text-red-500',
              stat.changeType === 'neutral' && 'text-muted-foreground'
            )}
          >
            {stat.change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
