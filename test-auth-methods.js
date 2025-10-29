// Quick test to verify Supabase admin auth methods
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase admin auth methods...')
console.log('URL:', supabaseUrl ? '✓' : '✗')
console.log('Service Key:', supabaseServiceKey ? '✓' : '✗')

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

console.log('\nAvailable auth.admin methods:')
console.log(Object.keys(adminClient.auth.admin))

async function testListUsers() {
  console.log('\nTesting listUsers()...')
  const { data, error } = await adminClient.auth.admin.listUsers()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`✓ Found ${data.users.length} users`)
  if (data.users.length > 0) {
    console.log('First user:', {
      id: data.users[0].id,
      email: data.users[0].email,
    })
  }
}

testListUsers().then(() => {
  console.log('\nTest complete!')
  process.exit(0)
}).catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
