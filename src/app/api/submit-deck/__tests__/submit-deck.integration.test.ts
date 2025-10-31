/**
 * Integration tests for submit-deck API route
 * Tests with real test user and database
 *
 * Self-contained: Creates and cleans up its own test user
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

describe('POST /api/submit-deck - Integration Tests', () => {
  let testUserToken: string
  let testUserId: string
  const testEmail = `deck-test-${Date.now()}@testing.com`
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
        name: 'Deck Test User',
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

  it('should successfully submit a deck with valid data', async () => {
    const submissionData = {
      patreonUsername: 'TestUser',
      email: 'test@testing.com',
      discordUsername: 'testuser#1234',
      mysteryDeck: 'no',
      commander: 'Atraxa, Praetors\' Voice',
      colorPreference: 'GWUB',
      theme: 'Superfriends',
      bracket: 'bracket3',
      budget: '500',
      coffee: 'Black coffee',
      idealDate: 'Just a chill game night',
    }

    const response = await fetch('http://localhost:8888/api/submit-deck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(submissionData),
    })

    const result = await response.json()

    expect(response.status).toBe(201)
    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id')
    expect(result.data).toHaveProperty('submissionNumber')

    // Verify submission in database
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: submission } = await supabase
      .from('deck_submissions')
      .select('*')
      .eq('id', result.data.id)
      .single()

    expect(submission).toBeDefined()
    expect(submission?.user_id).toBe(testUserId)
    expect(submission?.commander).toBe('Atraxa, Praetors\' Voice')
    expect(submission?.status).toBe('pending')
  })

  it('should allow admin to bypass tier requirements', async () => {
    const submissionData = {
      patreonUsername: 'AdminTest',
      email: 'test@testing.com',
      discordUsername: 'admin#0001',
      mysteryDeck: 'yes',
      colorPreference: 'R',
      bracket: 'bracket4',
      budget: '1000',
      coffee: 'Espresso',
    }

    const response = await fetch('http://localhost:8888/api/submit-deck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(submissionData),
    })

    expect(response.status).toBe(201)
    const result = await response.json()
    expect(result.success).toBe(true)
  })

  it('should save draft without validation', async () => {
    const draftData = {
      patreonUsername: 'DraftUser',
      email: 'incomplete@example.com',
      isDraft: true,
      // Missing required fields for non-draft
    }

    const response = await fetch('http://localhost:8888/api/submit-deck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(draftData),
    })

    const result = await response.json()

    expect(response.status).toBe(201)
    expect(result.success).toBe(true)

    // Verify draft status in database
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: submission } = await supabase
      .from('deck_submissions')
      .select('status')
      .eq('id', result.data.id)
      .single()

    expect(submission?.status).toBe('draft')
  })

  it('should reject submission without authentication', async () => {
    const submissionData = {
      patreonUsername: 'NoAuth',
      email: 'noauth@example.com',
      discordUsername: 'noauth#1234',
      mysteryDeck: 'no',
      colorPreference: 'G',
      bracket: 'bracket2',
      budget: '200',
      coffee: 'Tea',
    }

    const response = await fetch('http://localhost:8888/api/submit-deck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: JSON.stringify(submissionData),
    })

    expect(response.status).toBe(401)
    const result = await response.json()
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('UNAUTHORIZED')
  })

  it('should reject submission with invalid data', async () => {
    const invalidData = {
      patreonUsername: 'Invalid',
      // Missing required fields
    }

    const response = await fetch('http://localhost:8888/api/submit-deck', {
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
