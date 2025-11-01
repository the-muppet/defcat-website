// app/admin/page.tsx
/**
 * Admin Dashboard - Main Overview Page
 * Updated with accessible tinted styling
 */

import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Database,
  Package,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlowingEffect } from '@/components/ui/glowEffect'
import { requireAdminAccess, requireModeratorAccess } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  await requireModeratorAccess()

  const supabase = await createClient()

  const [{ count: deckCount }, { count: userCount }, { count: pendingCount }] = await Promise.all([
    supabase.from('moxfield_decks').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('deck_submissions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'queued']),
  ])

  return (
    <div className="container mx-auto px-4 py-8" data-page="admin-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Manage decks, users, and site content</p>
          </div>
        </div>

        {/* Stats Grid with tinted cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Decks
              </CardTitle>
              <Database className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{deckCount || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Active listings</div>
            </CardContent>
          </Card>
          </div>

          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{userCount || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Registered accounts</div>
            </CardContent>
          </Card>
          </div>

          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
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
          </div>

          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                  Premium Decks
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">-</div>
              <div className="text-xs text-muted-foreground mt-1">Tier exclusive</div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Quick Actions with tinted cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <Database className="h-8 w-8 mb-2" style={{ color: 'var(--mana-color)' }} />
              <CardTitle className="text-foreground">Deck Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Import, edit, and manage deck listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild className="w-full btn-tinted-primary">
                  <Link href="/admin/decks">Manage Decks</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-tinted hover:bg-accent-tinted"
                >
                  <Link href="/admin/decks/import">Import from Moxfield</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>

          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <ClipboardList className="h-8 w-8 mb-2" style={{ color: 'var(--mana-color)' }} />
              <CardTitle className="text-foreground">Pending Submissions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Review and manage deck submission requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full btn-tinted-primary">
                <Link href="/admin/submissions">
                  View Submissions {pendingCount ? `(${pendingCount})` : ''}
                </Link>
              </Button>
            </CardContent>
          </Card>
          </div>

          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <Users className="h-8 w-8 mb-2" style={{ color: 'var(--mana-color)' }} />
              <CardTitle className="text-foreground">User Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage user accounts and tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full btn-tinted-primary">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
          </div>

          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <Package className="h-8 w-8 mb-2" style={{ color: 'var(--mana-color)' }} />
              <CardTitle className="text-foreground">Products Configuration</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage Fourthwall product links for the store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full btn-tinted-primary">
                <Link href="/admin/products">Manage Products</Link>
              </Button>
            </CardContent>
          </Card>
          </div>

          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <Settings className="h-8 w-8 mb-2" style={{ color: 'var(--mana-color)' }} />
              <CardTitle className="text-foreground">Site Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure site-wide settings and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full btn-tinted-primary">
                <Link href="/admin/settings">Site Settings</Link>
              </Button>
            </CardContent>
          </Card>
          </div>

          <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="card-glass border-0 hover:shadow-tinted-lg transition-all relative">
            <CardHeader>
              <BookOpen className="h-8 w-8 mb-2" style={{ color: 'var(--mana-color)' }} />
              <CardTitle className="text-foreground">Documentation</CardTitle>
              <CardDescription className="text-muted-foreground">
                System architecture diagrams and technical documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full btn-tinted-primary">
                <Link href="/admin/docs">View Documentation</Link>
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
