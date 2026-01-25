'use client'

/**
 * Preview Tabs Component
 * Multi-platform preview with tab navigation for selected platforms
 */

import { useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PlatformPreview } from './platform-preview'
import type { SocialPlatform } from '@/lib/social/types'
import { PLATFORM_LABELS } from '@/lib/social/types'
import { PLATFORM_CONFIGS } from '@/lib/social/constants'
import { Facebook, Instagram, AlertTriangle } from 'lucide-react'

interface PreviewTabsProps {
  platforms: SocialPlatform[]
  caption: string
  mediaUrls: string[]
  hashtags: string[]
}

/**
 * Platform icons mapping
 */
const PLATFORM_ICONS: Record<SocialPlatform, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: TikTokIcon,
}

/**
 * Custom TikTok icon (lucide doesn't have TikTok)
 */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.2-1.74V12a6.8 6.8 0 001.89.26 6.68 6.68 0 003.33-.89v4.3a6.34 6.34 0 11-10.22-5v3.4a2.89 2.89 0 105.2 1.74V2h3.45a4.83 4.83 0 003.77 4.25V9.5a8.11 8.11 0 01-3.77-.89z" />
    </svg>
  )
}

/**
 * Check if caption exceeds platform's visible character limit
 */
function checkCaptionExceedsLimit(caption: string, platform: SocialPlatform): boolean {
  const config = PLATFORM_CONFIGS[platform]
  return caption.length > config.visibleChars
}

/**
 * Preview Tabs component for multi-platform post preview
 *
 * Shows tabs for each selected platform with live preview switching.
 * Displays warning badge when caption exceeds platform's visible character limit.
 */
export function PreviewTabs({
  platforms,
  caption,
  mediaUrls,
  hashtags,
}: PreviewTabsProps) {
  // Memoize caption warnings for each platform
  const platformWarnings = useMemo(() => {
    const warnings: Partial<Record<SocialPlatform, boolean>> = {}
    platforms.forEach((platform) => {
      warnings[platform] = checkCaptionExceedsLimit(caption, platform)
    })
    return warnings
  }, [platforms, caption])

  // Handle empty platforms selection
  if (platforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertTriangle className="size-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">
          Selecteaza platforme pentru preview
        </p>
      </div>
    )
  }

  // Default to first selected platform
  const defaultPlatform = platforms[0]

  return (
    <Tabs defaultValue={defaultPlatform} className="w-full">
      {/* Tab triggers - horizontal scroll on mobile */}
      <TabsList className="w-full h-auto flex-wrap gap-1 bg-transparent justify-start mb-4">
        {platforms.map((platform) => {
          const Icon = PLATFORM_ICONS[platform]
          const hasWarning = platformWarnings[platform]

          return (
            <TabsTrigger
              key={platform}
              value={platform}
              className="relative flex items-center gap-2 px-4 py-2 data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{PLATFORM_LABELS[platform]}</span>
              {hasWarning && (
                <Badge
                  variant="outline"
                  className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center bg-warning text-warning-foreground border-warning"
                >
                  <AlertTriangle className="size-3" />
                </Badge>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>

      {/* Tab content - preview for each platform */}
      {platforms.map((platform) => (
        <TabsContent key={platform} value={platform} className="mt-0">
          <div className="py-4">
            <PlatformPreview
              platform={platform}
              caption={caption}
              mediaUrls={mediaUrls}
              hashtags={hashtags}
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

/**
 * Get character count info for a platform
 */
export function getCharacterCountInfo(caption: string, platform: SocialPlatform): {
  current: number
  visible: number
  max: number
  exceedsVisible: boolean
  exceedsMax: boolean
} {
  const config = PLATFORM_CONFIGS[platform]
  const current = caption.length

  return {
    current,
    visible: config.visibleChars,
    max: config.captionLimit,
    exceedsVisible: current > config.visibleChars,
    exceedsMax: current > config.captionLimit,
  }
}
