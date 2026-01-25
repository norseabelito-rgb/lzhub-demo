'use client'

/**
 * SocialMonthView - Month calendar view for social content
 * Shows post indicators on scheduled days with status colors
 */

import { useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns'
import { ro } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { SocialPost, PostStatus } from '@/lib/social/types'

// ============================================================================
// Types
// ============================================================================

interface SocialMonthViewProps {
  currentDate: Date
  posts: SocialPost[]
  onPostClick: (id: string) => void
  onDayClick: (date: Date) => void
}

// ============================================================================
// Constants
// ============================================================================

// Day names in Romanian (abbreviated)
const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Status priority for badge color (lower = more urgent)
const STATUS_PRIORITY: Record<PostStatus, number> = {
  failed: 0,
  scheduled: 1,
  draft: 2,
  published: 3,
}

// Status colors
const STATUS_COLORS: Record<PostStatus, string> = {
  failed: 'bg-destructive/20 text-destructive',
  scheduled: 'bg-primary/20 text-primary',
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-500/20 text-green-600',
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
 * Get the most urgent status from a list of posts
 */
function getMostUrgentStatus(posts: SocialPost[]): PostStatus {
  if (posts.length === 0) return 'draft'

  return posts.reduce((mostUrgent, post) => {
    if (STATUS_PRIORITY[post.status] < STATUS_PRIORITY[mostUrgent]) {
      return post.status
    }
    return mostUrgent
  }, posts[0].status)
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// ============================================================================
// Component
// ============================================================================

export function SocialMonthView({
  currentDate,
  posts,
  onPostClick,
  onDayClick,
}: SocialMonthViewProps) {
  // Generate calendar days including padding from adjacent months
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  // Group days into weeks for rendering
  const weeks = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7))
    }
    return result
  }, [calendarDays])

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {DAY_NAMES.map((name, index) => (
          <div
            key={index}
            className="border-r last:border-r-0 p-2 text-center text-xs font-medium text-muted-foreground sm:text-sm"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-rows-[repeat(auto-fill,minmax(100px,1fr))]">
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 border-b last:border-b-0"
          >
            {week.map((day) => (
              <DayCell
                key={day.toISOString()}
                day={day}
                currentMonth={currentDate}
                posts={posts}
                onPostClick={onPostClick}
                onDayClick={onDayClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface DayCellProps {
  day: Date
  currentMonth: Date
  posts: SocialPost[]
  onPostClick: (id: string) => void
  onDayClick: (date: Date) => void
}

function DayCell({
  day,
  currentMonth,
  posts,
  onPostClick,
  onDayClick,
}: DayCellProps) {
  const isCurrentMonth = isSameMonth(day, currentMonth)
  const isTodayDate = isToday(day)

  // Get and sort posts for this day in a single useMemo
  // Uses posts and day as deps to satisfy React Compiler
  const sortedPosts = useMemo(() => {
    const dayPosts = getPostsForDate(posts, day)
    return dayPosts.sort((a, b) => {
      const dateA = a.scheduledAt instanceof Date ? a.scheduledAt : new Date(a.scheduledAt!)
      const dateB = b.scheduledAt instanceof Date ? b.scheduledAt : new Date(b.scheduledAt!)
      return dateA.getTime() - dateB.getTime()
    })
  }, [posts, day])

  const postCount = sortedPosts.length
  const mostUrgentStatus = getMostUrgentStatus(sortedPosts)

  return (
    <button
      onClick={() => onDayClick(day)}
      className={cn(
        'border-r last:border-r-0 min-h-[100px] p-1 text-left transition-colors sm:p-2',
        'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
        !isCurrentMonth && 'bg-muted/30 text-muted-foreground/50',
        isTodayDate && 'ring-2 ring-primary ring-inset'
      )}
    >
      {/* Day number and post count badge */}
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'text-sm font-medium',
            isTodayDate && 'text-primary',
            !isCurrentMonth && 'text-muted-foreground/50'
          )}
        >
          {format(day, 'd')}
        </span>

        {postCount > 0 && (
          <span
            className={cn(
              'rounded-full px-1.5 text-xs font-medium',
              STATUS_COLORS[mostUrgentStatus]
            )}
          >
            {postCount}
          </span>
        )}
      </div>

      {/* Post titles (first 2) */}
      {sortedPosts.length > 0 && (
        <div className="mt-1 space-y-0.5 overflow-hidden">
          {sortedPosts.slice(0, 2).map((post) => (
            <div
              key={post.id}
              onClick={(e) => {
                e.stopPropagation()
                onPostClick(post.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  onPostClick(post.id)
                }
              }}
              className={cn(
                'truncate rounded px-1 text-xs cursor-pointer transition-colors',
                'hover:bg-accent',
                STATUS_COLORS[post.status]
              )}
            >
              <span className="font-medium">
                {format(
                  post.scheduledAt instanceof Date
                    ? post.scheduledAt
                    : new Date(post.scheduledAt!),
                  'HH:mm'
                )}
              </span>
              <span className="hidden sm:inline ml-1">
                {truncate(post.caption || 'Fara text', 15)}
              </span>
            </div>
          ))}

          {sortedPosts.length > 2 && (
            <div className="px-1 text-xs text-muted-foreground">
              +{sortedPosts.length - 2} mai mult
            </div>
          )}
        </div>
      )}
    </button>
  )
}
