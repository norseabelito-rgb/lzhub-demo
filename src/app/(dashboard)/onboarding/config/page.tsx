'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/auth-guard'
import { ConfigPageContent } from '@/components/onboarding/config/config-page-content'

function ConfigContent() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/onboarding/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Configurare Onboarding</h1>
          <p className="text-muted-foreground">
            Personalizeaza continutul NDA, documente, video si quiz
          </p>
        </div>
      </div>
      <ConfigPageContent />
    </div>
  )
}

export default function OnboardingConfigPage() {
  return (
    <AuthGuard allowedRoles={['manager']}>
      <ConfigContent />
    </AuthGuard>
  )
}
