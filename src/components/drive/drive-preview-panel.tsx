'use client'

/**
 * DrivePreviewPanel - Side panel for image preview with metadata
 * Fixed positioned panel on the right side with navigation and selection
 */

import { useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  FileImage,
  HardDrive,
  Maximize2,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { DriveFile } from '@/lib/drive/types'

// ============================================================================
// Types
// ============================================================================

export interface DrivePreviewPanelProps {
  /** File to preview (null when no preview) */
  file: DriveFile | null
  /** Whether this file is currently selected */
  isSelected: boolean
  /** Toggle selection */
  onSelect: () => void
  /** Close the preview panel */
  onClose: () => void
  /** Navigate to previous image (null if first) */
  onPrevious: (() => void) | null
  /** Navigate to next image (null if last) */
  onNext: (() => void) | null
  /** Use inline positioning instead of fixed (for use inside dialogs) */
  inline?: boolean
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format file size from bytes to human-readable format
 */
function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Get larger image URL from Lorem Picsum
 * The thumbnailLink is 200x200, we need a larger preview
 */
function getPreviewUrl(thumbnailLink: string): string {
  // Transform https://picsum.photos/seed/xxx/200/200 to /seed/xxx/800/600
  return thumbnailLink.replace('/200/200', '/800/600')
}

// ============================================================================
// Main Component
// ============================================================================

export function DrivePreviewPanel({
  file,
  isSelected,
  onSelect,
  onClose,
  onPrevious,
  onNext,
  inline = false,
}: DrivePreviewPanelProps) {
  // Keyboard navigation
  useEffect(() => {
    if (!file) return

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowLeft':
          if (onPrevious) {
            e.preventDefault()
            onPrevious()
          }
          break
        case 'ArrowRight':
          if (onNext) {
            e.preventDefault()
            onNext()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [file, onPrevious, onNext, onClose])

  // Don't render if no file
  if (!file) return null

  const dimensions = file.imageMediaMetadata
    ? `${file.imageMediaMetadata.width} x ${file.imageMediaMetadata.height}`
    : 'Unknown'

  const dateAdded = format(parseISO(file.createdTime), 'MMM d, yyyy')

  const containerClass = inline
    ? 'flex h-full flex-col bg-background'
    : 'fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border bg-background shadow-xl transition-transform duration-200 lg:w-96'

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="truncate pr-2 text-sm font-medium" title={file.name}>
          {file.name}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close preview</span>
        </Button>
      </div>

      {/* Image Preview */}
      <div className="relative flex-1 overflow-hidden bg-muted">
        {/* Image container */}
        <div className="relative flex h-full items-center justify-center p-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={getPreviewUrl(file.thumbnailLink)}
              alt={file.name}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 320px, 384px"
              unoptimized
              priority
            />
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm disabled:opacity-30"
            onClick={onPrevious ?? undefined}
            disabled={!onPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous image</span>
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm disabled:opacity-30"
            onClick={onNext ?? undefined}
            disabled={!onNext}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next image</span>
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-3 border-t border-border p-4">
        {/* Filename */}
        <div className="flex items-start gap-3">
          <FileImage className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Filename</p>
            <p className="truncate text-sm font-medium" title={file.name}>
              {file.name}
            </p>
          </div>
        </div>

        {/* Dimensions */}
        <div className="flex items-start gap-3">
          <Maximize2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Dimensions</p>
            <p className="text-sm font-medium">{dimensions}</p>
          </div>
        </div>

        {/* File size */}
        <div className="flex items-start gap-3">
          <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">File size</p>
            <p className="text-sm font-medium">{formatFileSize(file.size)}</p>
          </div>
        </div>

        {/* Date added */}
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Date added</p>
            <p className="text-sm font-medium">{dateAdded}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-border p-4">
        <Button
          className="w-full"
          variant={isSelected ? 'secondary' : 'default'}
          onClick={onSelect}
        >
          {isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            'Select Photo'
          )}
        </Button>
      </div>
    </div>
  )
}
