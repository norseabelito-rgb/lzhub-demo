'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOnboardingConfigStore } from '@/lib/onboarding'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function NdaConfig() {
  const config = useOnboardingConfigStore((s) => s.config)
  const updateNda = useOnboardingConfigStore((s) => s.updateNda)
  const isLoading = useOnboardingConfigStore((s) => s.isLoading)

  const [content, setContent] = useState(config?.ndaContent ?? '')
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (html: string) => {
    setContent(html)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      await updateNda(content)
      setHasChanges(false)
      toast.success('NDA salvat cu succes')
    } catch {
      toast.error('Eroare la salvarea NDA')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acord de Confidentialitate (NDA)</CardTitle>
        <CardDescription>
          Editati textul NDA-ului pe care angajatii il vor citi si semna in timpul onboarding-ului.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TiptapEditor
          content={content}
          onChange={handleChange}
          placeholder="Scrieti continutul NDA..."
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salveaza NDA
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
