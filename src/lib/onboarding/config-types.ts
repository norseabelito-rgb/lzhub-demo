/**
 * TypeScript types for the onboarding configuration system
 * These mirror the Prisma models and are used in API responses and client state
 */

export interface OnboardingConfigDocument {
  id: string
  configId: string
  title: string
  content: string
  minReadingSeconds: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface OnboardingConfigChapter {
  id: string
  configId: string
  title: string
  timestamp: number
  sortOrder: number
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'multi_select' | 'open_text'

export interface QuizQuestionOption {
  id: string
  text: string
}

export interface OnboardingConfigQuestion {
  id: string
  configId: string
  type: QuestionType
  text: string
  options: QuizQuestionOption[]
  correctAnswer: string | string[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/** Public question (no correctAnswer) for employee wizard */
export interface OnboardingPublicQuestion {
  id: string
  type: QuestionType
  text: string
  options: QuizQuestionOption[]
  sortOrder: number
}

export interface OnboardingConfig {
  id: string
  ndaContent: string
  videoUrl: string | null
  videoFileName: string | null
  videoFileSize: number | null
  videoDescription: string | null
  quizPassThreshold: number
  quizMaxAttempts: number
  updatedAt: string
  updatedBy: string | null
  documents: OnboardingConfigDocument[]
  chapters: OnboardingConfigChapter[]
  questions: OnboardingConfigQuestion[]
}

/** Public config (no correctAnswer on questions) for employee wizard */
export interface OnboardingPublicConfig {
  id: string
  ndaContent: string
  videoUrl: string | null
  videoFileName: string | null
  videoDescription: string | null
  quizPassThreshold: number
  quizMaxAttempts: number
  documents: OnboardingConfigDocument[]
  chapters: OnboardingConfigChapter[]
  questions: OnboardingPublicQuestion[]
}
