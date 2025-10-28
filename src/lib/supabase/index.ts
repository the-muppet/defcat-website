/**
 * Supabase client exports
 * Import from this file based on your context:
 *
 * Client Components:
 *   import { createClient } from '@/lib/supabase/client'
 *
 * Server Components/Actions:
 *   import { createClient } from '@/lib/supabase/server'
 *
 * Middleware:
 *   import { updateSession } from '@/lib/supabase/middleware'
 *
 * Admin operations (server-only):
 *   import { createAdminClient } from '@/lib/supabase/admin'
 */

export { createAdminClient } from './admin'
export { createClient as createBrowserClient } from './client'
export { updateSession } from './middleware'
export { createClient as createServerClient } from './server'

export interface supabase {
  updateSession: (session: any) => any
  createBrowserClient: () => any
  createServerClient: () => any
  createAdminClient: () => any
}
