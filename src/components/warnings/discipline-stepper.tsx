'use client'

import { Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DISCIPLINE_LEVELS,
  DISCIPLINE_LEVEL_LABELS,
  type DisciplineLevel,
} from '@/lib/warnings'

export interface DisciplineStepperProps {
  /** Employee's current highest active discipline level (null if no warnings) */
  currentLevel: DisciplineLevel | null
  /** Level being selected in form mode (for visual distinction) */
  selectedLevel?: DisciplineLevel
  /** Callback when level is selected in form mode */
  onSelectLevel?: (level: DisciplineLevel) => void
  /** Whether stepper is read-only (display only) */
  readonly?: boolean
  /** Whether to show level labels below circles */
  showLabels?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

/** Get numeric index for discipline level comparison */
function getLevelIndex(level: DisciplineLevel | null): number {
  if (level === null) return -1
  return DISCIPLINE_LEVELS.indexOf(level)
}

/** Check if selecting a level would skip levels */
function isSkippingLevels(
  currentLevel: DisciplineLevel | null,
  selectedLevel: DisciplineLevel
): boolean {
  const currentIndex = getLevelIndex(currentLevel)
  const selectedIndex = getLevelIndex(selectedLevel)
  // Skipping if selecting more than 1 level ahead
  return selectedIndex > currentIndex + 1
}

/** Get color classes for each discipline level */
function getLevelColorClasses(level: DisciplineLevel, isActive: boolean): string {
  const colors: Record<DisciplineLevel, { active: string; inactive: string }> = {
    verbal: {
      active: 'bg-accent border-accent text-accent-foreground',
      inactive: 'border-accent/50 text-accent/70',
    },
    written: {
      active: 'bg-amber-500 border-amber-500 text-white',
      inactive: 'border-amber-500/50 text-amber-500/70',
    },
    final: {
      active: 'bg-orange-500 border-orange-500 text-white',
      inactive: 'border-orange-500/50 text-orange-500/70',
    },
    termination: {
      active: 'bg-destructive border-destructive text-destructive-foreground',
      inactive: 'border-destructive/50 text-destructive/70',
    },
  }
  return isActive ? colors[level].active : colors[level].inactive
}

/** Size configurations */
const sizeConfig = {
  sm: {
    circle: 'w-8 h-8 text-xs',
    icon: 'w-3.5 h-3.5',
    connector: 'h-0.5',
    label: 'text-xs',
    gap: 'gap-1',
  },
  md: {
    circle: 'w-10 h-10 text-sm',
    icon: 'w-4 h-4',
    connector: 'h-0.5',
    label: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    circle: 'w-12 h-12 text-base',
    icon: 'w-5 h-5',
    connector: 'h-1',
    label: 'text-base',
    gap: 'gap-3',
  },
}

/**
 * 4-level discipline progression stepper
 * Visualizes: Verbal -> Scris -> Final -> Terminare
 *
 * States:
 * - Completed: Levels below current (filled with checkmark)
 * - Current: Employee's current level (filled with pulse)
 * - Selected: Level being picked in form (larger outline)
 * - Upcoming: Future levels (muted outline)
 */
export function DisciplineStepper({
  currentLevel,
  selectedLevel,
  onSelectLevel,
  readonly = false,
  showLabels = true,
  size = 'md',
  className,
}: DisciplineStepperProps) {
  const currentIndex = getLevelIndex(currentLevel)
  const selectedIndex = selectedLevel ? getLevelIndex(selectedLevel) : -1
  const config = sizeConfig[size]
  const isInteractive = !readonly && onSelectLevel

  // Check if selection skips levels
  const showSkipWarning = selectedLevel && isSkippingLevels(currentLevel, selectedLevel)

  return (
    <div className={cn('flex flex-col', config.gap, className)}>
      {/* Stepper container - horizontal on md+, vertical on mobile */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
        {DISCIPLINE_LEVELS.map((level, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isSelected = index === selectedIndex
          const isUpcoming = index > currentIndex

          // Determine circle state
          const isActive = isCompleted || isCurrent || isSelected
          const colorClasses = getLevelColorClasses(level, isActive)

          return (
            <div
              key={level}
              className="flex flex-row md:flex-col items-center gap-2 md:gap-1"
            >
              {/* Circle with connector */}
              <div className="flex items-center">
                {/* Connector line (before, except first) */}
                {index > 0 && (
                  <div
                    className={cn(
                      'hidden md:block w-8 lg:w-12',
                      config.connector,
                      index <= currentIndex
                        ? 'bg-accent'
                        : 'bg-muted-foreground/30 border-t border-dashed'
                    )}
                  />
                )}

                {/* Circle */}
                <button
                  type="button"
                  onClick={() => isInteractive && onSelectLevel(level)}
                  disabled={readonly || !onSelectLevel}
                  className={cn(
                    'relative flex items-center justify-center rounded-full border-2 transition-all',
                    config.circle,
                    colorClasses,
                    // States
                    isCompleted && 'ring-0',
                    isCurrent && 'ring-2 ring-offset-2 ring-offset-background animate-pulse',
                    isSelected && !isCurrent && 'ring-2 ring-offset-2 ring-offset-background scale-110',
                    isUpcoming && !isSelected && 'bg-transparent',
                    // Interactive
                    isInteractive && 'cursor-pointer hover:scale-105',
                    !isInteractive && 'cursor-default'
                  )}
                  aria-label={DISCIPLINE_LEVEL_LABELS[level]}
                >
                  {isCompleted ? (
                    <Check className={config.icon} />
                  ) : (
                    <span className="font-medium">{index + 1}</span>
                  )}
                </button>

                {/* Connector line (after, except last) */}
                {index < DISCIPLINE_LEVELS.length - 1 && (
                  <div
                    className={cn(
                      'hidden md:block w-8 lg:w-12',
                      config.connector,
                      index < currentIndex
                        ? 'bg-accent'
                        : 'bg-muted-foreground/30 border-t border-dashed'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <span
                  className={cn(
                    config.label,
                    'font-medium whitespace-nowrap',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {DISCIPLINE_LEVEL_LABELS[level]}
                </span>
              )}

              {/* Mobile connector (vertical line) */}
              {index < DISCIPLINE_LEVELS.length - 1 && (
                <div
                  className={cn(
                    'md:hidden w-0.5 h-6 ml-[15px]',
                    index < currentIndex
                      ? 'bg-accent'
                      : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Skip levels warning */}
      {showSkipWarning && (
        <div className="flex items-center gap-2 text-amber-500 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Sari peste niveluri - aceasta este o escaladare accelerata</span>
        </div>
      )}
    </div>
  )
}
