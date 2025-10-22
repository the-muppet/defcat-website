/**
 * Patreon OAuth Redirect Route
 * Initiates the OAuth flow by redirecting to Patreon
 */

import { NextResponse } from 'next/server'

function initiateOAuthFlow(request: Request) {
  const origin = new URL(request.url).origin

  const clientId = process.env.PATREON_CLIENT_ID
  const redirectUri = process.env.PATREON_REDIRECT_URI

  if (!clientId || !redirectUri) {
    console.error('Missing Patreon OAuth credentials')
    return NextResponse.redirect(`${origin}/auth/login?error=config_missing`)
  }

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
