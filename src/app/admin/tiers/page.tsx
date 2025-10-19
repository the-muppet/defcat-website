/**
 * Admin Tier Configuration Page
 */

import { requireAdmin } from '@/lib/auth-guards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default async function AdminTiersPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Package className="h-10 w-10 text-defcat-blue" />
          <div>
            <h1 className="text-4xl font-bold text-gradient">Tier Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Configure Patreon tier benefits and access levels
            </p>
          </div>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Tier configuration functionality is under development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground">
              <p className="mb-4">This page will allow you to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Configure Patreon tier names and pricing</li>
                <li>Set deck access levels for each tier</li>
                <li>Manage feature permissions per tier</li>
                <li>Define tier-specific benefits</li>
                <li>Set up tier upgrade paths</li>
                <li>Preview tier comparison table</li>
              </ul>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Current tiers:</strong> Citizen, Cat, DefCat, ChonkCat
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tier definitions are currently managed in <code className="bg-background px-1 py-0.5 rounded">src/types/core.ts</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
