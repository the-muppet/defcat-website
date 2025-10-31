'use client'

import { Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function UpdateAllDecksButton() {
  const [updating, setUpdating] = useState(false)

  const handleUpdateAll = async () => {
    setUpdating(true)

    try {
      const response = await fetch(
        'https://paerhoqoypdezkqhzimk.supabase.co/functions/v1/sync-bookmark',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookmarkId: 'xpGzQ',
            forceRescrape: true,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to trigger update')
      }

      const _result = await response.json()

      toast.success('Update started successfully!', {
        description: 'All decks are being rescraped from Moxfield. This may take several minutes.',
        duration: 5000,
      })

      // Reload the page after a delay to show updated decks
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    } catch (error) {
      toast.error('Failed to start update', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 5000,
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleUpdateAll}
            disabled={updating}
            variant="outline"
            className="border-green-500/20 hover:bg-green-500/10 text-green-500"
          >
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Fetch All (Force)
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Force rescrape all existing decks to update their data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
