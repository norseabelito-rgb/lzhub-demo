'use client'

import { useState } from 'react'
import { MoreHorizontal, Eye, Tag, Trash2, Film, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ContentLibraryItem } from '@/lib/social'

// ============================================================================
// Types
// ============================================================================

export interface LibraryItemProps {
  item: ContentLibraryItem
  onSelect?: (item: ContentLibraryItem) => void
  onDelete?: (item: ContentLibraryItem) => void
  onEditTags?: (item: ContentLibraryItem) => void
  selected?: boolean
  className?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ============================================================================
// Component
// ============================================================================

export function LibraryItem({
  item,
  onSelect,
  onDelete,
  onEditTags,
  selected = false,
  className,
}: LibraryItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (onSelect) {
      onSelect(item)
    }
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden cursor-pointer transition-all',
        selected && 'ring-2 ring-accent',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Thumbnail container with aspect ratio */}
      <div className="relative aspect-square bg-muted">
        {/* Placeholder thumbnail (mock) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
          {item.type === 'video' ? (
            <Film className="h-12 w-12 text-accent/50" />
          ) : (
            <ImageIcon className="h-12 w-12 text-accent/50" />
          )}
        </div>

        {/* Type badge */}
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 text-xs bg-background/80 backdrop-blur-sm"
        >
          {item.type === 'video' ? 'Video' : 'Imagine'}
        </Badge>

        {/* Video duration badge */}
        {item.type === 'video' && item.duration && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 right-2 text-xs bg-background/80 backdrop-blur-sm"
          >
            {formatDuration(item.duration)}
          </Badge>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/60 flex flex-col justify-end p-3 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
          <p className="text-xs text-white/70">{formatFileSize(item.size)}</p>
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs bg-white/10 text-white border-white/20"
                >
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-white/10 text-white border-white/20"
                >
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background transition-opacity',
                isHovered ? 'opacity-100' : 'opacity-0 group-focus-within:opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Optiuni</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                if (onSelect) onSelect(item)
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Vezi detalii
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                if (onEditTags) onEditTags(item)
              }}
            >
              <Tag className="mr-2 h-4 w-4" />
              Editeaza tag-uri
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                if (onDelete) onDelete(item)
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Sterge
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Selected indicator */}
        {selected && (
          <div className="absolute inset-0 border-2 border-accent pointer-events-none" />
        )}
      </div>
    </Card>
  )
}
