/**
 * Integration tests for submit-roast API route
 * Tests with real test user and database
 *
 * Self-contained: Creates and cleans up its own test user
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

describe('POST /api/submit-roast - Integration Tests', () => {
  let testUserToken: string
  let testUserId: string
  const testEmail = `roast-test-${Date.now()}@testing.com`
  const testPassword = 'test-password-123'

  beforeAll(async () => {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create test user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Roast Test User',
      },
    })

    if (createError || !newUser.user) {
      throw new Error(`Failed to create test user: ${createError?.message}`)
    }

    testUserId = newUser.user.id

    // Create profile with admin role and ArchMage tier
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: testUserId,
      email: testEmail,
      patreon_tier: 'ArchMage',
      role: 'admin',
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    // Sign in to get auth token
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (error || !data.session) {
      throw new Error(`Failed to sign in test user: ${error?.message}`)
    }

    testUserToken = data.session.access_token
  })

  afterAll(async () => {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Delete all submissions created by test user
    await supabase.from('deck_submissions').delete().eq('user_id', testUserId)

    // Delete profile
    await supabase.from('profiles').delete().eq('id', testUserId)

    // Delete auth user
    await supabase.auth.admin.deleteUser(testUserId)
  })

  it('should successfully submit a roast request with valid data', async () => {
    const roastData = {
      preferredName: 'TestRoaster',
      deckDescription: 'My attempt at a competitive cEDH deck',
      moxfieldLink: 'https://moxfield.com/decks/abc123',
      targetBracket: 'bracket4',
      artChoicesIntentional: 'Yes, all foils for maximum bling',
    }

    const response = await fetch('http://localhost:8888/api/submit-roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(roastData),
    })

    // Log the actual error if status is 500
    if (response.status === 500) {
      const text = await response.text()
      console.error('500 Error Response:', text.substring(0, 500))
      throw new Error(`API returned 500: ${text.substring(0, 200)}`)
    }

    const result = await response.json()

    expect(response.status).toBe(201)
    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id')
    expect(result.data).toHaveProperty('submissionNumber')

    // Verify roast submission in database
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: submission } = await supabase
      .from('deck_submissions')
      .select('*')
      .eq('id', result.data.id)
      .single()

    expect(submission).toBeDefined()
    expect(submission?.user_id).toBe(testUserId)
    expect(submission?.submission_type).toBe('roast')
    expect(submission?.deck_list_url).toBe('https://moxfield.com/decks/abc123')
    expect(submission?.status).toBe('pending')
  })

  it('should allow admin to bypass tier requirements', async () => {
    const roastData = {
      preferredName: 'AdminRoaster',
      deckDescription: 'Testing admin bypass',
      moxfieldLink: 'https://moxfield.com/decks/admin-test',
      targetBracket: 'bracket3',
      artChoicesIntentional: 'Not really',
    }

    const response = await fetch('http://localhost:8888/api/submit-roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(roastData),
    })

    expect(response.status).toBe(201)
    const result = await response.json()
    expect(result.success).toBe(true)
  })

  it('should reject roast without authentication', async () => {
    const roastData = {
      preferredName: 'NoAuth',
      deckDescription: 'This should fail',
      moxfieldLink: 'https://moxfield.com/decks/noauth',
      targetBracket: 'bracket2',
      artChoicesIntentional: 'No',
    }

    const response = await fetch('http://localhost:8888/api/submit-roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: JSON.stringify(roastData),
    })

    expect(response.status).toBe(401)
    const result = await response.json()
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('UNAUTHORIZED')
  })

  it('should reject roast with missing required fields', async () => {
    const invalidData = {
      preferredName: 'Incomplete',
      // Missing required fields
    }

    const response = await fetch('http://localhost:8888/api/submit-roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(invalidData),
    })

    expect(response.status).toBe(400)
    const result = await response.json()
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('VALIDATION_ERROR')
  })

  it('should reject roast with invalid Moxfield URL', async () => {
    const invalidData = {
      preferredName: 'BadURL',
      deckDescription: 'Testing URL validation',
      moxfieldLink: 'https://not-moxfield.com/decks/test',
      targetBracket: 'bracket2',
      artChoicesIntentional: 'No',
    }

    const response = await fetch('http://localhost:8888/api/submit-roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(invalidData),
    })

    expect(response.status).toBe(400)
    const result = await response.json()
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('VALIDATION_ERROR')
  })
})
