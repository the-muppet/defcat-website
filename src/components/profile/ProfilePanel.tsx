'use client'

import { ChevronDown, FileText, Library, Loader2, Package, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { MyDrafts } from '@/components/profile/MyDrafts'
import { MySubmissions } from '@/components/profile/MySubmissions'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { TierCreditsCard } from '@/components/profile/TierCreditsCard'
import { UserDecks } from '@/components/profile/UserDecks'
import { ManaSymbolSelector } from '@/components/settings/ManaSymbolSelector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { GlowingEffect } from '@/components/ui/glowEffect'
import { createClient } from '@/lib/supabase/client'
import type { db } from '@/types/supabase'

type Profile = db['public']['Tables']['profiles']['Row']

export default function ProfilePanel() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()

  const loadProfile = useCallback(
    async (isRefresh = false) => {
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
        .select(
          'id, patreon_tier, role, created_at, moxfield_username, email, patreon_id, updated_at'
        )
        .eq('id', authUser.id)
        .single()

      setProfile(profileData)
      setLoading(false)
      if (isRefresh) {
        setRefreshing(false)
      }
    },
    [supabase, router]
  )

  useEffect(() => {
    loadProfile(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : 'Unknown'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto py-8 w-[90%] sm:w-[85%] md:w-[80%] lg:w-[75%] xl:w-[70%]">
        <div className="flex flex-col gap-6">
          {/* Top Row: Profile Settings & Mana Selector */}
          <div className="relative rounded-2xl border">
            <GlowingEffect
              blur={1}
              borderWidth={3}
              spread={40}
              glow={true}
              disabled={false}
              proximity={25}
              inactiveZone={0.2}
            />
            <Card className="glass-panel border-0 relative">
              <CardContent className="p-0 m-0">
                <div className="flex items-center justify-between">
                  {/* Profile Settings Title */}
                  <div className="flex items-center gap-3">
                    <User className="h-12 w-12" style={{ color: 'var(--mana-color)' }} />
                    <div>
                      <h1 className="text-2xl mana-color">Profile Settings</h1>
                      <p className="text-sm text-muted-foreground">Manage your account</p>
                    </div>
                  </div>

                  {/* Mana Symbol Selector */}
                  <div className="pr-6 relative">
                    <ManaSymbolSelector />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content: 2 Columns - Full Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* LEFT COLUMN */}
            <div className="space-y-4 flex flex-col">
              {/* Tier + Credits Card (15-20% height) */}
              <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                  blur={0}
                  borderWidth={3}
                  spread={80}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <TierCreditsCard tier={userTier as any} />
              </div>

              {/* Account & Profile Form */}
              <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3 flex-1">
                <GlowingEffect
                  blur={0}
                  borderWidth={3}
                  spread={80}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <Card className="glass-panel border-0 relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                    <CardDescription>Update your profile details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Editable fields */}
                    <ProfileEditForm
                      userId={user.id}
                      currentEmail={profile?.email || user.email}
                      currentMoxfieldUsername={profile?.moxfield_username || null}
                      joinedDate={joinedDate}
                      onSuccess={() => {
                        loadProfile(true)
                      }}
                    />
                    {refreshing && (
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Refreshing profile...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4 flex flex-col">
              {/* My Decks */}
              <Collapsible defaultOpen={true} className="flex-1 flex flex-col">
                <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3 flex flex-col flex-1">
                  <GlowingEffect
                    blur={0}
                    borderWidth={3}
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <Card className="glass-panel border-0 relative flex flex-col flex-1">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Library className="h-5 w-5" />
                            My Decks
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="flex-1 overflow-hidden">
                      <CardContent className="h-full overflow-auto">
                        <UserDecks moxfieldUsername={profile?.moxfield_username || null} />
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </div>
              </Collapsible>

              {/* My Drafts */}
              <Collapsible defaultOpen={true} className="flex-1 flex flex-col">
                <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3 flex flex-col flex-1">
                  <GlowingEffect
                    blur={0}
                    borderWidth={3}
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <Card className="glass-panel border-0 relative flex flex-col flex-1">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            My Drafts
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="flex-1 overflow-hidden">
                      <CardContent className="h-full overflow-auto">
                        <MyDrafts />
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </div>
              </Collapsible>

              {/* My Submissions */}
              <Collapsible defaultOpen={true} className="flex-1 flex flex-col">
                <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3 flex flex-col flex-1">
                  <GlowingEffect
                    blur={0}
                    borderWidth={3}
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <Card className="glass-panel border-0 relative flex flex-col flex-1">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            My Submissions
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="flex-1 overflow-hidden">
                      <CardContent className="h-full overflow-auto">
                        <MySubmissions />
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
