'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ManaSymbolSelector } from '@/components/settings/ManaSymbolSelector'
import { NotificationBadgeToggle } from '@/components/settings/NotificationBadgeToggle'
import { TierBadge } from '@/components/tier/TierBadge'
import { MyDrafts } from '@/components/profile/MyDrafts'
import { User, Mail, Shield, Award, Palette, Loader2 } from 'lucide-react'
import { GlowingEffect } from '@/components/ui/glowEffect'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('patreon_tier, role, created_at')
        .eq('id', authUser.id)
        .single()

      setProfile(profileData)
      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userTier = profile?.patreon_tier || 'Citizen'
  const userRole = profile?.role || 'user'
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : 'Unknown'

  return (
    <div className="w-full max-w-4xl mx-auto px-2 py-2">
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 [&>li]:min-w-0">
        {/* Appearance - Full width */}
        <li className="list-none md:col-span-2">
          <div className="relative rounded-md border p-0.5">
            <GlowingEffect
              blur={0}
              borderWidth={1}
              spread={30}
              glow={true}
              disabled={false}
              proximity={24}
              inactiveZone={0.01}
            />
            <Card className="glass-panel border-0 relative">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Palette className="h-3.5 w-3.5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2">
                <ManaSymbolSelector />
              </CardContent>
            </Card>
          </div>
        </li>

        {/* Account Information */}
        <li className="list-none">
          <div className="relative rounded-md border p-0.5">
            <GlowingEffect
              blur={0}
              borderWidth={1}
              spread={30}
              glow={true}
              disabled={false}
              proximity={24}
              inactiveZone={0.01}
            />
            <Card className="glass-panel border-0 relative h-full">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 px-3 pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-xs font-medium truncate max-w-[140px]">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Joined</span>
                  <span className="text-xs">{joinedDate}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </li>

        {/* Patreon Tier */}
        <li className="list-none">
          <div className="relative rounded-md border p-0.5">
            <GlowingEffect
              blur={0}
              borderWidth={1}
              spread={30}
              glow={true}
              disabled={false}
              proximity={24}
              inactiveZone={0.01}
            />
            <Card className="glass-panel border-0 relative h-full">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Award className="h-3.5 w-3.5" />
                  Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2">
                <TierBadge tier={userTier as any} showTooltip={true} />
              </CardContent>
            </Card>
          </div>
        </li>

        {/* My Drafts */}
        <li className="list-none md:col-span-2">
          <div className="relative rounded-md border p-0.5">
            <GlowingEffect
              blur={0}
              borderWidth={1}
              spread={30}
              glow={true}
              disabled={false}
              proximity={24}
              inactiveZone={0.01}
            />
            <MyDrafts />
          </div>
        </li>

        {/* Role & Permissions - Conditional */}
        {(userRole === 'admin' || userRole === 'moderator' || userRole === 'developer') && (
          <li className="list-none md:col-span-2">
            <div className="relative rounded-md border p-0.5">
              <GlowingEffect
                blur={0}
                borderWidth={1}
                spread={30}
                glow={true}
                disabled={false}
                proximity={24}
                inactiveZone={0.01}
              />
              <Card className="glass-panel border-0 relative">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="flex items-center gap-1.5 text-sm">
                    <Shield className="h-3.5 w-3.5" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 px-3 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs capitalize font-medium">{userRole}</span>
                    {userRole === 'developer' && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-400">
                        Full
                      </span>
                    )}
                    {userRole === 'admin' && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        Admin
                      </span>
                    )}
                    {userRole === 'moderator' && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-green-500/20 text-green-400">
                        Mod
                      </span>
                    )}
                  </div>

                  {userRole === 'developer' && (
                    <>
                      <Separator className="my-1" />
                      <NotificationBadgeToggle />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </li>
        )}
      </ul>
    </div>
  )
}