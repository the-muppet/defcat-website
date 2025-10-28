/**
 * Patreon OAuth Redirect Route
 * Initiates the OAuth flow by redirecting to Patreon
 */

import { NextResponse } from 'next/server'

function initiateOAuthFlow(request: Request) {
  const origin = new URL(request.url).origin

  const clientId = process.env.PATREON_CLIENT_ID

  // Use dynamic redirect URI based on environment
  // In development, use localhost; in production, use the configured production URL
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')
  const redirectUri = isLocalhost
    ? `${origin}/auth/patreon-callback`
    : process.env.PATREON_REDIRECT_URI

  if (!clientId || !redirectUri) {
    console.error('Missing Patreon OAuth credentials')
    console.error('Client ID present:', !!clientId)
    console.error('Redirect URI:', redirectUri)
    return NextResponse.redirect(`${origin}/auth/login?error=config_missing`)
  }

  console.log('🔐 Initiating OAuth flow')
  console.log('Origin:', origin)
  console.log('Is localhost:', isLocalhost)
  console.log('Redirect URI:', redirectUri)

  // Build Patreon OAuth URL manually with proper scopes
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'identity identity[email] identity.memberships',
  })

  const patreonAuthUrl = `https://www.patreon.com/oauth2/authorize?${params.toString()}`

  // Use 303 redirect to change POST to GET
  return NextResponse.redirect(patreonAuthUrl, 303)
}

export async function GET(request: Request) {
  return initiateOAuthFlow(request)
}

export async function POST(request: Request) {
  return initiateOAuthFlow(request)
}
