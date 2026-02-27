import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { scheduledAt } = body

  if (!scheduledAt) {
    return NextResponse.json({ error: 'scheduledAt este obligatoriu' }, { status: 400 })
  }

  const existing = await prisma.socialPost.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Postare negasita' }, { status: 404 })
  }

  if (existing.status === 'published') {
    return NextResponse.json({ error: 'Postarea este deja publicata' }, { status: 400 })
  }

  const post = await prisma.socialPost.update({
    where: { id },
    data: {
      scheduledAt: new Date(scheduledAt),
      status: 'scheduled',
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })

  return NextResponse.json(post)
}
