'use client'

import { useState, useMemo } from 'react'
import { format, startOfDay, endOfDay } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Filter, User, FileText, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ResponsiveTable, type Column } from '@/components/ui/responsive-table'
import type { AuditEntry, AuditAction, AuditEntityType } from '@/lib/checklist'

// ============================================================================
// Types
// ============================================================================

interface AuditLogViewerProps {
  entries: AuditEntry[]
  showFilters?: boolean
  maxEntries?: number
}

interface Filters {
  dateFrom: string
  dateTo: string
  action: AuditAction | 'all'
  entityType: AuditEntityType | 'all'
  userId: string
}

type SortField = 'timestamp' | 'userName'
type SortDirection = 'asc' | 'desc'

// Row type for ResponsiveTable (requires id field)
interface AuditLogRow {
  id: string
  timestamp: string | Date
  userName: string
  userId: string
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  details: Record<string, unknown>
  wasWithinTimeWindow: boolean
  formattedDetails: string
}

// ============================================================================
// Action Badge Configuration
// ============================================================================

const ACTION_BADGES: Record<AuditAction, { label: string; className: string }> = {
  template_created: {
    label: 'Template creat',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  template_updated: {
    label: 'Template actualizat',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  template_deleted: {
    label: 'Template sters',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  instance_created: {
    label: 'Instanta creata',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  instance_assigned: {
    label: 'Instanta asignata',
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  item_checked: {
    label: 'Element bifat',
    className: 'bg-success/20 text-success border-success/30',
  },
  item_unchecked: {
    label: 'Element debifat',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  instance_completed: {
    label: 'Checklist completat',
    className: 'bg-success/20 text-success border-success/30',
  },
  instance_overdue: {
    label: 'Checklist depasit',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
}

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  template: 'Template',
  instance: 'Instanta',
  item: 'Element',
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDetails(entry: AuditEntry): string {
  const details = entry.details as Record<string, unknown>

  switch (entry.action) {
    case 'template_created':
    case 'template_updated':
    case 'template_deleted':
      return details.templateName as string || ENTITY_LABELS[entry.entityType]

    case 'instance_created':
    case 'instance_completed':
      return `${details.templateName || 'Checklist'} - ${details.assignedTo || ''}`

    case 'item_checked':
    case 'item_unchecked':
      return details.itemText as string || 'Element checklist'

    default:
      return ENTITY_LABELS[entry.entityType] || entry.entityId
  }
}

// ============================================================================
// Component
// ============================================================================

export function AuditLogViewer({
  entries,
  showFilters = true,
  maxEntries = 50,
}: AuditLogViewerProps) {
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    dateFrom: '',
    dateTo: '',
    action: 'all',
    entityType: 'all',
    userId: '',
  })
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Pagination state
  const [displayCount, setDisplayCount] = useState(maxEntries)

  // Get unique users for filter dropdown
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, string>()
    entries.forEach((e) => users.set(e.userId, e.userName))
    return Array.from(users, ([id, name]) => ({ id, name }))
  }, [entries])

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let result = [...entries]

    // Apply date range filter
    if (filters.dateFrom) {
      const fromDate = startOfDay(new Date(filters.dateFrom))
      result = result.filter((e) => new Date(e.timestamp) >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = endOfDay(new Date(filters.dateTo))
      result = result.filter((e) => new Date(e.timestamp) <= toDate)
    }

    // Apply action filter
    if (filters.action !== 'all') {
      result = result.filter((e) => e.action === filters.action)
    }

    // Apply entity type filter
    if (filters.entityType !== 'all') {
      result = result.filter((e) => e.entityType === filters.entityType)
    }

    // Apply user filter
    if (filters.userId) {
      result = result.filter((e) => e.userId === filters.userId)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } else if (sortField === 'userName') {
        comparison = a.userName.localeCompare(b.userName)
      }
      return sortDirection === 'desc' ? -comparison : comparison
    })

    return result
  }, [entries, filters, sortField, sortDirection])

  // Handle sort toggle
  const handleSort = (field: string) => {
    const typedField = field as SortField
    if (sortField === typedField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(typedField)
      setSortDirection('desc')
    }
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      action: 'all',
      entityType: 'all',
      userId: '',
    })
  }

  // Check if any filters are active
  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.action !== 'all' ||
    filters.entityType !== 'all' ||
    filters.userId

  // Paginated entries
  const displayedEntries = filteredEntries.slice(0, displayCount)
  const hasMore = filteredEntries.length > displayCount

  // Transform entries to table data with id field
  const tableData: AuditLogRow[] = useMemo(() => {
    return displayedEntries.map(entry => ({
      id: entry.id,
      timestamp: entry.timestamp,
      userName: entry.userName,
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      details: entry.details as Record<string, unknown>,
      wasWithinTimeWindow: entry.wasWithinTimeWindow,
      formattedDetails: formatDetails(entry),
    }))
  }, [displayedEntries])

  // Column definitions for ResponsiveTable
  const columns: Column<AuditLogRow>[] = useMemo(() => [
    {
      key: 'timestamp',
      label: 'Timestamp',
      isTitle: true,
      sortable: true,
      render: (value) => (
        <span className="font-medium">
          {format(new Date(value as string), "d MMM yyyy, HH:mm", { locale: ro })}
        </span>
      ),
    },
    {
      key: 'userName',
      label: 'Utilizator',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
            <User className="size-4 text-muted-foreground" />
          </div>
          <span className="text-sm">{String(value)}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Actiune',
      render: (value, item) => {
        const actionConfig = ACTION_BADGES[item.action]
        return (
          <Badge variant="outline" className={actionConfig.className}>
            {actionConfig.label}
          </Badge>
        )
      },
    },
    {
      key: 'formattedDetails',
      label: 'Detalii',
      hideOnMobile: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground max-w-[200px] truncate inline-block">
          {String(value || '-')}
        </span>
      ),
    },
    {
      key: 'wasWithinTimeWindow',
      label: 'Fereastra timp',
      render: (value, item) => (
        <Badge
          variant="outline"
          className={cn(
            item.wasWithinTimeWindow
              ? 'bg-success/20 text-success border-success/30'
              : 'bg-destructive/20 text-destructive border-destructive/30'
          )}
        >
          {item.wasWithinTimeWindow ? 'In timp' : 'In afara ferestrei'}
        </Badge>
      ),
    },
  ], [])

  // Custom empty state
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <FileText className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-medium">Nu exista inregistrari in audit log</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Actiunile vor aparea aici pe masura ce sunt efectuate
      </p>
    </div>
  )

  // If no entries at all, show empty state
  if (entries.length === 0) {
    return renderEmpty()
  }

  return (
    <div className="space-y-4">
      {/* Filter toggle and summary */}
      {showFilters && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className="mr-2 size-4" />
              Filtre
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Activ
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 size-4" />
                Reseteaza
              </Button>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'inregistrare' : 'inregistrari'}
          </span>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && showFilterPanel && (
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Date from */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">De la data</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            {/* Date to */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">Pana la data</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>

            {/* Action type */}
            <div className="space-y-2">
              <Label htmlFor="action">Tip actiune</Label>
              <select
                id="action"
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value as AuditAction | 'all' })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Toate actiunile</option>
                <option value="template_created">Template creat</option>
                <option value="template_updated">Template actualizat</option>
                <option value="template_deleted">Template sters</option>
                <option value="item_checked">Element bifat</option>
                <option value="item_unchecked">Element debifat</option>
                <option value="instance_completed">Checklist completat</option>
              </select>
            </div>

            {/* Entity type */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Tip entitate</Label>
              <select
                id="entityType"
                value={filters.entityType}
                onChange={(e) =>
                  setFilters({ ...filters, entityType: e.target.value as AuditEntityType | 'all' })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Toate entitatile</option>
                <option value="template">Template</option>
                <option value="instance">Instanta</option>
                <option value="item">Element</option>
              </select>
            </div>

            {/* User filter */}
            <div className="space-y-2">
              <Label htmlFor="userId">Utilizator</Label>
              <select
                id="userId"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Toti utilizatorii</option>
                {uniqueUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit log table with ResponsiveTable */}
      <ResponsiveTable
        data={tableData}
        columns={columns}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="Nicio activitate inregistrata"
      />

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setDisplayCount((c) => c + maxEntries)}
          >
            Incarca mai multe ({filteredEntries.length - displayCount} ramase)
          </Button>
        </div>
      )}

      {/* No results after filtering */}
      {filteredEntries.length === 0 && entries.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">
            Nu exista inregistrari care sa corespunda filtrelor
          </p>
          <Button variant="link" onClick={clearFilters}>
            Reseteaza filtrele
          </Button>
        </div>
      )}
    </div>
  )
}
