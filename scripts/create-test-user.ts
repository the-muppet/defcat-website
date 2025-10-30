/**
 * Create test admin user with email/password auth
 * Email: test@testing.com
 * Password: password
 * Role: admin
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createTestUser() {
  const testEmail = 'test@testing.com'
  const testPassword = 'password'

  console.log('Creating test admin user...')

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find((u) => u.email?.toLowerCase() === testEmail)

    let userId: string

    if (existingUser) {
      console.log(`User ${testEmail} already exists (ID: ${existingUser.id})`)
      userId = existingUser.id

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: testPassword,
      })

      if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`)
      }
      console.log('Password updated to: password')
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Test Admin',
        },
      })

      if (createError || !newUser.user) {
        throw new Error(`Failed to create user: ${createError?.message}`)
      }

      userId = newUser.user.id
      console.log(`Created user ${testEmail} (ID: ${userId})`)
    }

    // Update or create profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: testEmail,
          patreon_tier: 'ArchMage',
          role: 'admin',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    console.log('Profile updated with admin role and ArchMage tier')

    // Create or update submission status with unlimited submissions
    const { error: submissionError } = await supabase
      .from('user_submission_status')
      .upsert(
        {
          user_id: userId,
          remaining_submissions: 999,
          max_submissions: 999,
        },
        {
          onConflict: 'user_id',
        }
      )

    if (submissionError) {
      console.warn(`Warning: Failed to update submission status: ${submissionError.message}`)
    } else {
      console.log('Submission status updated with unlimited submissions')
    }

    // Create or update roast status with unlimited credits
    const { error: roastError } = await supabase
      .from('user_roast_status')
      .upsert(
        {
          user_id: userId,
          roast_credits: 999,
        },
        {
          onConflict: 'user_id',
        }
      )

    if (roastError) {
      console.warn(`Warning: Failed to update roast status: ${roastError.message}`)
    } else {
      console.log('Roast status updated with unlimited credits')
    }

    console.log('\nTest user setup complete!')
    console.log('Email: test@testing.com')
    console.log('Password: password')
    console.log('Role: admin')
    console.log('Tier: ArchMage')
  } catch (error) {
    console.error('Error creating test user:', error)
    process.exit(1)
  }
}

createTestUser()
