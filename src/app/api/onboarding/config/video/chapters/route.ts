import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/** POST - Add a chapter */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { title, timestamp } = body

  if (!title || timestamp === undefined) {
    return NextResponse.json({ error: 'Titlu si timestamp sunt obligatorii' }, { status: 400 })
  }

  // Get next sort order
  const lastChapter = await prisma.onboardingVideoChapter.findFirst({
    where: { configId: 'default' },
    orderBy: { sortOrder: 'desc' },
  })
  const nextOrder = (lastChapter?.sortOrder ?? -1) + 1

  const chapter = await prisma.onboardingVideoChapter.create({
    data: {
      configId: 'default',
      title,
      timestamp,
      sortOrder: nextOrder,
    },
  })

  return NextResponse.json(chapter, { status: 201 })
}
