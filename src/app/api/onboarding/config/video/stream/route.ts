import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { stat, open } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'

/** GET - Stream the onboarding video file from disk */
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const config = await prisma.onboardingConfig.findUnique({
    where: { id: 'default' },
    select: { videoUrl: true },
  })

  if (!config?.videoUrl) {
    return NextResponse.json({ error: 'Niciun video configurat' }, { status: 404 })
  }

  // videoUrl is like /uploads/onboarding/training-video-xxx.mp4
  const filePath = join(process.cwd(), 'public', config.videoUrl)

  let fileStats
  try {
    fileStats = await stat(filePath)
  } catch {
    return NextResponse.json({ error: 'Fisierul video nu a fost gasit pe disk' }, { status: 404 })
  }

  const fileSize = fileStats.size
  const ext = filePath.split('.').pop()?.toLowerCase() || 'mp4'
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
  }
  const contentType = mimeTypes[ext] || 'video/mp4'

  // Support Range requests for video seeking
  const rangeHeader = request.headers.get('range')

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
    if (match) {
      const start = parseInt(match[1])
      const end = match[2] ? parseInt(match[2]) : fileSize - 1
      const chunkSize = end - start + 1

      const fileHandle = await open(filePath, 'r')
      const stream = fileHandle.createReadStream({ start, end })

      const webStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk: Buffer | string) => controller.enqueue(chunk))
          stream.on('end', () => controller.close())
          stream.on('error', (err) => controller.error(err))
        },
        cancel() {
          stream.destroy()
          fileHandle.close()
        },
      })

      return new Response(webStream, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunkSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }
  }

  // Full file response
  const fileHandle = await open(filePath, 'r')
  const stream = fileHandle.createReadStream()

  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk: Buffer | string) => controller.enqueue(chunk))
      stream.on('end', () => controller.close())
      stream.on('error', (err) => controller.error(err))
    },
    cancel() {
      stream.destroy()
      fileHandle.close()
    },
  })

  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': fileSize.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
