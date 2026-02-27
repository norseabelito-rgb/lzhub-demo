import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/** PUT - Update document */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { documentId } = await params
  const body = await request.json()
  const { title, content, minReadingSeconds } = body

  const doc = await prisma.onboardingDocument.update({
    where: { id: documentId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(minReadingSeconds !== undefined && { minReadingSeconds }),
    },
  })

  return NextResponse.json(doc)
}

/** DELETE - Delete document */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { documentId } = await params

  await prisma.onboardingDocument.delete({
    where: { id: documentId },
  })

  return NextResponse.json({ success: true })
}
