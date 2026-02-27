import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/** POST - Add quiz question */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { type, text, options, correctAnswer } = body

  if (!type || !text) {
    return NextResponse.json({ error: 'Tip si text sunt obligatorii' }, { status: 400 })
  }

  // Get next sort order
  const lastQuestion = await prisma.onboardingQuizQuestion.findFirst({
    where: { configId: 'default' },
    orderBy: { sortOrder: 'desc' },
  })
  const nextOrder = (lastQuestion?.sortOrder ?? -1) + 1

  const question = await prisma.onboardingQuizQuestion.create({
    data: {
      configId: 'default',
      type,
      text,
      options: options ?? [],
      correctAnswer: correctAnswer ?? '',
      sortOrder: nextOrder,
    },
  })

  return NextResponse.json(question, { status: 201 })
}
