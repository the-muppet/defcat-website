/**
 * User Profile Page
 */

import ProfilePanel from '@/components/profile/ProfilePanel'
import { requireAuth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  await requireAuth()

  return <ProfilePanel />
}
