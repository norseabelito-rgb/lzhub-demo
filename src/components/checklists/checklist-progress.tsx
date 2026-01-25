'use client'

import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { ChecklistStatus } from '@/lib/checklist'

interface ChecklistProgressProps {
  completed: number
  total: number
  status: ChecklistStatus
  className?: string
}

const statusConfig: Record<
  ChecklistStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
  pending: {
    label: 'In asteptare',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground',
  },
  in_progress: {
    label: 'In progres',
    variant: 'default',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  completed: {
    label: 'Completat',
    variant: 'default',
    className: 'bg-success/20 text-success border-success/30',
  },
  overdue: {
    label: 'Depasit',
    variant: 'destructive',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
}

/**
 * Checklist progress display with bar, text, and status badge
 */
export function ChecklistProgress({
  completed,
  total,
  status,
  className,
}: ChecklistProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const config = statusConfig[status]

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar */}
      <Progress
        value={percentage}
        className={cn(
          'h-2',
          status === 'completed' && '[&>[data-slot=progress-indicator]]:bg-success',
          status === 'overdue' && '[&>[data-slot=progress-indicator]]:bg-destructive',
          status === 'in_progress' && '[&>[data-slot=progress-indicator]]:bg-blue-500'
        )}
      />

      {/* Text and badge row */}
      <div className="flex items-center justify-between gap-2">
        {/* Progress text */}
        <span className="text-sm text-muted-foreground">
          {completed}/{total} completate
        </span>

        {/* Status badge and percentage */}
        <div className="flex items-center gap-2">
          {/* Percentage badge */}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              percentage === 100 && 'bg-success/20 text-success',
              percentage > 0 && percentage < 100 && 'bg-muted text-muted-foreground',
              percentage === 0 && 'bg-muted text-muted-foreground'
            )}
          >
            {percentage}%
          </span>

          {/* Status badge */}
          <Badge variant="outline" className={cn('border', config.className)}>
            {config.label}
          </Badge>
        </div>
      </div>
    </div>
  )
}
