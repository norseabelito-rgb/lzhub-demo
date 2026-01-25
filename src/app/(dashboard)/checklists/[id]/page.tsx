'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { useChecklistStore } from '@/lib/checklist'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChecklistInstanceView } from '@/components/checklists/checklist-instance'

/**
 * Individual checklist detail/completion page
 * Access control: user can only view if assigned to them OR is manager
 */
export default function ChecklistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isManager } = useAuth()
  const { instances, templates } = useChecklistStore()

  const instanceId = params?.id as string

  // Find instance and template
  const instance = instances.find((i) => i.id === instanceId)
  const template = instance
    ? templates.find((t) => t.id === instance.templateId)
    : undefined

  // Access control check
  const hasAccess =
    instance && (instance.assignedTo === user?.id || isManager)

  // Redirect if unauthorized
  useEffect(() => {
    if (instance && user && !hasAccess) {
      toast.error('Acces interzis', {
        description: 'Nu ai permisiunea sa vezi acest checklist.',
      })
      router.push('/checklists')
    }
  }, [instance, user, hasAccess, router])

  // Loading state
  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se incarca...</p>
      </div>
    )
  }

  // Not found state
  if (!instance) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Inapoi</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Checklist negasit</h1>
          </div>
        </div>

        {/* Error card */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="size-8 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">
                Checklistul nu exista
              </h3>
              <p className="text-sm text-muted-foreground">
                Acest checklist nu a fost gasit sau a fost sters.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/checklists">Inapoi la checklisturi</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No access (should redirect, but show message as fallback)
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Inapoi</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Acces interzis</h1>
          </div>
        </div>

        {/* Error card */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="size-8 text-warning" />
            <div>
              <h3 className="font-semibold text-warning">
                Nu ai acces la acest checklist
              </h3>
              <p className="text-sm text-muted-foreground">
                Poti vizualiza doar checklisturile asignate tie.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/checklists">Inapoi la checklisturi</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Template not found (data integrity issue)
  if (!template) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Inapoi</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{instance.templateName}</h1>
          </div>
        </div>

        {/* Error card */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="size-8 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">
                Sablon negasit
              </h3>
              <p className="text-sm text-muted-foreground">
                Sablonul pentru acest checklist nu a fost gasit. Contacteaza un
                manager.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/checklists">Inapoi la checklisturi</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main view - has access, instance and template exist
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/checklists">
            <ArrowLeft className="size-5" />
            <span className="sr-only">Inapoi</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
      </div>

      {/* Checklist Instance View */}
      <ChecklistInstanceView
        instance={instance}
        template={template}
        currentUser={user}
      />
    </div>
  )
}
