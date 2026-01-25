'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus, Cake, Briefcase, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  createReservationSchema,
  editReservationSchema,
  generateTimeOptions,
  occasionOptions,
  type ReservationFormData,
} from '@/lib/calendar/validation'
import { useCustomerStore, useReservationStore, type Reservation, type Customer } from '@/lib/calendar'
import { ConflictWarning } from './conflict-warning'

// ============================================================================
// Types
// ============================================================================

interface ReservationFormProps {
  initialData?: Partial<Reservation>
  initialDate?: string
  initialTime?: string
  onSubmit: (data: ReservationFormData) => void
  onCancel: () => void
  mode: 'create' | 'edit'
}

// ============================================================================
// Presets
// ============================================================================

const PRESETS = [
  {
    id: 'birthday',
    label: 'Petrecere Aniversara',
    icon: Cake,
    occasion: 'birthday' as const,
    suggestedPartySize: 10,
  },
  {
    id: 'corporate',
    label: 'Eveniment Corporate',
    icon: Briefcase,
    occasion: 'corporate' as const,
    suggestedPartySize: 15,
  },
  {
    id: 'regular',
    label: 'Rezervare Standard',
    icon: Calendar,
    occasion: 'regular' as const,
    suggestedPartySize: 4,
  },
]

// ============================================================================
// Component
// ============================================================================

export function ReservationForm({
  initialData,
  initialDate,
  initialTime,
  onSubmit,
  onCancel,
  mode,
}: ReservationFormProps) {
  const [showConflict, setShowConflict] = useState(false)
  const [conflictInfo, setConflictInfo] = useState<{ reason: string; severity: 'warning' | 'critical' } | null>(null)
  const [customerMatches, setCustomerMatches] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const searchCustomers = useCustomerStore((state) => state.searchCustomers)
  const checkConflicts = useReservationStore((state) => state.checkConflicts)

  // Select schema based on mode
  const schema = mode === 'create' ? createReservationSchema : editReservationSchema

  // Generate time options
  const timeOptions = useMemo(() => generateTimeOptions(), [])

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.customerId ? '' : '', // Will be filled by customer lookup
      phone: '',
      email: '',
      date: initialDate || initialData?.date || new Date().toISOString().split('T')[0],
      startTime: initialTime || initialData?.startTime || '10:00',
      partySize: initialData?.partySize || 4,
      occasion: initialData?.occasion || 'regular',
      notes: initialData?.notes || '',
      overrideConflict: false,
    },
  })

  // Watch form values for conflict checking and customer lookup
  const watchedDate = watch('date')
  const watchedTime = watch('startTime')
  const watchedPartySize = watch('partySize')
  const watchedName = watch('name')
  const watchedPhone = watch('phone')
  const overrideConflict = watch('overrideConflict')

  // Load customer data if editing
  useEffect(() => {
    if (mode === 'edit' && initialData?.customerId) {
      const customer = useCustomerStore.getState().getCustomerById(initialData.customerId)
      if (customer) {
        setValue('name', customer.name)
        setValue('phone', customer.phone)
        setValue('email', customer.email || '')
      }
    }
  }, [mode, initialData, setValue])

  // Check conflicts when date/time/party size changes
  useEffect(() => {
    if (watchedDate && watchedTime && watchedPartySize) {
      // Calculate end time (1 hour from start)
      const [hours, minutes] = watchedTime.split(':').map(Number)
      const endHours = hours + 1
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

      const result = checkConflicts(
        watchedDate,
        watchedTime,
        endTime,
        watchedPartySize,
        mode === 'edit' ? initialData?.id : undefined
      )

      if (result.hasConflict && result.reason && result.severity) {
        setShowConflict(true)
        setConflictInfo({ reason: result.reason, severity: result.severity })
      } else {
        setShowConflict(false)
        setConflictInfo(null)
      }
    }
  }, [watchedDate, watchedTime, watchedPartySize, checkConflicts, mode, initialData])

  // Customer autocomplete lookup
  useEffect(() => {
    const query = watchedName || watchedPhone
    if (query && query.length >= 2) {
      const matches = searchCustomers(query).slice(0, 5)
      setCustomerMatches(matches)
      setShowCustomerDropdown(matches.length > 0)
    } else {
      setCustomerMatches([])
      setShowCustomerDropdown(false)
    }
  }, [watchedName, watchedPhone, searchCustomers])

  // Handle preset click
  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setValue('occasion', preset.occasion)
    setValue('partySize', preset.suggestedPartySize)
  }

  // Handle customer selection from autocomplete
  const handleSelectCustomer = (customer: Customer) => {
    setValue('name', customer.name)
    setValue('phone', customer.phone)
    setValue('email', customer.email || '')
    setShowCustomerDropdown(false)
  }

  // Party size increment/decrement
  const handlePartySizeChange = (delta: number) => {
    const current = watchedPartySize || 1
    const newValue = Math.max(1, Math.min(50, current + delta))
    setValue('partySize', newValue)
  }

  // Form submission
  const handleFormSubmit = (data: ReservationFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Presets Section */}
      <div className="space-y-2">
        <Label>Preseturi rapide</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handlePresetClick(preset)}
            >
              <preset.icon className="size-4" />
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Name Field with Autocomplete */}
      <div className="relative space-y-2">
        <Label htmlFor="name">Nume *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Nume client"
          aria-invalid={!!errors.name}
          autoComplete="off"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}

        {/* Customer autocomplete dropdown */}
        {showCustomerDropdown && customerMatches.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg">
            {customerMatches.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="font-medium">{customer.name}</div>
                <div className="text-xs text-muted-foreground">{customer.phone}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon *</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="07XX XXX XXX"
          aria-invalid={!!errors.phone}
        />
        <p className="text-xs text-muted-foreground">Format: 07XX XXX XXX</p>
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Email Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="email@exemplu.ro"
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Date and Time Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date Field */}
        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            aria-invalid={!!errors.date}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Time Field */}
        <div className="space-y-2">
          <Label htmlFor="startTime">Ora *</Label>
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.startTime}>
                  <SelectValue placeholder="Selecteaza ora" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.startTime && (
            <p className="text-sm text-destructive">{errors.startTime.message}</p>
          )}
        </div>
      </div>

      {/* Party Size with +/- buttons */}
      <div className="space-y-2">
        <Label htmlFor="partySize">Numar persoane *</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePartySizeChange(-1)}
            disabled={watchedPartySize <= 1}
          >
            <Minus className="size-4" />
          </Button>
          <Input
            id="partySize"
            type="number"
            {...register('partySize', { valueAsNumber: true })}
            className="w-20 text-center"
            min={1}
            max={50}
            aria-invalid={!!errors.partySize}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePartySizeChange(1)}
            disabled={watchedPartySize >= 50}
          >
            <Plus className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {watchedPartySize === 1 ? 'persoana' : 'persoane'}
          </span>
        </div>
        {errors.partySize && (
          <p className="text-sm text-destructive">{errors.partySize.message}</p>
        )}
      </div>

      {/* Occasion Select */}
      <div className="space-y-2">
        <Label htmlFor="occasion">Tip rezervare *</Label>
        <Controller
          name="occasion"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.occasion}>
                <SelectValue placeholder="Selecteaza tipul" />
              </SelectTrigger>
              <SelectContent>
                {occasionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.occasion && (
          <p className="text-sm text-destructive">{errors.occasion.message}</p>
        )}
      </div>

      {/* Notes Textarea */}
      <div className="space-y-2">
        <Label htmlFor="notes">Note (optional)</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Note suplimentare despre rezervare..."
          rows={3}
          aria-invalid={!!errors.notes}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Conflict Warning */}
      {showConflict && conflictInfo && (
        <div className="space-y-3">
          <ConflictWarning reason={conflictInfo.reason} severity={conflictInfo.severity} />

          {/* Override checkbox */}
          <div className="flex items-center gap-2">
            <Controller
              name="overrideConflict"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="overrideConflict"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label
              htmlFor="overrideConflict"
              className="text-sm font-normal cursor-pointer"
            >
              Continua oricum (override conflict)
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Bifand aceasta optiune, rezervarea va fi creata in ciuda avertismentului.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuleaza
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || (showConflict && !overrideConflict)}
        >
          {isSubmitting
            ? 'Se salveaza...'
            : mode === 'create'
            ? 'Creeaza Rezervare'
            : 'Salveaza Modificarile'}
        </Button>
      </div>
    </form>
  )
}
