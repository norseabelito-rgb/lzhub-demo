'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Minus, Plus, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useReservationStore, useCustomerStore } from '@/lib/calendar'

// ============================================================================
// Types
// ============================================================================

interface WalkupFormProps {
  /** Pre-selected time slot */
  defaultTime?: string
  /** Pre-selected date */
  defaultDate?: string
  /** Callback after successful submission */
  onSuccess?: () => void
  /** Callback when form is cancelled */
  onCancel?: () => void
  /** Render as dialog or inline */
  asDialog?: boolean
  /** Custom trigger element for dialog mode */
  trigger?: React.ReactNode
}

// ============================================================================
// Validation Schema
// ============================================================================

const walkupSchema = z.object({
  partySize: z
    .number()
    .min(1, 'Minim 1 persoana')
    .max(50, 'Maxim 50 persoane'),
  name: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type WalkupFormData = z.infer<typeof walkupSchema>

// ============================================================================
// Form Content Component
// ============================================================================

function WalkupFormContent({
  defaultTime,
  defaultDate,
  onSuccess,
  onCancel,
}: Omit<WalkupFormProps, 'asDialog' | 'trigger'>) {
  const createReservation = useReservationStore((state) => state.createReservation)
  const createCustomer = useCustomerStore((state) => state.createCustomer)

  // Get current/next slot if not provided
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()
  const nextSlotMinutes = currentMinutes < 30 ? 30 : 0
  const nextSlotHour = currentMinutes < 30 ? currentHour : currentHour + 1
  const defaultSlotTime = defaultTime || `${nextSlotHour.toString().padStart(2, '0')}:${nextSlotMinutes.toString().padStart(2, '0')}`
  const defaultSlotDate = defaultDate || now.toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WalkupFormData>({
    resolver: zodResolver(walkupSchema),
    defaultValues: {
      partySize: 2,
      name: '',
      phone: '',
      notes: '',
    },
  })

  const watchedPartySize = watch('partySize')

  // Party size increment/decrement
  const handlePartySizeChange = (delta: number) => {
    const current = watchedPartySize || 1
    const newValue = Math.max(1, Math.min(50, current + delta))
    setValue('partySize', newValue)
  }

  // Form submission
  const onSubmit = async (data: WalkupFormData) => {
    // Calculate end time (1 hour from start)
    const [hours, minutes] = defaultSlotTime.split(':').map(Number)
    const endHours = hours + 1
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    try {
      // Create customer if name/phone provided
      let customerId = 'walkup-anonymous'
      if (data.name || data.phone) {
        customerId = await createCustomer({
          name: data.name || 'Walk-up',
          phone: data.phone || '',
          tags: [],
        })
      }

      // Create the reservation as walk-up
      await createReservation({
        customerId,
        date: defaultSlotDate,
        startTime: defaultSlotTime,
        endTime,
        partySize: data.partySize,
        occasion: 'regular',
        notes: data.notes,
        status: 'confirmed',
        createdBy: 'staff',
        isWalkup: true,
      })

      // Show success message
      toast.success(`Walk-up inregistrat: ${data.partySize} persoane`, {
        description: `Slot: ${defaultSlotTime} - ${endTime}`,
      })

      // Reset form and call success callback
      reset()
      onSuccess?.()
    } catch (err) {
      toast.error('Eroare la inregistrare', {
        description: (err as Error).message,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Time slot display */}
      <div className="rounded-md bg-muted p-3 text-sm">
        <div className="font-medium">Slot selectat</div>
        <div className="text-muted-foreground">
          {defaultSlotDate} la {defaultSlotTime}
        </div>
      </div>

      {/* Party Size with +/- buttons (primary field) */}
      <div className="space-y-2">
        <Label htmlFor="walkup-partySize" className="text-base font-medium">
          Numar persoane *
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12"
            onClick={() => handlePartySizeChange(-1)}
            disabled={watchedPartySize <= 1}
          >
            <Minus className="size-5" />
          </Button>
          <Input
            id="walkup-partySize"
            type="number"
            {...register('partySize', { valueAsNumber: true })}
            className="w-20 h-12 text-center text-xl font-bold"
            min={1}
            max={50}
            aria-invalid={!!errors.partySize}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12"
            onClick={() => handlePartySizeChange(1)}
            disabled={watchedPartySize >= 50}
          >
            <Plus className="size-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {watchedPartySize === 1 ? 'persoana' : 'persoane'}
          </span>
        </div>
        {errors.partySize && (
          <p className="text-sm text-destructive">{errors.partySize.message}</p>
        )}
      </div>

      {/* Optional: Customer name */}
      <div className="space-y-2">
        <Label htmlFor="walkup-name">Nume (optional)</Label>
        <Input
          id="walkup-name"
          {...register('name')}
          placeholder="Nume client"
        />
      </div>

      {/* Optional: Phone */}
      <div className="space-y-2">
        <Label htmlFor="walkup-phone">Telefon (optional)</Label>
        <Input
          id="walkup-phone"
          {...register('phone')}
          placeholder="07XX XXX XXX"
        />
      </div>

      {/* Optional: Notes */}
      <div className="space-y-2">
        <Label htmlFor="walkup-notes">Note (optional)</Label>
        <Textarea
          id="walkup-notes"
          {...register('notes')}
          placeholder="Observatii rapide..."
          rows={2}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuleaza
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Se salveaza...' : 'Inregistreaza Walk-up'}
        </Button>
      </div>
    </form>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WalkupForm({
  defaultTime,
  defaultDate,
  onSuccess,
  onCancel,
  asDialog = true,
  trigger,
}: WalkupFormProps) {
  const [open, setOpen] = useState(false)

  // Handle success in dialog mode
  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  // Handle cancel in dialog mode
  const handleCancel = () => {
    setOpen(false)
    onCancel?.()
  }

  // Inline mode
  if (!asDialog) {
    return (
      <WalkupFormContent
        defaultTime={defaultTime}
        defaultDate={defaultDate}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    )
  }

  // Dialog mode
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="size-4" />
            Walk-up
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inregistrare Walk-up</DialogTitle>
          <DialogDescription>
            Adauga rapid un client care a venit fara rezervare.
          </DialogDescription>
        </DialogHeader>
        <WalkupFormContent
          defaultTime={defaultTime}
          defaultDate={defaultDate}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
