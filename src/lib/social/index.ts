/**
 * Social Media module barrel export
 * Exports all types, store, validation, and constants
 */

// Types
export * from './types'

// Constants
export * from './constants'

// Store
export { useSocialStore } from './social-store'
export type { SocialStore } from './social-store'

// Validation
export {
  postFormSchema,
  templateSchema,
  hashtagSetSchema,
  libraryItemSchema,
  validatePostForm,
  validateTemplateForm,
  validateHashtagSetForm,
} from './validation'
export type {
  PostFormData,
  TemplateFormData,
  HashtagSetFormData,
  LibraryItemFormData,
} from './validation'

// Mock Data
export {
  MOCK_POSTS,
  MOCK_CAPTION_TEMPLATES,
  MOCK_HASHTAG_SETS,
  MOCK_CONTENT_LIBRARY,
  initializeMockData,
} from './mock-data'
