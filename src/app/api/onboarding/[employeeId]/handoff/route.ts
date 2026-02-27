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
  const body = await request.json()
  const { type, signature } = body

  if (!type || !['manager', 'employee'].includes(type)) {
    return NextResponse.json(
      { error: 'type trebuie sa fie "manager" sau "employee"' },
      { status: 400 }
    )
  }

  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  const now = new Date()
  const currentHandoff = (existing.physicalHandoff as Record<string, unknown>) || {}
  const auditLog = Array.isArray(existing.auditLog) ? existing.auditLog : []

  let updatedHandoff: Record<string, unknown>
  let auditAction: string

  if (type === 'manager') {
    if (session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }

    if (!signature) {
      return NextResponse.json({ error: 'Semnatura managerului este obligatorie' }, { status: 400 })
    }

    updatedHandoff = {
      ...currentHandoff,
      markedByManager: true,
      managerSignature: {
        dataUrl: signature.dataUrl,
        signedAt: now.toISOString(),
        signedBy: session.user.id,
        signerName: signature.signerName || session.user.name,
      },
    }
    auditAction = 'Predare echipamente marcata de manager'
  } else {
    // employee confirmation
    if (session.user.id !== employeeId && session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }

    if (!currentHandoff.markedByManager) {
      return NextResponse.json(
        { error: 'Managerul trebuie sa marcheze predarea mai intai' },
        { status: 400 }
      )
    }

    updatedHandoff = {
      ...currentHandoff,
      confirmedByEmployee: true,
      employeeConfirmedAt: now.toISOString(),
    }
    auditAction = 'Primire echipamente confirmata de angajat'
  }

  const newAuditEntry = {
    id: crypto.randomUUID(),
    timestamp: now.toISOString(),
    step: 'handoff',
    action: auditAction,
    performedBy: session.user.id,
  }

  // Check if both sides are done
  const bothDone = updatedHandoff.markedByManager && updatedHandoff.confirmedByEmployee

  const updateData: Record<string, unknown> = {
    physicalHandoff: updatedHandoff,
    auditLog: [...(auditLog as unknown[]), newAuditEntry],
  }

  if (bothDone) {
    updateData.handoffCompleted = true
    updateData.currentStep = 'confirmation'
  }

  if (type === 'manager') {
    updateData.managerId = session.user.id
  }

  const progress = await prisma.onboardingProgress.update({
    where: { employeeId },
    data: updateData,
  })

  return NextResponse.json(progress)
}
