/**
 * Onboarding store for LaserZone Hub
 * Manages wizard state machine with step dependencies
 * Data operations use API calls to /api/onboarding/*
 */

import { create } from 'zustand'
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

// ============================================================================
// Constants
// ============================================================================

export const STEP_ORDER: OnboardingStep[] = [...ONBOARDING_STEPS]

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

export const MAX_QUIZ_ATTEMPTS = 3
export const QUIZ_PASS_THRESHOLD = 80

// ============================================================================
// API Response to Store Mapping
// ============================================================================

/**
 * Map flat DB record from API to the nested OnboardingProgress shape
 * the store and components expect.
 */
function mapApiToProgress(record: Record<string, unknown>): OnboardingProgress {
  const ndaSignature = record.ndaSignature as Record<string, unknown> | null
  const videoProgress = record.videoProgress as Record<string, unknown> | null
  const documents = (record.documents as Record<string, unknown>[]) || []
  const quizAttempts = (record.quizAttempts as Record<string, unknown>[]) || []
  const physicalHandoff = record.physicalHandoff as Record<string, unknown> | null
  const auditLog = (record.auditLog as Record<string, unknown>[]) || []

  return {
    employeeId: record.employeeId as string,
    employeeName: record.employeeName as string,
    startedAt: new Date(record.startedAt as string),
    currentStep: record.currentStep as OnboardingStep,
    nda: ndaSignature
      ? {
          signatureDataUrl: ndaSignature.signatureDataUrl as string,
          signedAt: new Date(ndaSignature.signedAt as string),
          signedBy: ndaSignature.signedBy as string,
          signedByName: ndaSignature.signedByName as string,
          pdfDataUrl: ndaSignature.pdfDataUrl as string | undefined,
        }
      : undefined,
    documents: documents.map((d) => ({
      documentId: d.documentId as string,
      startedAt: d.startedAt ? new Date(d.startedAt as string) : undefined,
      completedAt: d.completedAt ? new Date(d.completedAt as string) : undefined,
      timeSpentSeconds: (d.timeSpentSeconds as number) || 0,
      confirmed: (d.confirmed as boolean) || false,
    })),
    video: videoProgress
      ? {
          startedAt: videoProgress.startedAt
            ? new Date(videoProgress.startedAt as string)
            : undefined,
          completedAt: videoProgress.completedAt
            ? new Date(videoProgress.completedAt as string)
            : undefined,
          lastPosition: (videoProgress.lastPosition as number) || 0,
          totalDuration: (videoProgress.totalDuration as number) || 0,
          furthestReached: (videoProgress.furthestReached as number) || 0,
          completed: (videoProgress.completed as boolean) || false,
        }
      : undefined,
    quizAttempts: quizAttempts.map((a) => ({
      attemptNumber: a.attemptNumber as number,
      startedAt: new Date(a.startedAt as string),
      completedAt: a.completedAt ? new Date(a.completedAt as string) : undefined,
      answers: a.answers as Record<string, string | string[]>,
      score: a.score as number,
      passed: a.passed as boolean,
    })),
    physicalHandoff: physicalHandoff
      ? {
          markedByManager: (physicalHandoff.markedByManager as boolean) || false,
          managerSignature: physicalHandoff.managerSignature
            ? {
                dataUrl: (physicalHandoff.managerSignature as Record<string, unknown>)
                  .dataUrl as string,
                signedAt: new Date(
                  (physicalHandoff.managerSignature as Record<string, unknown>)
                    .signedAt as string
                ),
                signedBy: (physicalHandoff.managerSignature as Record<string, unknown>)
                  .signedBy as string,
                signerName: (physicalHandoff.managerSignature as Record<string, unknown>)
                  .signerName as string,
              }
            : undefined,
          confirmedByEmployee: (physicalHandoff.confirmedByEmployee as boolean) || false,
          employeeConfirmedAt: physicalHandoff.employeeConfirmedAt
            ? new Date(physicalHandoff.employeeConfirmedAt as string)
            : undefined,
        }
      : undefined,
    completedAt: record.completedAt ? new Date(record.completedAt as string) : undefined,
    isComplete: (record.isComplete as boolean) || false,
    auditLog: auditLog.map((e) => ({
      id: e.id as string,
      timestamp: new Date(e.timestamp as string),
      step: e.step as OnboardingStep,
      action: e.action as string,
      performedBy: e.performedBy as string,
      details: e.details as Record<string, unknown> | undefined,
    })),
  }
}

// ============================================================================
// Store Types
// ============================================================================

interface OnboardingState {
  currentProgress: OnboardingProgress | null
  allProgress: OnboardingProgress[]
  isLoading: boolean
  error: string | null
}

interface OnboardingActions {
  // Initialization
  initializeOnboarding: (employeeId: string, employeeName: string) => Promise<void>
  loadProgress: (employeeId: string) => Promise<OnboardingProgress | null>

  // Navigation (client-side UI logic)
  getStepStatus: (step: OnboardingStep) => StepStatus
  canAccessStep: (step: OnboardingStep) => boolean
  goToStep: (step: OnboardingStep) => void

  // NDA Step
  signNda: (signatureDataUrl: string, signedBy: string, signedByName: string) => Promise<void>
  saveNdaPdf: (pdfDataUrl: string) => void

  // Documents Step
  startDocument: (documentId: string) => void
  updateDocumentTime: (documentId: string, seconds: number) => void
  confirmDocument: (documentId: string) => Promise<void>
  areAllDocumentsConfirmed: () => boolean

  // Video Step
  updateVideoProgress: (position: number, duration: number) => void
  completeVideo: () => Promise<void>

  // Quiz Step
  submitQuizAttempt: (answers: Record<string, string | string[]>) => Promise<boolean>
  canRetryQuiz: () => boolean
  getQuizAttemptsRemaining: () => number

  // Physical Handoff
  managerMarkHandoff: (signature: { dataUrl: string; signedBy: string; signerName: string }) => Promise<void>
  employeeConfirmHandoff: () => Promise<void>

  // Completion
  completeOnboarding: () => Promise<void>

  // Audit
  addAuditEntry: (step: OnboardingStep, action: string, details?: Record<string, unknown>) => void

  // Manager Queries
  getAllIncompleteOnboarding: () => OnboardingProgress[]
  getOnboardingByEmployee: (employeeId: string) => OnboardingProgress | undefined
  fetchAllIncomplete: () => Promise<void>
  fetchAllProgress: () => Promise<void>

  // Manager Actions
  resetOnboarding: (employeeId: string) => Promise<void>
}

export type OnboardingStore = OnboardingState & OnboardingActions

// ============================================================================
// Helper Functions
// ============================================================================

function isStepCompleted(progress: OnboardingProgress, step: OnboardingStep): boolean {
  switch (step) {
    case 'nda':
      return !!progress.nda
    case 'documents':
      return progress.documents.length > 0 && progress.documents.every((d) => d.confirmed)
    case 'video':
      return !!progress.video?.completed
    case 'quiz':
      return progress.quizAttempts.some((a) => a.passed)
    case 'notification':
      return progress.quizAttempts.some((a) => a.passed)
    case 'handoff':
      return !!progress.physicalHandoff?.confirmedByEmployee
    case 'confirmation':
      return !!progress.physicalHandoff?.confirmedByEmployee
    case 'complete':
      return progress.isComplete
  }
}

function areDependenciesMet(progress: OnboardingProgress, step: OnboardingStep): boolean {
  const dependencies = STEP_DEPENDENCIES[step]
  return dependencies.every((dep) => isStepCompleted(progress, dep))
}

// ============================================================================
// Helpers for Store
// ============================================================================

/**
 * After an API call that returns the full progress record, the response
 * contains `currentStep` as stored in the DB.  The client-side wizard may
 * have advanced beyond that value (via goToStep) so we must preserve the
 * client-side step to avoid the wizard jumping backward.
 */
function preserveClientStep(
  apiProgress: OnboardingProgress,
  clientStep: OnboardingStep | undefined
): OnboardingProgress {
  if (!clientStep) return apiProgress

  const clientIdx = STEP_ORDER.indexOf(clientStep)
  const apiIdx = STEP_ORDER.indexOf(apiProgress.currentStep)

  // Keep whichever step is further ahead
  if (clientIdx > apiIdx) {
    return { ...apiProgress, currentStep: clientStep }
  }
  return apiProgress
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useOnboardingStore = create<OnboardingStore>()((set, get) => ({
  // Initial state
  currentProgress: null,
  allProgress: [],
  isLoading: false,
  error: null,

  // ========== Initialization ==========

  initializeOnboarding: async (employeeId, employeeName) => {
    // Check if progress already loaded
    const existing = get().allProgress.find((p) => p.employeeId === employeeId)
    if (existing) {
      set({ currentProgress: existing })
      return
    }

    // Try loading from API first
    set({ isLoading: true, error: null })
    try {
      const getRes = await fetch(`/api/onboarding/${employeeId}`)
      if (getRes.ok) {
        const data = await getRes.json()
        const progress = mapApiToProgress(data)
        set((state) => ({
          currentProgress: progress,
          allProgress: [...state.allProgress.filter((p) => p.employeeId !== employeeId), progress],
          isLoading: false,
        }))
        return
      }

      // Not found - create new
      if (getRes.status === 404) {
        const postRes = await fetch(`/api/onboarding/${employeeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeName }),
        })

        if (!postRes.ok) {
          const errData = await postRes.json().catch(() => ({}))
          throw new Error(errData.error || 'Eroare la crearea onboarding-ului')
        }

        const data = await postRes.json()
        const progress = mapApiToProgress(data)
        set((state) => ({
          currentProgress: progress,
          allProgress: [...state.allProgress, progress],
          isLoading: false,
        }))
        return
      }

      throw new Error('Eroare la incarcarea progresului')
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  loadProgress: async (employeeId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/${employeeId}`)
      if (res.status === 404) {
        set({ isLoading: false })
        return null
      }
      if (!res.ok) {
        throw new Error('Eroare la incarcarea progresului')
      }
      const data = await res.json()
      const progress = mapApiToProgress(data)
      set((state) => ({
        currentProgress: progress,
        allProgress: [...state.allProgress.filter((p) => p.employeeId !== employeeId), progress],
        isLoading: false,
      }))
      return progress
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      return null
    }
  },

  // ========== Navigation (client-side) ==========

  getStepStatus: (step) => {
    const { currentProgress } = get()
    if (!currentProgress) return 'locked'

    if (isStepCompleted(currentProgress, step)) {
      return 'completed'
    }

    if (!areDependenciesMet(currentProgress, step)) {
      return 'locked'
    }

    if (currentProgress.currentStep === step) {
      return 'in_progress'
    }

    return 'available'
  },

  canAccessStep: (step) => {
    const status = get().getStepStatus(step)
    return status !== 'locked'
  },

  goToStep: (step) => {
    if (!get().canAccessStep(step)) return

    const employeeId = get().currentProgress?.employeeId

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

    // Persist to DB (fire-and-forget so UI stays snappy)
    if (employeeId) {
      fetch(`/api/onboarding/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStep: step }),
      }).catch(() => {})
    }
  },

  // ========== NDA Step ==========

  signNda: async (signatureDataUrl, signedBy, signedByName) => {
    const { currentProgress } = get()
    if (!currentProgress) {
      const msg = 'Eroare: progresul onboarding nu este incarcat. Reincarcati pagina.'
      set({ error: msg })
      throw new Error(msg)
    }

    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/${currentProgress.employeeId}/nda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureDataUrl, signedByName }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la semnarea NDA')
      }

      const data = await res.json()
      const progress = preserveClientStep(mapApiToProgress(data), get().currentProgress?.currentStep)
      set((state) => ({
        currentProgress: progress,
        allProgress: state.allProgress.map((p) =>
          p.employeeId === progress.employeeId ? progress : p
        ),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      throw err
    }
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
      if (existingDoc) return state

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

  confirmDocument: async (documentId) => {
    const { currentProgress } = get()
    console.log('[Store] confirmDocument called', { documentId, hasProgress: !!currentProgress, employeeId: currentProgress?.employeeId })
    if (!currentProgress) {
      const msg = 'Eroare: progresul onboarding nu este incarcat. Reincarcati pagina.'
      set({ error: msg })
      throw new Error(msg)
    }

    const docProgress = currentProgress.documents.find((d) => d.documentId === documentId)

    set({ isLoading: true, error: null })
    try {
      console.log('[Store] confirmDocument fetching PUT /api/onboarding/' + currentProgress.employeeId + '/documents')
      const res = await fetch(`/api/onboarding/${currentProgress.employeeId}/documents`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          timeSpentSeconds: docProgress?.timeSpentSeconds || 0,
          confirmed: true,
        }),
      })

      console.log('[Store] confirmDocument response status:', res.status)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('[Store] confirmDocument API error:', errData)
        throw new Error(errData.error || 'Eroare la confirmarea documentului')
      }

      const data = await res.json()
      const progress = preserveClientStep(mapApiToProgress(data), get().currentProgress?.currentStep)
      console.log('[Store] confirmDocument success, doc confirmed:', progress.documents.find(d => d.documentId === documentId)?.confirmed)
      set((state) => ({
        currentProgress: progress,
        allProgress: state.allProgress.map((p) =>
          p.employeeId === progress.employeeId ? progress : p
        ),
        isLoading: false,
      }))
    } catch (err) {
      console.error('[Store] confirmDocument caught error:', err)
      set({ isLoading: false, error: (err as Error).message })
      throw err
    }
  },

  areAllDocumentsConfirmed: () => {
    const { currentProgress } = get()
    if (!currentProgress) return false
    return currentProgress.documents.length > 0 && currentProgress.documents.every((d) => d.confirmed)
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

  completeVideo: async () => {
    const { currentProgress } = get()
    if (!currentProgress?.video) return

    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/${currentProgress.employeeId}/video`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastPosition: currentProgress.video.lastPosition,
          furthestReached: currentProgress.video.furthestReached,
          completed: true,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la completarea video')
      }

      const data = await res.json()
      const progress = preserveClientStep(mapApiToProgress(data), get().currentProgress?.currentStep)
      set((state) => ({
        currentProgress: progress,
        allProgress: state.allProgress.map((p) =>
          p.employeeId === progress.employeeId ? progress : p
        ),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  // ========== Quiz Step ==========

  submitQuizAttempt: async (answers) => {
    const { currentProgress } = get()
    if (!currentProgress) return false

    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/${currentProgress.employeeId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la trimiterea quiz-ului')
      }

      const data = await res.json()
      const progress = preserveClientStep(mapApiToProgress(data), get().currentProgress?.currentStep)
      const quizResult = data._quizResult

      set((state) => ({
        currentProgress: progress,
        allProgress: state.allProgress.map((p) =>
          p.employeeId === progress.employeeId ? progress : p
        ),
        isLoading: false,
      }))

      return quizResult?.passed ?? false
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      return false
    }
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

  managerMarkHandoff: async (signature) => {
    const { currentProgress } = get()
    if (!currentProgress) return

    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/${currentProgress.employeeId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'manager',
          signature: {
            dataUrl: signature.dataUrl,
            signerName: signature.signerName,
          },
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la marcarea predarii')
      }

      const data = await res.json()
      const progress = preserveClientStep(mapApiToProgress(data), get().currentProgress?.currentStep)
      set((state) => ({
        currentProgress: progress,
        allProgress: state.allProgress.map((p) =>
          p.employeeId === progress.employeeId ? progress : p
        ),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  employeeConfirmHandoff: async () => {
    const { currentProgress } = get()
    if (!currentProgress?.physicalHandoff?.markedByManager) return

    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/${currentProgress.employeeId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'employee' }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la confirmarea primirii')
      }

      const data = await res.json()
      const progress = preserveClientStep(mapApiToProgress(data), get().currentProgress?.currentStep)
      set((state) => ({
        currentProgress: progress,
        allProgress: state.allProgress.map((p) =>
          p.employeeId === progress.employeeId ? progress : p
        ),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  // ========== Completion ==========

  completeOnboarding: async () => {
    const { currentProgress } = get()
    if (!currentProgress) return

    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/${currentProgress.employeeId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la finalizarea onboarding-ului')
      }

      const data = await res.json()
      const progress = preserveClientStep(mapApiToProgress(data), get().currentProgress?.currentStep)
      set((state) => ({
        currentProgress: progress,
        allProgress: state.allProgress.map((p) =>
          p.employeeId === progress.employeeId ? progress : p
        ),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
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

  fetchAllIncomplete: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding?incomplete=true')
      if (!res.ok) {
        throw new Error('Eroare la incarcarea datelor')
      }
      const records = await res.json()
      const allProgress = (records as Record<string, unknown>[]).map(mapApiToProgress)
      set({ allProgress, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  fetchAllProgress: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding')
      if (!res.ok) {
        throw new Error('Eroare la incarcarea datelor')
      }
      const records = await res.json()
      const allProgress = (records as Record<string, unknown>[]).map(mapApiToProgress)
      set({ allProgress, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  // ========== Manager Actions ==========

  resetOnboarding: async (employeeId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/${employeeId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la resetarea onboarding-ului')
      }

      const data = await res.json()
      const progress = mapApiToProgress(data)
      set((state) => ({
        currentProgress:
          state.currentProgress?.employeeId === employeeId ? progress : state.currentProgress,
        allProgress: state.allProgress.map((p) =>
          p.employeeId === employeeId ? progress : p
        ),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      throw err
    }
  },
}))
