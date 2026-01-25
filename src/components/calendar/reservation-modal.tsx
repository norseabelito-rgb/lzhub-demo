'use client'

import { useState, useCallback } from 'react'
import { Trash2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  useReservationStore,
  useCustomerStore,
  getStatusLabel,
  getStatusColor,
  type Reservation,
} from '@/lib/calendar'
import { ReservationForm } from './reservation-form'
import { type ReservationFormData } from '@/lib/calendar/validation'

// ============================================================================
// Types
// ============================================================================

interface ReservationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation?: Reservation | null
  initialDate?: string | null
  initialTime?: string | null
}

// ============================================================================
// Component
// ============================================================================

export function ReservationModal({
  open,
  onOpenChange,
  reservation,
  initialDate,
  initialTime,
}: ReservationModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Store actions
  const createReservation = useReservationStore((state) => state.createReservation)
  const updateReservation = useReservationStore((state) => state.updateReservation)
  const cancelReservation = useReservationStore((state) => state.cancelReservation)
  const deleteReservation = useReservationStore((state) => state.deleteReservation)
  const getCustomerById = useCustomerStore((state) => state.getCustomerById)
  const createCustomer = useCustomerStore((state) => state.createCustomer)
  const searchCustomers = useCustomerStore((state) => state.searchCustomers)

  // Determine mode
  const mode = reservation ? 'edit' : 'create'
  const isEditing = mode === 'edit'

  // Check if user can delete (would check role in real app)
  // For now, allow delete in edit mode
  const canDelete = isEditing

  // Calculate end time (1 hour from start)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = hours + 1
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Handle form submission
  const handleSubmit = useCallback(
    (data: ReservationFormData) => {
      // Find or create customer
      let customerId: string

      // Search for existing customer by phone
      const existingCustomers = searchCustomers(data.phone)
      const existingCustomer = existingCustomers.find(
        (c) => c.phone === data.phone
      )

      if (existingCustomer) {
        customerId = existingCustomer.id
        // Optionally update customer name/email if changed
      } else {
        // Create new customer
        customerId = createCustomer({
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          tags: [],
          notes: undefined,
        })
        toast.success('Client nou creat')
      }

      if (mode === 'create') {
        // Create new reservation
        const result = createReservation({
          customerId,
          date: data.date,
          startTime: data.startTime,
          endTime: calculateEndTime(data.startTime),
          partySize: data.partySize,
          occasion: data.occasion,
          notes: data.notes || undefined,
          status: 'confirmed',
          createdBy: 'current-user', // Would be actual user ID
        })

        if (result.hasConflict && !data.overrideConflict) {
          toast.warning('Rezervare creata cu avertisment de conflict', {
            description: result.conflictReason,
          })
        } else {
          toast.success('Rezervare creata cu succes')
        }
      } else if (reservation) {
        // Update existing reservation
        updateReservation(reservation.id, {
          customerId,
          date: data.date,
          startTime: data.startTime,
          endTime: calculateEndTime(data.startTime),
          partySize: data.partySize,
          occasion: data.occasion,
          notes: data.notes || undefined,
          conflictOverridden: data.overrideConflict || false,
        })
        toast.success('Rezervare actualizata')
      }

      onOpenChange(false)
    },
    [
      mode,
      reservation,
      createReservation,
      updateReservation,
      createCustomer,
      searchCustomers,
      onOpenChange,
    ]
  )

  // Handle cancel (soft delete)
  const handleCancelReservation = useCallback(() => {
    if (reservation) {
      cancelReservation(reservation.id)
      toast.success('Rezervare anulata')
      setShowCancelConfirm(false)
      onOpenChange(false)
    }
  }, [reservation, cancelReservation, onOpenChange])

  // Handle delete (hard delete)
  const handleDeleteReservation = useCallback(() => {
    if (reservation) {
      deleteReservation(reservation.id)
      toast.success('Rezervare stearsa permanent')
      setShowDeleteConfirm(false)
      onOpenChange(false)
    }
  }, [reservation, deleteReservation, onOpenChange])

  // Handle modal close
  const handleClose = useCallback(() => {
    setShowCancelConfirm(false)
    setShowDeleteConfirm(false)
    onOpenChange(false)
  }, [onOpenChange])

  // Get customer info for edit mode
  const customer = reservation
    ? getCustomerById(reservation.customerId)
    : undefined

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>
              {isEditing ? 'Editeaza Rezervarea' : 'Rezervare Noua'}
            </DialogTitle>

            {/* Status badge for edit mode */}
            {isEditing && reservation && (
              <Badge
                variant="outline"
                className={cn('text-xs', getStatusColor(reservation.status))}
              >
                {getStatusLabel(reservation.status)}
              </Badge>
            )}
          </div>

          {isEditing && customer && (
            <DialogDescription>
              {customer.name} - {customer.phone}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Main content */}
        {!showCancelConfirm && !showDeleteConfirm && (
          <>
            <ReservationForm
              mode={mode}
              initialData={
                reservation
                  ? {
                      ...reservation,
                    }
                  : undefined
              }
              initialDate={initialDate || undefined}
              initialTime={initialTime || undefined}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />

            {/* Edit mode actions */}
            {isEditing && reservation && reservation.status !== 'cancelled' && (
              <div className="mt-4 space-y-3 border-t pt-4">
                {/* Cancel reservation button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <XCircle className="mr-2 size-4" />
                  Anuleaza Rezervarea
                </Button>

                {/* Delete button (manager only) */}
                {canDelete && (
                  <button
                    type="button"
                    className="w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Sterge Permanent
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Cancel confirmation */}
        {showCancelConfirm && (
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Esti sigur ca vrei sa anulezi aceasta rezervare?
            </p>
            <p className="text-xs text-muted-foreground">
              Rezervarea va fi marcata ca anulata, dar va ramane in istoric.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
              >
                Inapoi
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelReservation}
              >
                Confirma Anularea
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium text-destructive">
              Atentie: Aceasta actiune este ireversibila!
            </p>
            <p className="text-xs text-muted-foreground">
              Rezervarea va fi stearsa permanent din sistem si nu va mai putea fi
              recuperata.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Inapoi
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteReservation}
              >
                <Trash2 className="mr-2 size-4" />
                Sterge Permanent
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
