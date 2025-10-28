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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-6 [&>li]:min-w-0">
      {/* Appearance - Full width */}
      <li className="list-none md:col-span-12">
        <div className="relative  rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <Card className="glass-panel border-0 relative ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your DeckVault</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ManaSymbolSelector />
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>Your preferences are saved locally</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </li>

      {/* Account Information - Left */}
      <li className="list-none md:col-span-6 md:row-span-1">
        <div className="relative  rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <Card className="glass-panel border-0 relative ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Joined</span>
                <span>{joinedDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </li>

      {/* Patreon Tier - Right */}
      <li className="list-none md:col-span-6 md:row-span-1">
        <div className="relative  rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <Card className="glass-panel border-0 relative ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Patreon Tier
              </CardTitle>
              <CardDescription>Your current patron status</CardDescription>
            </CardHeader>
            <CardContent>
              <TierBadge tier={userTier as any} showTooltip={true} />
            </CardContent>
          </Card>
        </div>
      </li>

      {/* My Drafts - Spans 2 rows on right */}
      <li className="list-none md:col-span-6 md:row-span-2 md:row-start-3">
        <div className="relative  rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
            <MyDrafts />
          </div>
      </li>

      {/* Role & Permissions - Bottom left (if applicable) */}
      {(userRole === 'admin' || userRole === 'moderator' || userRole === 'developer') && (
        <li className="list-none md:col-span-6 md:row-span-2 md:row-start-3">
          <div className="relative  rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              blur={0}
              borderWidth={3}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <Card className="glass-panel border-0 relative ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role & Permissions
                </CardTitle>
                <CardDescription>Your site access level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="capitalize font-medium">{userRole}</span>
                  {userRole === 'developer' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      Full Access
                    </span>
                  )}
                  {userRole === 'admin' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      Admin Access
                    </span>
                  )}
                  {userRole === 'moderator' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      Moderator Access
                    </span>
                  )}
                </div>

                {userRole === 'developer' && (
                  <>
                    <Separator />
                    <NotificationBadgeToggle />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </li>
      )}
    </ul>
  )
}
interface GridItemProps {
  area: string
  children: React.ReactNode
}

const GridItem = ({ area, children }: GridItemProps) => {
  return (
  <li className="list-none md:col-span-12 md:row-span-1">
    <div className="relative  rounded-2xl border p-2 md:rounded-3xl md:p-3">
      <GlowingEffect
        blur={0}
        borderWidth={3}
        spread={80}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <Card className="glass-panel border-0 relative ">
      {/* content */}
    </Card>
  </div>
</li>
  )
}
