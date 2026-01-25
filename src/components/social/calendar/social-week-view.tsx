'use client'

/**
 * SocialWeekView - Week view for social content calendar
 * Shows 7 columns (Mon-Sun) with compact post cards
 */

import { useMemo } from 'react'
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'
import { ro } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { SocialPost } from '@/lib/social/types'
import { PostCard } from '../post-card'

// ============================================================================
// Types
// ============================================================================

interface SocialWeekViewProps {
  startDate: Date
  posts: SocialPost[]
  onPostClick: (id: string) => void
  onDayClick?: (date: Date) => void
}

// ============================================================================
// Constants
// ============================================================================

const DAY_NAMES = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata', 'Duminica']

// Maximum posts to show before "+ N more"
const MAX_VISIBLE_POSTS = 3

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

// ============================================================================
// Component
// ============================================================================

export function SocialWeekView({
  startDate,
  posts,
  onPostClick,
  onDayClick,
}: SocialWeekViewProps) {
  // Calculate week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const start = startOfWeek(startDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [startDate])

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map((day, index) => {
          const isCurrentDay = isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={cn(
                'border-r last:border-r-0 p-2 text-center transition-colors',
                'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
                isCurrentDay && 'bg-primary/10'
              )}
            >
              <div className="text-xs text-muted-foreground sm:text-sm">
                {DAY_NAMES[index]}
              </div>
              <div
                className={cn(
                  'text-sm font-medium sm:text-base',
                  isCurrentDay && 'text-primary'
                )}
              >
                {format(day, 'd')}
              </div>
            </button>
          )
        })}
      </div>

      {/* Day columns with posts */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDays.map((day) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            posts={posts}
            onPostClick={onPostClick}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface DayColumnProps {
  date: Date
  posts: SocialPost[]
  onPostClick: (id: string) => void
  onDayClick?: (date: Date) => void
}

function DayColumn({ date, posts, onPostClick, onDayClick }: DayColumnProps) {
  const isCurrentDay = isToday(date)

  // Get and sort posts for this day
  const dayPosts = useMemo(() => {
    const postsForDate = getPostsForDate(posts, date)
    return sortByTime(postsForDate)
  }, [posts, date])

  const visiblePosts = dayPosts.slice(0, MAX_VISIBLE_POSTS)
  const remainingCount = dayPosts.length - MAX_VISIBLE_POSTS

  return (
    <div
      className={cn(
        'border-r last:border-r-0 p-2 flex flex-col gap-2',
        isCurrentDay && 'bg-primary/5'
      )}
    >
      {/* Posts list */}
      {visiblePosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          compact
          onClick={() => onPostClick(post.id)}
          className={cn(
            post.status === 'published' && 'opacity-60'
          )}
        />
      ))}

      {/* "+ N more" indicator */}
      {remainingCount > 0 && (
        <button
          onClick={() => onDayClick?.(date)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
        >
          + {remainingCount} mai mult
        </button>
      )}

      {/* Empty state - click area to day view */}
      {dayPosts.length === 0 && (
        <button
          onClick={() => onDayClick?.(date)}
          className="flex-1 min-h-[60px] flex items-center justify-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Fara postari
        </button>
      )}
    </div>
  )
}
