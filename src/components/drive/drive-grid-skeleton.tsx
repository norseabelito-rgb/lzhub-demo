'use client'

import { Skeleton } from '@/components/ui/skeleton'

// ============================================================================
// Types
// ============================================================================

export interface DriveGridSkeletonProps {
  /** Number of skeleton items to display */
  count?: number
}

// ============================================================================
// Component
// ============================================================================

/**
 * DriveGridSkeleton - Loading skeleton for the image grid
 *
 * Features:
 * - Matches DriveGrid responsive column layout
 * - Maintains aspect-square for consistent appearance
 * - Configurable count for different loading scenarios
 */
export function DriveGridSkeleton({ count = 12 }: DriveGridSkeletonProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="aspect-square rounded-lg"
        />
      ))}
    </div>
  )
}
