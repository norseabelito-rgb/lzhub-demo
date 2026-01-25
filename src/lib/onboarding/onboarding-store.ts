/**
 * Onboarding store for LaserZone Hub
 * Manages wizard state machine with step dependencies and persistence
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  OnboardingStep,
  StepStatus,
  OnboardingProgress,
  NdaSignature,
  VideoProgress,
  QuizAttempt,
  OnboardingAuditEntry,
} from './types'
import { ONBOARDING_STEPS } from './types'

const ONBOARDING_STORAGE_KEY = 'laserzone-onboarding'

// ============================================================================
// Constants
// ============================================================================

/**
 * Ordinea pasilor in wizard (secventiala)
 */
export const STEP_ORDER: OnboardingStep[] = [...ONBOARDING_STEPS]

/**
 * Dependintele fiecarui pas - ce pasi trebuie completati inainte
 */
export const STEP_DEPENDENCIES: Record<OnboardingStep, OnboardingStep[]> = {
  nda: [],
  documents: ['nda'],
  video: ['documents'],
  quiz: ['video'],
  notification: ['quiz'],
  handoff: ['notification'],
  confirmation: ['handoff'],
  complete: ['confirmation'],
}

/** Numarul maxim de incercari la quiz */
export const MAX_QUIZ_ATTEMPTS = 3

/** Procentul minim pentru a trece quiz-ul */
export const QUIZ_PASS_THRESHOLD = 80

// ============================================================================
// Store Types
// ============================================================================

interface OnboardingState {
  /** Progresul curent al angajatului logat (sesiune curenta) */
  currentProgress: OnboardingProgress | null
  /** Toate progresele pentru dashboard manager */
  allProgress: OnboardingProgress[]
}

interface OnboardingActions {
  // Initialization
  initializeOnboarding: (employeeId: string, employeeName: string) => void
  loadProgress: (employeeId: string) => OnboardingProgress | null

  // Navigation
  getStepStatus: (step: OnboardingStep) => StepStatus
  canAccessStep: (step: OnboardingStep) => boolean
  goToStep: (step: OnboardingStep) => void

  // NDA Step
  signNda: (signatureDataUrl: string, signedBy: string, signedByName: string) => void
  saveNdaPdf: (pdfDataUrl: string) => void

  // Documents Step
  startDocument: (documentId: string) => void
  updateDocumentTime: (documentId: string, seconds: number) => void
  confirmDocument: (documentId: string) => void
  areAllDocumentsConfirmed: () => boolean

  // Video Step
  updateVideoProgress: (position: number, duration: number) => void
  completeVideo: () => void

  // Quiz Step
  submitQuizAttempt: (answers: Record<string, string | string[]>, score: number) => boolean
  canRetryQuiz: () => boolean
  getQuizAttemptsRemaining: () => number

  // Physical Handoff
  managerMarkHandoff: (signature: { dataUrl: string; signedBy: string; signerName: string }) => void
  employeeConfirmHandoff: () => void

  // Completion
  completeOnboarding: () => void

  // Audit
  addAuditEntry: (step: OnboardingStep, action: string, details?: Record<string, unknown>) => void

  // Manager Queries
  getAllIncompleteOnboarding: () => OnboardingProgress[]
  getOnboardingByEmployee: (employeeId: string) => OnboardingProgress | undefined
}

export type OnboardingStore = OnboardingState & OnboardingActions

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Obtine indexul unui pas in wizard
 */
function getStepIndex(step: OnboardingStep): number {
  return STEP_ORDER.indexOf(step)
}

/**
 * Verifica daca un pas este completat
 */
function isStepCompleted(progress: OnboardingProgress, step: OnboardingStep): boolean {
  switch (step) {
    case 'nda':
      return !!progress.nda
    case 'documents':
      // Toate documentele trebuie confirmate
      return progress.documents.length > 0 && progress.documents.every((d) => d.confirmed)
    case 'video':
      return !!progress.video?.completed
    case 'quiz':
      // Cel putin o incercare trecuta
      return progress.quizAttempts.some((a) => a.passed)
    case 'notification':
      // Notificarea e doar un pas informativ, se completeaza automat dupa quiz
      return progress.quizAttempts.some((a) => a.passed)
    case 'handoff':
      return !!progress.physicalHandoff?.confirmedByEmployee
    case 'confirmation':
      // Confirmarea finala e doar un pas informativ
      return !!progress.physicalHandoff?.confirmedByEmployee
    case 'complete':
      return progress.isComplete
  }
}

/**
 * Verifica daca toate dependintele unui pas sunt satisfacute
 */
function areDependenciesMet(progress: OnboardingProgress, step: OnboardingStep): boolean {
  const dependencies = STEP_DEPENDENCIES[step]
  return dependencies.every((dep) => isStepCompleted(progress, dep))
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProgress: null,
      allProgress: [],

      // ========== Initialization ==========

      initializeOnboarding: (employeeId, employeeName) => {
        // Check if progress already exists
        const existing = get().allProgress.find((p) => p.employeeId === employeeId)

        if (existing) {
          // Load existing progress
          set({ currentProgress: existing })
          return
        }

        // Create new progress
        const now = new Date()
        const newProgress: OnboardingProgress = {
          employeeId,
          employeeName,
          startedAt: now,
          currentStep: 'nda',
          documents: [],
          quizAttempts: [],
          isComplete: false,
          auditLog: [
            {
              id: crypto.randomUUID(),
              timestamp: now,
              step: 'nda',
              action: 'Onboarding initializat',
              performedBy: employeeId,
            },
          ],
        }

        set((state) => ({
          currentProgress: newProgress,
          allProgress: [...state.allProgress, newProgress],
        }))
      },

      loadProgress: (employeeId) => {
        const progress = get().allProgress.find((p) => p.employeeId === employeeId)
        if (progress) {
          set({ currentProgress: progress })
        }
        return progress || null
      },

      // ========== Navigation ==========

      getStepStatus: (step) => {
        const { currentProgress } = get()
        if (!currentProgress) return 'locked'

        // If step is completed
        if (isStepCompleted(currentProgress, step)) {
          return 'completed'
        }

        // If dependencies not met
        if (!areDependenciesMet(currentProgress, step)) {
          return 'locked'
        }

        // If this is the current step
        if (currentProgress.currentStep === step) {
          return 'in_progress'
        }

        // Available but not started
        return 'available'
      },

      canAccessStep: (step) => {
        const status = get().getStepStatus(step)
        return status !== 'locked'
      },

      goToStep: (step) => {
        if (!get().canAccessStep(step)) return

        set((state) => {
          if (!state.currentProgress) return state

          const updatedProgress = {
            ...state.currentProgress,
            currentStep: step,
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      // ========== NDA Step ==========

      signNda: (signatureDataUrl, signedBy, signedByName) => {
        const now = new Date()

        set((state) => {
          if (!state.currentProgress) return state

          const ndaSignature: NdaSignature = {
            signatureDataUrl,
            signedAt: now,
            signedBy,
            signedByName,
          }

          const auditEntry: OnboardingAuditEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            step: 'nda',
            action: 'NDA semnat',
            performedBy: signedBy,
          }

          const updatedProgress = {
            ...state.currentProgress,
            nda: ndaSignature,
            // Do NOT auto-advance - let step-nda.tsx handle advancement after PDF download
            auditLog: [...state.currentProgress.auditLog, auditEntry],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      saveNdaPdf: (pdfDataUrl) => {
        set((state) => {
          if (!state.currentProgress?.nda) return state

          const updatedProgress = {
            ...state.currentProgress,
            nda: {
              ...state.currentProgress.nda,
              pdfDataUrl,
            },
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      // ========== Documents Step ==========

      startDocument: (documentId) => {
        const now = new Date()

        set((state) => {
          if (!state.currentProgress) return state

          const existingDoc = state.currentProgress.documents.find((d) => d.documentId === documentId)
          if (existingDoc) return state // Already started

          const newDocProgress = {
            documentId,
            startedAt: now,
            timeSpentSeconds: 0,
            confirmed: false,
          }

          const updatedProgress = {
            ...state.currentProgress,
            documents: [...state.currentProgress.documents, newDocProgress],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      updateDocumentTime: (documentId, seconds) => {
        set((state) => {
          if (!state.currentProgress) return state

          const updatedDocuments = state.currentProgress.documents.map((d) =>
            d.documentId === documentId
              ? { ...d, timeSpentSeconds: d.timeSpentSeconds + seconds }
              : d
          )

          const updatedProgress = {
            ...state.currentProgress,
            documents: updatedDocuments,
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      confirmDocument: (documentId) => {
        const now = new Date()

        set((state) => {
          if (!state.currentProgress) return state

          const updatedDocuments = state.currentProgress.documents.map((d) =>
            d.documentId === documentId
              ? { ...d, confirmed: true, completedAt: now }
              : d
          )

          const auditEntry: OnboardingAuditEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            step: 'documents',
            action: `Document confirmat: ${documentId}`,
            performedBy: state.currentProgress.employeeId,
            details: { documentId },
          }

          const updatedProgress = {
            ...state.currentProgress,
            documents: updatedDocuments,
            auditLog: [...state.currentProgress.auditLog, auditEntry],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      areAllDocumentsConfirmed: () => {
        const { currentProgress } = get()
        if (!currentProgress) return false
        // Assume 3 documents required (will be validated against mock data)
        return currentProgress.documents.length >= 3 && currentProgress.documents.every((d) => d.confirmed)
      },

      // ========== Video Step ==========

      updateVideoProgress: (position, duration) => {
        set((state) => {
          if (!state.currentProgress) return state

          const existingVideo = state.currentProgress.video
          const now = new Date()

          const videoProgress: VideoProgress = {
            startedAt: existingVideo?.startedAt || now,
            lastPosition: position,
            totalDuration: duration,
            // Cannot skip ahead - furthestReached is max of current position and previous furthest
            furthestReached: Math.max(position, existingVideo?.furthestReached || 0),
            completed: existingVideo?.completed || false,
          }

          const updatedProgress = {
            ...state.currentProgress,
            video: videoProgress,
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      completeVideo: () => {
        const now = new Date()

        set((state) => {
          if (!state.currentProgress?.video) return state

          const auditEntry: OnboardingAuditEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            step: 'video',
            action: 'Video de training completat',
            performedBy: state.currentProgress.employeeId,
          }

          const updatedProgress = {
            ...state.currentProgress,
            video: {
              ...state.currentProgress.video,
              completed: true,
              completedAt: now,
            },
            currentStep: 'quiz' as OnboardingStep,
            auditLog: [...state.currentProgress.auditLog, auditEntry],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      // ========== Quiz Step ==========

      submitQuizAttempt: (answers, score) => {
        const { currentProgress, canRetryQuiz } = get()
        if (!currentProgress) return false
        if (!canRetryQuiz() && currentProgress.quizAttempts.length >= MAX_QUIZ_ATTEMPTS) return false

        const now = new Date()
        const passed = score >= QUIZ_PASS_THRESHOLD

        const attempt: QuizAttempt = {
          attemptNumber: currentProgress.quizAttempts.length + 1,
          startedAt: now,
          completedAt: now,
          answers,
          score,
          passed,
        }

        const auditEntry: OnboardingAuditEntry = {
          id: crypto.randomUUID(),
          timestamp: now,
          step: 'quiz',
          action: passed
            ? `Quiz trecut (${score}% - incercarea ${attempt.attemptNumber})`
            : `Quiz nereusit (${score}% - incercarea ${attempt.attemptNumber})`,
          performedBy: currentProgress.employeeId,
          details: { score, passed, attemptNumber: attempt.attemptNumber },
        }

        set((state) => {
          if (!state.currentProgress) return state

          const updatedProgress = {
            ...state.currentProgress,
            quizAttempts: [...state.currentProgress.quizAttempts, attempt],
            currentStep: passed ? ('notification' as OnboardingStep) : state.currentProgress.currentStep,
            auditLog: [...state.currentProgress.auditLog, auditEntry],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })

        return passed
      },

      canRetryQuiz: () => {
        const { currentProgress } = get()
        if (!currentProgress) return false

        const attempts = currentProgress.quizAttempts
        const hasPassed = attempts.some((a) => a.passed)
        const hasAttemptsLeft = attempts.length < MAX_QUIZ_ATTEMPTS

        return !hasPassed && hasAttemptsLeft
      },

      getQuizAttemptsRemaining: () => {
        const { currentProgress } = get()
        if (!currentProgress) return 0
        return Math.max(0, MAX_QUIZ_ATTEMPTS - currentProgress.quizAttempts.length)
      },

      // ========== Physical Handoff ==========

      managerMarkHandoff: (signature) => {
        const now = new Date()

        set((state) => {
          if (!state.currentProgress) return state

          const auditEntry: OnboardingAuditEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            step: 'handoff',
            action: 'Predare echipamente marcata de manager',
            performedBy: signature.signedBy,
            details: { managerName: signature.signerName },
          }

          const updatedProgress = {
            ...state.currentProgress,
            physicalHandoff: {
              markedByManager: true,
              managerSignature: {
                dataUrl: signature.dataUrl,
                signedAt: now,
                signedBy: signature.signedBy,
                signerName: signature.signerName,
              },
              confirmedByEmployee: state.currentProgress.physicalHandoff?.confirmedByEmployee || false,
              employeeConfirmedAt: state.currentProgress.physicalHandoff?.employeeConfirmedAt,
            },
            auditLog: [...state.currentProgress.auditLog, auditEntry],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      employeeConfirmHandoff: () => {
        const now = new Date()

        set((state) => {
          if (!state.currentProgress?.physicalHandoff?.markedByManager) return state

          const auditEntry: OnboardingAuditEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            step: 'handoff',
            action: 'Primire echipamente confirmata de angajat',
            performedBy: state.currentProgress.employeeId,
          }

          const updatedProgress = {
            ...state.currentProgress,
            physicalHandoff: {
              ...state.currentProgress.physicalHandoff,
              confirmedByEmployee: true,
              employeeConfirmedAt: now,
            },
            currentStep: 'confirmation' as OnboardingStep,
            auditLog: [...state.currentProgress.auditLog, auditEntry],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      // ========== Completion ==========

      completeOnboarding: () => {
        const now = new Date()

        set((state) => {
          if (!state.currentProgress) return state

          const auditEntry: OnboardingAuditEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            step: 'complete',
            action: 'Onboarding finalizat cu succes',
            performedBy: state.currentProgress.employeeId,
          }

          const updatedProgress = {
            ...state.currentProgress,
            isComplete: true,
            completedAt: now,
            currentStep: 'complete' as OnboardingStep,
            auditLog: [...state.currentProgress.auditLog, auditEntry],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      // ========== Audit ==========

      addAuditEntry: (step, action, details) => {
        const now = new Date()

        set((state) => {
          if (!state.currentProgress) return state

          const auditEntry: OnboardingAuditEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            step,
            action,
            performedBy: state.currentProgress.employeeId,
            details,
          }

          const updatedProgress = {
            ...state.currentProgress,
            auditLog: [...state.currentProgress.auditLog, auditEntry],
          }

          return {
            currentProgress: updatedProgress,
            allProgress: state.allProgress.map((p) =>
              p.employeeId === updatedProgress.employeeId ? updatedProgress : p
            ),
          }
        })
      },

      // ========== Manager Queries ==========

      getAllIncompleteOnboarding: () => {
        return get().allProgress.filter((p) => !p.isComplete)
      },

      getOnboardingByEmployee: (employeeId) => {
        return get().allProgress.find((p) => p.employeeId === employeeId)
      },
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist allProgress - currentProgress is session-specific
      partialize: (state) => ({
        allProgress: state.allProgress,
      }),
    }
  )
)
