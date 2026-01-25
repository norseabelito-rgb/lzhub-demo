'use client'

import { useMemo } from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ChecklistInstance, ChecklistTemplate } from '@/lib/checklist'
import { cn } from '@/lib/utils'

interface MyChecklistsProps {
  instances: ChecklistInstance[]
  templates: ChecklistTemplate[]
  onSelect: (id: string) => void
}

/**
 * List of assigned checklists for current user
 * Groups by status: In progres -> In asteptare -> Completate
 */
export function MyChecklists({ instances, templates, onSelect }: MyChecklistsProps) {
  // Group instances by status for ordering
  const groupedInstances = useMemo(() => {
    const groups = {
      in_progress: [] as ChecklistInstance[],
      pending: [] as ChecklistInstance[],
      overdue: [] as ChecklistInstance[],
      completed: [] as ChecklistInstance[],
    }

    instances.forEach((instance) => {
      groups[instance.status].push(instance)
    })

    return groups
  }, [instances])

  // Get template for an instance
  const getTemplate = (instance: ChecklistInstance) => {
    return templates.find((t) => t.id === instance.templateId)
  }

  // Render a section of instances
  const renderSection = (
    title: string,
    items: ChecklistInstance[],
    emptyMessage?: string
  ) => {
    if (items.length === 0 && !emptyMessage) return null

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground/70 italic">{emptyMessage}</p>
        ) : (
          <div className="space-y-2">
            {items.map((instance) => (
              <ChecklistCard
                key={instance.id}
                instance={instance}
                template={getTemplate(instance)}
                onSelect={() => onSelect(instance.id)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Check if all lists are empty
  const totalInstances =
    groupedInstances.in_progress.length +
    groupedInstances.pending.length +
    groupedInstances.overdue.length +
    groupedInstances.completed.length

  if (totalInstances === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Clock className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-medium">Nu ai checklisturi asignate pentru azi</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Checklisturile vor aparea aici cand sunt asignate
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overdue items first if any */}
      {groupedInstances.overdue.length > 0 &&
        renderSection('Depasit termen', groupedInstances.overdue)}

      {/* In progress */}
      {renderSection('In progres', groupedInstances.in_progress)}

      {/* Pending */}
      {renderSection('In asteptare', groupedInstances.pending)}

      {/* Completed - collapsed by default */}
      {groupedInstances.completed.length > 0 &&
        renderSection('Completate azi', groupedInstances.completed)}
    </div>
  )
}

// Individual checklist card
function ChecklistCard({
  instance,
  template,
  onSelect,
}: {
  instance: ChecklistInstance
  template?: ChecklistTemplate
  onSelect: () => void
}) {
  const completedCount = instance.completions.length
  const totalCount = instance.items.length

  // Format time window
  const timeWindow = template?.timeWindow
  const timeWindowDisplay = timeWindow
    ? `${String(timeWindow.startHour).padStart(2, '0')}:${String(timeWindow.startMinute).padStart(2, '0')} - ${String(timeWindow.endHour).padStart(2, '0')}:${String(timeWindow.endMinute).padStart(2, '0')}`
    : null

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
        instance.status === 'overdue' && 'border-destructive/50',
        instance.status === 'completed' && 'border-success/30 opacity-75'
      )}
      onClick={onSelect}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{instance.templateName}</h4>
            {instance.status === 'overdue' && (
              <Badge variant="destructive" className="shrink-0">
                Depasit
              </Badge>
            )}
            {instance.status === 'completed' && (
              <Badge className="shrink-0 bg-success/20 text-success border-success/30">
                Completat
              </Badge>
            )}
          </div>

          {/* Time window info */}
          {timeWindowDisplay && (
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-3" />
              <span>{timeWindowDisplay}</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completedCount}/{totalCount}
              </span>
              <span>
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full transition-all',
                  instance.status === 'completed' && 'bg-success',
                  instance.status === 'overdue' && 'bg-destructive',
                  instance.status === 'in_progress' && 'bg-primary',
                  instance.status === 'pending' && 'bg-muted-foreground'
                )}
                style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </CardContent>
    </Card>
  )
}
