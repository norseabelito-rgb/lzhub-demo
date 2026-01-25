'use client'

/**
 * PostCard - Card component for displaying social post previews
 * Used in lists and calendar views with compact mode support
 */

import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SocialPost, SocialPlatform } from '@/lib/social/types'
import { PostStatusBadge } from './post-status-badge'
import { MetricsDisplay } from './metrics-display'
import { PlatformIcon } from './platform-icon'

interface PostCardProps {
  post: SocialPost
  onClick?: () => void
  compact?: boolean
  className?: string
}

/**
 * Truncate caption to specified length with ellipsis
 */
function truncateCaption(caption: string, maxLength: number): string {
  if (caption.length <= maxLength) return caption
  return caption.slice(0, maxLength).trim() + '...'
}

/**
 * Format schedule/publish info based on post status
 */
function getScheduleText(post: SocialPost): string {
  switch (post.status) {
    case 'published':
      if (post.publishedAt) {
        const date = post.publishedAt instanceof Date ? post.publishedAt : new Date(post.publishedAt)
        return `Publicat ${format(date, 'd MMM yyyy, HH:mm', { locale: ro })}`
      }
      return 'Publicat'
    case 'scheduled':
      if (post.scheduledAt) {
        const date = post.scheduledAt instanceof Date ? post.scheduledAt : new Date(post.scheduledAt)
        return `Programat pentru ${format(date, 'd MMM yyyy, HH:mm', { locale: ro })}`
      }
      return 'Programat'
    case 'failed':
      return 'Publicare esuata'
    case 'draft':
    default:
      return 'Ciorna'
  }
}

/**
 * Check if any platform has a different status than overall post status
 */
function hasMixedPlatformStatus(post: SocialPost): boolean {
  return post.platforms.some(
    (platform) => post.platformStatuses[platform].status !== post.status
  )
}

export function PostCard({
  post,
  onClick,
  compact = false,
  className,
}: PostCardProps) {
  const captionPreview = truncateCaption(post.caption, compact ? 40 : 80)
  const showMetrics = post.status === 'published' && !compact

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/50',
        compact ? 'p-2 gap-2' : 'p-4 gap-3',
        className
      )}
      onClick={onClick}
    >
      {/* Top row: Platform icons + Status badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {post.platforms.map((platform) => (
            <PlatformIcon
              key={platform}
              platform={platform}
              size={compact ? 'sm' : 'default'}
              status={post.platformStatuses[platform].status}
            />
          ))}
        </div>
        <PostStatusBadge status={post.status} size={compact ? 'sm' : 'default'} />
      </div>

      {/* Caption preview */}
      <p
        className={cn(
          'text-foreground line-clamp-2',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        {captionPreview || <span className="text-muted-foreground italic">Fara text</span>}
      </p>

      {/* Schedule info */}
      <p className={cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
        {getScheduleText(post)}
        {hasMixedPlatformStatus(post) && (
          <span className="ml-1 text-amber-500">*</span>
        )}
      </p>

      {/* Metrics for published posts (non-compact only) */}
      {showMetrics && (
        <MetricsDisplay metrics={post.metrics} compact className="mt-1" />
      )}
    </Card>
  )
}
