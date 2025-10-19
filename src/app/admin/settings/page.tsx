/**
 * Admin Site Settings Page
 */

import { requireAdmin } from '@/lib/auth-guards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Settings className="h-10 w-10 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold text-gradient">Site Settings</h1>
            <p className="text-muted-foreground mt-2">
              Configure site-wide settings and integrations
            </p>
          </div>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Site settings functionality is under development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground">
              <p className="mb-4">This page will allow you to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Configure Patreon OAuth credentials</li>
                <li>Manage Supabase connection settings</li>
                <li>Set up email notifications</li>
                <li>Configure site metadata (title, description, SEO)</li>
                <li>Manage feature flags</li>
                <li>Set up analytics integrations</li>
                <li>Configure error tracking (Sentry, etc.)</li>
                <li>Manage environment variables</li>
              </ul>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>For now:</strong> Settings are managed through environment variables in your <code className="bg-background px-1 py-0.5 rounded">.env.local</code> file
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
