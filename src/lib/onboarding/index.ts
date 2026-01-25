/**
 * Onboarding system barrel exports
 * Central export point for all onboarding-related functionality
 */

// Types
export type {
  OnboardingStep,
  StepStatus,
  NdaSignature,
  DocumentProgress,
  VideoProgress,
  QuizAttempt,
  PhysicalHandoff,
  OnboardingProgress,
  OnboardingAuditEntry,
} from './types'

// Constants
export { ONBOARDING_STEPS, ONBOARDING_STEP_LABELS } from './types'

// Store
export { useOnboardingStore, STEP_ORDER, STEP_DEPENDENCIES, MAX_QUIZ_ATTEMPTS, QUIZ_PASS_THRESHOLD } from './onboarding-store'
export type { OnboardingStore } from './onboarding-store'

// Mock data (for testing/development)
export {
  MOCK_NDA_TEXT,
  MOCK_DOCUMENTS,
  MOCK_VIDEO_URL,
  MOCK_VIDEO_CHAPTERS,
  MOCK_QUIZ_QUESTIONS,
  MOCK_ONBOARDING_PROGRESS,
} from './mock-data'

// PDF generation
export { generateNdaPdf, downloadNdaPdf, generateAndDownloadNdaPdf } from './pdf-generator'
export type { NdaPdfData } from './pdf-generator'
