"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ManaSymbolSelector } from '@/components/settings/ManaSymbolSelector'
import { Sparkles } from 'lucide-react'

export function SettingsPanel() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-defcat-purple" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Customize your experience
        </p>
      </div>  

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your DeckVault
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ManaSymbolSelector />

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>Your preferences are saved locally</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}