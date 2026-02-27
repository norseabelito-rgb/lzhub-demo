import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
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

  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  if (existing.isComplete) {
    return NextResponse.json({ error: 'Onboarding deja finalizat' }, { status: 400 })
  }

  const now = new Date()
  const auditLog = Array.isArray(existing.auditLog) ? existing.auditLog : []

  const newAuditEntry = {
    id: crypto.randomUUID(),
    timestamp: now.toISOString(),
    step: 'complete',
    action: 'Onboarding finalizat cu succes',
    performedBy: session.user.id,
  }

  const [progress] = await prisma.$transaction([
    prisma.onboardingProgress.update({
      where: { employeeId },
      data: {
        isComplete: true,
        completedAt: now,
        currentStep: 'complete',
        auditLog: [...(auditLog as any[]), newAuditEntry] as any,
      },
    }),
    prisma.user.update({
      where: { id: employeeId },
      data: { isNew: false },
    }),
  ])

  return NextResponse.json(progress)
}
