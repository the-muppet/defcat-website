import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

type UserRole = 'user' | 'admin' | 'moderator' | 'developer'

interface AuthResult {
  user: User
  role: UserRole
}

async function getUserWithRole(): Promise<AuthResult | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    user,
    role: (profile?.role as UserRole) || 'user',
  }
}

export async function requireAuth(): Promise<User> {
  const result = await getUserWithRole()
  if (!result) redirect('/auth/login')
  return result.user
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthResult> {
  const result = await getUserWithRole()
  if (!result) redirect('/auth/login')
  if (!allowedRoles.includes(result.role)) redirect('/')
  return result
}

export async function requireAdmin(): Promise<AuthResult> {
  return requireRole(['admin', 'developer'])
}

export async function requireModerator(): Promise<AuthResult> {
  return requireRole(['admin', 'developer', 'moderator'])
}

export async function requireDeveloper(): Promise<AuthResult> {
  return requireRole(['developer'])
}
