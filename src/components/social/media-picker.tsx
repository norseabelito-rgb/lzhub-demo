'use client'

import { useMemo, useState } from 'react'
import { Check, Image, Video, Film, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSocialStore } from '@/lib/social/social-store'
import type { MediaType } from '@/lib/social/types'

// ============================================================================
// Types
// ============================================================================

interface MediaPickerProps {
  /** IDs of selected media items */
  selectedIds: string[]
  /** Callback when selection changes */
  onChange: (ids: string[]) => void
}

// ============================================================================
// Constants
// ============================================================================

const MAX_MEDIA = 10

const FILTER_OPTIONS: { value: MediaType | 'all'; label: string; icon: typeof Image }[] = [
  { value: 'all', label: 'Toate', icon: Film },
  { value: 'image', label: 'Imagini', icon: Image },
  { value: 'video', label: 'Video', icon: Video },
]

// ============================================================================
// Component
// ============================================================================

export function MediaPicker({ selectedIds, onChange }: MediaPickerProps) {
  const [filter, setFilter] = useState<MediaType | 'all'>('all')

  // Get content library from store
  const contentLibrary = useSocialStore((state) => state.contentLibrary)

  // Filter library items
  const filteredItems = useMemo(() => {
    if (filter === 'all') {
      return contentLibrary
    }
    return contentLibrary.filter((item) => item.type === filter)
  }, [contentLibrary, filter])

  // Toggle media selection
  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id))
    } else {
      if (selectedIds.length < MAX_MEDIA) {
        onChange([...selectedIds, id])
      }
    }
  }

  const isAtLimit = selectedIds.length >= MAX_MEDIA

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 border-b">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              filter === option.value
                ? 'border-accent text-accent-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <option.icon className="size-4" />
            {option.label}
          </button>
        ))}
      </div>

      {/* Selection count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {selectedIds.length} / {MAX_MEDIA} selectate
        </span>
        {isAtLimit && (
          <span className="flex items-center gap-1 text-amber-500">
            <AlertCircle className="size-3" />
            Limita atinsa
          </span>
        )}
      </div>

      {/* Media grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Film className="size-12 mb-3 opacity-20" />
          <p className="text-sm">Biblioteca este goala.</p>
          <p className="text-xs mt-1">Adauga media din Biblioteca de continut.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const isDisabled = !isSelected && isAtLimit

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => !isDisabled && handleToggle(item.id)}
                disabled={isDisabled}
                className={cn(
                  'relative aspect-square rounded-md overflow-hidden',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'transition-opacity',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {/* Thumbnail */}
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />

                {/* Video indicator */}
                {item.type === 'video' && (
                  <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5">
                    <Video className="size-3 text-white" />
                  </div>
                )}

                {/* Selection overlay */}
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-accent/60'
                      : 'bg-black/0 hover:bg-black/20'
                  )}
                >
                  {isSelected && (
                    <div className="rounded-full bg-accent p-1">
                      <Check className="size-4 text-accent-foreground" />
                    </div>
                  )}
                </div>

                {/* Selection order indicator */}
                {isSelected && (
                  <div className="absolute top-1 left-1 rounded-full bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground">
                    {selectedIds.indexOf(item.id) + 1}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
