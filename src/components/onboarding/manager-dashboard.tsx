'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOnboardingStore } from '@/lib/onboarding'
import { EmployeeStatusCard } from './employee-status-card'
import { PhysicalHandoffForm } from './physical-handoff-form'
import { Search, Users, CheckCircle, Clock, Package, Settings } from 'lucide-react'
import Link from 'next/link'

type FilterOption = 'all' | 'handoff' | 'in_progress' | 'completed'

/**
 * Manager dashboard for viewing all employee onboarding status
 * Features:
 * - Stats overview (total, waiting for handoff, completed)
 * - Search by employee name
 * - Filter by status
 * - Grid of employee status cards
 */
export function ManagerDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [handoffDialogOpen, setHandoffDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string
    name: string
  } | null>(null)

  const allProgress = useOnboardingStore((state) => state.allProgress)
  const fetchAllProgress = useOnboardingStore((state) => state.fetchAllProgress)
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding)
  const isLoading = useOnboardingStore((state) => state.isLoading)

  // Fetch all onboarding progress on mount
  useEffect(() => {
    fetchAllProgress()
  }, [fetchAllProgress])

  // Calculate stats
  const stats = useMemo(() => {
    const total = allProgress.length
    const completed = allProgress.filter((p) => p.isComplete).length
    const waitingForHandoff = allProgress.filter(
      (p) =>
        !p.isComplete &&
        (p.currentStep === 'handoff' || p.currentStep === 'notification') &&
        !p.physicalHandoff?.markedByManager &&
        p.quizAttempts.some((a) => a.passed)
    ).length
    const inProgress = total - completed

    return { total, completed, waitingForHandoff, inProgress }
  }, [allProgress])

  // Filter and search
  const filteredProgress = useMemo(() => {
    let result = [...allProgress]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((p) => p.employeeName.toLowerCase().includes(query))
    }

    // Apply status filter
    switch (filter) {
      case 'handoff':
        result = result.filter(
          (p) =>
            !p.isComplete &&
            (p.currentStep === 'handoff' || p.currentStep === 'notification') &&
            !p.physicalHandoff?.markedByManager &&
            p.quizAttempts.some((a) => a.passed)
        )
        break
      case 'in_progress':
        result = result.filter((p) => !p.isComplete)
        break
      case 'completed':
        result = result.filter((p) => p.isComplete)
        break
      default:
        // 'all' - no filter
        break
    }

    // Sort: incomplete first (by start date desc), then completed
    result.sort((a, b) => {
      if (a.isComplete !== b.isComplete) {
        return a.isComplete ? 1 : -1
      }
      // Among same status, sort by start date (newest first for in progress)
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    })

    return result
  }, [allProgress, searchQuery, filter])

  // Handle mark handoff
  const handleMarkHandoff = (employeeId: string) => {
    const employee = allProgress.find((p) => p.employeeId === employeeId)
    if (employee) {
      setSelectedEmployee({ id: employee.employeeId, name: employee.employeeName })
      setHandoffDialogOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Config link */}
      <div className="flex justify-end">
        <Link href="/onboarding/config">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configureaza Onboarding
          </Button>
        </Link>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Angajati</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              in sistem de onboarding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progres</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              angajati activi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asteapta Predare</CardTitle>
            <Package className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.waitingForHandoff}</div>
            <p className="text-xs text-muted-foreground">
              necesita actiune
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completat</CardTitle>
            <CheckCircle className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              onboarding finalizat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Status Onboarding Angajati</CardTitle>
          <CardDescription>
            Vizualizeaza progresul si gestioneaza predarea echipamentelor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cauta dupa nume..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter dropdown */}
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterOption)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtreaza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toti angajatii</SelectItem>
                <SelectItem value="handoff">Asteapta predare</SelectItem>
                <SelectItem value="in_progress">In progres</SelectItem>
                <SelectItem value="completed">Completat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee cards grid */}
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-muted-foreground">Se incarca datele...</p>
          </CardContent>
        </Card>
      ) : filteredProgress.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProgress.map((progress) => (
            <EmployeeStatusCard
              key={progress.employeeId}
              progress={progress}
              onMarkHandoff={handleMarkHandoff}
              onResetOnboarding={resetOnboarding}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || filter !== 'all'
                ? 'Niciun angajat gasit pentru criteriile selectate'
                : 'Niciun angajat in proces de onboarding'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Physical handoff dialog */}
      {selectedEmployee && (
        <PhysicalHandoffForm
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          open={handoffDialogOpen}
          onOpenChange={setHandoffDialogOpen}
        />
      )}
    </div>
  )
}

export type ManagerDashboardProps = Record<string, never>
