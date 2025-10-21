import { requireDeveloper } from '@/lib/auth/require-developer'
import { DatabasePanel } from '@/components/admin/DatabasePanel'
import { Database } from 'lucide-react'

export default async function DeveloperDatabasePage() {
  await requireDeveloper()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Database className="h-10 w-10 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold">Database Management</h1>
            <p className="text-muted-foreground mt-1">
              Execute SQL queries and manage database schema
            </p>
          </div>
        </div>

        <DatabasePanel />
      </div>
    </div>
  )
}
