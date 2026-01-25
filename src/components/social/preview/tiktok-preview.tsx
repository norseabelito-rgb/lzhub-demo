'use client'

/**
 * TikTok Preview Component
 * Renders a post preview that mimics TikTok's vertical phone layout
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PLATFORM_CONFIGS } from '@/lib/social/constants'
import { Heart, MessageCircle, Share2, Bookmark, Music } from 'lucide-react'

interface TikTokPreviewProps {
  caption: string
  mediaUrls: string[]
  hashtags: string[]
  profileName?: string
}

/**
 * Truncates caption at TikTok's visible character limit
 */
function truncateCaption(caption: string, limit: number): { text: string; truncated: boolean } {
  if (caption.length <= limit) {
    return { text: caption, truncated: false }
  }
  return { text: caption.slice(0, limit), truncated: true }
}

/**
 * Formats hashtags inline with caption, preceded by #
 */
function formatHashtags(hashtags: string[]): string {
  if (hashtags.length === 0) return ''
  return ' ' + hashtags.map(tag => `#${tag}`).join(' ')
}

export function TikTokPreview({
  caption,
  mediaUrls,
  hashtags,
  profileName = 'laserzone_buc',
}: TikTokPreviewProps) {
  const config = PLATFORM_CONFIGS.tiktok
  const fullCaption = caption + formatHashtags(hashtags)
  const { text: truncatedCaption, truncated } = truncateCaption(fullCaption, config.visibleChars)
  const hasMedia = mediaUrls.length > 0
  const primaryMedia = hasMedia ? mediaUrls[0] : null

  return (
    <div className="relative bg-black rounded-3xl overflow-hidden border-4 border-zinc-800 shadow-xl">
      {/* Phone frame with 9:16 aspect ratio */}
      <div className="relative aspect-[9/16] min-h-[400px]">
        {/* Media background - full bleed */}
        {hasMedia && primaryMedia && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryMedia}
              alt="Post media"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </>
        )}

        {/* Placeholder for empty media */}
        {!hasMedia && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <span className="text-zinc-500 text-sm">Fara imagine</span>
          </div>
        )}

        {/* Right sidebar - action icons */}
        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
          {/* Profile avatar */}
          <div className="relative">
            <Avatar className="size-12 border-2 border-white">
              <AvatarImage src="/laserzone-logo.png" alt={profileName} />
              <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-sm">
                LZ
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>

          {/* Like button */}
          <ActionButton icon={Heart} count="1.2K" />

          {/* Comment button */}
          <ActionButton icon={MessageCircle} count="45" />

          {/* Share button */}
          <ActionButton icon={Share2} count="12" />

          {/* Bookmark button */}
          <ActionButton icon={Bookmark} count="" />
        </div>

        {/* Bottom overlay - profile and caption */}
        <div className="absolute bottom-4 left-3 right-20 space-y-2">
          {/* Username */}
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm drop-shadow-lg">
              @{profileName}
            </span>
          </div>

          {/* Caption */}
          <p className="text-white text-sm drop-shadow-lg">
            {truncatedCaption}
            {truncated && <span className="text-white/70">...</span>}
          </p>

          {/* Music ticker */}
          <div className="flex items-center gap-2 text-white text-xs">
            <Music className="size-4 animate-pulse" />
            <div className="overflow-hidden max-w-[180px]">
              <span className="whitespace-nowrap inline-block animate-marquee">
                Original sound - LaserZone
              </span>
            </div>
          </div>
        </div>

        {/* Spinning disc at bottom right */}
        <div className="absolute right-3 bottom-4 size-12 rounded-full bg-zinc-900 border-4 border-zinc-700 flex items-center justify-center animate-spin-slow">
          <div className="size-6 rounded-full bg-zinc-800 border-2 border-zinc-600" />
        </div>
      </div>
    </div>
  )
}

/**
 * TikTok-style action button with icon and count
 */
function ActionButton({
  icon: Icon,
  count,
}: {
  icon: React.ElementType
  count: string
}) {
  return (
    <button className="flex flex-col items-center gap-1">
      <div className="size-10 rounded-full bg-transparent flex items-center justify-center">
        <Icon className="size-7 text-white drop-shadow-lg" />
      </div>
      {count && <span className="text-white text-xs font-semibold drop-shadow-lg">{count}</span>}
    </button>
  )
}
