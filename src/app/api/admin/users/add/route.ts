import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { PasswordResetEmail } from '@/emails'

// Lazy-initialize Resend client
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin or developer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'moderator', 'developer'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role, patreonTier } = body

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['user', 'admin', 'moderator', 'developer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Only developers can assign developer role
    if (role === 'developer' && profile.role !== 'developer') {
      return NextResponse.json(
        { success: false, error: 'Only developers can assign developer role' },
        { status: 403 }
      )
    }

    // Use admin client to create user
    const adminClient = createAdminClient()

    // Generate a random password
    const randomPassword = `manual_${Date.now()}_${Math.random().toString(36).slice(2)}`

    // Create user in auth
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: {
        manually_added: true,
        added_by: user.id,
      },
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { success: false, error: createError.message || 'Failed to create user' },
        { status: 500 }
      )
    }

    if (!newUser.user) {
      return NextResponse.json(
        { success: false, error: 'User creation failed' },
        { status: 500 }
      )
    }

    // Create profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email,
        role,
        patreon_tier: patreonTier || null,
        patreon_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Try to delete the auth user if profile creation failed
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Generate password reset link
    const { data: resetData, error: resetError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    })

    let passwordResetSent = false

    if (!resetError && resetData.properties?.action_link) {
      // Send password reset email via Resend
      try {
        const resend = getResendClient()
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8888'

        // Extract the token from the action_link
        const actionLink = resetData.properties.action_link
        const tokenMatch = actionLink.match(/token=([^&]+)/)
        const token = tokenMatch ? tokenMatch[1] : null

        const resetLink = token
          ? `${siteUrl}/auth/reset-password#access_token=${token}&type=recovery`
          : actionLink

        await resend.emails.send({
          from: 'DefCat DeckVault <noreply@defcat.com>',
          to: email,
          subject: 'Set Your Password - DefCat DeckVault',
          react: PasswordResetEmail({
            resetLink,
            email,
          }),
        })

        passwordResetSent = true
        console.log('Password reset email sent successfully to:', email)
      } catch (emailError) {
        console.error('Error sending password reset email via Resend:', emailError)
        // Don't fail the entire operation - user was created successfully
      }
    } else {
      console.error('Error generating password reset link:', resetError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.user.id,
        email,
        role,
        passwordResetSent,
      }
    })
  } catch (error) {
    console.error('Add user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
