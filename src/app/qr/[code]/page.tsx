'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, AlertCircle, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { useChecklistStore } from '@/lib/checklist/checklist-store'
import { format } from 'date-fns'

// ============================================================================
// Types
// ============================================================================

type RedirectState =
  | 'loading'
  | 'not-authenticated'
  | 'template-not-found'
  | 'creating-instance'
  | 'redirecting'

// ============================================================================
// Page Component
// ============================================================================

export default function QRRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { getTemplateById, createInstance, instances } = useChecklistStore()

  const [hasAttemptedCreation, setHasAttemptedCreation] = useState(false)
  const [createdInstanceId, setCreatedInstanceId] = useState<string | null>(null)
  const [creationError, setCreationError] = useState(false)

  const templateId = params.code as string

  // Derive template and existing instance from store (not in effect)
  const template = useMemo(
    () => getTemplateById(templateId),
    [getTemplateById, templateId]
  )

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const existingInstance = useMemo(
    () =>
      instances.find(
        (i) =>
          i.templateId === templateId &&
          i.assignedTo === user?.id &&
          i.date === today
      ),
    [instances, templateId, user?.id, today]
  )

  // Compute derived state based on auth/template status
  const derivedState = useMemo<RedirectState>(() => {
    if (authLoading) return 'loading'
    if (!isAuthenticated || !user) return 'not-authenticated'
    if (!template) return 'template-not-found'
    if (creationError) return 'template-not-found'
    if (existingInstance || createdInstanceId) return 'redirecting'
    if (hasAttemptedCreation) return 'creating-instance'
    return 'creating-instance'
  }, [
    authLoading,
    isAuthenticated,
    user,
    template,
    existingInstance,
    createdInstanceId,
    hasAttemptedCreation,
    creationError,
  ])

  // Handle instance creation and redirect
  const handleCreateAndRedirect = useCallback(() => {
    if (!user || !template || hasAttemptedCreation) return

    setHasAttemptedCreation(true)

    // If instance already exists, redirect to it
    if (existingInstance) {
      router.replace(`/checklists/${existingInstance.id}`)
      return
    }

    // Create new instance for today
    try {
      const instanceId = createInstance(templateId, user.id, today)
      setCreatedInstanceId(instanceId)
      router.replace(`/checklists/${instanceId}`)
    } catch (error) {
      console.error('Failed to create checklist instance:', error)
      setCreationError(true)
    }
  }, [
    user,
    template,
    templateId,
    today,
    existingInstance,
    createInstance,
    router,
    hasAttemptedCreation,
  ])

  // Effect only triggers navigation, no state setting
  useEffect(() => {
    // Only proceed when we have auth data and a valid template
    if (authLoading || !isAuthenticated || !user || !template) return

    // Small delay to ensure UI renders before navigation
    const timeoutId = setTimeout(() => {
      handleCreateAndRedirect()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [authLoading, isAuthenticated, user, template, handleCreateAndRedirect])

  // Handle login redirect
  const handleLogin = () => {
    // Store the return URL in sessionStorage for after login
    sessionStorage.setItem('qr-redirect', `/qr/${templateId}`)
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        {/* Loading state */}
        {derivedState === 'loading' && (
          <div className="text-center">
            <QrCode className="h-16 w-16 text-primary mx-auto mb-4" />
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Se incarca...</p>
          </div>
        )}

        {/* Not authenticated state */}
        {derivedState === 'not-authenticated' && (
          <div className="text-center">
            <QrCode className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Autentificare necesara</h1>
            <p className="text-muted-foreground mb-6">
              Te rugam sa te autentifici pentru a accesa checklistul.
            </p>
            <Button onClick={handleLogin} className="w-full max-w-xs">
              Autentificare
            </Button>
          </div>
        )}

        {/* Template not found state */}
        {derivedState === 'template-not-found' && (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Checklist negasit</h1>
            <p className="text-muted-foreground mb-6">
              Codul QR nu corespunde unui checklist valid sau checklistul a fost sters.
            </p>
            <Button variant="outline" onClick={() => router.push('/checklists')}>
              Inapoi la checklisturi
            </Button>
          </div>
        )}

        {/* Creating instance / Redirecting state */}
        {(derivedState === 'creating-instance' || derivedState === 'redirecting') && (
          <div className="text-center">
            <QrCode className="h-16 w-16 text-primary mx-auto mb-4" />
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            {template && (
              <h1 className="text-xl font-semibold mb-2">{template.name}</h1>
            )}
            <p className="text-muted-foreground">
              {derivedState === 'creating-instance'
                ? 'Se creeaza checklistul...'
                : 'Redirectionare catre checklist...'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
