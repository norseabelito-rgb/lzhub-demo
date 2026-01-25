'use client'

import { useState, useMemo, type KeyboardEvent } from 'react'
import { X, Hash, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useSocialStore } from '@/lib/social/social-store'
import { PLATFORM_CONFIGS } from '@/lib/social/constants'
import { PLATFORM_LABELS, type SocialPlatform } from '@/lib/social/types'

// ============================================================================
// Types
// ============================================================================

interface HashtagPickerProps {
  /** IDs of selected hashtag sets */
  selectedSetIds: string[]
  /** Custom hashtags added by user */
  customHashtags: string[]
  /** Callback when set selection changes */
  onSetIdsChange: (ids: string[]) => void
  /** Callback when custom hashtags change */
  onCustomHashtagsChange: (hashtags: string[]) => void
  /** Currently selected platforms for limit warnings */
  platforms: SocialPlatform[]
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the most restrictive hashtag limit from selected platforms
 */
function getHashtagLimit(platforms: SocialPlatform[]): {
  limit: number
  platform: SocialPlatform | null
} {
  if (platforms.length === 0) {
    return { limit: 30, platform: null } // Default high limit
  }

  let minLimit = Infinity
  let limitingPlatform: SocialPlatform | null = null

  for (const platform of platforms) {
    const config = PLATFORM_CONFIGS[platform]
    if (config.hashtagLimit < minLimit) {
      minLimit = config.hashtagLimit
      limitingPlatform = platform
    }
  }

  return { limit: minLimit, platform: limitingPlatform }
}

// ============================================================================
// Component
// ============================================================================

export function HashtagPicker({
  selectedSetIds,
  customHashtags,
  onSetIdsChange,
  onCustomHashtagsChange,
  platforms,
}: HashtagPickerProps) {
  const [inputValue, setInputValue] = useState('')

  // Get hashtag sets from store
  const hashtagSets = useSocialStore((state) => state.hashtagSets)

  // Calculate total hashtags from selected sets + custom
  const resolvedHashtags = useMemo(() => {
    const fromSets = hashtagSets
      .filter((set) => selectedSetIds.includes(set.id))
      .flatMap((set) => set.hashtags)

    // Combine and deduplicate
    const allHashtags = [...new Set([...fromSets, ...customHashtags])]
    return allHashtags
  }, [hashtagSets, selectedSetIds, customHashtags])

  // Get hashtag limit from platforms
  const { limit, platform: limitingPlatform } = useMemo(
    () => getHashtagLimit(platforms),
    [platforms]
  )

  const isOverLimit = resolvedHashtags.length > limit
  const isNearLimit = resolvedHashtags.length >= limit * 0.8 && !isOverLimit

  // Toggle hashtag set selection
  const handleSetToggle = (setId: string) => {
    if (selectedSetIds.includes(setId)) {
      onSetIdsChange(selectedSetIds.filter((id) => id !== setId))
    } else {
      onSetIdsChange([...selectedSetIds, setId])
    }
  }

  // Add custom hashtag
  const addCustomHashtag = (tag: string) => {
    const cleanTag = tag.replace(/^#/, '').trim().toLowerCase()
    if (cleanTag && !customHashtags.includes(cleanTag)) {
      onCustomHashtagsChange([...customHashtags, cleanTag])
    }
  }

  // Remove custom hashtag
  const removeCustomHashtag = (tag: string) => {
    onCustomHashtagsChange(customHashtags.filter((t) => t !== tag))
  }

  // Handle input key press (enter or comma to add)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        // Split by comma in case user pastes multiple
        const tags = inputValue.split(',').map((t) => t.trim()).filter(Boolean)
        tags.forEach(addCustomHashtag)
        setInputValue('')
      }
    }
  }

  // Handle input blur - add any remaining text
  const handleBlur = () => {
    if (inputValue.trim()) {
      const tags = inputValue.split(',').map((t) => t.trim()).filter(Boolean)
      tags.forEach(addCustomHashtag)
      setInputValue('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Hashtag sets selection */}
      {hashtagSets.length > 0 && (
        <div className="space-y-2">
          <Label>Seturi de hashtag-uri</Label>
          <div className="flex flex-wrap gap-2">
            {hashtagSets.map((set) => {
              const isSelected = selectedSetIds.includes(set.id)
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => handleSetToggle(set.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <Hash className="size-3" />
                  {set.name}
                  <span className="text-xs opacity-60">({set.hashtags.length})</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Custom hashtag input */}
      <div className="space-y-2">
        <Label htmlFor="custom-hashtags">Hashtag-uri personalizate</Label>
        <Input
          id="custom-hashtags"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Adauga hashtag-uri (separa cu virgula sau Enter)"
        />
      </div>

      {/* Custom hashtags display */}
      {customHashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customHashtags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeCustomHashtag(tag)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="size-3" />
                <span className="sr-only">Sterge {tag}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Total count and limit warning */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Total: {resolvedHashtags.length} hashtag-uri
        </span>

        {(isOverLimit || isNearLimit) && limitingPlatform && (
          <span
            className={cn(
              'flex items-center gap-1',
              isOverLimit ? 'text-destructive' : 'text-amber-500'
            )}
          >
            <AlertTriangle className="size-3" />
            {isOverLimit ? 'Depaseste' : 'Aproape de'} limita {PLATFORM_LABELS[limitingPlatform]} ({limit})
          </span>
        )}
      </div>

      {/* Preview of resolved hashtags */}
      {resolvedHashtags.length > 0 && (
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-2">Preview hashtag-uri:</p>
          <p className="text-sm text-accent-foreground/80 break-words">
            {resolvedHashtags.map((tag) => `#${tag}`).join(' ')}
          </p>
        </div>
      )}
    </div>
  )
}
