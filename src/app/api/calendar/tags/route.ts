import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(tags)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const { name, color } = body

  if (!name || !color) {
    return NextResponse.json(
      { error: 'Numele si culoarea sunt obligatorii' },
      { status: 400 }
    )
  }

  const existing = await prisma.tag.findUnique({ where: { name } })
  if (existing) {
    return NextResponse.json(
      { error: 'Un tag cu acest nume exista deja' },
      { status: 400 }
    )
  }

  const tag = await prisma.tag.create({
    data: { name, color },
  })

  return NextResponse.json(tag, { status: 201 })
}
