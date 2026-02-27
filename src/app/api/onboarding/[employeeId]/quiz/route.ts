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
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { answers } = body as { answers: Record<string, string | string[]> }

  if (!answers) {
    return NextResponse.json({ error: 'answers este obligatoriu' }, { status: 400 })
  }

  // Load config for scoring
  const config = await prisma.onboardingConfig.findUnique({
    where: { id: 'default' },
    include: {
      questions: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!config) {
    return NextResponse.json({ error: 'Config negasit' }, { status: 500 })
  }

  const maxAttempts = config.quizMaxAttempts
  const passThreshold = config.quizPassThreshold

  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  const quizAttempts = Array.isArray(existing.quizAttempts)
    ? [...(existing.quizAttempts as Record<string, unknown>[])]
    : []

  if (quizAttempts.length >= maxAttempts) {
    return NextResponse.json(
      { error: 'Numarul maxim de incercari a fost atins' },
      { status: 400 }
    )
  }

  if (existing.quizPassed) {
    return NextResponse.json({ error: 'Quiz-ul a fost deja trecut' }, { status: 400 })
  }

  // Server-side scoring
  let correct = 0
  const totalQuestions = config.questions.length

  for (const question of config.questions) {
    const userAnswer = answers[question.id]
    const correctAnswer = question.correctAnswer

    if (question.type === 'open_text') {
      // Open text questions are always counted as correct (manually graded later)
      correct++
      continue
    }

    if (question.type === 'multi_select') {
      const userArr = Array.isArray(userAnswer) ? [...userAnswer].sort() : []
      const correctArr = Array.isArray(correctAnswer) ? [...(correctAnswer as string[])].sort() : []

      if (
        userArr.length === correctArr.length &&
        userArr.every((val, idx) => val === correctArr[idx])
      ) {
        correct++
      }
    } else {
      if (userAnswer === correctAnswer) {
        correct++
      }
    }
  }

  const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0
  const passed = score >= passThreshold

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
    const currentBest = existing.quizBestScore || 0
    if (score > currentBest) {
      updateData.quizBestScore = score
    }
  }

  const progress = await prisma.onboardingProgress.update({
    where: { employeeId },
    data: updateData,
  })

  // Return score and passed status (not the correct answers)
  return NextResponse.json({ ...progress, _quizResult: { score, passed, attemptNumber } })
}
