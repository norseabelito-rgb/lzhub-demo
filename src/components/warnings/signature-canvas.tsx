'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import SignaturePad from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SignatureCanvasProps {
  /** Callback when signature is saved - receives base64 data URL */
  onSave: (dataUrl: string) => void
  /** Callback when signature is cleared */
  onClear?: () => void
  /** Canvas width in pixels */
  width?: number
  /** Canvas height in pixels */
  height?: number
  /** Disable interaction */
  disabled?: boolean
  /** Label above canvas (e.g., "Semnatura Manager") */
  label?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Interactive signature canvas with touch/mouse support
 * Used for capturing manager and employee signatures on warnings
 */
export function SignatureCanvas({
  onSave,
  onClear,
  width = 400,
  height = 200,
  disabled = false,
  label,
  className,
}: SignatureCanvasProps) {
  const sigPadRef = useRef<SignaturePad>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ width, height })

  // Track if signature pad has content
  const handleEnd = useCallback(() => {
    if (sigPadRef.current) {
      setIsEmpty(sigPadRef.current.isEmpty())
    }
  }, [])

  // Clear the signature
  const handleClear = useCallback(() => {
    if (sigPadRef.current) {
      sigPadRef.current.clear()
      setIsEmpty(true)
      onClear?.()
    }
  }, [onClear])

  // Save the signature
  const handleSave = useCallback(() => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      // Get trimmed canvas to remove whitespace
      const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png')
      onSave(dataUrl)
    }
  }, [onSave])

  // Handle window resize - clear to prevent distortion
  useEffect(() => {
    const handleResize = () => {
      // Calculate responsive width based on container
      const newWidth = Math.min(width, window.innerWidth - 48)
      const newHeight = Math.round((newWidth / width) * height)

      if (newWidth !== canvasSize.width || newHeight !== canvasSize.height) {
        setCanvasSize({ width: newWidth, height: newHeight })
        // Clear canvas on resize to prevent distortion
        if (sigPadRef.current) {
          sigPadRef.current.clear()
          setIsEmpty(true)
        }
      }
    }

    // Initial size calculation
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [width, height, canvasSize.width, canvasSize.height])

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <div className="relative">
        {/* Signature canvas container */}
        <div
          className={cn(
            'border border-border rounded-lg bg-muted/30 overflow-hidden',
            disabled && 'opacity-50'
          )}
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            touchAction: 'none' // Prevent scrolling while signing
          }}
        >
          <SignaturePad
            ref={sigPadRef}
            canvasProps={{
              width: canvasSize.width,
              height: canvasSize.height,
              className: 'signature-canvas',
              style: {
                touchAction: 'none',
                cursor: disabled ? 'not-allowed' : 'crosshair',
              },
            }}
            backgroundColor="transparent"
            penColor="oklch(0.8 0.2 335)" // Neon pink accent for signature
            onEnd={handleEnd}
          />
        </div>

        {/* Disabled overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              Dezactivat
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={disabled || isEmpty}
        >
          Sterge
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={disabled || isEmpty}
        >
          Confirma
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Deseneaza semnatura folosind mouse-ul sau degetul
      </p>
    </div>
  )
}
