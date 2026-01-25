/**
 * Social Media store for LaserZone Hub
 * Manages posts, templates, hashtag sets, and content library
 * with localStorage persistence
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
import { SOCIAL_PLATFORMS } from './types'
import { DEFAULT_METRICS } from './constants'

const SOCIAL_STORAGE_KEY = 'laserzone-social'

// ============================================================================
// Store Types
// ============================================================================

interface SocialState {
  posts: SocialPost[]
  captionTemplates: CaptionTemplate[]
  hashtagSets: HashtagSet[]
  contentLibrary: ContentLibraryItem[]
  isLoading: boolean
}

interface SocialActions {
  // Post CRUD
  createPost: (
    data: Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt' | 'metrics' | 'platformStatuses' | 'publishedAt' | 'status'>
  ) => string
  updatePost: (id: string, updates: Partial<SocialPost>) => void
  deletePost: (id: string) => void
  schedulePost: (id: string, scheduledAt: Date) => void
  publishPost: (id: string) => Promise<void>
  cancelSchedule: (id: string) => void

  // Post queries
  getPostById: (id: string) => SocialPost | undefined
  getPostsByStatus: (status: PostStatus) => SocialPost[]
  getPostsForDateRange: (startDate: string, endDate: string) => SocialPost[]
  getScheduledPosts: () => SocialPost[]
  getDrafts: () => SocialPost[]

  // Template CRUD
  createTemplate: (data: Omit<CaptionTemplate, 'id' | 'createdAt'>) => string
  updateTemplate: (id: string, updates: Partial<CaptionTemplate>) => void
  deleteTemplate: (id: string) => void
  getTemplateById: (id: string) => CaptionTemplate | undefined
  getTemplatesByCategory: (category: string) => CaptionTemplate[]

  // Hashtag Set CRUD
  createHashtagSet: (data: Omit<HashtagSet, 'id' | 'createdAt'>) => string
  updateHashtagSet: (id: string, updates: Partial<HashtagSet>) => void
  deleteHashtagSet: (id: string) => void
  getHashtagSetById: (id: string) => HashtagSet | undefined

  // Content Library
  addToLibrary: (item: Omit<ContentLibraryItem, 'id' | 'createdAt' | 'updatedAt'>) => string
  removeFromLibrary: (id: string) => void
  updateLibraryItem: (id: string, updates: Partial<ContentLibraryItem>) => void
  getLibraryItemById: (id: string) => ContentLibraryItem | undefined
  getLibraryByType: (type: MediaType) => ContentLibraryItem[]
  getLibraryByTag: (tag: string) => ContentLibraryItem[]
}

export type SocialStore = SocialState & SocialActions

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create empty platform statuses for a new post
 */
function createEmptyPlatformStatuses(): Record<SocialPlatform, PlatformPostStatus> {
  return {
    facebook: { status: 'draft' },
    instagram: { status: 'draft' },
    tiktok: { status: 'draft' },
  }
}

/**
 * Create empty metrics for a new post
 */
function createEmptyMetrics(): Record<SocialPlatform, PostMetrics> {
  const now = new Date()
  return {
    facebook: { ...DEFAULT_METRICS, lastUpdated: now },
    instagram: { ...DEFAULT_METRICS, lastUpdated: now },
    tiktok: { ...DEFAULT_METRICS, lastUpdated: now },
  }
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      // Initial state
      posts: [],
      captionTemplates: [],
      hashtagSets: [],
      contentLibrary: [],
      isLoading: false,

      // ========== Post CRUD ==========

      createPost: (data) => {
        const id = crypto.randomUUID()
        const now = new Date()

        const post: SocialPost = {
          ...data,
          id,
          status: data.scheduledAt ? 'scheduled' : 'draft',
          publishedAt: null,
          platformStatuses: createEmptyPlatformStatuses(),
          metrics: createEmptyMetrics(),
          createdAt: now,
          updatedAt: now,
        }

        // Update platform statuses based on selected platforms
        data.platforms.forEach((platform) => {
          post.platformStatuses[platform] = {
            status: data.scheduledAt ? 'scheduled' : 'draft',
          }
        })

        set((state) => ({
          posts: [...state.posts, post],
        }))

        return id
      },

      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          ),
        }))
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        }))
      },

      schedulePost: (id, scheduledAt) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p

            const updatedPlatformStatuses = { ...p.platformStatuses }
            p.platforms.forEach((platform) => {
              updatedPlatformStatuses[platform] = { status: 'scheduled' }
            })

            return {
              ...p,
              scheduledAt,
              status: 'scheduled' as const,
              platformStatuses: updatedPlatformStatuses,
              updatedAt: new Date(),
            }
          }),
        }))
      },

      publishPost: async (id) => {
        // Simulate publishing delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p

            const now = new Date()
            const updatedPlatformStatuses = { ...p.platformStatuses }
            p.platforms.forEach((platform) => {
              updatedPlatformStatuses[platform] = {
                status: 'published',
                postId: `mock-${platform}-${crypto.randomUUID().slice(0, 8)}`,
              }
            })

            return {
              ...p,
              status: 'published' as const,
              publishedAt: now,
              platformStatuses: updatedPlatformStatuses,
              updatedAt: now,
            }
          }),
        }))
      },

      cancelSchedule: (id) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p

            const updatedPlatformStatuses = { ...p.platformStatuses }
            p.platforms.forEach((platform) => {
              updatedPlatformStatuses[platform] = { status: 'draft' }
            })

            return {
              ...p,
              scheduledAt: null,
              status: 'draft' as const,
              platformStatuses: updatedPlatformStatuses,
              updatedAt: new Date(),
            }
          }),
        }))
      },

      // ========== Post Queries ==========

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
        return get().posts
          .filter((p) => p.status === 'scheduled' && p.scheduledAt)
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

      createTemplate: (data) => {
        const id = crypto.randomUUID()
        const now = new Date()

        const template: CaptionTemplate = {
          ...data,
          id,
          createdAt: now,
        }

        set((state) => ({
          captionTemplates: [...state.captionTemplates, template],
        }))

        return id
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          captionTemplates: state.captionTemplates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          captionTemplates: state.captionTemplates.filter((t) => t.id !== id),
        }))
      },

      getTemplateById: (id) => {
        return get().captionTemplates.find((t) => t.id === id)
      },

      getTemplatesByCategory: (category) => {
        return get().captionTemplates.filter((t) => t.category === category)
      },

      // ========== Hashtag Set CRUD ==========

      createHashtagSet: (data) => {
        const id = crypto.randomUUID()
        const now = new Date()

        const hashtagSet: HashtagSet = {
          ...data,
          id,
          createdAt: now,
        }

        set((state) => ({
          hashtagSets: [...state.hashtagSets, hashtagSet],
        }))

        return id
      },

      updateHashtagSet: (id, updates) => {
        set((state) => ({
          hashtagSets: state.hashtagSets.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }))
      },

      deleteHashtagSet: (id) => {
        set((state) => ({
          hashtagSets: state.hashtagSets.filter((h) => h.id !== id),
        }))
      },

      getHashtagSetById: (id) => {
        return get().hashtagSets.find((h) => h.id === id)
      },

      // ========== Content Library ==========

      addToLibrary: (item) => {
        const id = crypto.randomUUID()
        const now = new Date()

        const libraryItem: ContentLibraryItem = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          contentLibrary: [...state.contentLibrary, libraryItem],
        }))

        return id
      },

      removeFromLibrary: (id) => {
        set((state) => ({
          contentLibrary: state.contentLibrary.filter((i) => i.id !== id),
        }))
      },

      updateLibraryItem: (id, updates) => {
        set((state) => ({
          contentLibrary: state.contentLibrary.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date() } : i
          ),
        }))
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
    }),
    {
      name: SOCIAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        posts: state.posts,
        captionTemplates: state.captionTemplates,
        hashtagSets: state.hashtagSets,
        contentLibrary: state.contentLibrary,
      }),
    }
  )
)
