import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

/** DELETE - Delete video file and clear config */
export async function DELETE() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const config = await prisma.onboardingConfig.findUnique({
    where: { id: 'default' },
  })

  if (config?.videoUrl) {
    // Delete file from disk
    try {
      const filePath = join(process.cwd(), 'public', config.videoUrl)
      await unlink(filePath)
    } catch {
      // File might not exist, continue
    }
  }

  await prisma.onboardingConfig.update({
    where: { id: 'default' },
    data: {
      videoUrl: null,
      videoFileName: null,
      videoFileSize: null,
      updatedBy: session.user.id,
    },
  })

  return NextResponse.json({ success: true })
}
