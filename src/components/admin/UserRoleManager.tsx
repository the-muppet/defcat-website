'use client'

import { AlertCircle, CheckCircle2, Search, Shield, UserPlus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { PATREON_TIERS } from '@/types/core'

interface User {
  id: string
  email: string
  role: string
  patreon_tier: string | null
  created_at: string
}

interface UserRoleManagerProps {
  currentUserRole: 'admin' | 'moderator' | 'developer'
}

export function UserRoleManager({ currentUserRole }: UserRoleManagerProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('user')
  const [newUserTier, setNewUserTier] = useState('')
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  const isDeveloper = currentUserRole === 'developer'
  const availableRoles = isDeveloper
    ? ['user', 'admin', 'moderator', 'developer']
    : ['user', 'admin', 'moderator']

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, patreon_tier, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdating(true)
    setMessage(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update role')
      }

      setMessage({ type: 'success', text: 'Role updated successfully' })
      await loadUsers()
    } catch (err) {
      console.error('Failed to update role:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update role',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      setMessage({ type: 'error', text: 'Email is required' })
      return
    }

    setAdding(true)
    setMessage(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/users/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: newUserEmail.trim(),
          role: newUserRole,
          patreonTier: newUserTier.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to add user')
      }

      const successMessage = result.data.passwordResetSent
        ? 'User added successfully! Password reset email sent.'
        : 'User added successfully! Note: Password reset email may have failed.'

      setMessage({ type: 'success', text: successMessage })
      setNewUserEmail('')
      setNewUserRole('user')
      setNewUserTier('')
      setShowAddUser(false)
      await loadUsers()
    } catch (err) {
      console.error('Failed to add user:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add user',
      })
    } finally {
      setAdding(false)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Role Management
        </CardTitle>
        <CardDescription>
          {isDeveloper
            ? 'Manage user roles and permissions (all roles available)'
            : 'Manage user roles and permissions (cannot assign developer role)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-destructive/10 border border-destructive/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            )}
            <p
              className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-destructive'}`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              if (!showAddUser && searchTerm.trim()) {
                setNewUserEmail(searchTerm.trim())
              }
              setShowAddUser(!showAddUser)
            }}
            className="btn-tinted-primary"
          >
            {showAddUser ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </>
            )}
          </Button>
        </div>

        {showAddUser && (
          <Card className="border-tinted bg-card-tinted">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-user-role">Role</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger id="new-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-user-tier">Patreon Tier (Optional)</Label>
                <Select
                  value={newUserTier || 'none'}
                  onValueChange={(val) => setNewUserTier(val === 'none' ? '' : val)}
                >
                  <SelectTrigger id="new-user-tier">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {PATREON_TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddUser}
                disabled={adding || !newUserEmail.trim()}
                className="w-full btn-tinted-primary"
              >
                {adding ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Adding User...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading users...</div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border border-tinted bg-card-tinted"
              >
                <div className="flex-1">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Tier: {user.patreon_tier || 'None'} • Joined{' '}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => handleUpdateRole(user.id, newRole)}
                    disabled={updating}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            )}
          </div>
        )}

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Role Permissions:</strong>
            <br />• <strong>User:</strong> Basic access
            <br />• <strong>Admin:</strong> Content management (client access)
            <br />• <strong>Moderator:</strong> Content management + moderation
            <br />
            {isDeveloper && (
              <>
                • <strong>Developer:</strong> Full system access (database, SQL queries)
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
