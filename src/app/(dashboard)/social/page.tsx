'use client'

/**
 * Social Media page - Content calendar view
 * Main entry point for social media scheduling with day/week/month views
 */

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
} from 'date-fns'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSocialStore } from '@/lib/social/social-store'
import type { PostStatus, SocialPost } from '@/lib/social/types'
import { POST_STATUS_LABELS } from '@/lib/social/types'
import {
  SocialCalendarHeader,
  type SocialCalendarView,
} from '@/components/social/calendar/social-calendar-header'
import { SocialDayView } from '@/components/social/calendar/social-day-view'
import { SocialWeekView } from '@/components/social/calendar/social-week-view'
import { SocialMonthView } from '@/components/social/calendar/social-month-view'

// ============================================================================
// Types
// ============================================================================

type StatusFilter = 'all' | PostStatus

// ============================================================================
// Constants
// ============================================================================

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Toate' },
  { value: 'draft', label: POST_STATUS_LABELS.draft },
  { value: 'scheduled', label: POST_STATUS_LABELS.scheduled },
  { value: 'published', label: POST_STATUS_LABELS.published },
  { value: 'failed', label: POST_STATUS_LABELS.failed },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get date range for the current view
 */
function getDateRange(
  currentDate: Date,
  view: SocialCalendarView
): { start: string; end: string } {
  let start: Date
  let end: Date

  switch (view) {
    case 'day':
      start = currentDate
      end = currentDate
      break
    case 'week':
      start = startOfWeek(currentDate, { weekStartsOn: 1 })
      end = endOfWeek(currentDate, { weekStartsOn: 1 })
      break
    case 'month':
      // Include padding days from adjacent months
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      start = startOfWeek(monthStart, { weekStartsOn: 1 })
      end = endOfWeek(monthEnd, { weekStartsOn: 1 })
      break
  }

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

/**
 * Count posts scheduled for this month
 */
function countMonthPosts(posts: SocialPost[], currentDate: Date): number {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  return posts.filter((post) => {
    if (!post.scheduledAt) return false
    const postDate = post.scheduledAt instanceof Date
      ? post.scheduledAt
      : new Date(post.scheduledAt)
    return postDate >= monthStart && postDate <= monthEnd
  }).length
}

// ============================================================================
// Component
// ============================================================================

export default function SocialPage() {
  const router = useRouter()

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<SocialCalendarView>('month')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Get posts from store
  const getPostsForDateRange = useSocialStore((state) => state.getPostsForDateRange)
  const allPosts = useSocialStore((state) => state.posts)

  // Get date range for current view
  const dateRange = useMemo(() => getDateRange(currentDate, view), [currentDate, view])

  // Fetch posts for visible range
  const visiblePosts = useMemo(() => {
    const posts = getPostsForDateRange(dateRange.start, dateRange.end)

    // Apply status filter
    if (statusFilter !== 'all') {
      return posts.filter((post) => post.status === statusFilter)
    }

    return posts
  }, [getPostsForDateRange, dateRange, statusFilter])

  // Count scheduled posts for stats
  const monthPostCount = useMemo(
    () => countMonthPosts(allPosts, currentDate),
    [allPosts, currentDate]
  )

  // Handlers
  const handlePostClick = (id: string) => {
    router.push(`/social/${id}`)
  }

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    setView('day')
  }

  const handleViewChange = (newView: SocialCalendarView) => {
    setView(newView)
  }

  // Get current filter label
  const currentFilterLabel = STATUS_FILTER_OPTIONS.find(
    (opt) => opt.value === statusFilter
  )?.label ?? 'Toate'

  return (
    <div className="container py-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-glow text-primary">Social Media</h1>
          <p className="text-sm text-muted-foreground">
            {monthPostCount === 0
              ? 'Nicio postare programata aceasta luna'
              : monthPostCount === 1
              ? '1 postare programata aceasta luna'
              : `${monthPostCount} postari programate aceasta luna`}
          </p>
        </div>

        {/* Status filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline-glow" className="gap-2">
              <Filter className="size-4" />
              {currentFilterLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Calendar header */}
      <SocialCalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={handleViewChange}
      />

      {/* Calendar view */}
      {view === 'day' && (
        <SocialDayView
          date={currentDate}
          posts={visiblePosts}
          onPostClick={handlePostClick}
        />
      )}

      {view === 'week' && (
        <SocialWeekView
          startDate={currentDate}
          posts={visiblePosts}
          onPostClick={handlePostClick}
          onDayClick={handleDayClick}
        />
      )}

      {view === 'month' && (
        <SocialMonthView
          currentDate={currentDate}
          posts={visiblePosts}
          onPostClick={handlePostClick}
          onDayClick={handleDayClick}
        />
      )}
    </div>
  )
}
