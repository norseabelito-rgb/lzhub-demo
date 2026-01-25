'use client'

import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'
import {
  AlertTriangle,
  Clock,
  Users,
  Plus,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { DisciplineLevel } from '@/lib/warnings'
import {
  useWarningStore,
  DISCIPLINE_LEVEL_LABELS,
  DISCIPLINE_LEVELS,
} from '@/lib/warnings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponsiveTable, type Column } from '@/components/ui/responsive-table'

// ============================================================================
// Types
// ============================================================================

export interface WarningsDashboardProps {
  onSelectEmployee: (employeeId: string) => void
  onCreateWarning: () => void
}

interface EmployeeWarningStats {
  employeeId: string
  employeeName: string
  currentLevel: DisciplineLevel | null
  totalWarnings: number
  activeWarnings: number
  lastWarningDate: Date | null
  pendingCount: number
  isPendingTermination: boolean
}

// Row type for ResponsiveTable (requires id field)
interface EmployeeWarningRow extends EmployeeWarningStats {
  id: string
}

type SortField = 'currentLevel' | 'employeeName' | 'lastWarningDate' | 'pendingCount'
type SortDirection = 'asc' | 'desc'
type FilterTab = 'active' | 'pending' | 'all'

// ============================================================================
// Constants
// ============================================================================

const LEVEL_BADGE_COLORS: Record<DisciplineLevel | 'none', string> = {
  none: 'bg-muted text-muted-foreground',
  verbal: 'bg-accent/20 text-accent border-accent/30',
  written: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  final: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  termination: 'bg-destructive/20 text-destructive border-destructive/30',
}

// ============================================================================
// Helper Functions
// ============================================================================

function getLevelIndex(level: DisciplineLevel | null): number {
  if (!level) return -1
  return DISCIPLINE_LEVELS.indexOf(level)
}

interface WarningLike {
  level: DisciplineLevel
  isCleared: boolean
}

function getHighestActiveLevel(warnings: WarningLike[]): DisciplineLevel | null {
  const activeWarnings = warnings.filter(w => !w.isCleared)
  if (activeWarnings.length === 0) return null

  let highestIndex = -1
  let highestLevel: DisciplineLevel | null = null

  for (const warning of activeWarnings) {
    const index = getLevelIndex(warning.level)
    if (index > highestIndex) {
      highestIndex = index
      highestLevel = warning.level
    }
  }

  return highestLevel
}

// ============================================================================
// Main Component
// ============================================================================

export function WarningsDashboard({
  onSelectEmployee,
  onCreateWarning,
}: WarningsDashboardProps) {
  const { warnings } = useWarningStore()

  const [activeTab, setActiveTab] = useState<FilterTab>('active')
  const [sortField, setSortField] = useState<SortField>('currentLevel')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Group warnings by employee and calculate stats
  const employeeStats = useMemo(() => {
    const statsMap = new Map<string, EmployeeWarningStats>()

    for (const warning of warnings) {
      const existing = statsMap.get(warning.employeeId)

      if (existing) {
        existing.totalWarnings++
        if (!warning.isCleared) {
          existing.activeWarnings++
        }
        if (warning.status === 'pending_acknowledgment') {
          existing.pendingCount++
        }
        if (!existing.lastWarningDate || new Date(warning.createdAt) > existing.lastWarningDate) {
          existing.lastWarningDate = new Date(warning.createdAt)
        }
      } else {
        statsMap.set(warning.employeeId, {
          employeeId: warning.employeeId,
          employeeName: warning.employeeName,
          currentLevel: null, // will be calculated
          totalWarnings: 1,
          activeWarnings: warning.isCleared ? 0 : 1,
          lastWarningDate: new Date(warning.createdAt),
          pendingCount: warning.status === 'pending_acknowledgment' ? 1 : 0,
          isPendingTermination: false,
        })
      }
    }

    // Calculate current level for each employee
    for (const [employeeId, stats] of statsMap) {
      const employeeWarnings = warnings.filter(w => w.employeeId === employeeId)
      stats.currentLevel = getHighestActiveLevel(employeeWarnings)
      stats.isPendingTermination = stats.currentLevel === 'termination' && stats.pendingCount > 0
    }

    return Array.from(statsMap.values())
  }, [warnings])

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const total = warnings.length
    const pending = warnings.filter(w => w.status === 'pending_acknowledgment').length
    const terminationPending = employeeStats.filter(e => e.isPendingTermination).length

    return { total, pending, terminationPending }
  }, [warnings, employeeStats])

  // Filter based on active tab
  const filteredStats = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return employeeStats.filter(e => e.activeWarnings > 0)
      case 'pending':
        return employeeStats.filter(e => e.pendingCount > 0)
      case 'all':
      default:
        return employeeStats
    }
  }, [employeeStats, activeTab])

  // Sort the filtered results
  const sortedStats = useMemo(() => {
    const sorted = [...filteredStats]

    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'currentLevel':
          comparison = getLevelIndex(b.currentLevel) - getLevelIndex(a.currentLevel)
          break
        case 'employeeName':
          comparison = a.employeeName.localeCompare(b.employeeName)
          break
        case 'lastWarningDate':
          const dateA = a.lastWarningDate?.getTime() ?? 0
          const dateB = b.lastWarningDate?.getTime() ?? 0
          comparison = dateB - dateA
          break
        case 'pendingCount':
          comparison = b.pendingCount - a.pendingCount
          break
      }

      return sortDirection === 'asc' ? -comparison : comparison
    })

    return sorted
  }, [filteredStats, sortField, sortDirection])

  // Transform stats to include id field for ResponsiveTable
  const tableData: EmployeeWarningRow[] = useMemo(() => {
    return sortedStats.map(stat => ({
      id: stat.employeeId,
      ...stat,
    }))
  }, [sortedStats])

  // Column definitions for ResponsiveTable
  const columns: Column<EmployeeWarningRow>[] = useMemo(() => [
    {
      key: 'employeeName',
      label: 'Angajat',
      isTitle: true,
      sortable: true,
      render: (value) => <span className="font-medium">{String(value)}</span>,
    },
    {
      key: 'currentLevel',
      label: 'Nivel curent',
      sortable: true,
      render: (_, item) => (
        <Badge
          variant="outline"
          className={LEVEL_BADGE_COLORS[item.currentLevel || 'none']}
        >
          {item.currentLevel
            ? DISCIPLINE_LEVEL_LABELS[item.currentLevel]
            : 'Niciunul'}
        </Badge>
      ),
    },
    {
      key: 'activeWarnings',
      label: 'Avertismente active',
      cellClassName: 'text-center',
      render: (value) => <span className="text-center">{String(value)}</span>,
    },
    {
      key: 'lastWarningDate',
      label: 'Ultimul avertisment',
      sortable: true,
      render: (value) => value ? (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(value as Date, { addSuffix: true, locale: ro })}
        </span>
      ) : <span className="text-sm text-muted-foreground">-</span>,
    },
    {
      key: 'pendingCount',
      label: 'Status',
      sortable: true,
      render: (_, item) => (
        <div className="flex flex-wrap gap-1">
          {item.pendingCount > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
              {item.pendingCount} in asteptare
            </Badge>
          )}
          {item.isPendingTermination && (
            <Badge variant="destructive">Terminare</Badge>
          )}
          {item.pendingCount === 0 && !item.isPendingTermination && (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ], [])

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

  // Get empty message based on tab
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'active':
        return 'Niciun angajat cu avertismente active'
      case 'pending':
        return 'Niciun avertisment in asteptare'
      case 'all':
      default:
        return 'Niciun avertisment inregistrat'
    }
  }

  // Custom empty state with icon
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-success/10 p-4">
        <Users className="h-8 w-8 text-success" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">
        {getEmptyMessage()}
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avertismente</h1>
          <p className="text-sm text-muted-foreground">
            Gestioneaza disciplina echipei
          </p>
        </div>
        <Button onClick={onCreateWarning}>
          <Plus className="h-4 w-4 mr-2" />
          Avertisment Nou
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/10 p-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.total}</p>
                <p className="text-sm text-muted-foreground">Total avertismente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-500/10 p-2">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.pending}</p>
                <p className="text-sm text-muted-foreground">Asteptand confirmare</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          overallStats.terminationPending > 0 && 'border-destructive/50 bg-destructive/5'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.terminationPending}</p>
                <p className="text-sm text-muted-foreground">Terminare in asteptare</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="active">
            Active ({employeeStats.filter(e => e.activeWarnings > 0).length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            In asteptare ({employeeStats.filter(e => e.pendingCount > 0).length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Toate ({employeeStats.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Employees table with ResponsiveTable */}
      <ResponsiveTable
        data={tableData}
        columns={columns}
        onRowClick={(item) => onSelectEmployee(item.employeeId)}
        rowClassName={(item) =>
          item.isPendingTermination ? 'bg-destructive/5 hover:bg-destructive/10' : ''
        }
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        renderEmpty={renderEmpty}
      />
    </div>
  )
}
