/**
 * Google Drive integration types for LaserZone Hub
 * Types match Google Drive API v3 structure for future integration
 */

// ============================================================================
// File and Folder Types (matching Google Drive API v3)
// ============================================================================

/**
 * DriveFile - Matches Google Drive API v3 File resource
 * https://developers.google.com/drive/api/v3/reference/files
 */
export interface DriveFile {
  /** Unique file identifier */
  id: string
  /** File name */
  name: string
  /** MIME type of the file */
  mimeType: string
  /** Thumbnail URL for preview */
  thumbnailLink: string
  /** ISO 8601 timestamp of creation */
  createdTime: string
  /** ISO 8601 timestamp of last modification */
  modifiedTime: string
  /** Parent folder IDs */
  parents: string[]
  /** File size in bytes (optional for folders) */
  size?: number
  /** Image metadata (for image files) */
  imageMediaMetadata?: {
    width: number
    height: number
  }
}

/**
 * DriveFolder - Google Drive folder representation
 * Folders have a specific MIME type in Google Drive
 */
export interface DriveFolder {
  /** Unique folder identifier */
  id: string
  /** Folder name */
  name: string
  /** Folder MIME type (literal) */
  mimeType: 'application/vnd.google-apps.folder'
  /** Parent folder IDs */
  parents: string[]
}

/**
 * DriveItem - Union type for files and folders
 */
export type DriveItem = DriveFile | DriveFolder

/**
 * Type guard to check if item is a folder
 */
export function isFolder(item: DriveItem): item is DriveFolder {
  return item.mimeType === 'application/vnd.google-apps.folder'
}

/**
 * Type guard to check if item is a file
 */
export function isFile(item: DriveItem): item is DriveFile {
  return item.mimeType !== 'application/vnd.google-apps.folder'
}

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * FolderPath - Breadcrumb path element
 */
export interface FolderPath {
  /** Folder ID */
  id: string
  /** Folder name for display */
  name: string
}

// ============================================================================
// Picker UI Types
// ============================================================================

/**
 * DriveTab - Available tabs in the picker
 */
export type DriveTab = 'recent' | 'browse'

/**
 * SelectionMode - Single or multi-file selection
 */
export type SelectionMode = 'single' | 'multi'

// ============================================================================
// Store State Types
// ============================================================================

/**
 * DriveState - State managed by the Drive picker store
 */
export interface DriveState {
  /** Whether the picker modal is open */
  isOpen: boolean
  /** Whether connected to Google Drive (OAuth simulation) */
  isConnected: boolean
  /** Current active tab */
  currentTab: DriveTab
  /** Current folder being viewed (null = root) */
  currentFolderId: string | null
  /** Breadcrumb path to current folder */
  folderPath: FolderPath[]
  /** Set of selected file IDs (O(1) lookups) */
  selectedIds: Set<string>
  /** Current selection mode */
  selectionMode: SelectionMode
  /** File ID currently being previewed (null = no preview) */
  previewFileId: string | null
  /** Current search query */
  searchQuery: string
  /** Loading state for async operations */
  isLoading: boolean
}

/**
 * DriveActions - Actions available on the Drive store
 */
export interface DriveActions {
  // Modal control
  /** Open the picker with specified selection mode */
  open: (mode?: SelectionMode) => void
  /** Close the picker */
  close: () => void

  // Tab navigation
  /** Switch to a different tab */
  setTab: (tab: DriveTab) => void

  // Folder navigation
  /** Navigate into a folder */
  navigateToFolder: (folderId: string, folderName: string) => void
  /** Navigate up one level */
  navigateUp: () => void
  /** Navigate to a specific index in the breadcrumb path */
  navigateToPathIndex: (index: number) => void

  // Selection management
  /** Toggle selection of a file */
  toggleSelection: (fileId: string) => void
  /** Select all provided file IDs (multi mode only) */
  selectAll: (fileIds: string[]) => void
  /** Clear all selections */
  clearSelection: () => void
  /** Get files that are currently selected */
  getSelectedFiles: () => DriveFile[]

  // Preview
  /** Set file to preview */
  setPreviewFile: (fileId: string) => void
  /** Clear the preview */
  clearPreview: () => void

  // Search
  /** Set search query */
  setSearchQuery: (query: string) => void

  // OAuth simulation
  /** Connect to Google Drive (simulated) */
  connect: () => void
  /** Disconnect from Google Drive */
  disconnect: () => void
}

/**
 * DriveStore - Complete store type (state + actions)
 */
export type DriveStore = DriveState & DriveActions
