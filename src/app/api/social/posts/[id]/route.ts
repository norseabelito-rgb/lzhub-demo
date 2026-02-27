import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params

  const post = await prisma.socialPost.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })

  if (!post) {
    return NextResponse.json({ error: 'Postare negasita' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(
  request: Request,
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

  if (existing.status !== 'draft' && existing.status !== 'scheduled') {
    return NextResponse.json(
      { error: 'Doar postarile draft sau programate pot fi actualizate' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { caption, mediaIds, hashtags, platforms } = body

  const post = await prisma.socialPost.update({
    where: { id },
    data: {
      ...(caption !== undefined && { caption }),
      ...(mediaIds !== undefined && { mediaIds }),
      ...(hashtags !== undefined && { hashtags }),
      ...(platforms !== undefined && { platforms }),
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })

  return NextResponse.json(post)
}

export async function DELETE(
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

  if (existing.status !== 'draft') {
    return NextResponse.json(
      { error: 'Doar postarile draft pot fi sterse' },
      { status: 400 }
    )
  }

  await prisma.socialPost.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
