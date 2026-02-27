import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink, readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'

const CHUNK_DIR = join('/tmp', 'onboarding-video-chunks')
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'onboarding')
const MAX_SIZE = 1024 * 1024 * 1024 // 1 GB

/** POST - Upload video chunk or finalize upload */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const formData = await request.formData()
  const action = formData.get('action') as string

  if (action === 'chunk') {
    // Handle chunk upload
    const chunk = formData.get('chunk') as File
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    const uploadId = formData.get('uploadId') as string
    const totalSize = parseInt(formData.get('totalSize') as string)

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId) {
      return NextResponse.json({ error: 'Date lipsa' }, { status: 400 })
    }

    if (totalSize > MAX_SIZE) {
      return NextResponse.json({ error: 'Fisierul depaseste limita de 1GB' }, { status: 400 })
    }

    const chunkDir = join(CHUNK_DIR, uploadId)
    await mkdir(chunkDir, { recursive: true })

    const buffer = Buffer.from(await chunk.arrayBuffer())
    await writeFile(join(chunkDir, `chunk-${chunkIndex.toString().padStart(5, '0')}`), buffer)

    return NextResponse.json({
      chunkIndex,
      totalChunks,
      received: true,
    })
  }

  if (action === 'finalize') {
    const uploadId = formData.get('uploadId') as string
    const fileName = formData.get('fileName') as string
    const totalSize = parseInt(formData.get('totalSize') as string)

    if (!uploadId || !fileName) {
      return NextResponse.json({ error: 'Date lipsa' }, { status: 400 })
    }

    const chunkDir = join(CHUNK_DIR, uploadId)
    if (!existsSync(chunkDir)) {
      return NextResponse.json({ error: 'Upload negasit' }, { status: 404 })
    }

    // Concatenate chunks
    await mkdir(UPLOAD_DIR, { recursive: true })
    const chunks = await readdir(chunkDir)
    chunks.sort() // Sorted by padded index

    const ext = fileName.split('.').pop() || 'mp4'
    const outputFileName = `training-video-${Date.now()}.${ext}`
    const outputPath = join(UPLOAD_DIR, outputFileName)

    const allBuffers: Buffer[] = []
    for (const chunkFile of chunks) {
      const buf = await readFile(join(chunkDir, chunkFile))
      allBuffers.push(buf)
    }
    await writeFile(outputPath, Buffer.concat(allBuffers))

    // Cleanup chunks
    for (const chunkFile of chunks) {
      await unlink(join(chunkDir, chunkFile)).catch(() => {})
    }
    await unlink(chunkDir).catch(() => {})

    // Delete old video if exists
    const config = await prisma.onboardingConfig.findUnique({ where: { id: 'default' } })
    if (config?.videoUrl) {
      try {
        await unlink(join(process.cwd(), 'public', config.videoUrl))
      } catch {
        // ignore
      }
    }

    const videoUrl = `/uploads/onboarding/${outputFileName}`

    await prisma.onboardingConfig.update({
      where: { id: 'default' },
      data: {
        videoUrl,
        videoFileName: fileName,
        videoFileSize: totalSize,
        updatedBy: session.user.id,
      },
    })

    return NextResponse.json({ videoUrl, fileName, fileSize: totalSize })
  }

  return NextResponse.json({ error: 'Actiune necunoscuta' }, { status: 400 })
}
