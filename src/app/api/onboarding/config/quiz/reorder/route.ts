import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/** PUT - Reorder quiz questions */
export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { orderedIds } = body as { orderedIds: string[] }

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: 'orderedIds este obligatoriu' }, { status: 400 })
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.onboardingQuizQuestion.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )

  return NextResponse.json({ success: true })
}
