'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export interface SignatureDisplayProps {
  /** Base64 data URL of the signature image */
  dataUrl: string
  /** Name of the person who signed */
  signerName: string
  /** Date and time when signature was captured */
  signedAt: Date
  /** Additional CSS classes */
  className?: string
}

/**
 * Display a captured signature with signer info
 * Shows the signature image with name and timestamp below
 */
export function SignatureDisplay({
  dataUrl,
  signerName,
  signedAt,
  className,
}: SignatureDisplayProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Signature image container */}
      <div className="border border-border rounded-lg bg-muted/30 p-2 max-w-[400px]">
        <Image
          src={dataUrl}
          alt={`Semnatura ${signerName}`}
          width={380}
          height={150}
          className="w-full h-auto object-contain"
          unoptimized // Base64 images should not be optimized
        />
      </div>

      {/* Signer info */}
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {signerName}
        </span>
        <span className="text-xs text-muted-foreground">
          {format(signedAt, "d MMMM yyyy, HH:mm", { locale: ro })}
        </span>
      </div>
    </div>
  )
}
