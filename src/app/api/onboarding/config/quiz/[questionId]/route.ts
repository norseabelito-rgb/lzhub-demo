import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/** PUT - Update question */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { questionId } = await params
  const body = await request.json()
  const { type, text, options, correctAnswer } = body

  const question = await prisma.onboardingQuizQuestion.update({
    where: { id: questionId },
    data: {
      ...(type !== undefined && { type }),
      ...(text !== undefined && { text }),
      ...(options !== undefined && { options }),
      ...(correctAnswer !== undefined && { correctAnswer }),
    },
  })

  return NextResponse.json(question)
}

/** DELETE - Delete question */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { questionId } = await params

  await prisma.onboardingQuizQuestion.delete({
    where: { id: questionId },
  })

  return NextResponse.json({ success: true })
}
