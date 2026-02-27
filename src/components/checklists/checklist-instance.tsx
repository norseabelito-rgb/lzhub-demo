'use client'

import { useMemo, useState } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { ro } from 'date-fns/locale'
import { CheckCircle2, Clock, AlertTriangle, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ChecklistItemRow } from './checklist-item'
import { ChecklistProgress } from './checklist-progress'
import {
  useChecklistStore,
  isWithinTimeWindow,
  type ChecklistInstance,
  type ChecklistTemplate,
} from '@/lib/checklist'
import type { User as AuthUser } from '@/lib/auth'

interface ChecklistInstanceViewProps {
  instance: ChecklistInstance
  template: ChecklistTemplate
  currentUser: AuthUser
}

/**
 * Full page component for completing a checklist
 * Handles time window validation, item checking, and completion display
 */
export function ChecklistInstanceView({
  instance,
  template,
  currentUser,
}: ChecklistInstanceViewProps) {
  const { checkItem, uncheckItem } = useChecklistStore()
  const [checkingItemId, setCheckingItemId] = useState<string | null>(null)

  // Check time window status
  const timeStatus = useMemo(() => {
    return isWithinTimeWindow(template)
  }, [template])

  // Calculate completion stats
  const completedCount = instance.completions.length
  const totalCount = instance.items.length
  const requiredItems = instance.items.filter((i) => i.required)
  const completedRequired = requiredItems.filter((i) =>
    instance.completions.some((c) => c.itemId === i.id)
  )
  const isFullyComplete = completedRequired.length === requiredItems.length

  // Get late completions for summary
  const lateCompletions = instance.completions.filter((c) => c.wasLate)

  // Format time window display
  const timeWindowDisplay = `${String(template.timeWindow.startHour).padStart(2, '0')}:${String(template.timeWindow.startMinute).padStart(2, '0')} - ${String(template.timeWindow.endHour).padStart(2, '0')}:${String(template.timeWindow.endMinute).padStart(2, '0')}`

  // Calculate minutes past window if late
  const getMinutesPastWindow = () => {
    const now = new Date()
    const today = new Date()
    today.setHours(template.timeWindow.endHour, template.timeWindow.endMinute, 0, 0)
    return differenceInMinutes(now, today)
  }

  const handleItemCheck = async (itemId: string, checked: boolean) => {
    setCheckingItemId(itemId)
    try {
      if (checked) {
        const result = await checkItem(instance.id, itemId, currentUser.id, currentUser.name)

        if (result.success) {
          if (result.wasLate) {
            toast.warning('Element bifat - completare tarzie', {
              description: 'Aceasta actiune a fost inregistrata ca tarzie in audit log.',
            })
          } else {
            toast.success('Element completat')
          }
        } else {
          toast.error('Nu se poate bifa', {
            description: result.error,
          })
        }
      } else {
        await uncheckItem(instance.id, itemId, currentUser.id, currentUser.name)
        toast.info('Element debifat')
      }
    } finally {
      setCheckingItemId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="mt-1 space-y-1">
                <span className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  {format(new Date(instance.date), "d MMMM yyyy", { locale: ro })}
                </span>
                <span className="flex items-center gap-2">
                  <User className="size-4" />
                  {currentUser.name}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Fereastra: {timeWindowDisplay}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChecklistProgress
            completed={completedCount}
            total={totalCount}
            status={instance.status}
          />
        </CardContent>
      </Card>

      {/* Time Window Banner */}
      {!isFullyComplete && (
        <TimeWindowBanner
          isAllowed={timeStatus.allowed}
          isLate={timeStatus.isLate}
          allowLateCompletion={template.timeWindow.allowLateCompletion}
          minutesPast={timeStatus.isLate ? getMinutesPastWindow() : 0}
        />
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Elemente de completat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {instance.items.map((item) => {
            const completion = instance.completions.find((c) => c.itemId === item.id)
            const isDisabled = (!timeStatus.allowed && !completion) || checkingItemId === item.id

            return (
              <ChecklistItemRow
                key={item.id}
                item={item}
                completion={completion}
                disabled={isDisabled}
                disabledReason={checkingItemId === item.id ? 'Se proceseaza...' : timeStatus.reason}
                onCheck={(checked) => handleItemCheck(item.id, checked)}
              />
            )
          })}
        </CardContent>
      </Card>

      {/* Completion Summary - shown when all required items checked */}
      {isFullyComplete && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-8 text-success" />
              <div>
                <h3 className="font-semibold text-success">Checklist completat!</h3>
                {instance.completedAt && (
                  <p className="text-sm text-muted-foreground">
                    Completat la{' '}
                    {format(new Date(instance.completedAt), 'HH:mm', { locale: ro })}
                  </p>
                )}
              </div>
            </div>

            {/* Late completions warning */}
            {lateCompletions.length > 0 && (
              <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-warning">
                  <AlertTriangle className="size-4" />
                  {lateCompletions.length} element(e) completat(e) tarziu
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {lateCompletions.map((c) => {
                    const item = instance.items.find((i) => i.id === c.itemId)
                    return (
                      <li key={c.itemId}>
                        - {item?.text || 'Element necunoscut'}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Time window banner sub-component
function TimeWindowBanner({
  isAllowed,
  isLate,
  allowLateCompletion,
  minutesPast,
}: {
  isAllowed: boolean
  isLate: boolean
  allowLateCompletion: boolean
  minutesPast: number
}) {
  if (isAllowed && !isLate) {
    // Within time window - green
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-success">
        <CheckCircle2 className="size-5" />
        <span className="text-sm font-medium">Esti in fereastra de completare</span>
      </div>
    )
  }

  if (isAllowed && isLate) {
    // Late but allowed - yellow warning
    return (
      <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-warning">
        <AlertTriangle className="size-5" />
        <span className="text-sm font-medium">
          Ai depasit fereastra cu {minutesPast} minute - completarea va fi marcata ca tarzie
        </span>
      </div>
    )
  }

  // Not allowed - red blocked
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
      <AlertTriangle className="size-5" />
      <span className="text-sm font-medium">
        Fereastra de completare a expirat
        {!allowLateCompletion && ' - nu se mai pot bifa elemente noi'}
      </span>
    </div>
  )
}
