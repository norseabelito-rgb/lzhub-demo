'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, ListChecks, Settings2, History, FileText, QrCode } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useChecklistStore } from '@/lib/checklist'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MyChecklists } from '@/components/checklists/my-checklists'

/**
 * Main checklists page with role-based content
 * Employees: see only their assigned checklists
 * Managers: see their checklists + team overview
 */
export default function ChecklistsPage() {
  const router = useRouter()
  const { user, isManager } = useAuth()
  const { instances, templates } = useChecklistStore()

  // Get today's date in ISO format
  const today = format(new Date(), 'yyyy-MM-dd')

  // Filter instances for current user and today
  const myInstances = instances.filter(
    (i) => i.assignedTo === user?.id && i.date === today
  )

  // For managers: get all instances for today
  const allTodayInstances = instances.filter((i) => i.date === today)

  // Calculate team stats for managers
  const teamStats = {
    total: allTodayInstances.length,
    completed: allTodayInstances.filter((i) => i.status === 'completed').length,
    inProgress: allTodayInstances.filter((i) => i.status === 'in_progress').length,
    pending: allTodayInstances.filter((i) => i.status === 'pending').length,
    overdue: allTodayInstances.filter((i) => i.status === 'overdue').length,
  }

  const handleSelectChecklist = (id: string) => {
    router.push(`/checklists/${id}`)
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se incarca...</p>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="glow-subtle-hover">
            <Link href="/dashboard">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Inapoi</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-glow text-primary">
              {isManager ? 'Checklisturi' : 'Checklisturile mele'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isManager
                ? 'Gestioneaza checklisturile echipei'
                : 'Checklisturi asignate pentru azi'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* History link - all users */}
          <Button variant="outline-glow" asChild>
            <Link href="/checklists/history">
              <History className="mr-2 size-4" />
              Istoric
            </Link>
          </Button>

          {/* Manager-only links */}
          {isManager && (
            <>
              <Button variant="outline-glow" asChild>
                <Link href="/checklists/audit">
                  <FileText className="mr-2 size-4" />
                  Audit Log
                </Link>
              </Button>
              <Button variant="outline-glow" asChild>
                <Link href="/checklists/templates">
                  <Settings2 className="mr-2 size-4" />
                  Sabloane
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* My Checklists Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          {isManager ? 'Checklisturile mele' : 'Checklisturi pentru azi'}
        </h2>
        <MyChecklists
          instances={myInstances}
          templates={templates}
          onSelect={handleSelectChecklist}
        />
      </section>

      {/* Floating Action Button for QR Scan - Mobile optimized */}
      <Link
        href="/checklists/scan"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:h-12 md:w-auto md:rounded-lg md:px-4 glow-intense"
      >
        <QrCode className="h-6 w-6 md:mr-2 md:h-5 md:w-5" />
        <span className="sr-only md:not-sr-only md:font-medium">Scaneaza QR</span>
      </Link>

      {/* Manager: Team Overview Section */}
      {isManager && allTodayInstances.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Status completare echipa</h2>

          {/* Quick stats */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Completate"
              value={teamStats.completed}
              variant="success"
            />
            <StatCard
              label="In progres"
              value={teamStats.inProgress}
              variant="default"
            />
            <StatCard
              label="In asteptare"
              value={teamStats.pending}
              variant="secondary"
            />
            {teamStats.overdue > 0 && (
              <StatCard
                label="Depasite"
                value={teamStats.overdue}
                variant="destructive"
              />
            )}
          </div>

          {/* Team checklist grid */}
          <Card className="hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-base text-glow text-primary">
                Toate checklisturile pentru azi
              </CardTitle>
              <CardDescription>
                {teamStats.completed}/{teamStats.total} completate azi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allTodayInstances.map((instance) => {
                  const completedCount = instance.completions.length
                  const totalCount = instance.items.length
                  const percentage =
                    totalCount > 0
                      ? Math.round((completedCount / totalCount) * 100)
                      : 0

                  return (
                    <div
                      key={instance.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-accent/50"
                      onClick={() => handleSelectChecklist(instance.id)}
                    >
                      <ListChecks className="size-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {instance.templateName}
                          </span>
                          <StatusBadge status={instance.status} />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Asignat: {instance.assignedTo === user?.id ? 'Tu' : instance.assignedTo}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-medium">{percentage}%</span>
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary glow-subtle"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}

// Stat card for manager overview
function StatCard({
  label,
  value,
  variant,
}: {
  label: string
  value: number
  variant: 'default' | 'secondary' | 'success' | 'destructive'
}) {
  const colorClass = {
    default: 'text-primary',
    secondary: 'text-muted-foreground',
    success: 'text-success',
    destructive: 'text-destructive',
  }[variant]

  return (
    <Card className="p-4 hover:border-primary/30 transition-colors">
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  )
}

// Status badge helper
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'Asteptare',
      className: 'bg-muted text-muted-foreground',
    },
    in_progress: {
      label: 'In progres',
      className: 'bg-blue-500/20 text-blue-400',
    },
    completed: {
      label: 'Completat',
      className: 'bg-success/20 text-success',
    },
    overdue: {
      label: 'Depasit',
      className: 'bg-destructive/20 text-destructive',
    },
  }

  const c = config[status] || config.pending

  return (
    <Badge variant="outline" className={c.className}>
      {c.label}
    </Badge>
  )
}
