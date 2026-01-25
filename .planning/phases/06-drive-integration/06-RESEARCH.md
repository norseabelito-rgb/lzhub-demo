# Phase 6: Drive Integration - Research

**Researched:** 2026-01-23
**Domain:** File picker UI, image grid with selection, mock data for Google Drive
**Confidence:** HIGH

## Summary

This phase implements a Google Drive file picker UI prototype with mock data. The research focused on four key areas: (1) UI component patterns for file picker modals with shadcn/ui, (2) image grid layouts with multi-select capabilities, (3) side panel preview patterns, and (4) mock data structures that mirror Google Drive API responses for future integration.

The project already has Zustand stores with TypeScript patterns, shadcn/ui Dialog component, and date-fns installed. The standard approach is to build a `Dialog`-based picker modal with a `Sheet` for the preview panel, using the existing project patterns for stores and types. Mock images will use Lorem Picsum with seed values for consistency.

**Primary recommendation:** Build a full-width Dialog-based picker with tabs for "Recent" vs "Browse Drive", using existing Zustand patterns for drive state management, and mock data that matches Google Drive API structure for seamless future integration.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-dialog | ^1.1.15 | Modal/picker foundation | Already in project, shadcn/ui basis |
| zustand | ^5.0.10 | Picker state management | Already in project, proven patterns |
| date-fns | ^4.1.0 | Date grouping for "Recent" view | Already in project |
| lucide-react | ^0.562.0 | Icons (folder, image, search) | Already in project |

### To Add
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-scroll-area | latest | Scrollable image grid container | Needed for overflow handling in picker |
| (none) | - | Sheet component for preview panel | Can build with Dialog + positioning |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dialog for picker | Sheet | Dialog centers content, Sheet slides from edge - Dialog better for focused selection task |
| Custom side panel | Sheet component | Custom positioning gives more control, Sheet adds dependency |
| CSS Grid for images | Masonry library | CSS Grid sufficient for uniform thumbnails, masonry adds complexity |

**No additional installation needed.** Existing dependencies cover all requirements. Sheet can be added via shadcn CLI if preferred for preview panel:

```bash
npx shadcn@latest add sheet scroll-area skeleton breadcrumb
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── drive/
│       ├── types.ts           # DriveFile, DriveFolder, DriveState types
│       ├── drive-store.ts     # Zustand store for picker state
│       └── mock-data.ts       # Mock Drive files and folders
├── components/
│   └── drive/
│       ├── drive-picker.tsx         # Main Dialog wrapper
│       ├── drive-picker-tabs.tsx    # Recent | Browse Drive tabs
│       ├── drive-breadcrumb.tsx     # Folder navigation breadcrumb
│       ├── drive-grid.tsx           # Image/file grid with selection
│       ├── drive-grid-item.tsx      # Individual thumbnail with checkbox
│       ├── drive-preview-panel.tsx  # Side panel for image preview
│       ├── drive-search.tsx         # Search input component
│       └── drive-recent-view.tsx    # Grouped by day view
```

### Pattern 1: Picker Dialog with Controlled State
**What:** Dialog that manages open/close state via Zustand, receives selection callback
**When to use:** Opening picker from various contexts (post composer, profile settings)
**Example:**
```typescript
// Source: Existing auth-store pattern + shadcn Dialog docs
interface DrivePickerProps {
  mode: 'single' | 'multi'
  onSelect: (files: DriveFile[]) => void
  onCancel: () => void
}

export function DrivePicker({ mode, onSelect, onCancel }: DrivePickerProps) {
  const { isOpen, close, selectedFiles } = useDriveStore()

  const handleConfirm = () => {
    onSelect(selectedFiles)
    close()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        {/* Picker content */}
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 2: Selection State with Set for Performance
**What:** Use Set internally for O(1) lookups, convert to Array only when needed
**When to use:** Multi-select with potentially hundreds of items
**Example:**
```typescript
// Source: AG Grid multi-select patterns, MUI X Data Grid
interface DriveSelectionState {
  selectedIds: Set<string>
  selectionMode: 'single' | 'multi'
}

interface DriveSelectionActions {
  toggleSelection: (fileId: string) => void
  selectAll: (fileIds: string[]) => void
  clearSelection: () => void
  getSelectedFiles: () => DriveFile[]
}
```

### Pattern 3: Date Grouping for Recent View
**What:** Group files by relative date labels ("Today", "Yesterday", "Jan 20")
**When to use:** Recent photos view with 30-day window
**Example:**
```typescript
// Source: date-fns isToday, isYesterday, format
import { isToday, isYesterday, format, subDays, isAfter } from 'date-fns'

function getDateGroupLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d')  // "Jan 20"
}

function groupByDate(files: DriveFile[]): Map<string, DriveFile[]> {
  const thirtyDaysAgo = subDays(new Date(), 30)
  const recentFiles = files.filter(f => isAfter(new Date(f.createdTime), thirtyDaysAgo))

  return recentFiles.reduce((groups, file) => {
    const label = getDateGroupLabel(new Date(file.createdTime))
    const group = groups.get(label) || []
    group.push(file)
    groups.set(label, group)
    return groups
  }, new Map<string, DriveFile[]>())
}
```

### Pattern 4: Breadcrumb Navigation State
**What:** Track folder path as array, enable click-to-navigate-up
**When to use:** Browse Drive folder navigation
**Example:**
```typescript
// Source: shadcn Breadcrumb docs
interface FolderPath {
  id: string
  name: string
}

interface DriveNavigationState {
  currentPath: FolderPath[]  // [root, folder1, folder2]
  currentFolderId: string | null
}

interface DriveNavigationActions {
  navigateToFolder: (folderId: string, folderName: string) => void
  navigateUp: () => void
  navigateToPathIndex: (index: number) => void  // Click breadcrumb
}
```

### Anti-Patterns to Avoid
- **Prop drilling picker state:** Use Zustand store instead of passing state through many components
- **Array.includes for selection checks:** Use Set.has() for O(1) lookups
- **Loading all images eagerly:** Use native lazy loading via `loading="lazy"` on img tags
- **Storing full file objects in selection:** Store IDs only, resolve to files when needed

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal focus trapping | Custom focus management | Radix Dialog (built-in) | Edge cases with nested focusables |
| Image lazy loading | Intersection Observer | `loading="lazy"` attribute | Native browser support, simpler |
| Date relative formatting | Custom date logic | date-fns isToday/isYesterday | Handles edge cases, i18n-ready |
| Keyboard navigation in grid | Manual keydown handlers | Radix roving tabindex patterns | Arrow key navigation is complex |
| Scroll overflow in grid | Custom scroll | Radix ScrollArea | Consistent cross-browser styling |

**Key insight:** The picker UI has many accessibility requirements (focus trapping, keyboard nav, screen reader announcements) that Radix primitives handle automatically. Don't rebuild these.

## Common Pitfalls

### Pitfall 1: Selection Checkbox Z-Index Issues
**What goes wrong:** Checkbox overlay gets hidden behind image on hover states
**Why it happens:** Image hover effects (scale, shadow) create new stacking contexts
**How to avoid:** Keep checkbox in separate positioned container with explicit z-index higher than any image effects
**Warning signs:** Checkboxes "disappear" when hovering images

### Pitfall 2: Preview Panel State Sync
**What goes wrong:** Preview shows stale data after navigating to different folder
**Why it happens:** Preview panel state not cleared on navigation
**How to avoid:** Clear previewFileId in store when currentFolderId changes
**Warning signs:** Preview shows image from different folder

### Pitfall 3: Multi-Select Memory with Large Grids
**What goes wrong:** Selection state grows unbounded, affecting performance
**Why it happens:** Never clearing selection when context changes
**How to avoid:** Clear selection on tab switch (Recent/Browse) or folder navigation
**Warning signs:** Slow renders when switching views

### Pitfall 4: Mock Data URL Caching
**What goes wrong:** Lorem Picsum images reload on every render
**Why it happens:** Random URLs without seed generate different images
**How to avoid:** Use seed parameter: `https://picsum.photos/seed/{fileId}/200/200`
**Warning signs:** Images flash/change during development

### Pitfall 5: Grid Layout Shift on Image Load
**What goes wrong:** Grid jumps as images load in
**Why it happens:** No aspect ratio container, images have no reserved space
**How to avoid:** Use aspect-ratio CSS or wrapper with padding-bottom trick
**Warning signs:** Content jumping during load

## Code Examples

Verified patterns from official sources:

### Mock Drive File Type
```typescript
// Source: Google Drive API v3 File resource structure
export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink: string
  createdTime: string  // ISO 8601
  modifiedTime: string
  parents: string[]    // Parent folder IDs
  size?: number        // bytes
  imageMediaMetadata?: {
    width: number
    height: number
  }
}

export interface DriveFolder {
  id: string
  name: string
  mimeType: 'application/vnd.google-apps.folder'
  parents: string[]
}

export type DriveItem = DriveFile | DriveFolder
```

### Mock Data Generator
```typescript
// Source: Lorem Picsum API docs
const MOCK_ROOT_ID = 'root'

function generateMockFile(index: number, folderId: string): DriveFile {
  const id = `file-${folderId}-${index}`
  const daysAgo = Math.floor(Math.random() * 30)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)

  return {
    id,
    name: `Photo ${index + 1}.jpg`,
    mimeType: 'image/jpeg',
    // Seed ensures same image for same ID
    thumbnailLink: `https://picsum.photos/seed/${id}/200/200`,
    createdTime: date.toISOString(),
    modifiedTime: date.toISOString(),
    parents: [folderId],
    size: Math.floor(Math.random() * 5000000) + 500000,
    imageMediaMetadata: {
      width: 1920,
      height: 1080,
    },
  }
}
```

### Image Grid Item with Selection
```typescript
// Source: Google Photos selection pattern, shadcn Checkbox
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface DriveGridItemProps {
  file: DriveFile
  isSelected: boolean
  onSelect: () => void
  onPreview: () => void
}

export function DriveGridItem({ file, isSelected, onSelect, onPreview }: DriveGridItemProps) {
  return (
    <div
      className="group relative aspect-square cursor-pointer rounded-lg overflow-hidden"
      onClick={onPreview}
    >
      {/* Image with lazy loading */}
      <img
        src={file.thumbnailLink}
        alt={file.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />

      {/* Selection checkbox - always visible when selected, hover otherwise */}
      <div
        className={cn(
          "absolute top-2 left-2 z-10 transition-opacity",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => { e.stopPropagation(); onSelect() }}
      >
        <Checkbox
          checked={isSelected}
          className="h-5 w-5 border-2 border-white bg-black/50 data-[state=checked]:bg-primary"
        />
      </div>

      {/* Selection highlight overlay */}
      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-primary ring-inset pointer-events-none" />
      )}
    </div>
  )
}
```

### Zustand Drive Store Pattern
```typescript
// Source: Project auth-store.ts pattern, Zustand docs
import { create } from 'zustand'
import type { DriveState, DriveActions, DriveFile } from './types'
import { getMockFiles, getMockFolders } from './mock-data'

type DriveStore = DriveState & DriveActions

export const useDriveStore = create<DriveStore>()((set, get) => ({
  // State
  isOpen: false,
  currentTab: 'recent',
  currentFolderId: null,
  folderPath: [],
  selectedIds: new Set<string>(),
  selectionMode: 'single',
  previewFileId: null,
  searchQuery: '',
  isLoading: false,

  // Actions
  open: (mode: 'single' | 'multi') => set({
    isOpen: true,
    selectionMode: mode,
    selectedIds: new Set(),
    currentTab: 'recent',
  }),

  close: () => set({
    isOpen: false,
    previewFileId: null,
    searchQuery: '',
  }),

  setTab: (tab) => set({
    currentTab: tab,
    selectedIds: new Set(),  // Clear selection on tab change
    previewFileId: null,
  }),

  navigateToFolder: (folderId, folderName) => {
    const { folderPath } = get()
    set({
      currentFolderId: folderId,
      folderPath: [...folderPath, { id: folderId, name: folderName }],
      selectedIds: new Set(),
      previewFileId: null,
    })
  },

  navigateUp: () => {
    const { folderPath } = get()
    if (folderPath.length === 0) return
    const newPath = folderPath.slice(0, -1)
    set({
      currentFolderId: newPath.length > 0 ? newPath[newPath.length - 1].id : null,
      folderPath: newPath,
      previewFileId: null,
    })
  },

  toggleSelection: (fileId) => {
    const { selectedIds, selectionMode } = get()
    const newSelected = new Set(selectedIds)

    if (selectionMode === 'single') {
      newSelected.clear()
      newSelected.add(fileId)
    } else {
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId)
      } else {
        newSelected.add(fileId)
      }
    }

    set({ selectedIds: newSelected })
  },

  clearSelection: () => set({ selectedIds: new Set() }),

  setPreviewFile: (fileId) => set({ previewFileId: fileId }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  getSelectedFiles: () => {
    const { selectedIds } = get()
    const allFiles = getMockFiles()  // Would be from actual data source
    return allFiles.filter(f => selectedIds.has(f.id))
  },
}))
```

### Skeleton Grid for Loading State
```typescript
// Source: shadcn Skeleton docs
import { Skeleton } from '@/components/ui/skeleton'

export function DriveGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Scroll event listeners for lazy load | Intersection Observer / native `loading="lazy"` | 2020+ | Better performance, less code |
| Array.filter for selections | Set-based selection state | Always preferred | O(1) lookup vs O(n) |
| Custom modal focus trap | Radix Dialog primitives | shadcn adoption | Accessibility handled automatically |
| CSS float grids | CSS Grid / Flexbox | 2018+ | Cleaner layout, better responsive |

**Deprecated/outdated:**
- Manual IntersectionObserver for images: Native `loading="lazy"` is now sufficient for most cases
- Redux for UI state: Zustand is lighter weight for component-local global state

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal grid density for different screen sizes**
   - What we know: Google Drive web uses ~6 columns on desktop, ~3 on mobile
   - What's unclear: Exact breakpoints and thumbnail sizes for this specific design
   - Recommendation: Start with responsive grid (3-4-5-6 columns), iterate based on feedback

2. **Preview panel width ratio**
   - What we know: Google Drive uses ~40% width for preview
   - What's unclear: Best ratio for this app's content
   - Recommendation: Use 60/40 split (grid/preview), make panel dismissible

3. **Mock folder structure depth**
   - What we know: Need folders for realistic breadcrumb testing
   - What's unclear: How deep the mock hierarchy should go
   - Recommendation: 2-3 levels deep is sufficient for prototype

## Sources

### Primary (HIGH confidence)
- Google Drive API v3 File resource - https://developers.google.com/workspace/drive/api/reference/rest/v2/files
- shadcn/ui Dialog - https://ui.shadcn.com/docs/components/dialog
- shadcn/ui Breadcrumb - https://ui.shadcn.com/docs/components/breadcrumb
- Zustand GitHub README - https://github.com/pmndrs/zustand
- Lorem Picsum API - https://picsum.photos/

### Secondary (MEDIUM confidence)
- shadcn/ui Skeleton docs - https://ui.shadcn.com/docs/components/skeleton
- date-fns documentation (already in project)
- AG Grid multi-select patterns - https://www.ag-grid.com/react-data-grid/row-selection-multi-row/
- MUI X Data Grid selection - https://mui.com/x/react-data-grid/row-selection/

### Tertiary (LOW confidence)
- Zustand modal management gist - https://gist.github.com/lmnnarciso/9cd3929171887aca97e7b10373bf2c9c
- Various blog posts on image grid patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing project dependencies, verified APIs
- Architecture: HIGH - Follows established project patterns (auth-store, types separation)
- Pitfalls: MEDIUM - Based on common React patterns, some specific to this implementation
- Mock data structure: HIGH - Directly from Google Drive API docs

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable libraries, no breaking changes expected)
