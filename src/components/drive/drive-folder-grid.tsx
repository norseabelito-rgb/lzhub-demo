'use client'

import { Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DriveFolder } from '@/lib/drive/types'

interface DriveFolderGridProps {
  /** List of folders to display */
  folders: DriveFolder[]
  /** Called when a folder is clicked for navigation */
  onNavigate: (folderId: string, folderName: string) => void
  /** Additional className for container */
  className?: string
}

/**
 * DriveFolderGrid - Grid of folder cards for navigation
 *
 * Displays subfolders in a responsive grid layout.
 * Each folder is clickable to navigate into it.
 * Returns null if no folders to display.
 */
export function DriveFolderGrid({
  folders,
  onNavigate,
  className,
}: DriveFolderGridProps) {
  // No folders to show
  if (folders.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4',
        className
      )}
    >
      {folders.map((folder) => (
        <button
          key={folder.id}
          type="button"
          onClick={() => onNavigate(folder.id, folder.name)}
          className={cn(
            'flex items-center gap-2 p-3 rounded-md border border-border',
            'bg-card text-card-foreground',
            'hover:bg-accent/50 hover:border-accent',
            'transition-colors cursor-pointer',
            'text-left'
          )}
        >
          <Folder className="h-5 w-5 text-muted-foreground shrink-0" />
          <span className="text-sm truncate">{folder.name}</span>
        </button>
      ))}
    </div>
  )
}
