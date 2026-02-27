import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const where: Record<string, unknown> = {}

  if (status) {
    where.status = status
  }

  if (from || to) {
    const scheduledAt: Record<string, Date> = {}
    if (from) scheduledAt.gte = new Date(from)
    if (to) scheduledAt.lte = new Date(to)
    where.scheduledAt = scheduledAt
  }

  const posts = await prisma.socialPost.findMany({
    where,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const { caption, mediaIds, hashtags, platforms, scheduledAt } = body

  if (!caption || !platforms || platforms.length === 0) {
    return NextResponse.json(
      { error: 'caption si platforms sunt obligatorii' },
      { status: 400 }
    )
  }

  const status = scheduledAt ? 'scheduled' : 'draft'

  const post = await prisma.socialPost.create({
    data: {
      caption,
      mediaIds: mediaIds || [],
      hashtags: hashtags || [],
      platforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status,
      platformStatuses: {},
      metrics: {},
      createdById: session.user.id,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })

  return NextResponse.json(post, { status: 201 })
}
