'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import type { DriveFile } from '@/lib/drive/types'

// ============================================================================
// Types
// ============================================================================

export interface DriveGridItemProps {
  /** Drive file to display */
  file: DriveFile
  /** Whether this item is selected */
  isSelected: boolean
  /** Callback when selection is toggled */
  onSelect: () => void
  /** Callback when item is clicked for preview */
  onPreview: () => void
}

// ============================================================================
// Component
// ============================================================================

/**
 * DriveGridItem - Individual grid item with thumbnail and selection checkbox
 *
 * Features:
 * - Thumbnail with lazy loading
 * - Selection checkbox (appears on hover, always visible when selected)
 * - Selection ring when selected
 * - Hover zoom effect on image
 * - Error state for failed image loads
 */
export function DriveGridItem({
  file,
  isSelected,
  onSelect,
  onPreview,
}: DriveGridItemProps) {
  const [hasError, setHasError] = React.useState(false)

  // Handle checkbox click without triggering preview
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  // Handle keyboard on checkbox
  const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation()
    }
  }

  return (
    <div
      className={cn(
        'group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted',
        isSelected && 'ring-2 ring-primary ring-inset'
      )}
      onClick={onPreview}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPreview()
        }
      }}
      aria-label={`${file.name}${isSelected ? ' (selected)' : ''}`}
    >
      {/* Thumbnail image */}
      {hasError ? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : (
        <Image
          src={file.thumbnailLink}
          alt={file.name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16.6vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      )}

      {/* Checkbox overlay - z-20 ensures it stays above image hover effects */}
      <div
        className={cn(
          'absolute left-2 top-2 z-20 transition-opacity duration-150',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
        onClick={handleCheckboxClick}
        onKeyDown={handleCheckboxKeyDown}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className={cn(
            'h-5 w-5 border-2 border-white shadow-md',
            'bg-black/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary'
          )}
          aria-label={`Select ${file.name}`}
        />
      </div>

      {/* Selection highlight overlay */}
      {isSelected && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-primary/10" />
      )}
    </div>
  )
}
