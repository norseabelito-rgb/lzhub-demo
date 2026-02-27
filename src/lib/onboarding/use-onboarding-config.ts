'use client'

import { useState, useEffect } from 'react'
import type { OnboardingPublicConfig } from './config-types'

/**
 * Hook to fetch the public onboarding config (without correctAnswer)
 * Used by the employee onboarding wizard
 */
export function useOnboardingConfig() {
  const [config, setConfig] = useState<OnboardingPublicConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchConfig() {
      try {
        const res = await fetch('/api/onboarding/config/public')
        if (!res.ok) {
          throw new Error('Eroare la incarcarea configurarii')
        }
        const data = await res.json()
        if (!cancelled) {
          setConfig(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message)
          setIsLoading(false)
        }
      }
    }

    fetchConfig()

    return () => {
      cancelled = true
    }
  }, [])

  return { config, isLoading, error }
}
