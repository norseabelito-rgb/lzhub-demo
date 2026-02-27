import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { employeeId } = await params

  if (session.user.id !== employeeId && session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { documentId, timeSpentSeconds, confirmed } = body

  if (!documentId) {
    return NextResponse.json({ error: 'documentId este obligatoriu' }, { status: 400 })
  }

  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  const documents = Array.isArray(existing.documents) ? [...(existing.documents as Record<string, unknown>[])] : []
  const docIndex = documents.findIndex((d) => d.documentId === documentId)
  const now = new Date()

  if (docIndex >= 0) {
    // Update existing document progress
    const doc = { ...documents[docIndex] }
    if (timeSpentSeconds !== undefined) {
      doc.timeSpentSeconds = timeSpentSeconds
    }
    if (confirmed !== undefined) {
      doc.confirmed = confirmed
      if (confirmed) {
        doc.completedAt = now.toISOString()
      }
    }
    documents[docIndex] = doc
  } else {
    // Create new document progress entry
    documents.push({
      documentId,
      startedAt: now.toISOString(),
      timeSpentSeconds: timeSpentSeconds || 0,
      confirmed: confirmed || false,
      ...(confirmed && { completedAt: now.toISOString() }),
    })
  }

  const auditLog = Array.isArray(existing.auditLog) ? existing.auditLog : []
  const updateData: Record<string, unknown> = { documents }

  if (confirmed) {
    const newAuditEntry = {
      id: crypto.randomUUID(),
      timestamp: now.toISOString(),
      step: 'documents',
      action: `Document confirmat: ${documentId}`,
      performedBy: session.user.id,
      details: { documentId },
    }
    updateData.auditLog = [...(auditLog as unknown[]), newAuditEntry]
  }

  const progress = await prisma.onboardingProgress.update({
    where: { employeeId },
    data: updateData,
  })

  return NextResponse.json(progress)
}
