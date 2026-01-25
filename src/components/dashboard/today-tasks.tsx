import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  CheckSquare,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Check,
} from 'lucide-react'
import type { TodayTask } from '@/lib/mock-data/dashboard'

interface TodayTasksProps {
  tasks: TodayTask[]
  title?: string
}

const typeIcons = {
  checklist: CheckSquare,
  onboarding: GraduationCap,
  reservation: Calendar,
  warning: AlertTriangle,
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
}

export function TodayTasks({ tasks, title = 'Task-uri de azi' }: TodayTasksProps) {
  const pendingTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  return (
    <Card className="hover:border-primary/30 transition-colors duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingTasks.length === 0 && completedTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Niciun task pentru azi
          </p>
        )}

        {pendingTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}

        {completedTasks.length > 0 && pendingTasks.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              COMPLETATE
            </p>
          </div>
        )}

        {completedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </CardContent>
    </Card>
  )
}

function TaskItem({ task }: { task: TodayTask }) {
  const Icon = typeIcons[task.type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3',
        task.completed && 'opacity-60'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          task.completed ? 'bg-green-500/10' : 'bg-primary/10'
        )}
      >
        {task.completed ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Icon className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'font-medium',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </p>
          {!task.completed && (
            <Badge
              variant="outline"
              className={cn('text-xs', priorityColors[task.priority])}
            >
              {task.priority === 'high'
                ? 'Urgent'
                : task.priority === 'medium'
                ? 'Normal'
                : 'Scazut'}
            </Badge>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        {task.dueTime && !task.completed && (
          <p className="mt-1 text-xs text-muted-foreground">
            Pana la {task.dueTime}
          </p>
        )}
      </div>
    </div>
  )
}
