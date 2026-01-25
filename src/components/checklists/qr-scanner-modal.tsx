'use client'

import { useState, useEffect, useCallback } from 'react'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { X, Camera, Keyboard, AlertCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ============================================================================
// Types
// ============================================================================

interface QRScannerModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Called when the modal should close */
  onClose: () => void
  /** Called when a QR code is successfully scanned */
  onScan: (templateId: string) => void
}

type ScannerState = 'initializing' | 'ready' | 'permission-denied' | 'error'

// ============================================================================
// Component
// ============================================================================

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const [scannerState, setScannerState] = useState<ScannerState>('initializing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualCode, setManualCode] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return

    // Use setTimeout to avoid synchronous setState in effect body
    const timeoutId = setTimeout(() => {
      setScannerState('initializing')
      setErrorMessage(null)
      setShowManualEntry(false)
      setManualCode('')
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [isOpen])

  // Handle scan result
  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (detectedCodes.length === 0) return

      const rawValue = detectedCodes[0].rawValue
      if (!rawValue) return

      // Parse the URL to extract template ID
      // Expected format: https://domain.com/qr/{template-id}
      try {
        const url = new URL(rawValue)
        const pathParts = url.pathname.split('/')
        const qrIndex = pathParts.findIndex((part) => part === 'qr')

        if (qrIndex !== -1 && pathParts[qrIndex + 1]) {
          const templateId = pathParts[qrIndex + 1]
          onScan(templateId)
          onClose()
        } else {
          setErrorMessage('Codul QR nu este valid pentru un checklist')
        }
      } catch {
        // If not a valid URL, treat the raw value as the template ID
        if (rawValue.length > 10) {
          // Likely a UUID
          onScan(rawValue)
          onClose()
        } else {
          setErrorMessage('Codul QR nu este valid')
        }
      }
    },
    [onScan, onClose]
  )

  // Handle scanner errors
  const handleError = useCallback((error: unknown) => {
    console.error('Scanner error:', error)

    const errorStr = String(error).toLowerCase()

    if (errorStr.includes('permission') || errorStr.includes('notallowed')) {
      setScannerState('permission-denied')
      setErrorMessage(
        'Permisiunea pentru camera a fost refuzata. Te rugam sa permiti accesul la camera din setarile browserului.'
      )
    } else if (errorStr.includes('notfound') || errorStr.includes('no camera')) {
      setScannerState('error')
      setErrorMessage('Nu a fost gasita nicio camera. Te rugam sa folosesti introducerea manuala.')
      setShowManualEntry(true)
    } else {
      setScannerState('error')
      setErrorMessage('Camera nu este disponibila. Te rugam sa folosesti introducerea manuala.')
      setShowManualEntry(true)
    }
  }, [])

  // Handle manual code submission
  const handleManualSubmit = () => {
    const code = manualCode.trim()
    if (!code) return

    // If it looks like a URL, parse it
    if (code.startsWith('http')) {
      try {
        const url = new URL(code)
        const pathParts = url.pathname.split('/')
        const qrIndex = pathParts.findIndex((part) => part === 'qr')

        if (qrIndex !== -1 && pathParts[qrIndex + 1]) {
          onScan(pathParts[qrIndex + 1])
          onClose()
          return
        }
      } catch {
        // Not a valid URL, continue
      }
    }

    // Treat as template ID directly
    onScan(code)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Scaneaza Cod QR
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative bg-black">
          {/* Scanner Area */}
          {scannerState !== 'permission-denied' && scannerState !== 'error' && !showManualEntry && (
            <div className="relative aspect-square w-full max-h-[400px] overflow-hidden">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                constraints={{
                  facingMode: 'environment', // Use back camera on mobile
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
                components={{
                  torch: true, // Show torch/flash toggle if available
                }}
              />

              {/* Scanning frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </div>

              {/* Loading indicator */}
              {scannerState === 'initializing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Se initializeaza camera...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Permission denied / Error state */}
          {(scannerState === 'permission-denied' || scannerState === 'error') && (
            <div className="aspect-square w-full max-h-[400px] flex items-center justify-center bg-muted/10">
              <div className="text-center p-6">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
                <Button
                  variant="outline"
                  onClick={() => setShowManualEntry(true)}
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Introducere manuala
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error message banner */}
        {errorMessage && scannerState === 'ready' && (
          <div className="p-3 bg-destructive/10 border-t border-destructive/20">
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
          </div>
        )}

        {/* Manual entry section */}
        <div className="p-4 border-t bg-background">
          {!showManualEntry ? (
            <button
              onClick={() => setShowManualEntry(true)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Keyboard className="h-4 w-4 inline-block mr-2" />
              Sau introdu codul manual
            </button>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="manual-code" className="text-sm font-medium">
                Introdu ID-ul checklistului
              </Label>
              <div className="flex gap-2">
                <Input
                  id="manual-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="ex: abc123-def456..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                <Button onClick={handleManualSubmit} disabled={!manualCode.trim()}>
                  Deschide
                </Button>
              </div>
              <button
                onClick={() => setShowManualEntry(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Inapoi la scanner
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
