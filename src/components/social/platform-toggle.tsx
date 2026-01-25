'use client'

import { Facebook, Instagram } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOCIAL_PLATFORMS, PLATFORM_LABELS, type SocialPlatform } from '@/lib/social/types'

// ============================================================================
// Types
// ============================================================================

interface PlatformToggleProps {
  /** Currently selected platforms */
  selected: SocialPlatform[]
  /** Callback when selection changes */
  onChange: (platforms: SocialPlatform[]) => void
  /** Whether the field has an error */
  hasError?: boolean
}

// ============================================================================
// Platform Icon Component
// ============================================================================

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case 'facebook':
      return <Facebook className="size-4" />
    case 'instagram':
      return <Instagram className="size-4" />
    case 'tiktok':
      // TikTok has no lucide icon - use styled text
      return (
        <span className="text-xs font-bold leading-none">TT</span>
      )
  }
}

// ============================================================================
// Component
// ============================================================================

export function PlatformToggle({ selected, onChange, hasError }: PlatformToggleProps) {
  const handleToggle = (platform: SocialPlatform) => {
    if (selected.includes(platform)) {
      // Remove platform from selection
      onChange(selected.filter((p) => p !== platform))
    } else {
      // Add platform to selection
      onChange([...selected, platform])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SOCIAL_PLATFORMS.map((platform) => {
        const isSelected = selected.includes(platform)

        return (
          <button
            key={platform}
            type="button"
            onClick={() => handleToggle(platform)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isSelected
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
              hasError && !isSelected && 'ring-1 ring-destructive/50'
            )}
          >
            <PlatformIcon platform={platform} />
            {PLATFORM_LABELS[platform]}
          </button>
        )
      })}
    </div>
  )
}
