import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ManaSymbolSelector } from '@/components/settings/ManaSymbolSelector'
import { TierBadge } from '@/components/tier/TierBadge'
import { User, Mail, Shield, Award, Palette } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('patreon_tier, role, created_at')
    .eq('id', user.id)
    .single()

  const userTier = profile?.patreon_tier || 'Citizen'
  const userRole = profile?.role || 'user'
  const joinedDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <User className="h-10 w-10 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold">Profile</h1>
            <p className="text-muted-foreground mt-1">
              View your account information and preferences
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your DeckVault
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ManaSymbolSelector />

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>Your preferences are saved locally</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
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

          <Card className="glass-panel">
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

          {(userRole === 'admin' || userRole === 'moderator' || userRole === 'developer') && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role & Permissions
                </CardTitle>
                <CardDescription>Your site access level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="capitalize font-medium">{userRole}</span>
                  {userRole === 'developer' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      Full Access
                    </span>
                  )}
                  {(userRole === 'admin' || userRole === 'moderator') && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      Admin Access
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
