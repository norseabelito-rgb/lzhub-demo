'use client'

/**
 * DrivePicker - Main picker dialog integrating all Drive components
 * Large modal with tabs, navigation, search, selection, and preview
 */

import { useMemo, useCallback, useEffect } from 'react'
import { X, Cloud } from 'lucide-react'
import { useDriveStore } from '@/lib/drive/drive-store'
import type { DriveFile, DriveFolder } from '@/lib/drive/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DrivePickerTabs } from './drive-picker-tabs'
import { DriveConnect } from './drive-connect'
import { DriveBreadcrumb } from './drive-breadcrumb'
import { DriveSearch } from './drive-search'
import { DriveFolderGrid } from './drive-folder-grid'
import { DriveGrid } from './drive-grid'
import { DriveRecentView } from './drive-recent-view'
import { DrivePreviewPanel } from './drive-preview-panel'

// ============================================================================
// Types
// ============================================================================

export interface DrivePickerProps {
  /** Called when user confirms selection */
  onSelect: (files: DriveFile[]) => void
  /** Called when user cancels/closes picker */
  onCancel: () => void
}

// ============================================================================
// Component
// ============================================================================

/**
 * DrivePicker - Main picker dialog
 *
 * Features:
 * - Tab navigation: Recent | Browse Drive
 * - Folder navigation with breadcrumb
 * - Search filtering
 * - Single or multi-select mode
 * - Preview panel for selected image
 * - Keyboard shortcuts (Enter to confirm, Escape to close)
 */
export function DrivePicker({ onSelect, onCancel }: DrivePickerProps) {
  // Get store state and actions
  const isOpen = useDriveStore((s) => s.isOpen)
  const isConnected = useDriveStore((s) => s.isConnected)
  const currentTab = useDriveStore((s) => s.currentTab)
  const currentFolderId = useDriveStore((s) => s.currentFolderId)
  const folderPath = useDriveStore((s) => s.folderPath)
  const selectedIds = useDriveStore((s) => s.selectedIds)
  const previewFileId = useDriveStore((s) => s.previewFileId)
  const searchQuery = useDriveStore((s) => s.searchQuery)

  const setTab = useDriveStore((s) => s.setTab)
  const navigateToFolder = useDriveStore((s) => s.navigateToFolder)
  const navigateToPathIndex = useDriveStore((s) => s.navigateToPathIndex)
  const toggleSelection = useDriveStore((s) => s.toggleSelection)
  const setPreviewFile = useDriveStore((s) => s.setPreviewFile)
  const clearPreview = useDriveStore((s) => s.clearPreview)
  const setSearchQuery = useDriveStore((s) => s.setSearchQuery)
  const connect = useDriveStore((s) => s.connect)
  const disconnect = useDriveStore((s) => s.disconnect)
  const close = useDriveStore((s) => s.close)
  const getSelectedFiles = useDriveStore((s) => s.getSelectedFiles)

  // Get files based on current tab and folder
  // No Drive API yet - return empty state
  const { files, folders } = useMemo((): { files: DriveFile[]; folders: DriveFolder[] } => {
    return { files: [], folders: [] }
  }, [currentTab, currentFolderId])

  // Filter files by search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files
    const lowerQuery = searchQuery.toLowerCase()
    return files.filter((file) => file.name.toLowerCase().includes(lowerQuery))
  }, [files, searchQuery])

  // Filter folders by search query (for browse tab)
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders
    const lowerQuery = searchQuery.toLowerCase()
    return folders.filter((folder) =>
      folder.name.toLowerCase().includes(lowerQuery)
    )
  }, [folders, searchQuery])

  // Get preview file - no Drive API yet
  const previewFile = useMemo((): DriveFile | null => {
    if (!previewFileId) return null
    return filteredFiles.find((f) => f.id === previewFileId) || null
  }, [previewFileId, filteredFiles])

  // Calculate previous/next for preview navigation
  const { onPrevious, onNext } = useMemo(() => {
    if (!previewFileId || filteredFiles.length === 0) {
      return { onPrevious: null, onNext: null }
    }

    const currentIndex = filteredFiles.findIndex((f) => f.id === previewFileId)
    if (currentIndex === -1) {
      return { onPrevious: null, onNext: null }
    }

    const prevFile = filteredFiles[currentIndex - 1]
    const nextFile = filteredFiles[currentIndex + 1]

    return {
      onPrevious: prevFile ? () => setPreviewFile(prevFile.id) : null,
      onNext: nextFile ? () => setPreviewFile(nextFile.id) : null,
    }
  }, [previewFileId, filteredFiles, setPreviewFile])

  // Handle confirm selection
  const handleConfirm = useCallback(() => {
    const selected = getSelectedFiles()
    onSelect(selected)
    close()
  }, [getSelectedFiles, onSelect, close])

  // Handle cancel
  const handleCancel = useCallback(() => {
    onCancel()
    close()
  }, [onCancel, close])

  // Handle dialog close (from X button or overlay click)
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleCancel()
      }
    },
    [handleCancel]
  )

  // Navigate to root
  const handleNavigateRoot = useCallback(() => {
    navigateToPathIndex(-1)
  }, [navigateToPathIndex])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      // Enter to confirm (if files selected)
      if (e.key === 'Enter' && selectedIds.size > 0 && !previewFileId) {
        e.preventDefault()
        handleConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIds.size, previewFileId, handleConfirm])

  // Clear search when changing tabs or folders
  useEffect(() => {
    setSearchQuery('')
  }, [currentTab, currentFolderId, setSearchQuery])

  const selectionCount = selectedIds.size

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex h-[80vh] max-h-[900px] max-w-5xl flex-col gap-0 p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="text-lg font-semibold">
            Select from Drive
          </DialogTitle>
          <div className="flex items-center gap-2">
            <DriveConnect
              isConnected={isConnected}
              onConnect={connect}
              onDisconnect={disconnect}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="border-b border-border px-6 py-3">
          <DrivePickerTabs activeTab={currentTab} onTabChange={setTab} />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left side - content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {!isConnected ? (
              // Not connected state
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Cloud className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    Connect to Google Drive
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect your Google Drive account to select photos
                  </p>
                </div>
                <Button onClick={connect} className="mt-2">
                  Connect Google Drive
                </Button>
              </div>
            ) : currentTab === 'recent' ? (
              // Recent tab content
              <div className="flex-1 overflow-y-auto p-6">
                <DriveRecentView
                  files={filteredFiles}
                  selectedIds={selectedIds}
                  onSelect={toggleSelection}
                  onPreview={setPreviewFile}
                />
              </div>
            ) : (
              // Browse tab content
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Breadcrumb and search */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-3">
                  <DriveBreadcrumb
                    folderPath={folderPath}
                    onNavigate={navigateToPathIndex}
                    onNavigateRoot={handleNavigateRoot}
                  />
                  <DriveSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search in this folder..."
                    className="w-64"
                  />
                </div>

                {/* Folders and files */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Folder grid */}
                  <DriveFolderGrid
                    folders={filteredFolders}
                    onNavigate={navigateToFolder}
                  />

                  {/* File grid */}
                  <DriveGrid
                    files={filteredFiles}
                    selectedIds={selectedIds}
                    onSelect={toggleSelection}
                    onPreview={setPreviewFile}
                    emptyMessage={
                      searchQuery
                        ? 'No images match your search'
                        : 'No images in this folder'
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right side - preview panel */}
          {previewFile && (
            <div className="relative w-80 shrink-0 border-l border-border lg:w-96">
              <DrivePreviewPanel
                file={previewFile}
                isSelected={selectedIds.has(previewFile.id)}
                onSelect={() => toggleSelection(previewFile.id)}
                onClose={clearPreview}
                onPrevious={onPrevious}
                onNext={onNext}
                inline
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="text-sm text-muted-foreground">
            {selectionCount > 0
              ? `${selectionCount} photo${selectionCount !== 1 ? 's' : ''} selected`
              : 'No photos selected'}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={selectionCount === 0}>
              Use Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
