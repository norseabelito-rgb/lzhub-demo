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
  const { lastPosition, furthestReached, completed } = body

  if (lastPosition === undefined || furthestReached === undefined) {
    return NextResponse.json(
      { error: 'lastPosition si furthestReached sunt obligatorii' },
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
  const existingVideo = existing.videoProgress as Record<string, unknown> | null

  const videoProgress = {
    startedAt: existingVideo?.startedAt || now.toISOString(),
    lastPosition,
    totalDuration: existingVideo?.totalDuration || 0,
    furthestReached: Math.max(furthestReached, (existingVideo?.furthestReached as number) || 0),
    completed: completed || existingVideo?.completed || false,
    ...(completed && { completedAt: now.toISOString() }),
  }

  const updateData: Record<string, unknown> = { videoProgress }

  if (completed && !existing.videoCompleted) {
    updateData.videoCompleted = true
    updateData.currentStep = 'quiz'

    const auditLog = Array.isArray(existing.auditLog) ? existing.auditLog : []
    updateData.auditLog = [
      ...(auditLog as unknown[]),
      {
        id: crypto.randomUUID(),
        timestamp: now.toISOString(),
        step: 'video',
        action: 'Video de training completat',
        performedBy: session.user.id,
      },
    ]
  }

  const progress = await prisma.onboardingProgress.update({
    where: { employeeId },
    data: updateData,
  })

  return NextResponse.json(progress)
}
