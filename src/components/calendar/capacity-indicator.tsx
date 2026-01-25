'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useReservationStore } from '@/lib/calendar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ============================================================================
// Types
// ============================================================================

interface CapacityIndicatorProps {
  /** Current number of booked spots */
  current: number
  /** Maximum capacity for the slot */
  max: number
  /** Display mode */
  mode: 'bar' | 'badge' | 'mini'
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get capacity color based on percentage and thresholds
 */
function getCapacityColor(
  percentage: number,
  warningThreshold: number,
  criticalThreshold: number
): 'green' | 'yellow' | 'red' {
  if (percentage >= criticalThreshold) return 'red'
  if (percentage >= warningThreshold) return 'yellow'
  return 'green'
}

/**
 * Get Tailwind classes for each color state
 */
function getColorClasses(color: 'green' | 'yellow' | 'red') {
  switch (color) {
    case 'red':
      return {
        bg: 'bg-destructive',
        bgLight: 'bg-destructive/20',
        text: 'text-destructive',
        border: 'border-destructive',
        ring: 'ring-destructive',
      }
    case 'yellow':
      return {
        bg: 'bg-warning',
        bgLight: 'bg-warning/20',
        text: 'text-warning',
        border: 'border-warning',
        ring: 'ring-warning',
      }
    default:
      return {
        bg: 'bg-green-500',
        bgLight: 'bg-green-500/20',
        text: 'text-green-500',
        border: 'border-green-500',
        ring: 'ring-green-500',
      }
  }
}

// ============================================================================
// Component
// ============================================================================

export function CapacityIndicator({
  current,
  max,
  mode,
  className,
}: CapacityIndicatorProps) {
  const capacitySettings = useReservationStore((state) => state.capacitySettings)

  // Calculate percentage and color
  const { percentage, color, colorClasses, isCritical } = useMemo(() => {
    const pct = max > 0 ? current / max : 0
    const clr = getCapacityColor(
      pct,
      capacitySettings.warningThreshold,
      capacitySettings.criticalThreshold
    )
    return {
      percentage: pct,
      color: clr,
      colorClasses: getColorClasses(clr),
      isCritical: pct >= capacitySettings.criticalThreshold,
    }
  }, [current, max, capacitySettings])

  // Tooltip content for all modes
  const tooltipContent = `${current} / ${max} persoane`

  // Bar mode: Horizontal progress bar with text
  if (mode === 'bar') {
    return (
      <div className={cn('space-y-1', className)}>
        {/* Progress bar container */}
        <div className={cn('h-2 w-full rounded-full', colorClasses.bgLight)}>
          {/* Progress bar fill */}
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              colorClasses.bg,
              isCritical && 'animate-pulse'
            )}
            style={{ width: `${Math.min(percentage * 100, 100)}%` }}
          />
        </div>
        {/* Text label */}
        <div className={cn('text-xs', colorClasses.text)}>
          {current} / {max}
        </div>
      </div>
    )
  }

  // Badge mode: Small circular badge with tooltip
  if (mode === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-medium',
                colorClasses.bg,
                'text-white',
                isCritical && 'animate-pulse',
                className
              )}
            >
              {current}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Mini mode: Just a colored dot with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-block size-2.5 rounded-full',
              colorClasses.bg,
              isCritical && 'animate-pulse',
              className
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
