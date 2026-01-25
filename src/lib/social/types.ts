/**
 * Social Media types for LaserZone Hub
 * Data foundation for multi-platform social media scheduling system
 * Types align with Ayrshare API structure for future integration
 */

// ============================================================================
// Platform Types
// ============================================================================

/**
 * Supported social media platforms
 * Matches Ayrshare API platform identifiers
 */
export const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'tiktok'] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

/** Platform display labels in Romanian */
export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

// ============================================================================
// Post Status Types
// ============================================================================

/**
 * Current status of a social media post
 */
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

/** Post status display labels in Romanian */
export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Ciorna',
  scheduled: 'Programat',
  published: 'Publicat',
  failed: 'Esuat',
}

// ============================================================================
// Post Metrics Types
// ============================================================================

/**
 * Engagement metrics for a post on a specific platform
 * Populated after publishing via analytics API
 */
export interface PostMetrics {
  /** Number of likes/reactions */
  likes: number
  /** Number of comments */
  comments: number
  /** Number of shares/reposts */
  shares: number
  /** Number of views (primarily for video content) */
  views: number
  /** When metrics were last updated */
  lastUpdated: Date
}

// ============================================================================
// Platform Status Types
// ============================================================================

/**
 * Per-platform status tracking for a post
 * Each platform can have different publish status
 */
export interface PlatformPostStatus {
  /** Current status on this platform */
  status: PostStatus
  /** Platform's post ID after successful publish */
  postId?: string
  /** Error message if publishing failed */
  error?: string
}

// ============================================================================
// Social Post Types
// ============================================================================

/**
 * Main social media post record
 * Core entity for scheduling and publishing
 */
export interface SocialPost {
  /** Unique identifier (UUID) */
  id: string

  // Content
  /** Post caption text */
  caption: string
  /** References to ContentLibraryItem IDs */
  mediaIds: string[]
  /** Resolved hashtags (not set IDs) */
  hashtags: string[]

  // Targeting
  /** Which platforms to post to */
  platforms: SocialPlatform[]

  // Scheduling
  /** When to publish (null = draft) */
  scheduledAt: Date | null
  /** When actually published */
  publishedAt: Date | null

  // Status tracking
  /** Overall post status */
  status: PostStatus
  /** Per-platform status */
  platformStatuses: Record<SocialPlatform, PlatformPostStatus>

  // Metrics (populated after publishing)
  metrics: Record<SocialPlatform, PostMetrics>

  // Metadata
  /** User ID who created the post */
  createdBy: string
  /** When the post was created */
  createdAt: Date
  /** When the post was last updated */
  updatedAt: Date
}

// ============================================================================
// Caption Template Types
// ============================================================================

/**
 * Reusable caption template with placeholders
 * Speeds up post creation for common scenarios
 */
export interface CaptionTemplate {
  /** Unique identifier (UUID) */
  id: string
  /** Template display name */
  name: string
  /** Template text content (may include placeholders) */
  content: string
  /** Category for organization (e.g., 'promotie', 'eveniment', 'general') */
  category: string
  /** When the template was created */
  createdAt: Date
}

// ============================================================================
// Hashtag Set Types
// ============================================================================

/**
 * Named collection of related hashtags
 * Allows quick hashtag group insertion
 */
export interface HashtagSet {
  /** Unique identifier (UUID) */
  id: string
  /** Set display name (e.g., 'LaserTag General', 'Evenimente') */
  name: string
  /** Hashtags in this set (without # prefix) */
  hashtags: string[]
  /** When the set was created */
  createdAt: Date
}

// ============================================================================
// Content Library Types
// ============================================================================

/**
 * Type of media content
 */
export type MediaType = 'image' | 'video'

/**
 * Media item in the content library
 * Can be linked to Google Drive files from Phase 6
 */
export interface ContentLibraryItem {
  /** Unique identifier (UUID) */
  id: string
  /** Display name for the media */
  name: string
  /** Type of media */
  type: MediaType
  /** URL for displaying the media */
  url: string
  /** Thumbnail URL for previews */
  thumbnailUrl: string
  /** MIME type (e.g., 'image/jpeg', 'video/mp4') */
  mimeType: string
  /** File size in bytes */
  size: number
  /** Dimensions for images/videos */
  dimensions?: {
    width: number
    height: number
  }
  /** Duration in seconds for videos */
  duration?: number
  /** User-defined tags for organization */
  tags: string[]
  /** Reference to Google Drive file ID if imported from Drive */
  driveFileId?: string
  /** When the item was added to library */
  createdAt: Date
  /** When the item was last updated */
  updatedAt: Date
}
