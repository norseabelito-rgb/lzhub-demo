'use client'

import { FolderOpen } from 'lucide-react'

import type { DriveFile } from '@/lib/drive/types'
import { DriveGridItem } from './drive-grid-item'

// ============================================================================
// Types
// ============================================================================

export interface DriveGridProps {
  /** Files to display in the grid */
  files: DriveFile[]
  /** Set of selected file IDs */
  selectedIds: Set<string>
  /** Callback when a file's selection is toggled */
  onSelect: (fileId: string) => void
  /** Callback when a file is clicked for preview */
  onPreview: (fileId: string) => void
  /** Message to show when no files are present */
  emptyMessage?: string
}

// ============================================================================
// Component
// ============================================================================

/**
 * DriveGrid - Responsive image grid with selection support
 *
 * Features:
 * - Responsive columns: 3 (mobile) -> 4 (sm) -> 5 (md) -> 6 (lg)
 * - Selection state management via Set for O(1) lookups
 * - Empty state with customizable message
 * - Maps files to DriveGridItem components
 */
export function DriveGrid({
  files,
  selectedIds,
  onSelect,
  onPreview,
  emptyMessage = 'Nu au fost gasite imagini',
}: DriveGridProps) {
  // Empty state
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {files.map((file) => (
        <DriveGridItem
          key={file.id}
          file={file}
          isSelected={selectedIds.has(file.id)}
          onSelect={() => onSelect(file.id)}
          onPreview={() => onPreview(file.id)}
        />
      ))}
    </div>
  )
}
