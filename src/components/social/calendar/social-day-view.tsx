'use client'

/**
 * SocialDayView - Day view for social content calendar
 * Shows all posts scheduled for a single day
 */

import { useMemo } from 'react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SocialPost } from '@/lib/social/types'
import { PostCard } from '../post-card'

// ============================================================================
// Types
// ============================================================================

interface SocialDayViewProps {
  date: Date
  posts: SocialPost[]
  onPostClick: (id: string) => void
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get posts scheduled for a specific date
 */
function getPostsForDate(posts: SocialPost[], date: Date): SocialPost[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  return posts.filter((post) => {
    if (!post.scheduledAt) return false
    const postDate = post.scheduledAt instanceof Date
      ? post.scheduledAt
      : new Date(post.scheduledAt)
    return format(postDate, 'yyyy-MM-dd') === dateStr
  })
}

/**
 * Sort posts by scheduled time
 */
function sortByTime(posts: SocialPost[]): SocialPost[] {
  return [...posts].sort((a, b) => {
    const dateA = a.scheduledAt instanceof Date ? a.scheduledAt : new Date(a.scheduledAt!)
    const dateB = b.scheduledAt instanceof Date ? b.scheduledAt : new Date(b.scheduledAt!)
    return dateA.getTime() - dateB.getTime()
  })
}

/**
 * Group posts by time for display
 */
function groupByTime(posts: SocialPost[]): Map<string, SocialPost[]> {
  const groups = new Map<string, SocialPost[]>()

  posts.forEach((post) => {
    if (!post.scheduledAt) return
    const postDate = post.scheduledAt instanceof Date
      ? post.scheduledAt
      : new Date(post.scheduledAt)
    const timeKey = format(postDate, 'HH:mm')

    if (!groups.has(timeKey)) {
      groups.set(timeKey, [])
    }
    groups.get(timeKey)!.push(post)
  })

  return groups
}

// ============================================================================
// Component
// ============================================================================

export function SocialDayView({
  date,
  posts,
  onPostClick,
}: SocialDayViewProps) {
  // Get and sort posts for this day
  const dayPosts = useMemo(() => {
    const postsForDate = getPostsForDate(posts, date)
    return sortByTime(postsForDate)
  }, [posts, date])

  // Group posts by time
  const groupedPosts = useMemo(() => {
    return groupByTime(dayPosts)
  }, [dayPosts])

  // Format date for header
  const dateHeader = useMemo(() => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: ro })
  }, [date])

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Date header with post count */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <h3 className="font-semibold capitalize">{dateHeader}</h3>
        <span className="text-sm text-muted-foreground">
          {dayPosts.length === 0
            ? 'Fara postari'
            : dayPosts.length === 1
            ? '1 postare'
            : `${dayPosts.length} postari`}
        </span>
      </div>

      {/* Posts list */}
      <div className="p-4">
        {dayPosts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {Array.from(groupedPosts.entries()).map(([time, timePosts]) => (
              <TimeGroup
                key={time}
                time={time}
                posts={timePosts}
                onPostClick={onPostClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <CalendarDays className="size-12 mb-4 opacity-50" />
      <p className="text-center">Nu sunt postari programate pentru aceasta zi</p>
    </div>
  )
}

interface TimeGroupProps {
  time: string
  posts: SocialPost[]
  onPostClick: (id: string) => void
}

function TimeGroup({ time, posts, onPostClick }: TimeGroupProps) {
  return (
    <div className="space-y-2">
      {/* Time header */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{time}</span>
        <div className="flex-1 border-t" />
      </div>

      {/* Posts at this time */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
            className={cn(
              post.status === 'published' && 'opacity-60'
            )}
          />
        ))}
      </div>
    </div>
  )
}
