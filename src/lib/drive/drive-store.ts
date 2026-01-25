/**
 * Google Drive picker store for LaserZone Hub
 * Manages picker state with Set-based selection for O(1) lookups
 *
 * Note: No persist middleware - picker state is session-only
 */

import { create } from 'zustand'
import type { DriveFile, DriveState, DriveActions, DriveStore, SelectionMode, DriveTab, FolderPath } from './types'
import { getMockFileById } from './mock-data'

// ============================================================================
// Initial State
// ============================================================================

const initialState: DriveState = {
  isOpen: false,
  isConnected: false,
  currentTab: 'recent',
  currentFolderId: null,
  folderPath: [],
  selectedIds: new Set<string>(),
  selectionMode: 'single',
  previewFileId: null,
  searchQuery: '',
  isLoading: false,
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useDriveStore = create<DriveStore>()((set, get) => ({
  // Initial state spread
  ...initialState,

  // ========== Modal Control ==========

  open: (mode: SelectionMode = 'single') => {
    set({
      isOpen: true,
      selectionMode: mode,
      selectedIds: new Set<string>(),
      currentTab: 'recent',
      previewFileId: null,
      searchQuery: '',
    })
  },

  close: () => {
    set({
      isOpen: false,
      previewFileId: null,
      searchQuery: '',
      // Keep isConnected state - user stays connected
    })
  },

  // ========== Tab Navigation ==========

  setTab: (tab: DriveTab) => {
    set({
      currentTab: tab,
      // Clear selection and preview when switching tabs
      selectedIds: new Set<string>(),
      previewFileId: null,
    })
  },

  // ========== Folder Navigation ==========

  navigateToFolder: (folderId: string, folderName: string) => {
    set((state) => {
      const newPathItem: FolderPath = { id: folderId, name: folderName }
      return {
        currentFolderId: folderId,
        folderPath: [...state.folderPath, newPathItem],
        // Clear selection and preview when navigating
        selectedIds: new Set<string>(),
        previewFileId: null,
      }
    })
  },

  navigateUp: () => {
    set((state) => {
      if (state.folderPath.length === 0) return state

      const newPath = state.folderPath.slice(0, -1)
      const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null

      return {
        folderPath: newPath,
        currentFolderId: newFolderId,
        selectedIds: new Set<string>(),
        previewFileId: null,
      }
    })
  },

  navigateToPathIndex: (index: number) => {
    set((state) => {
      // If index is -1, go to root
      if (index < 0) {
        return {
          folderPath: [],
          currentFolderId: null,
          selectedIds: new Set<string>(),
          previewFileId: null,
        }
      }

      // Slice path to include up to and including index
      const newPath = state.folderPath.slice(0, index + 1)
      const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null

      return {
        folderPath: newPath,
        currentFolderId: newFolderId,
        selectedIds: new Set<string>(),
        previewFileId: null,
      }
    })
  },

  // ========== Selection Management ==========

  toggleSelection: (fileId: string) => {
    set((state) => {
      const { selectionMode, selectedIds } = state

      if (selectionMode === 'single') {
        // Single mode: clear and add new (or toggle off if same)
        if (selectedIds.has(fileId)) {
          return { selectedIds: new Set<string>() }
        }
        return { selectedIds: new Set<string>([fileId]) }
      }

      // Multi mode: toggle membership
      const newSelectedIds = new Set(selectedIds)
      if (newSelectedIds.has(fileId)) {
        newSelectedIds.delete(fileId)
      } else {
        newSelectedIds.add(fileId)
      }

      // IMPORTANT: Create new Set to trigger React updates
      return { selectedIds: newSelectedIds }
    })
  },

  selectAll: (fileIds: string[]) => {
    const { selectionMode } = get()

    // Only works in multi mode
    if (selectionMode !== 'multi') return

    set({ selectedIds: new Set<string>(fileIds) })
  },

  clearSelection: () => {
    set({ selectedIds: new Set<string>() })
  },

  getSelectedFiles: (): DriveFile[] => {
    const { selectedIds } = get()
    const files: DriveFile[] = []

    selectedIds.forEach((id) => {
      const file = getMockFileById(id)
      if (file) {
        files.push(file)
      }
    })

    return files
  },

  // ========== Preview ==========

  setPreviewFile: (fileId: string) => {
    set({ previewFileId: fileId })
  },

  clearPreview: () => {
    set({ previewFileId: null })
  },

  // ========== Search ==========

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  // ========== OAuth Simulation ==========

  connect: () => {
    // Instant connection for prototype
    // In production, this would trigger OAuth flow
    set({ isConnected: true })
  },

  disconnect: () => {
    set({
      isConnected: false,
      isOpen: false,
      // Reset all state on disconnect
      currentTab: 'recent',
      currentFolderId: null,
      folderPath: [],
      selectedIds: new Set<string>(),
      previewFileId: null,
      searchQuery: '',
    })
  },
}))

// ============================================================================
// Selector Hooks (for optimized re-renders)
// ============================================================================

/**
 * Check if a specific file is selected
 */
export function useIsFileSelected(fileId: string): boolean {
  return useDriveStore((state) => state.selectedIds.has(fileId))
}

/**
 * Get selection count
 */
export function useSelectionCount(): number {
  return useDriveStore((state) => state.selectedIds.size)
}
