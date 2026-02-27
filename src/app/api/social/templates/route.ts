import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const templates = await prisma.socialTemplate.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(templates)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const { name, content, category } = body

  if (!name || !content || !category) {
    return NextResponse.json(
      { error: 'name, content si category sunt obligatorii' },
      { status: 400 }
    )
  }

  const template = await prisma.socialTemplate.create({
    data: { name, content, category },
  })

  return NextResponse.json(template, { status: 201 })
}
