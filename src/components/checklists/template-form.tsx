'use client'

import * as React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, GripVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { ChecklistTemplate, ChecklistType } from '@/lib/checklist/types'

// ============================================================================
// Form Schema
// ============================================================================

const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Textul elementului este obligatoriu'),
  order: z.number(),
  required: z.boolean(),
})

const timeWindowSchema = z.object({
  startHour: z.number().min(0).max(23),
  startMinute: z.number().min(0).max(59),
  endHour: z.number().min(0).max(23),
  endMinute: z.number().min(0).max(59),
  allowLateCompletion: z.boolean(),
  lateWindowMinutes: z.number().min(0).optional(),
})

const templateFormSchema = z.object({
  name: z.string().min(3, 'Numele trebuie sa aiba cel putin 3 caractere'),
  description: z.string().optional(),
  type: z.enum(['deschidere', 'inchidere', 'custom'] as const),
  timeWindow: timeWindowSchema,
  assignedTo: z.union([
    z.literal('all'),
    z.literal('shift'),
    z.array(z.string()),
  ]),
  items: z.array(checklistItemSchema).min(1, 'Adauga cel putin un element'),
}).refine((data) => {
  const { startHour, startMinute, endHour, endMinute } = data.timeWindow
  const startTotal = startHour * 60 + startMinute
  const endTotal = endHour * 60 + endMinute
  return startTotal < endTotal
}, {
  message: 'Ora de sfarsit trebuie sa fie dupa ora de inceput',
  path: ['timeWindow', 'endHour'],
})

export type TemplateFormData = z.infer<typeof templateFormSchema>

// ============================================================================
// Component Props
// ============================================================================

interface TemplateFormProps {
  /** Template to edit, undefined for create mode */
  template?: ChecklistTemplate
  /** Called when form is submitted with valid data */
  onSubmit: (data: TemplateFormData) => void
  /** Called when user cancels */
  onCancel: () => void
  /** Loading state */
  isSubmitting?: boolean
}

// ============================================================================
// Component
// ============================================================================

export function TemplateForm({
  template,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TemplateFormProps) {

  // Default values for create mode
  const defaultValues: TemplateFormData = template
    ? {
        name: template.name,
        description: template.description || '',
        type: template.type,
        timeWindow: {
          startHour: template.timeWindow.startHour,
          startMinute: template.timeWindow.startMinute,
          endHour: template.timeWindow.endHour,
          endMinute: template.timeWindow.endMinute,
          allowLateCompletion: template.timeWindow.allowLateCompletion,
          lateWindowMinutes: template.timeWindow.lateWindowMinutes || 0,
        },
        assignedTo: template.assignedTo,
        items: template.items.map((item, index) => ({
          id: item.id,
          text: item.text,
          order: index,
          required: item.required,
        })),
      }
    : {
        name: '',
        description: '',
        type: 'deschidere' as ChecklistType,
        timeWindow: {
          startHour: 9,
          startMinute: 0,
          endHour: 11,
          endMinute: 0,
          allowLateCompletion: true,
          lateWindowMinutes: 30,
        },
        assignedTo: 'all' as const,
        items: [
          { id: crypto.randomUUID(), text: '', order: 0, required: true },
        ],
      }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchAllowLate = watch('timeWindow.allowLateCompletion')
  const watchAssignedTo = watch('assignedTo')

  // Determine assignment type for radio selection
  const assignmentType = Array.isArray(watchAssignedTo)
    ? 'select'
    : watchAssignedTo

  const handleFormSubmit = handleSubmit((data) => {
    // Reorder items based on their position
    const orderedData = {
      ...data,
      items: data.items.map((item, index) => ({
        ...item,
        order: index,
      })),
    }
    onSubmit(orderedData)
  })

  const addItem = () => {
    append({
      id: crypto.randomUUID(),
      text: '',
      order: fields.length,
      required: true,
    })
  }

  const handleAssignmentChange = (value: 'all' | 'shift' | 'select') => {
    if (value === 'select') {
      setValue('assignedTo', [])
    } else {
      setValue('assignedTo', value)
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nume template *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="ex: Checklist Deschidere"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descriere</Label>
        <Input
          id="description"
          {...register('description')}
          placeholder="Descriere optionala"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Tip *</Label>
        <select
          id="type"
          {...register('type')}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="deschidere">Deschidere</option>
          <option value="inchidere">Inchidere</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Time Window */}
      <div className="space-y-4">
        <Label>Fereastra de timp *</Label>

        <div className="grid grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Inceput</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={23}
                {...register('timeWindow.startHour', { valueAsNumber: true })}
                className="w-16 text-center"
                placeholder="09"
              />
              <span className="text-muted-foreground">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                {...register('timeWindow.startMinute', { valueAsNumber: true })}
                className="w-16 text-center"
                placeholder="00"
              />
            </div>
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Sfarsit</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={23}
                {...register('timeWindow.endHour', { valueAsNumber: true })}
                className="w-16 text-center"
                placeholder="11"
                aria-invalid={!!errors.timeWindow?.endHour}
              />
              <span className="text-muted-foreground">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                {...register('timeWindow.endMinute', { valueAsNumber: true })}
                className="w-16 text-center"
                placeholder="00"
              />
            </div>
            {errors.timeWindow?.endHour && (
              <p className="text-sm text-destructive">
                {errors.timeWindow.endHour.message}
              </p>
            )}
          </div>
        </div>

        {/* Late Completion */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="allowLate"
              checked={watchAllowLate}
              onCheckedChange={(checked) =>
                setValue('timeWindow.allowLateCompletion', !!checked)
              }
            />
            <Label htmlFor="allowLate" className="cursor-pointer">
              Permite completare cu intarziere
            </Label>
          </div>

          {watchAllowLate && (
            <div className="ml-6 flex items-center gap-2">
              <Input
                type="number"
                min={0}
                {...register('timeWindow.lateWindowMinutes', {
                  valueAsNumber: true,
                })}
                className="w-20"
                placeholder="30"
              />
              <span className="text-sm text-muted-foreground">
                minute intarziere permise
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-3">
        <Label>Atribuire *</Label>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="assignmentType"
              value="all"
              checked={assignmentType === 'all'}
              onChange={() => handleAssignmentChange('all')}
              className="h-4 w-4 border-input text-primary focus:ring-ring"
            />
            <span className="text-sm">Toti angajatii</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="assignmentType"
              value="shift"
              checked={assignmentType === 'shift'}
              onChange={() => handleAssignmentChange('shift')}
              className="h-4 w-4 border-input text-primary focus:ring-ring"
            />
            <span className="text-sm">Tura curenta</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="assignmentType"
              value="select"
              checked={assignmentType === 'select'}
              onChange={() => handleAssignmentChange('select')}
              className="h-4 w-4 border-input text-primary focus:ring-ring"
            />
            <span className="text-sm">Selecteaza angajati</span>
          </label>

          {assignmentType === 'select' && (
            <p className="ml-6 text-xs text-muted-foreground">
              Selectia angajatilor va fi disponibila dupa integrarea cu sistemul de personal.
            </p>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        <Label>Elemente checklist *</Label>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start gap-2 p-3 rounded-md border bg-card"
            >
              <GripVertical className="mt-2.5 h-4 w-4 text-muted-foreground shrink-0 cursor-move" />

              <div className="flex-1 space-y-2">
                <Input
                  {...register(`items.${index}.text`)}
                  placeholder={`Element ${index + 1}`}
                  aria-invalid={!!errors.items?.[index]?.text}
                />
                {errors.items?.[index]?.text && (
                  <p className="text-sm text-destructive">
                    {errors.items[index]?.text?.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={watch(`items.${index}.required`)}
                  onCheckedChange={(checked) =>
                    setValue(`items.${index}.required`, !!checked)
                  }
                />
                <Label
                  htmlFor={`required-${field.id}`}
                  className="text-xs cursor-pointer"
                >
                  Obligatoriu
                </Label>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="text-muted-foreground hover:text-destructive mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {errors.items && typeof errors.items.message === 'string' && (
          <p className="text-sm text-destructive">{errors.items.message}</p>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adauga element
        </Button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Anuleaza
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Se salveaza...' : 'Salveaza template'}
        </Button>
      </div>
    </form>
  )
}
