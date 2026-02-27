import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.socialPost.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Postare negasita' }, { status: 404 })
  }

  if (existing.status === 'published') {
    return NextResponse.json({ error: 'Postarea este deja publicata' }, { status: 400 })
  }

  const now = new Date()

  const post = await prisma.socialPost.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: now,
      metrics: {},
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })

  return NextResponse.json(post)
}
