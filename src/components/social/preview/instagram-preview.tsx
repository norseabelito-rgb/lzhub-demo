'use client'

/**
 * Instagram Preview Component
 * Renders a post preview that mimics Instagram's feed layout
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PLATFORM_CONFIGS } from '@/lib/social/constants'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, CheckCircle2 } from 'lucide-react'

interface InstagramPreviewProps {
  caption: string
  mediaUrls: string[]
  hashtags: string[]
  profileName?: string
}

/**
 * Truncates caption at Instagram's visible character limit
 */
function truncateCaption(caption: string, limit: number): { text: string; truncated: boolean } {
  if (caption.length <= limit) {
    return { text: caption, truncated: false }
  }
  return { text: caption.slice(0, limit), truncated: true }
}

/**
 * Formats hashtags in Instagram style - muted blue on separate line
 */
function formatHashtags(hashtags: string[]): React.ReactNode {
  if (hashtags.length === 0) return null

  return (
    <span className="text-blue-400/80">
      {hashtags.map((tag, idx) => (
        <span key={tag}>
          {idx > 0 && ' '}#{tag}
        </span>
      ))}
    </span>
  )
}

export function InstagramPreview({
  caption,
  mediaUrls,
  hashtags,
  profileName = 'laserzone_bucuresti',
}: InstagramPreviewProps) {
  const config = PLATFORM_CONFIGS.instagram
  const { text: truncatedCaption, truncated } = truncateCaption(caption, config.visibleChars)
  const hasMedia = mediaUrls.length > 0
  const primaryMedia = hasMedia ? mediaUrls[0] : null

  return (
    <div className="bg-card/80 rounded-lg border border-border/50 overflow-hidden">
      {/* Header: Profile info with verified badge */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 ring-2 ring-accent ring-offset-2 ring-offset-background">
            <AvatarImage src="/laserzone-logo.png" alt={profileName} />
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-xs">
              LZ
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm text-foreground">{profileName}</span>
            <CheckCircle2 className="size-4 text-blue-500 fill-blue-500" />
          </div>
        </div>
        <button className="p-1 hover:bg-muted/50 rounded">
          <MoreHorizontal className="size-5 text-foreground" />
        </button>
      </div>

      {/* Media area - 1:1 square aspect ratio */}
      {hasMedia && primaryMedia && (
        <div className="relative w-full aspect-square bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryMedia}
            alt="Post media"
            className="w-full h-full object-cover"
          />
          {mediaUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              1/{mediaUrls.length}
            </div>
          )}
        </div>
      )}

      {/* Placeholder for empty media */}
      {!hasMedia && (
        <div className="w-full aspect-square bg-muted/50 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Fara imagine</span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <button className="hover:opacity-70 transition-opacity">
            <Heart className="size-6 text-foreground" />
          </button>
          <button className="hover:opacity-70 transition-opacity">
            <MessageCircle className="size-6 text-foreground" />
          </button>
          <button className="hover:opacity-70 transition-opacity">
            <Send className="size-6 text-foreground" />
          </button>
        </div>
        <button className="hover:opacity-70 transition-opacity">
          <Bookmark className="size-6 text-foreground" />
        </button>
      </div>

      {/* Likes count */}
      <div className="px-3 pb-1">
        <span className="text-sm font-semibold text-foreground">123 aprecieri</span>
      </div>

      {/* Caption area */}
      <div className="px-3 pb-2">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{profileName}</span>
          {' '}
          <span className="whitespace-pre-wrap">
            {truncatedCaption}
            {truncated && (
              <span className="text-muted-foreground">...<span className="cursor-pointer hover:text-foreground"> mai mult</span></span>
            )}
          </span>
        </p>
        {hashtags.length > 0 && (
          <p className="text-sm mt-1">
            {formatHashtags(hashtags)}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <span className="text-xs text-muted-foreground uppercase">Acum</span>
      </div>
    </div>
  )
}
