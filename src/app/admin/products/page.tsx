import { Package } from 'lucide-react'
import { ProductsPanel } from '@/components/admin/ProductsPanel'
import { requireAdminAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  await requireAdminAccess()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Package className="h-10 w-10 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold">Products Management</h1>
            <p className="text-muted-foreground mt-1">Manage product links for the store</p>
          </div>
        </div>

        <ProductsPanel />
      </div>
    </div>
  )
}
