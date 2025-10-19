/**
 * Admin Dashboard - Main Overview Page
 */

import { requireAdmin } from '@/lib/auth-guards';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Users, Package, Settings } from 'lucide-react';

export default async function AdminDashboard() {
  // Require admin role - will redirect if not admin
  await requireAdmin();

  const supabase = await createClient();

  // Get stats
  const [
    { count: deckCount },
    { count: userCount }
  ] = await Promise.all([
    supabase.from('decks').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ]);

  return (
    <div className="container mx-auto px-4 py-8" data-page="admin-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage decks, users, and site content
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deckCount || 0}</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userCount || 0}</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Patrons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">-</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Premium Decks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">-</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel">
            <CardHeader>
              <Database className="h-8 w-8 mb-2 text-defcat-purple" />
              <CardTitle>Deck Management</CardTitle>
              <CardDescription>
                Import, edit, and manage deck listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/admin/decks">Manage Decks</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/decks/import">Import from Moxfield</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-defcat-pink" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user accounts and tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <Package className="h-8 w-8 mb-2 text-defcat-blue" />
              <CardTitle>Tier Configuration</CardTitle>
              <CardDescription>
                Configure Patreon tier settings and benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/tiers">Manage Tiers</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <Settings className="h-8 w-8 mb-2 text-purple-500" />
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure site-wide settings and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/settings">Site Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
