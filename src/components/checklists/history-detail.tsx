'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ChecklistInstance, ChecklistTemplate } from '@/lib/checklist'

// ============================================================================
// Types
// ============================================================================

interface HistoryDetailProps {
  date: Date
  instances: ChecklistInstance[]
  templates: ChecklistTemplate[]
}

// Status configuration
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  completed: {
    label: 'Completat',
    className: 'bg-success/20 text-success border-success/30',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'In progres',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Clock,
  },
  pending: {
    label: 'In asteptare',
    className: 'bg-muted text-muted-foreground',
    icon: Clock,
  },
  overdue: {
    label: 'Depasit',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    icon: AlertTriangle,
  },
}

// ============================================================================
// Component
// ============================================================================

export function HistoryDetail({ date, instances, templates }: HistoryDetailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Calculate summary stats
  const stats = {
    total: instances.length,
    completed: instances.filter((i) => i.status === 'completed').length,
    overdue: instances.filter((i) => i.status === 'overdue').length,
    inProgress: instances.filter((i) => i.status === 'in_progress').length,
    pending: instances.filter((i) => i.status === 'pending').length,
  }

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedId((current) => (current === id ? null : id))
  }

  // Get template for instance
  const getTemplate = (templateId: string) => {
    return templates.find((t) => t.id === templateId)
  }

  // Empty state
  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <CalendarDays className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-medium">Nu exista checklisturi pentru aceasta data</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecteaza o alta data din calendar
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Date header */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold capitalize">
          {format(date, "EEEE, d MMMM yyyy", { locale: ro })}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats.completed === stats.total ? (
            <span className="text-success">
              Toate cele {stats.total} checklisturi completate
            </span>
          ) : (
            <>
              {stats.completed} din {stats.total} checklisturi completate
              {stats.overdue > 0 && (
                <span className="text-destructive">, {stats.overdue} depasite</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Instances list */}
      <div className="space-y-3">
        {instances.map((instance) => {
          const isExpanded = expandedId === instance.id
          const statusConfig = STATUS_CONFIG[instance.status]
          const template = getTemplate(instance.templateId)
          const completedCount = instance.completions.length
          const totalCount = instance.items.length
          const StatusIcon = statusConfig.icon

          // Check for late completions
          const lateCompletions = instance.completions.filter((c) => c.wasLate)

          return (
            <Card key={instance.id} className="overflow-hidden">
              {/* Instance header - clickable to expand */}
              <button
                className="w-full text-left"
                onClick={() => toggleExpand(instance.id)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base truncate">
                          {instance.templateName}
                        </CardTitle>
                        <Badge variant="outline" className={statusConfig.className}>
                          <StatusIcon className="mr-1 size-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Assigned user and completion info */}
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="size-3" />
                          <span>{instance.assignedTo}</span>
                        </div>
                        {instance.completedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>
                              Completat la {format(new Date(instance.completedAt), 'HH:mm')}
                            </span>
                          </div>
                        )}
                        <span>
                          {completedCount}/{totalCount} elemente
                        </span>
                      </div>

                      {/* Late completions warning */}
                      {lateCompletions.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
                          <AlertTriangle className="size-3" />
                          <span>
                            {lateCompletions.length} element(e) completat(e) tarziu
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expand/collapse indicator */}
                    <div className="shrink-0 text-muted-foreground">
                      {isExpanded ? (
                        <ChevronDown className="size-5" />
                      ) : (
                        <ChevronRight className="size-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </button>

              {/* Expanded content - items list */}
              {isExpanded && (
                <CardContent className="border-t px-4 py-3">
                  <div className="space-y-2">
                    {instance.items.map((item) => {
                      const completion = instance.completions.find(
                        (c) => c.itemId === item.id
                      )
                      const isCompleted = !!completion
                      const isLate = completion?.wasLate

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-start gap-3 rounded-md p-2',
                            isCompleted && 'bg-success/5',
                            isLate && 'bg-destructive/5'
                          )}
                        >
                          {/* Completion status icon */}
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2
                                className={cn(
                                  'size-5',
                                  isLate ? 'text-destructive' : 'text-success'
                                )}
                              />
                            ) : (
                              <XCircle className="size-5 text-muted-foreground" />
                            )}
                          </div>

                          {/* Item details */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'text-sm',
                                !isCompleted && 'text-muted-foreground'
                              )}
                            >
                              {item.text}
                              {item.required && (
                                <span className="ml-1 text-destructive">*</span>
                              )}
                            </p>

                            {/* Completion info */}
                            {completion && (
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  {format(new Date(completion.completedAt), 'HH:mm')}
                                </span>
                                <span>-</span>
                                <span>{completion.completedBy}</span>
                                {isLate && (
                                  <Badge
                                    variant="outline"
                                    className="bg-destructive/20 text-destructive border-destructive/30 text-xs"
                                  >
                                    Tarziu
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Time window info if available */}
                  {template?.timeWindow && (
                    <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-4" />
                        <span>
                          Fereastra de completare:{' '}
                          {String(template.timeWindow.startHour).padStart(2, '0')}:
                          {String(template.timeWindow.startMinute).padStart(2, '0')} -{' '}
                          {String(template.timeWindow.endHour).padStart(2, '0')}:
                          {String(template.timeWindow.endMinute).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
