/**
 * Admin Users Management Page
 */

import { requireAdmin } from '@/lib/auth-guards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Users className="h-10 w-10 text-defcat-pink" />
          <div>
            <h1 className="text-4xl font-bold text-gradient">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage user accounts, roles, and tier assignments
            </p>
          </div>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              User management functionality is under development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground">
              <p className="mb-4">This page will allow you to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>View all registered users</li>
                <li>Search and filter users by email, tier, or role</li>
                <li>Update user roles (admin, moderator, user)</li>
                <li>Manually assign Patreon tiers</li>
                <li>View user activity and login history</li>
                <li>Manage user permissions</li>
              </ul>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>For now:</strong> User roles can be managed directly in the Supabase dashboard
                by updating the <code className="bg-background px-1 py-0.5 rounded">profiles</code> table.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
