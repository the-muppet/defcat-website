/**
 * OAuth Callback Route
 * Handles the OAuth callback from Patreon
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { exchangeCodeForToken, fetchPatreonMembership } from '@/lib/api/patreon'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  try {
    // Determine the redirect URI that was used (must match what was sent to Patreon)
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')
    const redirectUri = isLocalhost ? `${origin}/auth/callback` : process.env.PATREON_REDIRECT_URI!

    // Exchange code for Patreon access token
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
      // User already exists, fetch them directly by email
      console.log('User already exists, fetching by email:', email)

      const { data: existingUserData, error: getUserError } =
        await adminClient.auth.admin.getUserByEmail(email)

      if (getUserError || !existingUserData?.user) {
        console.error('Error fetching user by email:', getUserError)
        console.error('Create error was:', createError)
        return NextResponse.redirect(
          `${origin}/auth/login?error=user_lookup_failed&details=${encodeURIComponent(getUserError?.message || 'User not found')}`
        )
      }

      userId = existingUserData.user.id
      console.log('Found existing user:', userId)
    } else if (newUser.user) {
      userId = newUser.user.id
      console.log('Created new user:', userId)
    } else {
      console.error('Unexpected error: no user returned from createUser')
      return NextResponse.redirect(`${origin}/auth/login?error=user_creation_failed`)
    }

    // Update/create profile with default role
    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: userId,
      email,
      patreon_id: patreonId,
      patreon_tier: tier,
      role: 'user', // Default role for new users
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Profile update error:', profileError)
    }

    // Sign in the user using admin client to get session tokens
    const { data: signInData, error: signInError } = await adminClient.auth.signInWithPassword({
      email,
      password: userId, // Use userId as password (we'll update user to have no password requirement)
    })

    // If password sign-in fails (user doesn't exist or wrong password), update the user
    if (signInError) {
      // Update user to have a password (using their userId as password for consistency)
      const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
        password: userId,
      })

      if (updateError) {
        console.error('Failed to set user password:', updateError)
      }

      // Try to sign in again
      const { data: retrySignInData, error: retrySignInError } =
        await adminClient.auth.signInWithPassword({
          email,
          password: userId,
        })

      if (retrySignInError || !retrySignInData.session) {
        console.error('Sign-in retry failed:', retrySignInError)
        return NextResponse.redirect(`${origin}/auth/login?error=session_failed`)
      }

      // Set cookies and redirect
      const _cookieStore = await cookies()
      const response = NextResponse.redirect(`${origin}/decks`)

      // Set session cookies for Supabase SSR
      const sessionCookies = [
        {
          name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0]}-auth-token`,
          value: JSON.stringify({
            access_token: retrySignInData.session.access_token,
            refresh_token: retrySignInData.session.refresh_token,
            expires_at: retrySignInData.session.expires_at,
          }),
        },
      ]

      for (const cookie of sessionCookies) {
        response.cookies.set(cookie.name, cookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        })
      }

      return response
    }

    // Original sign-in succeeded
    const _cookieStore = await cookies()
    const response = NextResponse.redirect(`${origin}/decks`)

    // Set session cookies for Supabase SSR
    const sessionCookies = [
      {
        name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0]}-auth-token`,
        value: JSON.stringify({
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_at: signInData.session.expires_at,
        }),
      },
    ]

    for (const cookie of sessionCookies) {
      response.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }
}
