/**
 * Mock data for Google Drive integration
 * Simulates Google Drive content with Lorem Picsum images
 */

import { subDays, subHours, subMinutes } from 'date-fns'
import type { DriveFile, DriveFolder } from './types'

// ============================================================================
// Constants
// ============================================================================

/** Root folder ID (Google Drive uses 'root' for My Drive) */
export const MOCK_ROOT_ID = 'root'

// ============================================================================
// Mock Folder Structure
// ============================================================================

/**
 * Mock folders simulating Google Drive folder structure
 * Organized in a hierarchy for realistic breadcrumb testing
 */
export const MOCK_FOLDERS: DriveFolder[] = [
  // Root level folders
  {
    id: 'folder-event-photos',
    name: 'Event Photos',
    mimeType: 'application/vnd.google-apps.folder',
    parents: [MOCK_ROOT_ID],
  },
  {
    id: 'folder-marketing',
    name: 'Marketing Assets',
    mimeType: 'application/vnd.google-apps.folder',
    parents: [MOCK_ROOT_ID],
  },
  {
    id: 'folder-team',
    name: 'Team Photos',
    mimeType: 'application/vnd.google-apps.folder',
    parents: [MOCK_ROOT_ID],
  },
  {
    id: 'folder-misc',
    name: 'Miscellaneous',
    mimeType: 'application/vnd.google-apps.folder',
    parents: [MOCK_ROOT_ID],
  },
  // Subfolders - Event Photos
  {
    id: 'folder-event-birthday',
    name: 'Birthday Parties',
    mimeType: 'application/vnd.google-apps.folder',
    parents: ['folder-event-photos'],
  },
  {
    id: 'folder-event-corporate',
    name: 'Corporate Events',
    mimeType: 'application/vnd.google-apps.folder',
    parents: ['folder-event-photos'],
  },
  // Subfolders - Marketing
  {
    id: 'folder-marketing-social',
    name: 'Social Media',
    mimeType: 'application/vnd.google-apps.folder',
    parents: ['folder-marketing'],
  },
  {
    id: 'folder-marketing-print',
    name: 'Print Materials',
    mimeType: 'application/vnd.google-apps.folder',
    parents: ['folder-marketing'],
  },
  // Subfolders - Team
  {
    id: 'folder-team-headshots',
    name: 'Headshots',
    mimeType: 'application/vnd.google-apps.folder',
    parents: ['folder-team'],
  },
  // Subfolders - Misc
  {
    id: 'folder-misc-archive',
    name: 'Archive',
    mimeType: 'application/vnd.google-apps.folder',
    parents: ['folder-misc'],
  },
]

// ============================================================================
// Mock File Generation
// ============================================================================

/**
 * Generate a mock file with consistent seeded image from Lorem Picsum
 */
function generateMockFile(index: number, folderId: string, recentDays?: number): DriveFile {
  const id = `file-${folderId}-${index}`
  const seed = `${folderId}-${index}` // Consistent seed for Lorem Picsum

  // Generate dates - some recent, some older
  const daysAgo = recentDays !== undefined ? recentDays : Math.floor(Math.random() * 30)
  const hoursAgo = Math.floor(Math.random() * 24)
  const minutesAgo = Math.floor(Math.random() * 60)

  const createdDate = subMinutes(subHours(subDays(new Date(), daysAgo), hoursAgo), minutesAgo)
  const modifiedDate = subMinutes(createdDate, Math.floor(Math.random() * 60)) // Modified within hour of creation

  // File names that make sense for a laser tag venue
  const fileNames = [
    'action_shot',
    'team_celebration',
    'arena_lights',
    'player_portrait',
    'group_photo',
    'victory_pose',
    'equipment_check',
    'lobby_shot',
    'neon_ambiance',
    'game_moment',
    'high_score',
    'arena_overview',
    'party_group',
    'laser_beam',
    'scoreboard',
  ]

  const fileName = `${fileNames[index % fileNames.length]}_${index + 1}.jpg`

  // Random file sizes between 500KB and 5MB
  const size = Math.floor(Math.random() * 4500000) + 500000

  // Random image dimensions (common photo sizes)
  const dimensions = [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
    { width: 2048, height: 1536 },
    { width: 3840, height: 2160 },
    { width: 1600, height: 1200 },
  ]
  const dim = dimensions[index % dimensions.length]

  return {
    id,
    name: fileName,
    mimeType: 'image/jpeg',
    thumbnailLink: `https://picsum.photos/seed/${seed}/200/200`,
    createdTime: createdDate.toISOString(),
    modifiedTime: modifiedDate.toISOString(),
    parents: [folderId],
    size,
    imageMediaMetadata: {
      width: dim.width,
      height: dim.height,
    },
  }
}

/**
 * Generate multiple mock files for a folder
 */
function generateFilesForFolder(folderId: string, count: number): DriveFile[] {
  const files: DriveFile[] = []

  for (let i = 0; i < count; i++) {
    // Make ~30% of files "recent" (last 3 days) for testing Recent view
    const recentDays = i % 3 === 0 ? Math.floor(Math.random() * 3) : undefined
    files.push(generateMockFile(i, folderId, recentDays))
  }

  return files
}

// ============================================================================
// Pre-generated Mock Files
// ============================================================================

/**
 * All mock files across all folders
 * Total: 82 files (8-15 per folder)
 */
export const MOCK_FILES: DriveFile[] = [
  // Root folder - some loose files
  ...generateFilesForFolder(MOCK_ROOT_ID, 8),
  // Event Photos subfolders
  ...generateFilesForFolder('folder-event-photos', 10),
  ...generateFilesForFolder('folder-event-birthday', 12),
  ...generateFilesForFolder('folder-event-corporate', 10),
  // Marketing subfolders
  ...generateFilesForFolder('folder-marketing', 8),
  ...generateFilesForFolder('folder-marketing-social', 10),
  ...generateFilesForFolder('folder-marketing-print', 8),
  // Team subfolders
  ...generateFilesForFolder('folder-team', 6),
  ...generateFilesForFolder('folder-team-headshots', 5),
  // Misc subfolders
  ...generateFilesForFolder('folder-misc', 5),
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get files in a specific folder
 * @param folderId - Folder ID (null for root)
 */
export function getMockFilesInFolder(folderId: string | null): DriveFile[] {
  const targetId = folderId ?? MOCK_ROOT_ID
  return MOCK_FILES.filter((file) => file.parents.includes(targetId))
}

/**
 * Get subfolders in a specific folder
 * @param folderId - Folder ID (null for root)
 */
export function getMockFoldersInFolder(folderId: string | null): DriveFolder[] {
  const targetId = folderId ?? MOCK_ROOT_ID
  return MOCK_FOLDERS.filter((folder) => folder.parents.includes(targetId))
}

/**
 * Get recent files (last 30 days), sorted by modification date descending
 * Used for the "Recent" tab in the picker
 */
export function getMockRecentFiles(): DriveFile[] {
  const thirtyDaysAgo = subDays(new Date(), 30)

  return MOCK_FILES.filter((file) => new Date(file.modifiedTime) >= thirtyDaysAgo).sort(
    (a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
  )
}

/**
 * Get a file by its ID
 * @param id - File ID
 */
export function getMockFileById(id: string): DriveFile | undefined {
  return MOCK_FILES.find((file) => file.id === id)
}

/**
 * Get a folder by its ID
 * @param id - Folder ID
 */
export function getMockFolderById(id: string): DriveFolder | undefined {
  return MOCK_FOLDERS.find((folder) => folder.id === id)
}

/**
 * Search files by name (case-insensitive)
 * @param query - Search query
 */
export function searchMockFiles(query: string): DriveFile[] {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase()
  return MOCK_FILES.filter((file) => file.name.toLowerCase().includes(lowerQuery))
}
