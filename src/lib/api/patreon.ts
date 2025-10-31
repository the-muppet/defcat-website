/**
 * Patreon API Client
 * Handles fetching user membership data and tier information
 */

import type { PatreonTier } from '@/types/core'
import { logger } from '@/lib/observability/logger'

interface PatreonMember {
  data: {
    id: string
    attributes: {
      email: string
      full_name: string
      patron_status: string | null
    }
    relationships: {
      memberships: {
        data: Array<{ id: string; type: string }>
      }
    }
  }
  included?: Array<{
    id: string
    type: string
    attributes: {
      currently_entitled_amount_cents: number
      patron_status: string
    }
  }>
}

/**
 * Determine user's tier based on Patreon pledge amount
 */
export function determineTier(pledgeAmountCents: number): PatreonTier {
  if (pledgeAmountCents >= 25000) return 'ArchMage' // $250
  if (pledgeAmountCents >= 16500) return 'Wizard' // $165
  if (pledgeAmountCents >= 5000) return 'Duke' // $50
  if (pledgeAmountCents >= 3000) return 'Emissary' // $30
  if (pledgeAmountCents >= 1000) return 'Knight' // $10
  return 'Citizen' // $2
}

/**
 * Fetch user's Patreon membership data
 */
export async function fetchPatreonMembership(
  accessToken: string
): Promise<{ tier: PatreonTier; patreonId: string }> {
  const response = await fetch(
    'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[user]=email,full_name&fields[member]=currently_entitled_amount_cents,patron_status',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('Patreon API request failed', undefined, {
      status: response.status,
      statusText: response.statusText,
    })
    throw new Error(`Patreon API error: ${response.statusText}`)
  }

  const data: PatreonMember = await response.json()
  logger.debug('Patreon membership data retrieved', {
    patreonId: data.data.id,
    patronStatus: data.included?.[0]?.attributes.patron_status,
  })

  // Extract user ID
  const patreonId = data.data.id

  // Find active membership
  const activeMembership = data.included?.find(
    (item) =>
      item.type === 'member' &&
      (item.attributes.patron_status === 'active_patron' ||
        item.attributes.patron_status === 'declined_patron')
  )

  // Determine tier from pledge amount
  const pledgeAmountCents = activeMembership?.attributes.currently_entitled_amount_cents || 0
  const tier = determineTier(pledgeAmountCents)

  return { tier, patreonId }
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const params = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: process.env.PATREON_CLIENT_ID!,
    client_secret: process.env.PATREON_CLIENT_SECRET!,
    redirect_uri: redirectUri,
  })

  const response = await fetch('https://www.patreon.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('Patreon token exchange failed', undefined, {
      status: response.status,
      statusText: response.statusText,
    })
    throw new Error(`Patreon token exchange failed: ${response.statusText}`)
  }

  const data = await response.json()
  logger.info('Patreon token exchange successful')
  return data.access_token
}
