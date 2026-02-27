import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params

  const tag = await prisma.tag.findUnique({ where: { id } })
  if (!tag) {
    return NextResponse.json({ error: 'Tag negasit' }, { status: 404 })
  }

  // Cascade delete will remove CustomerTag associations
  await prisma.tag.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
