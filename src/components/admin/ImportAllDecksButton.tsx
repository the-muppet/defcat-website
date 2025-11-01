'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/client'

export function ImportAllDecksButton() {
  const [importing, setImporting] = useState(false)

  const handleImportAll = async () => {
    setImporting(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.functions.invoke('fetch-decks', {
        body: {},
      })

      if (error) {
        throw new Error(error.message || 'Failed to trigger import')
      }

      const _result = data

      toast.success('Import started successfully!', {
        description: 'The Moxfield scraper is now running. This may take a few minutes.',
        duration: 5000,
      })

      // Reload the page after a delay to show new decks
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      toast.error('Failed to start import', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 5000,
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleImportAll}
            disabled={importing}
            variant="outline"
            className="border-blue-500/20 hover:bg-blue-500/10 text-blue-500"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Fetch All (New)
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Import only new decks that don't exist in the database</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
