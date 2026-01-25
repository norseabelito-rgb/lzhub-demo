'use client'

import { useRouter } from 'next/navigation'
import { PostComposer } from '@/components/social/post-composer'

/**
 * New Post Page
 * Renders the PostComposer in create mode
 */
export default function NewPostPage() {
  const router = useRouter()

  // Navigate to social calendar after save
  const handleSave = () => {
    router.push('/social')
  }

  // Navigate back on cancel
  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container max-w-3xl py-6">
      <PostComposer
        mode="create"
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
