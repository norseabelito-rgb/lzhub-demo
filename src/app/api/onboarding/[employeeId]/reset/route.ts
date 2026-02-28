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

  // Only managers can reset onboarding
  if (session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { employeeId } = await params

  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  const now = new Date()
  const auditLog = Array.isArray(existing.auditLog) ? existing.auditLog : []

  const resetAuditEntry = {
    id: crypto.randomUUID(),
    timestamp: now.toISOString(),
    step: 'nda',
    action: 'Onboarding resetat de manager',
    performedBy: session.user.id,
    details: {
      managerName: session.user.name,
      previousStep: existing.currentStep,
      wasComplete: existing.isComplete,
    },
  }

  // Reset all progress but keep audit log history
  const [progress] = await prisma.$transaction([
    prisma.onboardingProgress.update({
      where: { employeeId },
      data: {
        currentStep: 'nda',
        startedAt: now,
        ndaSigned: false,
        ndaSignature: null as any,
        ndaPdfUrl: null,
        documents: [],
        videoProgress: null as any,
        videoCompleted: false,
        quizAttempts: [],
        quizPassed: false,
        quizBestScore: null,
        physicalHandoff: null as any,
        handoffCompleted: false,
        managerId: null,
        isComplete: false,
        completedAt: null,
        auditLog: [...(auditLog as any[]), resetAuditEntry] as any,
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    }),
    // Mark user as new again so they go through onboarding
    prisma.user.update({
      where: { id: employeeId },
      data: { isNew: true },
    }),
  ])

  return NextResponse.json(progress)
}
