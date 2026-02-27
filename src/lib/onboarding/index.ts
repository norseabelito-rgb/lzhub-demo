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

// Static content
export {
  NDA_TEXT,
  TRAINING_DOCUMENTS,
  TRAINING_VIDEO_URL,
  VIDEO_CHAPTERS,
  QUIZ_QUESTIONS,
} from './content'
export type { TrainingDocument, VideoChapter, QuizQuestion, QuizOption } from './content'

// Config types & store
export type {
  OnboardingConfig,
  OnboardingPublicConfig,
  OnboardingConfigDocument,
  OnboardingConfigChapter,
  OnboardingConfigQuestion,
  OnboardingPublicQuestion,
  QuestionType,
  QuizQuestionOption,
} from './config-types'
export { useOnboardingConfigStore } from './config-store'
export type { OnboardingConfigStore } from './config-store'
export { useOnboardingConfig } from './use-onboarding-config'

// PDF generation
export { generateNdaPdf, downloadNdaPdf, generateAndDownloadNdaPdf } from './pdf-generator'
export type { NdaPdfData } from './pdf-generator'
