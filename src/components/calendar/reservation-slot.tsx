'use client'

import { useMemo } from 'react'
import { Cake, Briefcase, Users, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Reservation, Occasion } from '@/lib/calendar'
import { useCustomerStore } from '@/lib/calendar'

// ============================================================================
// Types
// ============================================================================

interface ReservationSlotProps {
  reservation: Reservation
  compact?: boolean
  onClick?: (reservation: Reservation) => void
}

// ============================================================================
// Occasion Icon Component
// ============================================================================

function OccasionIcon({ occasion }: { occasion: Occasion }) {
  switch (occasion) {
    case 'birthday':
      return <Cake className="size-4 text-primary" />
    case 'corporate':
      return <Briefcase className="size-4 text-primary" />
    case 'group':
      return <Users className="size-4 text-primary" />
    default:
      return null
  }
}

// ============================================================================
// Status Colors
// ============================================================================

function getStatusClasses(status: Reservation['status'], hasConflict: boolean, conflictOverridden: boolean) {
  // Conflict styling takes precedence
  if (hasConflict && !conflictOverridden) {
    return {
      border: 'border-destructive',
      bg: 'bg-destructive/10',
      text: 'text-destructive',
    }
  }

  switch (status) {
    case 'confirmed':
      return {
        border: 'border-success/50',
        bg: 'bg-success/10',
        text: 'text-success',
      }
    case 'cancelled':
      return {
        border: 'border-muted',
        bg: 'bg-muted/50',
        text: 'text-muted-foreground line-through',
      }
    case 'completed':
      return {
        border: 'border-muted',
        bg: 'bg-muted/30',
        text: 'text-muted-foreground',
      }
    case 'no_show':
      return {
        border: 'border-warning/50',
        bg: 'bg-warning/10',
        text: 'text-warning',
      }
    default:
      return {
        border: 'border-border',
        bg: 'bg-card',
        text: 'text-foreground',
      }
  }
}

// ============================================================================
// Component
// ============================================================================

export function ReservationSlot({
  reservation,
  compact = false,
  onClick,
}: ReservationSlotProps) {
  const getCustomerById = useCustomerStore((state) => state.getCustomerById)

  const customer = useMemo(() => {
    return getCustomerById(reservation.customerId)
  }, [getCustomerById, reservation.customerId])

  const statusClasses = getStatusClasses(
    reservation.status,
    reservation.hasConflict,
    reservation.conflictOverridden
  )

  const handleClick = () => {
    if (onClick) {
      onClick(reservation)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  // Compact mode for week/month views
  if (compact) {
    return (
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        className={cn(
          'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs border',
          'truncate',
          statusClasses.border,
          statusClasses.bg,
          onClick && 'cursor-pointer hover:opacity-80'
        )}
      >
        <span className="font-medium">{reservation.startTime}</span>
        {customer && (
          <span className={cn('truncate', statusClasses.text)}>
            {customer.name.split(' ')[0]}
          </span>
        )}
        {reservation.hasConflict && !reservation.conflictOverridden && (
          <AlertTriangle className="size-3 text-destructive shrink-0" />
        )}
      </div>
    )
  }

  // Full mode for day view
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={cn(
        'flex flex-col gap-1 rounded-md border p-2',
        statusClasses.border,
        statusClasses.bg,
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity'
      )}
    >
      {/* Top row: Time and conflict warning */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="size-3 text-muted-foreground" />
          <span className="font-medium">
            {reservation.startTime} - {reservation.endTime}
          </span>
        </div>
        {reservation.hasConflict && !reservation.conflictOverridden && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="size-3" />
            <span>Conflict</span>
          </div>
        )}
      </div>

      {/* Customer name and occasion */}
      <div className="flex items-center gap-2">
        {customer && (
          <span className={cn('font-medium', statusClasses.text)}>
            {customer.name}
          </span>
        )}
        <OccasionIcon occasion={reservation.occasion} />
      </div>

      {/* Party size */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="size-3" />
        <span>
          {reservation.partySize} {reservation.partySize === 1 ? 'persoana' : 'persoane'}
        </span>
      </div>
    </div>
  )
}
