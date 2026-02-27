'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuditStore } from '@/lib/checklist'
import { Button } from '@/components/ui/button'
import { AuditLogViewer } from '@/components/checklists/audit-log-viewer'

/**
 * Audit log page (CHKL-03)
 * Manager-only access to view all checklist actions
 */
function AuditPageContent() {
  const { entries, isLoading, fetchEntries } = useAuditStore()

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Inapoi</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground">
              Toate actiunile din sistemul de checklisturi
            </p>
          </div>
        </div>

        {/* Export button (placeholder) */}
        <Button variant="outline" disabled title="In curand">
          <Download className="mr-2 size-4" />
          Exporta CSV
        </Button>
      </div>

      {/* Info card */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-5 text-blue-400" />
          <div>
            <h3 className="font-medium text-blue-400">Audit Log Imutabil</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Acest log inregistreaza toate actiunile din sistemul de checklisturi.
              Inregistrarile nu pot fi modificate sau sterse.
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && entries.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Se incarca audit log-ul...</span>
        </div>
      )}

      {/* Audit log viewer */}
      {!isLoading && (
        <AuditLogViewer entries={entries} showFilters={true} maxEntries={50} />
      )}
    </div>
  )
}

/**
 * Wrapped with AuthGuard for manager-only access
 */
export default function AuditPage() {
  return (
    <AuthGuard allowedRoles={['manager']}>
      <AuditPageContent />
    </AuthGuard>
  )
}
