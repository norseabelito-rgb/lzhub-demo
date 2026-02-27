import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/** PUT - Update chapter */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { chapterId } = await params
  const body = await request.json()
  const { title, timestamp } = body

  const chapter = await prisma.onboardingVideoChapter.update({
    where: { id: chapterId },
    data: {
      ...(title !== undefined && { title }),
      ...(timestamp !== undefined && { timestamp }),
    },
  })

  return NextResponse.json(chapter)
}

/** DELETE - Delete chapter */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { chapterId } = await params

  await prisma.onboardingVideoChapter.delete({
    where: { id: chapterId },
  })

  return NextResponse.json({ success: true })
}
