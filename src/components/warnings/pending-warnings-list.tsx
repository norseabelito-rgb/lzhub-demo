'use client'

import { useMemo, useEffect } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWarningStore } from '@/lib/warnings/warning-store'
import {
  type Warning,
  VIOLATION_CATEGORY_LABELS,
  DISCIPLINE_LEVEL_LABELS,
} from '@/lib/warnings'

export interface PendingWarningsListProps {
  /** Filter by specific employee ID (optional, shows all if undefined) */
  employeeId?: string
  /** Callback when a warning is selected */
  onSelectWarning: (warning: Warning) => void
  /** Show employee name in list items (default: true) */
  showEmployeeName?: boolean
  /** Additional CSS classes */
  className?: string
}

/** Get badge classes for discipline level */
function getLevelBadgeClasses(level: Warning['level']): string {
  switch (level) {
    case 'verbal':
      return 'bg-accent text-accent-foreground'
    case 'written':
      return 'bg-amber-500 text-white'
    case 'final':
      return 'bg-orange-500 text-white'
    case 'termination':
      return 'bg-destructive text-destructive-foreground'
  }
}

/**
 * List of warnings awaiting acknowledgment
 * Shows pending warnings for a specific employee or all employees
 */
export function PendingWarningsList({
  employeeId,
  onSelectWarning,
  showEmployeeName = true,
  className,
}: PendingWarningsListProps) {
  // Get pending warnings from store
  const getPendingAcknowledgments = useWarningStore((s) => s.getPendingAcknowledgments)
  const getAllPendingWarnings = useWarningStore((s) => s.getAllPendingWarnings)
  const fetchWarnings = useWarningStore((s) => s.fetchWarnings)
  const warnings = useWarningStore((s) => s.warnings)

  // Fetch warnings if not loaded yet
  useEffect(() => {
    if (warnings.length === 0) {
      fetchWarnings()
    }
  }, [warnings.length, fetchWarnings])

  // Fetch and sort warnings
  const pendingWarnings = useMemo(() => {
    const warnings = employeeId
      ? getPendingAcknowledgments(employeeId)
      : getAllPendingWarnings()

    // Sort by createdAt descending (newest first)
    return [...warnings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [employeeId, getPendingAcknowledgments, getAllPendingWarnings])

  // Empty state
  if (pendingWarnings.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            Nu exista avertismente in asteptare
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Toate avertismentele au fost confirmate
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {pendingWarnings.map((warning) => (
          <Card
            key={warning.id}
            className="cursor-pointer transition-colors hover:bg-accent/5"
            onClick={() => onSelectWarning(warning)}
          >
            <CardContent className="p-4">
              {/* First row: Employee name (if shown) and badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {showEmployeeName && (
                  <span className="font-medium text-foreground">
                    {warning.employeeName}
                  </span>
                )}
                <Badge className={getLevelBadgeClasses(warning.level)}>
                  {DISCIPLINE_LEVEL_LABELS[warning.level]}
                </Badge>
                <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                  Asteapta confirmare
                </Badge>
              </div>

              {/* Second row: Category and date */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{VIOLATION_CATEGORY_LABELS[warning.category]}</span>
                <span className="text-xs">|</span>
                <span>
                  {format(warning.incidentDate, 'd MMM yyyy', { locale: ro })}
                </span>
              </div>

              {/* Third row: Time since issued */}
              <div className="mt-2 text-xs text-muted-foreground">
                Emis {formatDistanceToNow(warning.createdAt, { addSuffix: true, locale: ro })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground text-center">
        {pendingWarnings.length} avertisment{pendingWarnings.length !== 1 ? 'e' : ''} in asteptare
      </div>
    </div>
  )
}
