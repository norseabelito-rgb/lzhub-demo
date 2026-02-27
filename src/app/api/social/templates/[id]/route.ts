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

  const template = await prisma.socialTemplate.findUnique({
    where: { id },
  })

  if (!template) {
    return NextResponse.json({ error: 'Template negasit' }, { status: 404 })
  }

  return NextResponse.json(template)
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
  const body = await request.json()
  const { name, content, category } = body

  const existing = await prisma.socialTemplate.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Template negasit' }, { status: 404 })
  }

  const template = await prisma.socialTemplate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(content !== undefined && { content }),
      ...(category !== undefined && { category }),
    },
  })

  return NextResponse.json(template)
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

  const existing = await prisma.socialTemplate.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Template negasit' }, { status: 404 })
  }

  await prisma.socialTemplate.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
