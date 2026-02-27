import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const sets = await prisma.hashtagSet.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(sets)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const { name, hashtags } = body

  if (!name || !hashtags || !Array.isArray(hashtags)) {
    return NextResponse.json(
      { error: 'name si hashtags (array) sunt obligatorii' },
      { status: 400 }
    )
  }

  const set = await prisma.hashtagSet.create({
    data: { name, hashtags },
  })

  return NextResponse.json(set, { status: 201 })
}
