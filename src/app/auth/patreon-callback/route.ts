/**
 * New Patreon OAuth Callback Route
 * Handles Patreon OAuth and creates proper Supabase sessions
 */

import { NextResponse } from 'next/server'
import { exchangeCodeForToken, fetchPatreonMembership } from '@/lib/api/patreon'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/observability/logger'
import { userLogins, patreonSyncs } from '@/lib/observability/metrics'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  logger.info('OAuth callback initiated', { origin, codePresent: !!code })

  if (!code) {
    logger.error('OAuth callback failed: no authorization code provided')
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  try {
    // Determine the redirect URI that was used (must match what was sent to Patreon)
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')
    const redirectUri = isLocalhost
      ? `${origin}/auth/patreon-callback`
      : process.env.PATREON_REDIRECT_URI!

    logger.debug('OAuth redirect URI determined', { redirectUri, isLocalhost })

    // Exchange code for Patreon access token
    logger.info('Exchanging authorization code for Patreon access token')
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
      logger.info('User already exists, searching by email', { email: logger.redact(['email'], { email }).email })

      const { data: listData, error: listError } =
        await adminClient.auth.admin.listUsers()

      if (listError) {
        logger.error('Failed to list users during lookup', listError)
        return NextResponse.redirect(
          `${origin}/auth/login?error=user_lookup_failed&details=${encodeURIComponent(listError.message)}`
        )
      }

      const existingUser = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

      if (!existingUser) {
        logger.error('User not found in auth.users table after Patreon authentication')
        return NextResponse.redirect(
          `${origin}/auth/login?error=user_lookup_failed&details=${encodeURIComponent('User not found')}`
        )
      }

      userId = existingUser.id
      logger.info('Found existing user', { userId })
    } else if (newUser.user) {
      userId = newUser.user.id
      logger.info('Created new user', { userId })
    } else {
      logger.error('Unexpected error: no user returned from createUser call')
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
      logger.info('Site owner detected - granting admin access', { userId })
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
      logger.error('Failed to update user profile', profileError, { userId })
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
      logger.error('Failed to set user password', passwordError, { userId })
      return NextResponse.redirect(`${origin}/auth/login?error=password_setup_failed`)
    }

    // Sign in to get session tokens
    const { data: sessionData, error: signInError } = await adminClient.auth.signInWithPassword({
      email,
      password: userPassword,
    })

    if (signInError || !sessionData.session) {
      logger.error('Sign-in failed after password setup', signInError, { userId })
      return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`)
    }

    logger.info('Session created successfully', { userId, tier, role: userRole })

    // Track metrics for successful login and tier sync
    userLogins.add(1, {
      tier,
      role: userRole,
      isNewUser: !!newUser?.user,
    })

    patreonSyncs.add(1, {
      tier,
      status: 'success',
    })

    // Redirect with session tokens in URL hash for client-side session setup
    const redirectUrl = new URL(`${origin}/auth/callback-success`)
    redirectUrl.hash = `access_token=${sessionData.session.access_token}&refresh_token=${sessionData.session.refresh_token}`

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    logger.error('OAuth callback failed', error instanceof Error ? error : undefined, {
      origin,
    })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      `${origin}/auth/login?error=callback_failed&details=${encodeURIComponent(errorMessage)}`
    )
  }
}
