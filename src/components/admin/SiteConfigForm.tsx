'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Youtube, Twitter, Users, DollarSign, Globe, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ConfigItem {
  key: string
  value: string
  category: string
  description: string
  is_sensitive: boolean
}

export function SiteConfigForm() {
  const [config, setConfig] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      console.log('Loading site config...')
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Loaded config:', data)
      setConfig(data)
    } catch (err) {
      console.error('Failed to load config:', err)
      setError(`Failed to load configuration: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    console.log('handleChange called:', key, value)
    setConfig(prev => {
      const updated = prev.map(item =>
        item.key === key ? { ...item, value } : item
      )
      console.log('Updated config:', updated)
      return updated
    })
    setSuccess(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('Starting save...', config)

      // Update all config items
      const updates = config.map(item => ({
        key: item.key,
        value: item.value,
        updated_at: new Date().toISOString()
      }))

      console.log('Updates to apply:', updates)

      for (const update of updates) {
        console.log(`Updating ${update.key}...`)
        const { data, error, count } = await supabase
          .from('site_config')
          .update({ value: update.value, updated_at: update.updated_at })
          .eq('key', update.key)
          .select()

        console.log(`Result for ${update.key}:`, { data, error, count })

        if (error) {
          console.error(`Failed to update ${update.key}:`, error)
          throw error
        }

        if (!data || data.length === 0) {
          console.warn(`Warning: Update for ${update.key} returned no data (RLS policy might be blocking)`)
        }
      }

      console.log('All updates successful!')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save config:', err)
      setError(`Failed to save configuration: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const getConfigValue = (key: string) => {
    return config.find(item => item.key === key)?.value || ''
  }

  const getConfigItem = (key: string) => {
    return config.find(item => item.key === key)
  }

  const renderConfigInput = (key: string, label: string, placeholder?: string) => {
    const item = getConfigItem(key)
    if (!item) return null

    return (
      <div className="space-y-2">
        <label htmlFor={key} className="text-sm font-medium">{label}</label>
        {item.description && (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        )}
        <Input
          id={key}
          type="text"
          value={item.value || ''}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
          className="font-mono text-sm"
        />
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="glass-panel">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="p-4 bg-muted rounded-lg text-xs">
        <p><strong>Debug:</strong> Loaded {config.length} config items</p>
        <p>Loading: {loading ? 'true' : 'false'}</p>
        {config.length > 0 && <p>First item: {config[0].key} = "{config[0].value}"</p>}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
          <p className="text-sm text-green-500">Configuration saved successfully!</p>
        </div>
      )}

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="videos">
            <Youtube className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="social">
            <Users className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="products">
            <DollarSign className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Video Configuration</CardTitle>
              <CardDescription>
                Configure YouTube video IDs for featured videos across the site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderConfigInput('college_video_id', 'Commander College Video', 'e.g., dQw4w9WgXcQ')}
              {renderConfigInput('featured_video_id', 'Featured Video (Home)', 'e.g., dQw4w9WgXcQ')}
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> The video ID is the part after <code>?v=</code> in YouTube URLs.
                  For example: <code>youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong></code>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Configure social media profile URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderConfigInput('youtube_url', 'YouTube Channel', 'https://youtube.com/@defcat')}
              {renderConfigInput('twitter_url', 'Twitter/X Profile', 'https://twitter.com/defcat')}
              {renderConfigInput('discord_url', 'Discord Server', 'https://discord.gg/defcat')}
              {renderConfigInput('patreon_url', 'Patreon Page', 'https://patreon.com/defcat')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Product Affiliate Links</CardTitle>
              <CardDescription>
                Configure affiliate links for the discount store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderConfigInput('playmat_link', 'Playmat Bundle')}
              {renderConfigInput('deckbox_link', 'Deck Box')}
              {renderConfigInput('sleeves_link', 'Card Sleeves')}
              {renderConfigInput('dice_link', 'Dice Set')}
              {renderConfigInput('chair_link', 'Gaming Chair')}
              {renderConfigInput('mousepad_link', 'Mousepad')}
              {renderConfigInput('storage_link', 'Card Storage')}
              {renderConfigInput('apparel_link', 'Apparel')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Site metadata and general configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderConfigInput('site_title', 'Site Title')}
              {renderConfigInput('site_description', 'Site Description')}
              {renderConfigInput('admin_email', 'Admin Email')}
            </CardContent>
          </Card>

          <Card className="glass-panel border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="text-yellow-500">API Keys & Secrets</CardTitle>
              <CardDescription>
                Sensitive API keys are managed through environment variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                For security, API keys and secrets are stored in your <code className="bg-background px-1 py-0.5 rounded">.env.local</code> file:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li><code>RESEND_API_KEY</code> - Email service API key</li>
                <li><code>PATREON_CLIENT_ID</code> - Patreon OAuth client ID</li>
                <li><code>PATREON_CLIENT_SECRET</code> - Patreon OAuth secret</li>
                <li><code>SUPABASE_SERVICE_ROLE_KEY</code> - Supabase admin key</li>
              </ul>
              <p className="text-xs text-yellow-500 mt-4">
                Never commit <code>.env.local</code> to version control!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="btn-tinted-primary shadow-tinted-glow"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
