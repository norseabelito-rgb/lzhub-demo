'use client'

/**
 * Platform Preview Component
 * Unified interface for rendering platform-specific post previews
 */

import type { SocialPlatform } from '@/lib/social/types'
import { FacebookPreview } from './preview/facebook-preview'
import { InstagramPreview } from './preview/instagram-preview'
import { TikTokPreview } from './preview/tiktok-preview'

interface PlatformPreviewProps {
  platform: SocialPlatform
  caption: string
  mediaUrls: string[]
  hashtags: string[]
}

/**
 * Placeholder image for posts without media
 */
const PLACEHOLDER_IMAGE = '/placeholder-media.png'

/**
 * Platform-specific max-width container settings
 */
const PLATFORM_CONTAINER_CLASSES: Record<SocialPlatform, string> = {
  facebook: 'max-w-md', // Card width
  instagram: 'max-w-sm', // Phone width
  tiktok: 'max-w-xs', // Narrow phone
}

/**
 * Renders platform-specific preview for a social media post
 *
 * @param platform - The social platform to render preview for
 * @param caption - Post caption text
 * @param mediaUrls - Array of media URLs (images/videos)
 * @param hashtags - Array of hashtags (without # prefix)
 */
export function PlatformPreview({
  platform,
  caption,
  mediaUrls,
  hashtags,
}: PlatformPreviewProps) {
  // Handle empty media with placeholder
  const effectiveMediaUrls = mediaUrls.length > 0 ? mediaUrls : []

  const containerClass = PLATFORM_CONTAINER_CLASSES[platform]

  return (
    <div className={`w-full ${containerClass} mx-auto`}>
      {platform === 'facebook' && (
        <FacebookPreview
          caption={caption}
          mediaUrls={effectiveMediaUrls}
          hashtags={hashtags}
        />
      )}
      {platform === 'instagram' && (
        <InstagramPreview
          caption={caption}
          mediaUrls={effectiveMediaUrls}
          hashtags={hashtags}
        />
      )}
      {platform === 'tiktok' && (
        <TikTokPreview
          caption={caption}
          mediaUrls={effectiveMediaUrls}
          hashtags={hashtags}
        />
      )}
    </div>
  )
}

/**
 * Export individual previews for direct usage if needed
 */
export { FacebookPreview } from './preview/facebook-preview'
export { InstagramPreview } from './preview/instagram-preview'
export { TikTokPreview } from './preview/tiktok-preview'
