import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const tag = searchParams.get('tag')

  const where: Record<string, unknown> = {}

  if (type) {
    where.type = type
  }

  if (tag) {
    where.tags = { has: tag }
  }

  const items = await prisma.contentLibraryItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const { name, type, url, thumbnailUrl, mimeType, size, width, height, duration, tags } = body

  if (!name || !type || !url || !thumbnailUrl || !mimeType || size === undefined) {
    return NextResponse.json(
      { error: 'name, type, url, thumbnailUrl, mimeType si size sunt obligatorii' },
      { status: 400 }
    )
  }

  const item = await prisma.contentLibraryItem.create({
    data: {
      name,
      type,
      url,
      thumbnailUrl,
      mimeType,
      size,
      width: width || null,
      height: height || null,
      duration: duration || null,
      tags: tags || [],
    },
  })

  return NextResponse.json(item, { status: 201 })
}
