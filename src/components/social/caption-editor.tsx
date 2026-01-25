'use client'

import { useMemo } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PLATFORM_CONFIGS } from '@/lib/social/constants'
import { PLATFORM_LABELS, type SocialPlatform } from '@/lib/social/types'

// ============================================================================
// Types
// ============================================================================

interface CaptionEditorProps {
  /** Current caption text */
  value: string
  /** Callback when caption changes */
  onChange: (value: string) => void
  /** Currently selected platforms for limit calculation */
  platforms: SocialPlatform[]
  /** Placeholder text */
  placeholder?: string
  /** Whether the field has an error */
  hasError?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate the most restrictive character limit from selected platforms
 */
function getMostRestrictiveLimit(platforms: SocialPlatform[]): {
  limit: number
  platforms: SocialPlatform[]
} {
  if (platforms.length === 0) {
    // Default to TikTok limit (4000) when no platforms selected
    return { limit: 4000, platforms: [] }
  }

  // Find the minimum caption limit among selected platforms
  let minLimit = Infinity
  let limitingPlatforms: SocialPlatform[] = []

  for (const platform of platforms) {
    const config = PLATFORM_CONFIGS[platform]
    if (config.captionLimit < minLimit) {
      minLimit = config.captionLimit
      limitingPlatforms = [platform]
    } else if (config.captionLimit === minLimit) {
      limitingPlatforms.push(platform)
    }
  }

  return { limit: minLimit, platforms: limitingPlatforms }
}

// ============================================================================
// Component
// ============================================================================

export function CaptionEditor({
  value,
  onChange,
  platforms,
  placeholder = 'Scrie textul postarii...',
  hasError,
}: CaptionEditorProps) {
  // Calculate character limit based on selected platforms
  const { limit, platforms: limitingPlatforms } = useMemo(
    () => getMostRestrictiveLimit(platforms),
    [platforms]
  )

  const currentLength = value.length
  const percentage = limit > 0 ? (currentLength / limit) * 100 : 0
  const isNearLimit = percentage > 90 && percentage <= 100
  const isOverLimit = percentage > 100

  // Format the limiting platforms display
  const limitingPlatformsText = useMemo(() => {
    if (limitingPlatforms.length === 0) {
      return 'Limita implicita'
    }
    return limitingPlatforms.map((p) => PLATFORM_LABELS[p]).join(', ')
  }, [limitingPlatforms])

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'min-h-[120px] resize-y',
          hasError && 'border-destructive focus-visible:border-destructive'
        )}
      />

      {/* Character counter and limit info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs">
          Limita impusa de: {limitingPlatformsText}
        </span>

        <span
          className={cn(
            'tabular-nums',
            isOverLimit && 'text-destructive font-medium',
            isNearLimit && !isOverLimit && 'text-amber-500',
            !isNearLimit && !isOverLimit && 'text-muted-foreground'
          )}
        >
          {currentLength.toLocaleString('ro-RO')} / {limit.toLocaleString('ro-RO')}
        </span>
      </div>
    </div>
  )
}
