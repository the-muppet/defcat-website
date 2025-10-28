// app/hooks/use-moxfield-sync.ts
import { useState } from 'react'
import type { MoxfieldSyncParams, MoxfieldSyncResponse } from '@/types/moxfield'

export function useMoxfieldSync() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MoxfieldSyncResponse | null>(null)

  const sync = async (params: MoxfieldSyncParams) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/moxfield-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }
      
      setData(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { sync, isLoading, error, data }
}