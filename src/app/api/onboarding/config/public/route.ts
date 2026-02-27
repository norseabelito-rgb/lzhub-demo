import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/** GET - Public config for employees (no correctAnswer on questions) */
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const config = await prisma.onboardingConfig.findUnique({
    where: { id: 'default' },
    include: {
      documents: { orderBy: { sortOrder: 'asc' } },
      chapters: { orderBy: { sortOrder: 'asc' } },
      questions: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!config) {
    return NextResponse.json({ error: 'Config negasit' }, { status: 404 })
  }

  // Strip correctAnswer from questions
  const publicQuestions = config.questions.map(({ correctAnswer, ...q }) => q)

  return NextResponse.json({
    id: config.id,
    ndaContent: config.ndaContent,
    videoUrl: config.videoUrl,
    videoFileName: config.videoFileName,
    videoDescription: config.videoDescription,
    quizPassThreshold: config.quizPassThreshold,
    quizMaxAttempts: config.quizMaxAttempts,
    documents: config.documents,
    chapters: config.chapters,
    questions: publicQuestions,
  })
}
