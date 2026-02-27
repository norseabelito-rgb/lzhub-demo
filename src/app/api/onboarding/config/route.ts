import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

const CONFIG_INCLUDE = {
  documents: { orderBy: { sortOrder: 'asc' as const } },
  chapters: { orderBy: { sortOrder: 'asc' as const } },
  questions: { orderBy: { sortOrder: 'asc' as const } },
}

/** GET - Returns full config with documents, chapters, questions. Auto-creates default if missing. */
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  let config = await prisma.onboardingConfig.findUnique({
    where: { id: 'default' },
    include: CONFIG_INCLUDE,
  })

  if (!config) {
    // Auto-create default config
    config = await prisma.onboardingConfig.create({
      data: {
        id: 'default',
        ndaContent: '<p>Configurati continutul NDA.</p>',
        quizPassThreshold: 80,
        quizMaxAttempts: 3,
      },
      include: CONFIG_INCLUDE,
    })
  }

  return NextResponse.json(config)
}

/** PUT - Update config fields. Manager only. */
export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }
  if (session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const updateData: Record<string, unknown> = { updatedBy: session.user.id }

  if (body.ndaContent !== undefined) updateData.ndaContent = body.ndaContent
  if (body.quizPassThreshold !== undefined) updateData.quizPassThreshold = body.quizPassThreshold
  if (body.quizMaxAttempts !== undefined) updateData.quizMaxAttempts = body.quizMaxAttempts
  if (body.videoDescription !== undefined) updateData.videoDescription = body.videoDescription

  const config = await prisma.onboardingConfig.update({
    where: { id: 'default' },
    data: updateData,
    include: CONFIG_INCLUDE,
  })

  return NextResponse.json(config)
}
