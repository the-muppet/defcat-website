import { Users } from 'lucide-react'
import { UserRoleManager } from '@/components/admin/UserRoleManager'
import { requireAdmin } from '@/lib/auth/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const { role } = await requireAdmin()

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
          <UserRoleManager currentUserRole={role} />
        </div>
      </div>
    </div>
  )
}
