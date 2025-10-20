/**
 * Admin Site Settings Page
 */

import { requireAdmin } from '@/lib/auth-guards';
import { Settings } from 'lucide-react';
import { SiteConfigForm } from '@/components/admin/SiteConfigForm';

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
              Configure site-wide settings, videos, social links, and product affiliates
            </p>
          </div>
        </div>

        <SiteConfigForm />
      </div>
    </div>
  );
}
