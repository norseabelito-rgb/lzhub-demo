/**
 * Zod validation schemas for reservation form
 * All error messages in Romanian
 */

import { z } from 'zod'

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Main reservation form schema
 * Validates all required and optional fields with Romanian error messages
 */
export const reservationSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(2, 'Numele trebuie sa aiba minim 2 caractere')
    .max(100, 'Numele poate avea maxim 100 caractere'),

  phone: z
    .string()
    .regex(/^0[0-9]{9}$/, 'Numar de telefon invalid (format: 07XX XXX XXX)'),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data invalida'),

  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ora invalida'),

  partySize: z
    .number()
    .min(1, 'Minim 1 persoana')
    .max(50, 'Maxim 50 persoane'),

  occasion: z.enum(['regular', 'birthday', 'corporate', 'group', 'other'], {
    message: 'Selecteaza tipul rezervarii'
  }),

  // Optional fields
  email: z
    .string()
    .email('Email invalid')
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(500, 'Maxim 500 caractere')
    .optional(),

  // Conflict override
  overrideConflict: z.boolean().optional()
})

// ============================================================================
// Schema with Refinements
// ============================================================================

/**
 * Enhanced schema with business rule validations
 */
export const reservationSchemaWithRefinements = reservationSchema
  .refine(
    (data) => {
      // Start time must be within operating hours (09:00 - 22:00)
      const [hours] = data.startTime.split(':').map(Number)
      return hours >= 9 && hours < 22
    },
    {
      message: 'Ora trebuie sa fie intre 09:00 si 22:00',
      path: ['startTime']
    }
  )
  .refine(
    (data) => {
      // Start time must be on 30-minute boundary
      const [, minutes] = data.startTime.split(':').map(Number)
      return minutes === 0 || minutes === 30
    },
    {
      message: 'Ora trebuie sa fie la :00 sau :30',
      path: ['startTime']
    }
  )

/**
 * Schema for create mode - includes past date validation
 */
export const createReservationSchema = reservationSchemaWithRefinements.refine(
  (data) => {
    // Date cannot be in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const reservationDate = new Date(data.date)
    reservationDate.setHours(0, 0, 0, 0)
    return reservationDate >= today
  },
  {
    message: 'Data nu poate fi in trecut',
    path: ['date']
  }
)

/**
 * Schema for edit mode - skips past date validation
 * Existing reservations can have past dates
 */
export const editReservationSchema = reservationSchemaWithRefinements

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Form data type inferred from the base schema
 */
export type ReservationFormData = z.infer<typeof reservationSchema>

// ============================================================================
// Validation Function
// ============================================================================

/**
 * Validate reservation form data based on mode
 *
 * @param data - Form data to validate
 * @param mode - 'create' for new reservations, 'edit' for existing ones
 * @returns Validation result with typed data or errors
 */
export function validateReservation(
  data: unknown,
  mode: 'create' | 'edit'
): { success: true; data: ReservationFormData } | { success: false; errors: z.ZodError } {
  const schema = mode === 'create' ? createReservationSchema : editReservationSchema

  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

// ============================================================================
// Time Slot Helpers
// ============================================================================

/**
 * Generate available time slots for the form select
 * Operating hours: 09:00 - 21:30 (last slot starts at 21:30)
 */
export function generateTimeOptions(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = []

  for (let hour = 9; hour < 22; hour++) {
    const hourStr = hour.toString().padStart(2, '0')
    slots.push({ value: `${hourStr}:00`, label: `${hourStr}:00` })
    if (hour < 21 || (hour === 21)) {
      slots.push({ value: `${hourStr}:30`, label: `${hourStr}:30` })
    }
  }

  // Remove the last 22:00 slot since it would end at 23:00
  return slots.filter(slot => slot.value !== '21:30' || true) // Keep 21:30 as last valid start time
}

/**
 * Occasion options for the form select
 */
export const occasionOptions = [
  { value: 'regular', label: 'Rezervare normala' },
  { value: 'birthday', label: 'Petrecere zi de nastere' },
  { value: 'corporate', label: 'Eveniment corporate' },
  { value: 'group', label: 'Grup' },
  { value: 'other', label: 'Altele' }
] as const
