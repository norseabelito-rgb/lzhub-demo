'use client'

import { Check, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { ChecklistItem, ItemCompletion } from '@/lib/checklist'

interface ChecklistItemRowProps {
  item: ChecklistItem
  completion?: ItemCompletion
  disabled: boolean
  disabledReason?: string
  onCheck: (checked: boolean) => void
}

/**
 * Individual checklist item with checkbox and metadata
 * Mobile-first, touch-friendly (min-h-12 for touch targets)
 */
export function ChecklistItemRow({
  item,
  completion,
  disabled,
  disabledReason,
  onCheck,
}: ChecklistItemRowProps) {
  const isChecked = !!completion
  const wasLate = completion?.wasLate ?? false

  const handleChange = () => {
    if (disabled) return
    onCheck(!isChecked)
  }

  return (
    <div
      className={cn(
        'flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
        disabled && 'cursor-not-allowed opacity-50',
        isChecked && !wasLate && 'border-success/50 bg-success/10',
        isChecked && wasLate && 'border-warning/50 bg-warning/10',
        !isChecked && !disabled && 'hover:bg-accent/50'
      )}
      role="checkbox"
      aria-checked={isChecked}
      aria-disabled={disabled}
      title={disabled ? disabledReason : undefined}
    >
      {/* Checkbox area - large touch target */}
      <button
        type="button"
        onClick={handleChange}
        disabled={disabled}
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded border-2 transition-colors',
          isChecked && !wasLate && 'border-success bg-success text-success-foreground',
          isChecked && wasLate && 'border-warning bg-warning text-warning-foreground',
          !isChecked && !disabled && 'border-muted-foreground hover:border-primary',
          !isChecked && disabled && 'border-muted',
          disabled && 'cursor-not-allowed'
        )}
        aria-label={isChecked ? 'Debifa elementul' : 'Bifeaza elementul'}
      >
        {isChecked && <Check className="size-4" strokeWidth={3} />}
      </button>

      {/* Item text */}
      <span
        className={cn(
          'flex-1 text-sm',
          isChecked && 'text-muted-foreground line-through',
          !item.required && 'text-muted-foreground'
        )}
      >
        {item.text}
        {!item.required && (
          <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
        )}
      </span>

      {/* Completion info - right side */}
      {isChecked && completion && (
        <div className="flex shrink-0 items-center gap-2">
          {/* Late badge */}
          {wasLate && (
            <span className="flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
              <AlertTriangle className="size-3" />
              Tarziu
            </span>
          )}

          {/* Completion time */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {format(new Date(completion.completedAt), 'HH:mm', { locale: ro })}
          </span>
        </div>
      )}
    </div>
  )
}
