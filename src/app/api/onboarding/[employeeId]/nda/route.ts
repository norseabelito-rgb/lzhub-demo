import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { employeeId } = await params

  if (session.user.id !== employeeId && session.user.role !== 'manager') {
    console.error('[NDA] Acces interzis:', {
      sessionUserId: session.user.id,
      employeeId,
      role: session.user.role,
      match: session.user.id === employeeId,
    })
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { signatureDataUrl, signedByName } = body

  if (!signatureDataUrl || !signedByName) {
    return NextResponse.json(
      { error: 'signatureDataUrl si signedByName sunt obligatorii' },
      { status: 400 }
    )
  }

  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  if (existing.ndaSigned) {
    return NextResponse.json({ error: 'NDA deja semnat' }, { status: 400 })
  }

  const now = new Date()
  const ndaSignature = {
    signatureDataUrl,
    signedAt: now.toISOString(),
    signedBy: session.user.id,
    signedByName,
  }

  const auditLog = Array.isArray(existing.auditLog) ? existing.auditLog : []
  const newAuditEntry = {
    id: crypto.randomUUID(),
    timestamp: now.toISOString(),
    step: 'nda',
    action: 'NDA semnat',
    performedBy: session.user.id,
  }

  const progress = await prisma.onboardingProgress.update({
    where: { employeeId },
    data: {
      ndaSigned: true,
      ndaSignature,
      // Don't advance currentStep here — let the client advance
      // after the user downloads the PDF via the "Download PDF and continue" button
      auditLog: [...auditLog, newAuditEntry],
    },
  })

  return NextResponse.json(progress)
}
