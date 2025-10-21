'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Users, Shield, CheckCircle2, AlertCircle, Search } from 'lucide-react'

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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()

  const isDeveloper = currentUserRole === 'developer'
  const availableRoles = isDeveloper
    ? ['user', 'admin', 'moderator', 'developer']
    : ['user', 'admin', 'moderator']

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
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
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdating(true)
    setMessage(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId, role: newRole })
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
        text: err instanceof Error ? err.message : 'Failed to update role'
      })
    } finally {
      setUpdating(false)
    }
  }

  const filteredUsers = users.filter(user =>
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
          <div className={`p-3 rounded-lg flex items-start gap-2 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-destructive/10 border border-destructive/20'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-500' : 'text-destructive'
            }`}>
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
        </div>

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
                    Tier: {user.patreon_tier || 'None'} • Joined {new Date(user.created_at).toLocaleDateString()}
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
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        )}

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Role Permissions:</strong><br />
            • <strong>User:</strong> Basic access<br />
            • <strong>Admin:</strong> Content management (client access)<br />
            • <strong>Moderator:</strong> Content management + moderation<br />
            {isDeveloper && (
              <>• <strong>Developer:</strong> Full system access (database, SQL queries)</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
