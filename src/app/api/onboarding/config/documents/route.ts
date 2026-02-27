import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/** POST - Create a new document */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { title, content, minReadingSeconds } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'Titlu si continut sunt obligatorii' }, { status: 400 })
  }

  // Get next sort order
  const lastDoc = await prisma.onboardingDocument.findFirst({
    where: { configId: 'default' },
    orderBy: { sortOrder: 'desc' },
  })
  const nextOrder = (lastDoc?.sortOrder ?? -1) + 1

  const doc = await prisma.onboardingDocument.create({
    data: {
      configId: 'default',
      title,
      content,
      minReadingSeconds: minReadingSeconds ?? 30,
      sortOrder: nextOrder,
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
