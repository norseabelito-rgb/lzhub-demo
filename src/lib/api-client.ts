export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new ApiError(errorData.error || 'Request failed', res.status, errorData)
  }
  return res.json()
}
