'use client'

import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

interface ConflictWarningProps {
  reason: string
  severity: 'warning' | 'critical'
}

// ============================================================================
// Component
// ============================================================================

/**
 * Conflict warning component for reservation form
 * Displays yellow warning for 80%+ capacity, red for 100%+ (critical)
 */
export function ConflictWarning({ reason, severity }: ConflictWarningProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        severity === 'critical'
          ? 'border-destructive/50 bg-destructive/10 text-destructive'
          : 'border-warning/50 bg-warning/10 text-warning'
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle
        className={cn(
          'size-5 shrink-0',
          severity === 'critical' ? 'text-destructive' : 'text-warning'
        )}
      />
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {severity === 'critical' ? 'Avertizare Critica' : 'Atentie'}
        </p>
        <p className={cn(
          'text-sm',
          severity === 'critical' ? 'text-destructive/80' : 'text-warning/80'
        )}>
          {reason}
        </p>
      </div>
    </div>
  )
}
