# Phase 6: Drive Integration - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse Google Drive and select photos for use in social media posts. This phase delivers OAuth connection (simulated for prototype), folder browsing, image preview, and selection. Actual Google API integration comes later — this phase builds the UI with mock Drive data.

</domain>

<decisions>
## Implementation Decisions

### Folder Navigation
- Breadcrumb + grid layout (like Google Drive web)
- Full Drive access — user sees all folders they have access to
- Default sort: most recent first
- Search bar included — search by filename within current folder or entire Drive

### Selection Behavior
- Context-dependent selection: single-select for profile pics, multi-select for carousel posts
- Confirm button to finalize selection ("Use Selected")
- After confirm: picker closes, returns selected images to calling context
- Checkbox overlay in corner of selected images (like Google Photos)

### Preview Experience
- Side panel slides in from right showing larger image
- Basic metadata displayed: filename, dimensions, file size, date added
- Navigation: visible arrows + keyboard arrow keys to browse between images
- Select button in preview panel to add image without closing preview

### Recent Photos
- "Recent" = photos added in last 30 days
- Quick access tabs at top: "Recent" | "Browse Drive" — Recent is default view
- Shows all images from anywhere in Drive (not folder-restricted)
- Grouped by day: "Today", "Yesterday", "Jan 20" headers

### Claude's Discretion
- Exact grid density and thumbnail sizes
- Loading states and skeleton placeholders
- Error handling for failed image loads
- Mock data structure and sample images

</decisions>

<specifics>
## Specific Ideas

- Recent as default view — users mostly want photos they just took/uploaded
- Google Drive web as reference for breadcrumb navigation feel
- Checkbox overlay matches Google Photos selection pattern users already know

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-drive-integration*
*Context gathered: 2026-01-23*
