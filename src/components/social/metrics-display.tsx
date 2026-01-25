'use client'

/**
 * MetricsDisplay - Shows engagement metrics for social media posts
 * Displays likes, comments, shares, and views with formatting for large numbers
 */

import { Heart, MessageCircle, Share2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PostMetrics, SocialPlatform } from '@/lib/social/types'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'

interface MetricsDisplayProps {
  metrics: Record<SocialPlatform, PostMetrics>
  platform?: SocialPlatform
  className?: string
  compact?: boolean
}

/**
 * Format large numbers for display:
 * - 1000 -> "1K"
 * - 1500 -> "1.5K"
 * - 1000000 -> "1M"
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    const formatted = (num / 1000000).toFixed(1)
    return formatted.endsWith('.0') ? `${Math.floor(num / 1000000)}M` : `${formatted}M`
  }
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(1)
    return formatted.endsWith('.0') ? `${Math.floor(num / 1000)}K` : `${formatted}K`
  }
  return num.toString()
}

/**
 * Aggregate metrics across all platforms or get single platform metrics
 */
function getMetricValues(
  metrics: Record<SocialPlatform, PostMetrics>,
  platform?: SocialPlatform
): { likes: number; comments: number; shares: number; views: number; lastUpdated: Date | null } {
  if (platform) {
    const platformMetrics = metrics[platform]
    return {
      likes: platformMetrics.likes,
      comments: platformMetrics.comments,
      shares: platformMetrics.shares,
      views: platformMetrics.views,
      lastUpdated: platformMetrics.lastUpdated instanceof Date
        ? platformMetrics.lastUpdated
        : new Date(platformMetrics.lastUpdated),
    }
  }

  // Aggregate across all platforms
  const platforms = Object.keys(metrics) as SocialPlatform[]
  let latestUpdate: Date | null = null

  const totals = platforms.reduce(
    (acc, p) => {
      const m = metrics[p]
      const updateDate = m.lastUpdated instanceof Date ? m.lastUpdated : new Date(m.lastUpdated)

      if (!latestUpdate || updateDate > latestUpdate) {
        latestUpdate = updateDate
      }

      return {
        likes: acc.likes + m.likes,
        comments: acc.comments + m.comments,
        shares: acc.shares + m.shares,
        views: acc.views + m.views,
      }
    },
    { likes: 0, comments: 0, shares: 0, views: 0 }
  )

  return { ...totals, lastUpdated: latestUpdate }
}

interface MetricItemProps {
  icon: React.ReactNode
  value: number
  label: string
  compact?: boolean
}

function MetricItem({ icon, value, label, compact }: MetricItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-muted-foreground',
        compact && 'gap-1'
      )}
      title={label}
    >
      <span className={cn('shrink-0', compact ? 'size-3' : 'size-4')}>
        {icon}
      </span>
      <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
        {formatNumber(value)}
      </span>
    </div>
  )
}

export function MetricsDisplay({
  metrics,
  platform,
  className,
  compact = false,
}: MetricsDisplayProps) {
  const values = getMetricValues(metrics, platform)
  const hasData = values.likes > 0 || values.comments > 0 || values.shares > 0 || values.views > 0

  if (!hasData) {
    return (
      <div className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm', className)}>
        Fara date
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className={cn('flex items-center', compact ? 'gap-3' : 'gap-4')}>
        <MetricItem
          icon={<Heart className="size-full" />}
          value={values.likes}
          label="Aprecieri"
          compact={compact}
        />
        <MetricItem
          icon={<MessageCircle className="size-full" />}
          value={values.comments}
          label="Comentarii"
          compact={compact}
        />
        {!compact && (
          <>
            <MetricItem
              icon={<Share2 className="size-full" />}
              value={values.shares}
              label="Distribuiri"
              compact={compact}
            />
            <MetricItem
              icon={<Eye className="size-full" />}
              value={values.views}
              label="Vizualizari"
              compact={compact}
            />
          </>
        )}
      </div>
      {!compact && values.lastUpdated && (
        <span className="text-xs text-muted-foreground/70">
          Actualizat: {format(values.lastUpdated, 'd MMM yyyy, HH:mm', { locale: ro })}
        </span>
      )}
    </div>
  )
}
