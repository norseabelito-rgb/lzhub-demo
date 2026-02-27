import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get('entityType')
  const entityId = searchParams.get('entityId')
  const userId = searchParams.get('userId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const action = searchParams.get('action')
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  const where: Record<string, unknown> = {}
  if (entityType) where.entityType = entityType
  if (entityId) where.entityId = entityId
  if (userId) where.userId = userId
  if (action) where.action = action

  if (from || to) {
    const createdAt: Record<string, Date> = {}
    if (from) createdAt.gte = new Date(from)
    if (to) createdAt.lte = new Date(to)
    where.createdAt = createdAt
  }

  const entries = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return NextResponse.json(entries)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const { action, entityType, entityId, details, wasWithinTimeWindow } = body

  if (!action || !entityType || !entityId) {
    return NextResponse.json(
      { error: 'action, entityType si entityId sunt obligatorii' },
      { status: 400 }
    )
  }

  const entry = await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || '',
      action,
      entityType,
      entityId,
      details: details || {},
      wasWithinTimeWindow: wasWithinTimeWindow ?? true,
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
