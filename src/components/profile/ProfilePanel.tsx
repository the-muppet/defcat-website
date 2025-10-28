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
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { UserDecks } from '@/components/profile/UserDecks'
import { UserIcon, Shield, Award, Palette, Loader2, Library } from 'lucide-react'
import { GlowingEffect } from '@/components/ui/glowEffect'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()

  const loadProfile = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    }

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
      .select('patreon_tier, role, created_at, moxfield_username, email')
      .eq('id', authUser.id)
      .single()

    setProfile(profileData)
    setLoading(false)
    if (isRefresh) {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadProfile(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 py-8 max-w-5xl">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>li]:min-w-0">
        {/* Account & Profile - Full width */}
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
                  <UserIcon className="h-3.5 w-3.5" />
                  Account & Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2 space-y-4">
                {/* Read-only account info */}
                <div className="space-y-2 p-3 bg-accent/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">User ID</span>
                    <span className="text-xs font-mono truncate max-w-[200px]">{user.id}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Joined</span>
                    <span className="text-xs">{joinedDate}</span>
                  </div>
                </div>

                {/* Editable fields */}
                <ProfileEditForm
                  userId={user.id}
                  currentEmail={profile?.email || user.email}
                  currentMoxfieldUsername={profile?.moxfield_username || null}
                  onSuccess={() => {
                    loadProfile(true)
                  }}
                />
                {refreshing && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Refreshing profile...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </li>

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

        {/* Patreon Tier */}
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

        {/* My Decks from Moxfield */}
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
                  <Library className="h-3.5 w-3.5" />
                  My Decks
                </CardTitle>
                <CardDescription className="text-xs">
                  Your Moxfield decks
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-2">
                <UserDecks moxfieldUsername={profile?.moxfield_username || null} />
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
    </div>
  )
}