// app/admin/credits/page.tsx
import { Coins, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { requireAdmin } from '@/lib/auth/auth-guards'
import { TierBenefitsMatrix } from '@/components/admin/CreditMatrix'
import { CreditTypesList } from '@/components/admin/CreditList'
import { DistributionManager } from '@/components/admin/DistributionManager'

export const dynamic = 'force-dynamic'

export default async function AdminCreditsPage() {
  await requireAdmin()

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Coins className="h-10 w-10" style={{ color: 'var(--mana-color)' }} />
          <div>
            <h1 className="text-4xl font-bold text-gradient">Credit System</h1>
            <p className="text-muted-foreground mt-2">
              Manage credit types, tiers, and monthly benefit distributions
            </p>
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="matrix" className="space-y-6">
          <TabsList className="glass-tinted">
            <TabsTrigger value="matrix">Benefits Matrix</TabsTrigger>
            <TabsTrigger value="credits">Credit Types</TabsTrigger>
            <TabsTrigger value="tiers">Tiers</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix">
            <TierBenefitsMatrix />
          </TabsContent>

          <TabsContent value="credits">
            <CreditTypesList />
          </TabsContent>

          <TabsContent value="distribution">
            <DistributionManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}