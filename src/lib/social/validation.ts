/**
 * Zod validation schemas for social media forms
 * All error messages in Romanian
 */

import { z } from 'zod'
import { SOCIAL_PLATFORMS } from './types'

// ============================================================================
// Post Form Schema
// ============================================================================

/**
 * Schema for post creation/editing form
 * Validates caption, platforms, media, hashtags, and scheduling
 */
export const postFormSchema = z.object({
  caption: z
    .string()
    .min(1, 'Caption-ul este obligatoriu')
    .max(4000, 'Maxim 4000 caractere'),

  platforms: z
    .array(z.enum(SOCIAL_PLATFORMS))
    .min(1, 'Selecteaza cel putin o platforma'),

  mediaIds: z
    .array(z.string())
    .max(10, 'Maxim 10 fisiere media'),

  hashtagSetIds: z
    .array(z.string())
    .optional(),

  customHashtags: z
    .array(z.string())
    .optional(),

  scheduledAt: z
    .string()
    .nullable()
    .optional(),
})

export type PostFormData = z.infer<typeof postFormSchema>

// ============================================================================
// Template Schema
// ============================================================================

/**
 * Schema for caption template creation/editing
 */
export const templateSchema = z.object({
  name: z
    .string()
    .min(1, 'Numele este obligatoriu')
    .max(50, 'Maxim 50 caractere'),

  content: z
    .string()
    .min(1, 'Continutul este obligatoriu'),

  category: z
    .string()
    .min(1, 'Categoria este obligatorie'),
})

export type TemplateFormData = z.infer<typeof templateSchema>

// ============================================================================
// Hashtag Set Schema
// ============================================================================

/**
 * Schema for hashtag set creation/editing
 */
export const hashtagSetSchema = z.object({
  name: z
    .string()
    .min(1, 'Numele este obligatoriu')
    .max(30, 'Maxim 30 caractere'),

  hashtags: z
    .array(z.string())
    .min(1, 'Adauga cel putin un hashtag'),
})

export type HashtagSetFormData = z.infer<typeof hashtagSetSchema>

// ============================================================================
// Content Library Schema
// ============================================================================

/**
 * Schema for content library item metadata
 */
export const libraryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Numele este obligatoriu')
    .max(100, 'Maxim 100 caractere'),

  tags: z
    .array(z.string())
    .optional(),
})

export type LibraryItemFormData = z.infer<typeof libraryItemSchema>

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate post form data
 */
export function validatePostForm(
  data: unknown
): { success: true; data: PostFormData } | { success: false; errors: z.ZodError } {
  const result = postFormSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

/**
 * Validate template form data
 */
export function validateTemplateForm(
  data: unknown
): { success: true; data: TemplateFormData } | { success: false; errors: z.ZodError } {
  const result = templateSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

/**
 * Validate hashtag set form data
 */
export function validateHashtagSetForm(
  data: unknown
): { success: true; data: HashtagSetFormData } | { success: false; errors: z.ZodError } {
  const result = hashtagSetSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}
