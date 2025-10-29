/**
 * Admin Site Settings Page
 */

import { Coins, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditTypesList } from '@/components/admin/CreditList'
import { TierBenefitsMatrix } from '@/components/admin/CreditMatrix'
import { DistributionManager } from '@/components/admin/DistributionManager'
import { SiteConfigForm } from '@/components/forms/SiteConfigForm'
import { requireAdmin } from '@/lib/auth/auth-guards'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  await requireAdmin()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdminOrDeveloper = profile?.role === 'admin' || profile?.role === 'developer'

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Settings className="h-10 w-10 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold text-gradient">Site Settings</h1>
            <p className="text-muted-foreground mt-2">
              Configure site-wide settings, videos, social links, and product affiliates
            </p>
          </div>
        </div>

        <Tabs defaultValue="site" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="site">
              <Settings className="h-4 w-4 mr-2" />
              Site Settings
            </TabsTrigger>
            {isAdminOrDeveloper && (
              <TabsTrigger value="credits">
                <Coins className="h-4 w-4 mr-2" />
                Credits
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="site" className="mt-6">
        <SiteConfigForm />
          </TabsContent>

          {isAdminOrDeveloper && (
            <TabsContent value="credits" className="mt-6 space-y-6">
              <CreditTypesList />
              <TierBenefitsMatrix />
              <DistributionManager />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
