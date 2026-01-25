'use client'

/**
 * DriveRecentView - Date-grouped recent photos view
 * Groups photos by "Today", "Yesterday", or date (e.g., "Jan 20")
 */

import { useMemo } from 'react'
import { isToday, isYesterday, format, parseISO } from 'date-fns'
import { Check, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { DriveFile } from '@/lib/drive/types'

// ============================================================================
// Types
// ============================================================================

export interface DriveRecentViewProps {
  /** Files already filtered to recent 30 days, sorted by date desc */
  files: DriveFile[]
  /** Set of currently selected file IDs */
  selectedIds: Set<string>
  /** Toggle selection of a file */
  onSelect: (fileId: string) => void
  /** Open preview for a file */
  onPreview: (fileId: string) => void
}

// ============================================================================
// Date Grouping Helpers
// ============================================================================

/**
 * Get human-readable date group label
 */
function getDateGroupLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d') // "Jan 20"
}

/**
 * Group files by date label
 * Maintains order (files should already be sorted desc by date)
 */
function groupByDate(files: DriveFile[]): Map<string, DriveFile[]> {
  const groups = new Map<string, DriveFile[]>()

  for (const file of files) {
    const label = getDateGroupLabel(file.createdTime)
    const group = groups.get(label) || []
    group.push(file)
    groups.set(label, group)
  }

  return groups
}

// ============================================================================
// Grid Item Component
// ============================================================================

interface GridItemProps {
  file: DriveFile
  isSelected: boolean
  onSelect: () => void
  onPreview: () => void
}

function GridItem({ file, isSelected, onSelect, onPreview }: GridItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Shift+click or Ctrl/Cmd+click for selection
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      e.preventDefault()
      onSelect()
    } else {
      // Regular click for preview
      onPreview()
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-primary"
      onClick={handleClick}
    >
      {/* Image */}
      <Image
        src={file.thumbnailLink}
        alt={file.name}
        fill
        className="object-cover transition-transform group-hover:scale-105"
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 150px"
        unoptimized // Lorem Picsum doesn't need Next.js optimization
      />

      {/* Selection checkbox overlay */}
      <div
        className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
          isSelected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-white bg-black/50 opacity-0 group-hover:opacity-100'
        }`}
        onClick={handleCheckboxClick}
      >
        {isSelected && <Check className="h-4 w-4" />}
      </div>

      {/* Filename on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-xs text-white">{file.name}</p>
      </div>

      {/* Selected overlay */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background" />
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function DriveRecentView({
  files,
  selectedIds,
  onSelect,
  onPreview,
}: DriveRecentViewProps) {
  // Group files by date
  const groupedFiles = useMemo(() => groupByDate(files), [files])

  // Empty state
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ImageIcon className="mb-4 h-12 w-12" />
        <p className="text-lg font-medium">No recent photos</p>
        <p className="text-sm">Photos from the last 30 days will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Array.from(groupedFiles.entries()).map(([dateLabel, groupFiles]) => (
        <section key={dateLabel}>
          {/* Date group header */}
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {dateLabel}
            </h3>
            <span className="text-xs text-muted-foreground/70">
              ({groupFiles.length})
            </span>
          </div>

          {/* Grid of images */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {groupFiles.map((file) => (
              <GridItem
                key={file.id}
                file={file}
                isSelected={selectedIds.has(file.id)}
                onSelect={() => onSelect(file.id)}
                onPreview={() => onPreview(file.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
