'use client'

import { useRef } from 'react'
import QRCode from 'react-qr-code'
import { Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChecklistTemplate } from '@/lib/checklist/types'

// ============================================================================
// Types
// ============================================================================

interface QRCodeDisplayProps {
  /** Template to generate QR code for */
  template: ChecklistTemplate
  /** Size of the QR code in pixels (default: 200) */
  size?: number
  /** Show print button (default: true) */
  showPrintButton?: boolean
  /** Show download button (default: false) */
  showDownloadButton?: boolean
}

// ============================================================================
// Component
// ============================================================================

export function QRCodeDisplay({
  template,
  size = 200,
  showPrintButton = true,
  showDownloadButton = false,
}: QRCodeDisplayProps) {
  const printRef = useRef<HTMLDivElement>(null)

  // Generate QR code URL - points to /qr/[template-id] which redirects to checklist
  const qrValue =
    typeof window !== 'undefined'
      ? `${window.location.origin}/qr/${template.id}`
      : `/qr/${template.id}`

  // Print handler - opens print dialog with just the QR code section
  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Te rugam sa permiti popupuri pentru a printa codul QR')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${template.name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              padding: 2rem;
              text-align: center;
            }
            .qr-wrapper {
              background: white;
              padding: 1rem;
              border-radius: 8px;
              display: inline-block;
            }
            .template-name {
              margin-top: 1rem;
              font-size: 1.25rem;
              font-weight: 600;
              color: #333;
            }
            .instructions {
              margin-top: 0.5rem;
              font-size: 0.875rem;
              color: #666;
            }
            @media print {
              body {
                min-height: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-wrapper">
              ${printContent.querySelector('.qr-svg-container')?.innerHTML || ''}
            </div>
            <div class="template-name">${template.name}</div>
            <div class="instructions">Scaneaza pentru a deschide checklistul</div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Give the content time to render, then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  // Download handler - saves QR code as PNG
  const handleDownload = () => {
    const svg = printRef.current?.querySelector('svg')
    if (!svg) return

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with some padding
    const padding = 40
    canvas.width = size + padding * 2
    canvas.height = size + padding * 2 + 60 // Extra space for text

    // Draw white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Convert SVG to data URL and draw on canvas
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size)

      // Add template name below QR code
      ctx.fillStyle = '#333'
      ctx.font = 'bold 16px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(template.name, canvas.width / 2, size + padding + 30)

      // Download the canvas as PNG
      const link = document.createElement('a')
      link.download = `qr-${template.name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div ref={printRef} className="flex flex-col items-center gap-4 p-4">
      {/* QR Code with white background for readability */}
      <div className="qr-svg-container bg-white p-4 rounded-lg shadow-sm">
        <QRCode
          value={qrValue}
          size={size}
          fgColor="#f535aa" // Neon pink brand color
          bgColor="white"
          level="M" // Medium error correction
        />
      </div>

      {/* Template name */}
      <p className="text-lg font-medium text-center">{template.name}</p>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center">
        Scaneaza pentru a deschide checklistul
      </p>

      {/* Action buttons */}
      {(showPrintButton || showDownloadButton) && (
        <div className="flex items-center gap-2 pt-2">
          {showPrintButton && (
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Printeaza QR
            </Button>
          )}
          {showDownloadButton && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Descarca PNG
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
