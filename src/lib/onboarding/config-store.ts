'use client'

import { create } from 'zustand'
import type {
  OnboardingConfig,
  OnboardingConfigDocument,
  OnboardingConfigChapter,
  OnboardingConfigQuestion,
} from './config-types'

interface ConfigState {
  config: OnboardingConfig | null
  isLoading: boolean
  error: string | null
}

interface ConfigActions {
  loadConfig: () => Promise<void>

  // NDA
  updateNda: (ndaContent: string) => Promise<void>

  // Quiz settings
  updateQuizSettings: (passThreshold: number, maxAttempts: number) => Promise<void>

  // Documents
  addDocument: (data: { title: string; content: string; minReadingSeconds: number }) => Promise<void>
  updateDocument: (id: string, data: { title: string; content: string; minReadingSeconds: number }) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  reorderDocuments: (orderedIds: string[]) => Promise<void>

  // Video
  deleteVideo: () => Promise<void>
  updateVideoDescription: (description: string) => Promise<void>

  // Chapters
  addChapter: (data: { title: string; timestamp: number }) => Promise<void>
  updateChapter: (id: string, data: { title: string; timestamp: number }) => Promise<void>
  deleteChapter: (id: string) => Promise<void>

  // Questions
  addQuestion: (data: Omit<OnboardingConfigQuestion, 'id' | 'configId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateQuestion: (id: string, data: Omit<OnboardingConfigQuestion, 'id' | 'configId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  deleteQuestion: (id: string) => Promise<void>
  reorderQuestions: (orderedIds: string[]) => Promise<void>
}

export type OnboardingConfigStore = ConfigState & ConfigActions

export const useOnboardingConfigStore = create<OnboardingConfigStore>()((set, get) => ({
  config: null,
  isLoading: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config')
      if (!res.ok) throw new Error('Eroare la incarcarea configurarii')
      const data = await res.json()
      set({ config: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  updateNda: async (ndaContent) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ndaContent }),
      })
      if (!res.ok) throw new Error('Eroare la salvarea NDA')
      const data = await res.json()
      set({ config: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  updateQuizSettings: async (quizPassThreshold, quizMaxAttempts) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizPassThreshold, quizMaxAttempts }),
      })
      if (!res.ok) throw new Error('Eroare la salvare')
      const data = await res.json()
      set({ config: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  addDocument: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Eroare la adaugarea documentului')
      // Reload full config to get updated list
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  updateDocument: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/config/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Eroare la actualizarea documentului')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  deleteDocument: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/config/documents/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Eroare la stergerea documentului')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  reorderDocuments: async (orderedIds) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config/documents/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      })
      if (!res.ok) throw new Error('Eroare la reordonare')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  deleteVideo: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config/video', {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Eroare la stergerea video-ului')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  updateVideoDescription: async (description) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoDescription: description }),
      })
      if (!res.ok) throw new Error('Eroare la salvare')
      const data = await res.json()
      set({ config: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  addChapter: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config/video/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Eroare la adaugarea capitolului')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  updateChapter: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/config/video/chapters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Eroare la actualizarea capitolului')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  deleteChapter: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/config/video/chapters/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Eroare la stergerea capitolului')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  addQuestion: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Eroare la adaugarea intrebarii')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  updateQuestion: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/config/quiz/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Eroare la actualizarea intrebarii')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  deleteQuestion: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/onboarding/config/quiz/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Eroare la stergerea intrebarii')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  reorderQuestions: async (orderedIds) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/onboarding/config/quiz/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      })
      if (!res.ok) throw new Error('Eroare la reordonare')
      await get().loadConfig()
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },
}))
