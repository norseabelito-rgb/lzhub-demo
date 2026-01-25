'use client'

/**
 * Facebook Preview Component
 * Renders a post preview that mimics Facebook's card-style layout
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PLATFORM_CONFIGS } from '@/lib/social/constants'
import { ThumbsUp, Heart, Laugh, MessageCircle, Share2 } from 'lucide-react'

interface FacebookPreviewProps {
  caption: string
  mediaUrls: string[]
  hashtags: string[]
  profileName?: string
}

/**
 * Truncates caption at Facebook's visible character limit
 */
function truncateCaption(caption: string, limit: number): { text: string; truncated: boolean } {
  if (caption.length <= limit) {
    return { text: caption, truncated: false }
  }
  return { text: caption.slice(0, limit), truncated: true }
}

/**
 * Formats hashtags as inline blue links
 */
function formatHashtags(hashtags: string[]): React.ReactNode {
  if (hashtags.length === 0) return null

  return (
    <span className="text-blue-500">
      {hashtags.map((tag, idx) => (
        <span key={tag}>
          {idx > 0 && ' '}#{tag}
        </span>
      ))}
    </span>
  )
}

export function FacebookPreview({
  caption,
  mediaUrls,
  hashtags,
  profileName = 'LaserZone Bucuresti',
}: FacebookPreviewProps) {
  const config = PLATFORM_CONFIGS.facebook
  const { text: truncatedCaption, truncated } = truncateCaption(caption, config.visibleChars)
  const hasMedia = mediaUrls.length > 0
  const primaryMedia = hasMedia ? mediaUrls[0] : null

  return (
    <div className="bg-card/50 rounded-lg border border-border/50 overflow-hidden">
      {/* Header: Profile info and timestamp */}
      <div className="flex items-center gap-3 p-3">
        <Avatar className="size-10">
          <AvatarImage src="/laserzone-logo.png" alt={profileName} />
          <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-sm">
            LZ
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">{profileName}</span>
          <span className="text-xs text-muted-foreground">Acum · 🌐</span>
        </div>
      </div>

      {/* Caption area */}
      <div className="px-3 pb-3">
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {truncatedCaption}
          {truncated && (
            <span className="text-muted-foreground">... <span className="text-blue-500 cursor-pointer hover:underline">Mai mult</span></span>
          )}
          {hashtags.length > 0 && (
            <span className="block mt-1">
              {formatHashtags(hashtags)}
            </span>
          )}
        </p>
      </div>

      {/* Media area - 16:9 aspect ratio */}
      {hasMedia && primaryMedia && (
        <div className="relative w-full aspect-video bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryMedia}
            alt="Post media"
            className="w-full h-full object-cover"
          />
          {mediaUrls.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{mediaUrls.length - 1}
            </div>
          )}
        </div>
      )}

      {/* Placeholder for empty media */}
      {!hasMedia && (
        <div className="w-full aspect-video bg-muted/50 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Fara imagine</span>
        </div>
      )}

      {/* Reaction counts bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border/30">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-500">
              <ThumbsUp className="size-3 text-white" />
            </span>
            <span className="flex items-center justify-center size-5 rounded-full bg-red-500">
              <Heart className="size-3 text-white fill-white" />
            </span>
            <span className="flex items-center justify-center size-5 rounded-full bg-amber-400">
              <Laugh className="size-3 text-white" />
            </span>
          </div>
          <span className="text-xs text-muted-foreground ml-1">123</span>
        </div>
        <span className="text-xs text-muted-foreground">15 comentarii · 3 distribuiri</span>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-around border-t border-border/30 py-2">
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-lg transition-colors">
          <ThumbsUp className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Apreciaza</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-lg transition-colors">
          <MessageCircle className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Comenteaza</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-lg transition-colors">
          <Share2 className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Distribuie</span>
        </button>
      </div>
    </div>
  )
}
