import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, hashtags } = body

  const existing = await prisma.hashtagSet.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Set de hashtag-uri negasit' }, { status: 404 })
  }

  const set = await prisma.hashtagSet.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(hashtags !== undefined && { hashtags }),
    },
  })

  return NextResponse.json(set)
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

  const existing = await prisma.hashtagSet.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Set de hashtag-uri negasit' }, { status: 404 })
  }

  await prisma.hashtagSet.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
