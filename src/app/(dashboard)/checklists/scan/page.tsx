'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, ClipboardCheck, Camera, Keyboard } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QRScannerModal } from '@/components/checklists'
import { useChecklistStore } from '@/lib/checklist/checklist-store'
import { useAuth } from '@/lib/auth'
import { format } from 'date-fns'

// ============================================================================
// Page Component
// ============================================================================

export default function ScanPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { getTemplateById, createInstance, instances, fetchTemplates, fetchInstances } = useChecklistStore()

  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    fetchTemplates()
    fetchInstances()
  }, [fetchTemplates, fetchInstances])

  // Handle successful scan or manual entry
  const handleCodeSubmit = async (templateId: string) => {
    if (!user) {
      toast.error('Te rugam sa te autentifici')
      return
    }

    setIsProcessing(true)

    try {
      // Look up template
      const template = getTemplateById(templateId)
      if (!template) {
        toast.error('Checklistul nu a fost gasit')
        setIsProcessing(false)
        return
      }

      // Check if an instance already exists for today
      const today = format(new Date(), 'yyyy-MM-dd')
      const existingInstance = instances.find(
        (i) =>
          i.templateId === templateId &&
          i.assignedTo === user.id &&
          i.date === today
      )

      if (existingInstance) {
        toast.success(`Se deschide: ${template.name}`)
        router.push(`/checklists/${existingInstance.id}`)
        return
      }

      // Create new instance (async)
      const instanceId = await createInstance(templateId, user.id, today)
      toast.success(`S-a creat checklistul: ${template.name}`)
      router.push(`/checklists/${instanceId}`)
    } catch (error) {
      console.error('Failed to process QR code:', error)
      toast.error('Nu s-a putut deschide checklistul')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle scan from QR scanner modal
  const handleScan = (templateId: string) => {
    setIsScannerOpen(false)
    handleCodeSubmit(templateId)
  }

  // Handle manual code submission
  const handleManualSubmit = () => {
    const code = manualCode.trim()
    if (!code) return
    handleCodeSubmit(code)
    setManualCode('')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Scaneaza Checklist</h1>
        <p className="text-muted-foreground">
          Scaneaza codul QR sau introdu codul manual pentru a deschide rapid un checklist.
        </p>
      </div>

      {/* Main Scan Button - Large touch target for mobile */}
      <Card className="border-primary/50">
        <CardContent className="p-6">
          <Button
            onClick={() => setIsScannerOpen(true)}
            disabled={isProcessing}
            className="w-full min-h-20 text-lg font-semibold"
            size="lg"
          >
            <Camera className="h-8 w-8 mr-3" />
            {isProcessing ? 'Se proceseaza...' : 'Deschide camera pentru scanare'}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Apasa butonul pentru a scana un cod QR cu camera dispozitivului
          </p>
        </CardContent>
      </Card>

      {/* Manual Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Keyboard className="h-5 w-5" />
            Introducere manuala
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-code">Codul checklistului</Label>
            <div className="flex gap-2">
              <Input
                id="manual-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="ex: abc123-def456..."
                className="flex-1 min-h-12 text-base" // Larger touch target
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                disabled={isProcessing}
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim() || isProcessing}
                className="min-h-12 px-6"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Deschide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Link to My Checklists */}
      <Card>
        <CardContent className="p-4">
          <Button
            variant="outline"
            className="w-full min-h-14 justify-start text-left"
            onClick={() => router.push('/checklists')}
          >
            <ClipboardCheck className="h-5 w-5 mr-3" />
            <div>
              <p className="font-medium">Checklisturile mele</p>
              <p className="text-xs text-muted-foreground">
                Vezi toate checklisturile tale
              </p>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  )
}
