/**
 * Social Media store for LaserZone Hub
 * Manages posts, templates, hashtag sets, and content library
 * Data operations use API calls to /api/social/*
 */

import { create } from 'zustand'
import { isWithinInterval, parseISO } from 'date-fns'
import type {
  SocialPost,
  SocialPlatform,
  PostStatus,
  CaptionTemplate,
  HashtagSet,
  ContentLibraryItem,
  MediaType,
  PostMetrics,
  PlatformPostStatus,
} from './types'
import { DEFAULT_METRICS } from './constants'

// ============================================================================
// API Response Mapping
// ============================================================================

function mapApiPost(record: Record<string, unknown>): SocialPost {
  return {
    id: record.id as string,
    caption: record.caption as string,
    mediaIds: (record.mediaIds as string[]) || [],
    hashtags: (record.hashtags as string[]) || [],
    platforms: (record.platforms as SocialPlatform[]) || [],
    scheduledAt: record.scheduledAt ? new Date(record.scheduledAt as string) : null,
    publishedAt: record.publishedAt ? new Date(record.publishedAt as string) : null,
    status: record.status as PostStatus,
    platformStatuses: (record.platformStatuses as Record<SocialPlatform, PlatformPostStatus>) || {
      facebook: { status: 'draft' },
      instagram: { status: 'draft' },
      tiktok: { status: 'draft' },
    },
    metrics: (record.metrics as Record<SocialPlatform, PostMetrics>) || {
      facebook: { ...DEFAULT_METRICS, lastUpdated: new Date() },
      instagram: { ...DEFAULT_METRICS, lastUpdated: new Date() },
      tiktok: { ...DEFAULT_METRICS, lastUpdated: new Date() },
    },
    createdBy: record.createdById as string,
    createdAt: new Date(record.createdAt as string),
    updatedAt: new Date(record.updatedAt as string),
  }
}

function mapApiTemplate(record: Record<string, unknown>): CaptionTemplate {
  return {
    id: record.id as string,
    name: record.name as string,
    content: record.content as string,
    category: record.category as string,
    createdAt: new Date(record.createdAt as string),
  }
}

function mapApiHashtagSet(record: Record<string, unknown>): HashtagSet {
  return {
    id: record.id as string,
    name: record.name as string,
    hashtags: (record.hashtags as string[]) || [],
    createdAt: new Date(record.createdAt as string),
  }
}

function mapApiLibraryItem(record: Record<string, unknown>): ContentLibraryItem {
  return {
    id: record.id as string,
    name: record.name as string,
    type: record.type as MediaType,
    url: record.url as string,
    thumbnailUrl: record.thumbnailUrl as string,
    mimeType: record.mimeType as string,
    size: record.size as number,
    dimensions: record.width
      ? { width: record.width as number, height: record.height as number }
      : undefined,
    duration: record.duration as number | undefined,
    tags: (record.tags as string[]) || [],
    createdAt: new Date(record.createdAt as string),
    updatedAt: new Date(record.updatedAt as string),
  }
}

// ============================================================================
// Store Types
// ============================================================================

interface SocialState {
  posts: SocialPost[]
  captionTemplates: CaptionTemplate[]
  hashtagSets: HashtagSet[]
  contentLibrary: ContentLibraryItem[]
  isLoading: boolean
  error: string | null
}

interface SocialActions {
  // Fetch
  fetchPosts: (params?: { status?: PostStatus; from?: string; to?: string }) => Promise<void>
  fetchTemplates: () => Promise<void>
  fetchHashtagSets: () => Promise<void>
  fetchLibrary: () => Promise<void>

  // Post CRUD
  createPost: (
    data: Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt' | 'metrics' | 'platformStatuses' | 'publishedAt' | 'status'>
  ) => Promise<string>
  updatePost: (id: string, updates: Partial<SocialPost>) => Promise<void>
  deletePost: (id: string) => Promise<void>
  schedulePost: (id: string, scheduledAt: Date) => Promise<void>
  publishPost: (id: string) => Promise<void>
  cancelSchedule: (id: string) => Promise<void>

  // Post queries (client-side)
  getPostById: (id: string) => SocialPost | undefined
  getPostsByStatus: (status: PostStatus) => SocialPost[]
  getPostsForDateRange: (startDate: string, endDate: string) => SocialPost[]
  getScheduledPosts: () => SocialPost[]
  getDrafts: () => SocialPost[]

  // Template CRUD
  createTemplate: (data: Omit<CaptionTemplate, 'id' | 'createdAt'>) => Promise<string>
  updateTemplate: (id: string, updates: Partial<CaptionTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  getTemplateById: (id: string) => CaptionTemplate | undefined
  getTemplatesByCategory: (category: string) => CaptionTemplate[]

  // Hashtag Set CRUD
  createHashtagSet: (data: Omit<HashtagSet, 'id' | 'createdAt'>) => Promise<string>
  updateHashtagSet: (id: string, updates: Partial<HashtagSet>) => Promise<void>
  deleteHashtagSet: (id: string) => Promise<void>
  getHashtagSetById: (id: string) => HashtagSet | undefined

  // Content Library
  addToLibrary: (item: Omit<ContentLibraryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  removeFromLibrary: (id: string) => Promise<void>
  updateLibraryItem: (id: string, updates: Partial<ContentLibraryItem>) => Promise<void>
  getLibraryItemById: (id: string) => ContentLibraryItem | undefined
  getLibraryByType: (type: MediaType) => ContentLibraryItem[]
  getLibraryByTag: (tag: string) => ContentLibraryItem[]
}

export type SocialStore = SocialState & SocialActions

// ============================================================================
// Store Implementation
// ============================================================================

export const useSocialStore = create<SocialStore>()((set, get) => ({
  // Initial state
  posts: [],
  captionTemplates: [],
  hashtagSets: [],
  contentLibrary: [],
  isLoading: false,
  error: null,

  // ========== Fetch ==========

  fetchPosts: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.set('status', params.status)
      if (params?.from) searchParams.set('from', params.from)
      if (params?.to) searchParams.set('to', params.to)

      const qs = searchParams.toString()
      const res = await fetch(`/api/social/posts${qs ? `?${qs}` : ''}`)
      if (!res.ok) throw new Error('Eroare la incarcarea posturilor')
      const data = await res.json()
      set({ posts: (data as Record<string, unknown>[]).map(mapApiPost), isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  fetchTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/social/templates')
      if (!res.ok) throw new Error('Eroare la incarcarea template-urilor')
      const data = await res.json()
      set({ captionTemplates: (data as Record<string, unknown>[]).map(mapApiTemplate), isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  fetchHashtagSets: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/social/hashtags')
      if (!res.ok) throw new Error('Eroare la incarcarea seturilor de hashtag-uri')
      const data = await res.json()
      set({ hashtagSets: (data as Record<string, unknown>[]).map(mapApiHashtagSet), isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  fetchLibrary: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/social/library')
      if (!res.ok) throw new Error('Eroare la incarcarea bibliotecii')
      const data = await res.json()
      set({ contentLibrary: (data as Record<string, unknown>[]).map(mapApiLibraryItem), isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  // ========== Post CRUD ==========

  createPost: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: data.caption,
          mediaIds: data.mediaIds,
          hashtags: data.hashtags,
          platforms: data.platforms,
          scheduledAt: data.scheduledAt,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la crearea postului')
      }

      const postData = await res.json()
      const post = mapApiPost(postData)
      set((state) => ({ posts: [...state.posts, post], isLoading: false }))
      return post.id
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      return ''
    }
  },

  updatePost: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la actualizarea postului')
      }

      const postData = await res.json()
      const post = mapApiPost(postData)
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? post : p)),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  deletePost: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la stergerea postului')
      }
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  schedulePost: async (id, scheduledAt) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/posts/${id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la programarea postului')
      }

      const postData = await res.json()
      const post = mapApiPost(postData)
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? post : p)),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  publishPost: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/posts/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la publicarea postului')
      }

      const postData = await res.json()
      const post = mapApiPost(postData)
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? post : p)),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  cancelSchedule: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: null, status: 'draft' }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la anularea programarii')
      }

      const postData = await res.json()
      const post = mapApiPost(postData)
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? post : p)),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  // ========== Post Queries (client-side) ==========

  getPostById: (id) => {
    return get().posts.find((p) => p.id === id)
  },

  getPostsByStatus: (status) => {
    return get().posts.filter((p) => p.status === status)
  },

  getPostsForDateRange: (startDate, endDate) => {
    const start = parseISO(startDate)
    const end = parseISO(endDate)

    return get().posts.filter((p) => {
      if (!p.scheduledAt) return false
      const postDate = p.scheduledAt instanceof Date ? p.scheduledAt : new Date(p.scheduledAt)
      return isWithinInterval(postDate, { start, end })
    })
  },

  getScheduledPosts: () => {
    return get()
      .posts.filter((p) => p.status === 'scheduled' && p.scheduledAt)
      .sort((a, b) => {
        const dateA = a.scheduledAt instanceof Date ? a.scheduledAt : new Date(a.scheduledAt!)
        const dateB = b.scheduledAt instanceof Date ? b.scheduledAt : new Date(b.scheduledAt!)
        return dateA.getTime() - dateB.getTime()
      })
  },

  getDrafts: () => {
    return get().posts.filter((p) => p.status === 'draft')
  },

  // ========== Template CRUD ==========

  createTemplate: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/social/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la crearea template-ului')
      }

      const templateData = await res.json()
      const template = mapApiTemplate(templateData)
      set((state) => ({
        captionTemplates: [...state.captionTemplates, template],
        isLoading: false,
      }))
      return template.id
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      return ''
    }
  },

  updateTemplate: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la actualizarea template-ului')
      }

      const templateData = await res.json()
      const template = mapApiTemplate(templateData)
      set((state) => ({
        captionTemplates: state.captionTemplates.map((t) => (t.id === id ? template : t)),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la stergerea template-ului')
      }
      set((state) => ({
        captionTemplates: state.captionTemplates.filter((t) => t.id !== id),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  getTemplateById: (id) => {
    return get().captionTemplates.find((t) => t.id === id)
  },

  getTemplatesByCategory: (category) => {
    return get().captionTemplates.filter((t) => t.category === category)
  },

  // ========== Hashtag Set CRUD ==========

  createHashtagSet: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/social/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la crearea setului de hashtag-uri')
      }

      const hashtagData = await res.json()
      const hashtagSet = mapApiHashtagSet(hashtagData)
      set((state) => ({
        hashtagSets: [...state.hashtagSets, hashtagSet],
        isLoading: false,
      }))
      return hashtagSet.id
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      return ''
    }
  },

  updateHashtagSet: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/hashtags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la actualizarea setului')
      }

      const hashtagData = await res.json()
      const hashtagSet = mapApiHashtagSet(hashtagData)
      set((state) => ({
        hashtagSets: state.hashtagSets.map((h) => (h.id === id ? hashtagSet : h)),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  deleteHashtagSet: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/hashtags/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la stergerea setului')
      }
      set((state) => ({
        hashtagSets: state.hashtagSets.filter((h) => h.id !== id),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  getHashtagSetById: (id) => {
    return get().hashtagSets.find((h) => h.id === id)
  },

  // ========== Content Library ==========

  addToLibrary: async (item) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/social/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          type: item.type,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          mimeType: item.mimeType,
          size: item.size,
          width: item.dimensions?.width,
          height: item.dimensions?.height,
          duration: item.duration,
          tags: item.tags,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la adaugarea in biblioteca')
      }

      const itemData = await res.json()
      const libraryItem = mapApiLibraryItem(itemData)
      set((state) => ({
        contentLibrary: [...state.contentLibrary, libraryItem],
        isLoading: false,
      }))
      return libraryItem.id
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      return ''
    }
  },

  removeFromLibrary: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/library/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la stergerea din biblioteca')
      }
      set((state) => ({
        contentLibrary: state.contentLibrary.filter((i) => i.id !== id),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  updateLibraryItem: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/social/library/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Eroare la actualizarea elementului')
      }

      const itemData = await res.json()
      const libraryItem = mapApiLibraryItem(itemData)
      set((state) => ({
        contentLibrary: state.contentLibrary.map((i) => (i.id === id ? libraryItem : i)),
        isLoading: false,
      }))
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
    }
  },

  getLibraryItemById: (id) => {
    return get().contentLibrary.find((i) => i.id === id)
  },

  getLibraryByType: (type) => {
    return get().contentLibrary.filter((i) => i.type === type)
  },

  getLibraryByTag: (tag) => {
    return get().contentLibrary.filter((i) =>
      i.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    )
  },
}))
