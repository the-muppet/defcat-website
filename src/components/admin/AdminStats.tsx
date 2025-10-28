import { BarChart3, Database, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export async function AdminStats() {
  const supabase = await createClient()

  const [{ count: deckCount }, { count: userCount }] = await Promise.all([
    supabase.from('decks').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glass-tinted border-tinted hover:shadow-tinted-lg transition-all">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Decks</CardTitle>
          <Database className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{deckCount || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">Active listings</div>
        </CardContent>
      </Card>

      <Card className="glass-tinted border-tinted hover:shadow-tinted-lg transition-all">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{userCount || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">Registered accounts</div>
        </CardContent>
      </Card>

      <Card className="glass-tinted border-tinted hover:shadow-tinted-lg transition-all">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Patrons
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">-</div>
          <div className="text-xs text-muted-foreground mt-1">With benefits</div>
        </CardContent>
      </Card>

      <Card className="glass-tinted border-tinted hover:shadow-tinted-lg transition-all">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Premium Decks</CardTitle>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">-</div>
          <div className="text-xs text-muted-foreground mt-1">Tier exclusive</div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="glass-tinted border-tinted">
          <CardHeader>
            <div className="h-4 w-24 bg-accent-tinted rounded shimmer-tinted" />
          </CardHeader>
          <CardContent>
            <div className="h-9 w-16 bg-accent-tinted rounded shimmer-tinted mb-2" />
            <div className="h-3 w-20 bg-accent-tinted rounded shimmer-tinted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
