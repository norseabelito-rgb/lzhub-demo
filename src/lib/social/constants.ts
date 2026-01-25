/**
 * Social Media constants for LaserZone Hub
 * Platform-specific configurations and limits
 */

import type { SocialPlatform } from './types'

// ============================================================================
// Platform Configuration
// ============================================================================

/**
 * Platform-specific constraints and limits
 * Based on current platform guidelines (2026)
 */
export interface PlatformConfig {
  /** Maximum caption length in characters */
  captionLimit: number
  /** Characters visible before "see more" truncation */
  visibleChars: number
  /** Recommended maximum hashtags */
  hashtagLimit: number
  /** Primary aspect ratio for media */
  aspectRatio: string
  /** Maximum video duration in seconds */
  videoMaxDuration: number
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  facebook: {
    captionLimit: 63206,
    visibleChars: 80,
    hashtagLimit: 3,
    aspectRatio: '16:9',
    videoMaxDuration: 14400, // 4 hours
  },
  instagram: {
    captionLimit: 2200,
    visibleChars: 125,
    hashtagLimit: 15,
    aspectRatio: '1:1',
    videoMaxDuration: 90, // Reels max
  },
  tiktok: {
    captionLimit: 4000,
    visibleChars: 150,
    hashtagLimit: 5,
    aspectRatio: '9:16',
    videoMaxDuration: 600, // 10 minutes
  },
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default metrics for new posts
 */
export const DEFAULT_METRICS = {
  likes: 0,
  comments: 0,
  shares: 0,
  views: 0,
}

/**
 * Template categories for organization
 */
export const TEMPLATE_CATEGORIES = [
  'promotie',
  'eveniment',
  'petrecere',
  'corporate',
  'general',
] as const

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  promotie: 'Promotie',
  eveniment: 'Eveniment',
  petrecere: 'Petrecere',
  corporate: 'Corporate',
  general: 'General',
}
