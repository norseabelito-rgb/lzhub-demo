'use client'

import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOnboardingConfigStore } from '@/lib/onboarding'
import { NdaConfig } from './nda-config'
import { DocumentsConfig } from './documents-config'
import { VideoConfig } from './video-config'
import { QuizConfig } from './quiz-config'
import { FileText, BookOpen, Video, HelpCircle } from 'lucide-react'

export function ConfigPageContent() {
  const loadConfig = useOnboardingConfigStore((s) => s.loadConfig)
  const isLoading = useOnboardingConfigStore((s) => s.isLoading)
  const config = useOnboardingConfigStore((s) => s.config)

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  if (!config && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Eroare la incarcarea configurarii.
      </div>
    )
  }

  return (
    <Tabs defaultValue="nda" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="nda" className="gap-2">
          <FileText className="h-4 w-4" />
          NDA
        </TabsTrigger>
        <TabsTrigger value="documents" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Documente
        </TabsTrigger>
        <TabsTrigger value="video" className="gap-2">
          <Video className="h-4 w-4" />
          Video
        </TabsTrigger>
        <TabsTrigger value="quiz" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Quiz
        </TabsTrigger>
      </TabsList>

      <TabsContent value="nda">
        <NdaConfig />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsConfig />
      </TabsContent>

      <TabsContent value="video">
        <VideoConfig />
      </TabsContent>

      <TabsContent value="quiz">
        <QuizConfig />
      </TabsContent>
    </Tabs>
  )
}
