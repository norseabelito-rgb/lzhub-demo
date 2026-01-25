/**
 * PDF generator for NDA documents
 * Creates downloadable PDF with NDA text and embedded signature
 */

import { jsPDF } from 'jspdf'
import { MOCK_NDA_TEXT } from './mock-data'

export interface NdaPdfData {
  /** Employee name who signed */
  employeeName: string
  /** Date when signed */
  signedAt: Date
  /** Signature image data URL (base64 PNG) */
  signatureDataUrl: string
}

/**
 * Generate a PDF document for a signed NDA
 * @param data - NDA signing data including name, date, and signature
 * @returns Data URL of the generated PDF
 */
export function generateNdaPdf(data: NdaPdfData): string {
  const { employeeName, signedAt, signatureDataUrl } = data

  // Create PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin

  let yPosition = margin

  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('LASERZONE ARENA', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(14)
  doc.text('ACORD DE CONFIDENTIALITATE SI NEDIVULGARE', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // NDA Text - split into paragraphs
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const lines = doc.splitTextToSize(MOCK_NDA_TEXT, contentWidth)

  for (const line of lines) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = margin
    }

    // Check if this is a header line (starts with number or all caps)
    const isHeader = /^(\d+\.|[A-Z]{2,})/.test(line.trim())
    if (isHeader) {
      doc.setFont('helvetica', 'bold')
      yPosition += 3 // Extra spacing before headers
    } else {
      doc.setFont('helvetica', 'normal')
    }

    doc.text(line, margin, yPosition)
    yPosition += 5
  }

  // Ensure signature section fits on current page
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = margin
  }

  yPosition += 15

  // Signature section
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('SEMNATURA ANGAJAT', margin, yPosition)
  yPosition += 10

  // Employee name
  doc.setFont('helvetica', 'normal')
  doc.text(`Nume: ${employeeName}`, margin, yPosition)
  yPosition += 7

  // Date signed
  const formattedDate = signedAt.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Data semnarii: ${formattedDate}`, margin, yPosition)
  yPosition += 10

  // Signature image
  doc.text('Semnatura:', margin, yPosition)
  yPosition += 5

  // Add signature image if available
  if (signatureDataUrl && signatureDataUrl.startsWith('data:image')) {
    try {
      // Signature box dimensions
      const sigWidth = 60
      const sigHeight = 30

      doc.addImage(signatureDataUrl, 'PNG', margin, yPosition, sigWidth, sigHeight)
      yPosition += sigHeight + 5
    } catch (error) {
      console.error('Error adding signature image to PDF:', error)
      doc.text('[Semnatura digitala]', margin, yPosition)
      yPosition += 10
    }
  }

  // Footer with document ID
  const documentId = `NDA-${employeeName.replace(/\s+/g, '-').toUpperCase()}-${signedAt.getTime()}`
  yPosition += 10
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(`Document ID: ${documentId}`, margin, yPosition)
  doc.text(`Generat automat de LaserZone Hub`, pageWidth - margin, yPosition, { align: 'right' })

  // Return as data URL
  return doc.output('dataurlstring')
}

/**
 * Download a PDF file from a data URL
 * @param pdfDataUrl - The PDF data URL
 * @param fileName - Name for the downloaded file
 */
export function downloadNdaPdf(pdfDataUrl: string, fileName: string = 'NDA-LaserZone.pdf'): void {
  // Create a link element
  const link = document.createElement('a')
  link.href = pdfDataUrl
  link.download = fileName

  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generate and immediately download the NDA PDF
 * Convenience function combining generation and download
 * @param data - NDA signing data
 * @returns The generated PDF data URL (for storage)
 */
export function generateAndDownloadNdaPdf(data: NdaPdfData): string {
  const pdfDataUrl = generateNdaPdf(data)
  const fileName = `NDA-${data.employeeName.replace(/\s+/g, '-')}-${data.signedAt.toISOString().split('T')[0]}.pdf`
  downloadNdaPdf(pdfDataUrl, fileName)
  return pdfDataUrl
}
