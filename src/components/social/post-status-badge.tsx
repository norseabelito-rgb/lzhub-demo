'use client'

/**
 * PostStatusBadge - Color-coded status indicator for social posts
 * Displays post status (draft, scheduled, published, failed) with distinct colors
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PostStatus } from '@/lib/social/types'
import { POST_STATUS_LABELS } from '@/lib/social/types'

interface PostStatusBadgeProps {
  status: PostStatus
  size?: 'sm' | 'default'
  className?: string
}

/**
 * Status color mapping following project color conventions:
 * - draft: muted gray (neutral, work in progress)
 * - scheduled: accent pink (pending action, LaserZone brand)
 * - published: green (success, live content)
 * - failed: destructive red (error, needs attention)
 */
const STATUS_STYLES: Record<PostStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-muted',
  scheduled: 'bg-accent/20 text-accent border-accent/30',
  published: 'bg-green-500/20 text-green-500 border-green-500/30',
  failed: 'bg-destructive/20 text-destructive border-destructive/30',
}

export function PostStatusBadge({
  status,
  size = 'default',
  className,
}: PostStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        STATUS_STYLES[status],
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {POST_STATUS_LABELS[status]}
    </Badge>
  )
}
