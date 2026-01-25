'use client'

import { HardDrive } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { FolderPath } from '@/lib/drive/types'

interface DriveBreadcrumbProps {
  /** Current folder path (empty = root) */
  folderPath: FolderPath[]
  /** Navigate to a specific path index */
  onNavigate: (index: number) => void
  /** Navigate to root (My Drive) */
  onNavigateRoot: () => void
}

/**
 * DriveBreadcrumb - Navigation breadcrumb for folder hierarchy
 *
 * Shows "My Drive" as root, followed by the folder path.
 * All segments except the last are clickable for navigation.
 *
 * Example: My Drive > Event Photos > 2024
 */
export function DriveBreadcrumb({
  folderPath,
  onNavigate,
  onNavigateRoot,
}: DriveBreadcrumbProps) {
  // At root level - show "My Drive" as current page (non-clickable)
  if (folderPath.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1.5">
              <HardDrive className="h-4 w-4" />
              <span>My Drive</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // In a subfolder - show path with clickable navigation
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Root - always clickable when in subfolder */}
        <BreadcrumbItem>
          <BreadcrumbLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onNavigateRoot()
            }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <HardDrive className="h-4 w-4" />
            <span>My Drive</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* Path segments */}
        {folderPath.map((folder, index) => {
          const isLast = index === folderPath.length - 1

          return (
            <BreadcrumbItem key={folder.id}>
              {isLast ? (
                // Last item is current page (non-clickable)
                <BreadcrumbPage>{folder.name}</BreadcrumbPage>
              ) : (
                // Intermediate items are clickable
                <>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigate(index)
                    }}
                    className="cursor-pointer"
                  >
                    {folder.name}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
