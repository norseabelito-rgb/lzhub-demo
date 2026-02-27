import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

const MAX_QUIZ_ATTEMPTS = 3

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
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { answers, score, passed } = body

  if (answers === undefined || score === undefined || passed === undefined) {
    return NextResponse.json(
      { error: 'answers, score si passed sunt obligatorii' },
      { status: 400 }
    )
  }

  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  const quizAttempts = Array.isArray(existing.quizAttempts)
    ? [...(existing.quizAttempts as Record<string, unknown>[])]
    : []

  if (quizAttempts.length >= MAX_QUIZ_ATTEMPTS) {
    return NextResponse.json(
      { error: 'Numarul maxim de incercari a fost atins' },
      { status: 400 }
    )
  }

  if (existing.quizPassed) {
    return NextResponse.json({ error: 'Quiz-ul a fost deja trecut' }, { status: 400 })
  }

  const now = new Date()
  const attemptNumber = quizAttempts.length + 1

  const newAttempt = {
    attemptNumber,
    startedAt: now.toISOString(),
    completedAt: now.toISOString(),
    answers,
    score,
    passed,
  }

  quizAttempts.push(newAttempt)

  const auditLog = Array.isArray(existing.auditLog) ? existing.auditLog : []
  const newAuditEntry = {
    id: crypto.randomUUID(),
    timestamp: now.toISOString(),
    step: 'quiz',
    action: passed
      ? `Quiz trecut (${score}% - incercarea ${attemptNumber})`
      : `Quiz nereusit (${score}% - incercarea ${attemptNumber})`,
    performedBy: session.user.id,
    details: { score, passed, attemptNumber },
  }

  const updateData: Record<string, unknown> = {
    quizAttempts,
    auditLog: [...(auditLog as unknown[]), newAuditEntry],
  }

  if (passed) {
    updateData.quizPassed = true
    updateData.quizBestScore = score
    updateData.currentStep = 'notification'
  } else {
    // Update best score if better
    const currentBest = existing.quizBestScore || 0
    if (score > currentBest) {
      updateData.quizBestScore = score
    }
  }

  const progress = await prisma.onboardingProgress.update({
    where: { employeeId },
    data: updateData,
  })

  return NextResponse.json(progress)
}
