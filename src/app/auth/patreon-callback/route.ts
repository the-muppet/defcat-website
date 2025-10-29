/**
 * New Patreon OAuth Callback Route
 * Handles Patreon OAuth and creates proper Supabase sessions
 */

import { NextResponse } from 'next/server'
import { exchangeCodeForToken, fetchPatreonMembership } from '@/lib/api/patreon'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('🔐 OAuth callback initiated')
  console.log('Origin:', origin)
  console.log('Code present:', !!code)

  if (!code) {
    console.error('No authorization code provided')
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  try {
    // Determine the redirect URI that was used (must match what was sent to Patreon)
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')
    const redirectUri = isLocalhost
      ? `${origin}/auth/patreon-callback`
      : process.env.PATREON_REDIRECT_URI!

    console.log('Determined redirect URI:', redirectUri)

    // Exchange code for Patreon access token
    console.log('Exchanging code for Patreon access token...')
    const patreonAccessToken = await exchangeCodeForToken(code, redirectUri)

    // Fetch user data from Patreon
    const { tier, patreonId } = await fetchPatreonMembership(patreonAccessToken)

    // Fetch Patreon user email
    const patreonUserResponse = await fetch(
      'https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=email,full_name',
      {
        headers: {
          Authorization: `Bearer ${patreonAccessToken}`,
        },
      }
    )

    const patreonUserData = await patreonUserResponse.json()
    const email = patreonUserData.data.attributes.email
    const fullName = patreonUserData.data.attributes.full_name

    if (!email) {
      return NextResponse.redirect(`${origin}/auth/login?error=no_email`)
    }

    // TEMPORARY: Auto-accept site owner
    const isSiteOwner = email.toLowerCase() === 'jaynatale@defcat.net'

    // Use admin client to create/update user
    const adminClient = createAdminClient()

    let userId: string

    // Try to create new user - if they exist, we'll get their ID from auth
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        patreon_id: patreonId,
      },
    })

    if (createError) {
      // User already exists, list all users and find by email
      console.log('User already exists, searching for user by email:', email)

      const { data: listData, error: listError } =
        await adminClient.auth.admin.listUsers()

      if (listError) {
        console.error('Error listing users:', listError)
        return NextResponse.redirect(
          `${origin}/auth/login?error=user_lookup_failed&details=${encodeURIComponent(listError.message)}`
        )
      }

      const existingUser = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

      if (!existingUser) {
        console.error('User not found in auth.users table')
        return NextResponse.redirect(
          `${origin}/auth/login?error=user_lookup_failed&details=${encodeURIComponent('User not found')}`
        )
      }

      userId = existingUser.id
      console.log('Found existing user:', userId)
    } else if (newUser.user) {
      userId = newUser.user.id
      console.log('Created new user:', userId)
    } else {
      console.error('Unexpected error: no user returned from createUser')
      return NextResponse.redirect(`${origin}/auth/login?error=user_creation_failed`)
    }

    // Check if profile already exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    // Determine role - site owner gets admin role automatically
    let userRole = existingProfile?.role || 'user'
    if (isSiteOwner && userRole === 'user') {
      userRole = 'admin'
      console.log('🔑 Site owner detected - granting admin access')
    }

    // Update/create profile, preserving existing role if present
    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: userId,
      email,
      patreon_id: isSiteOwner ? null : patreonId, // Don't link site owner to Patreon
      patreon_tier: isSiteOwner ? 'ArchMage' : tier, // Give site owner highest tier
      role: userRole,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.redirect(
        `${origin}/auth/login?error=profile_update_failed&details=${encodeURIComponent(profileError.message)}`
      )
    }

    // Set a password for the user (they'll never need to know it)
    const userPassword = `patreon_${userId}_${Date.now()}_${Math.random().toString(36)}`

    const { error: passwordError } = await adminClient.auth.admin.updateUserById(userId, {
      password: userPassword,
    })

    if (passwordError) {
      console.error('Failed to set password:', passwordError)
      return NextResponse.redirect(`${origin}/auth/login?error=password_setup_failed`)
    }

    // Sign in to get session tokens
    const { data: sessionData, error: signInError } = await adminClient.auth.signInWithPassword({
      email,
      password: userPassword,
    })

    if (signInError || !sessionData.session) {
      console.error('Sign-in failed:', signInError)
      return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`)
    }

    console.log('✓ Session created successfully for:', email)

    // Redirect with session tokens in URL hash for client-side session setup
    const redirectUrl = new URL(`${origin}/auth/callback-success`)
    redirectUrl.hash = `access_token=${sessionData.session.access_token}&refresh_token=${sessionData.session.refresh_token}`

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('OAuth callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      `${origin}/auth/login?error=callback_failed&details=${encodeURIComponent(errorMessage)}`
    )
  }
}
