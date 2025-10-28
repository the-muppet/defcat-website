import { requireAdmin } from '@/lib/auth/require-admin'
import { createClient } from '@/lib/supabase/server'
import { UserRoleManager } from '@/components/admin/UserRoleManager'
import { DeveloperTools } from '@/components/admin/DeveloperTools'
import { Users } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  await requireAdmin()

  const supabase = await createClient()

  // Get current user's role
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const userRole = profile?.role as 'admin' | 'moderator' | 'developer'
  const isDeveloper = userRole === 'developer'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Users className="h-10 w-10 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserRoleManager currentUserRole={userRole} />

          {isDeveloper && <DeveloperTools />}
        </div>
      </div>
    </div>
  )
}
