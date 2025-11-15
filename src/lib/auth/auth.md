# Examples for using each type of auth correctly

```ts
// Server components
import { requireAuth, requireRole, requireTier } from '@/lib/auth/server'

export default async function AdminPage() {
  const { user, role } = await requireRole('admin')
  return <div>Welcome admin {user.email}</div>
}

// API routes
import { requireAuth, requireRole, ApiErrors } from '@/lib/auth/api'

export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response
  
  const { user } = authResult.data
  return NextResponse.json({ user })
}

// Client components
import { useAuth, useRoleAccess, useTierAccess } from '@/lib/auth/client'

export function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  const { isAdmin } = useRoleAccess()
  const { hasKnight } = useTierAccess()
  
  return <div>...</div>
}
```
