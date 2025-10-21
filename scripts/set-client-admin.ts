// Set a user to admin role (for client content management)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setClientAdmin() {
  // Get user ID from command line argument
  const userId = process.argv[2]

  if (!userId) {
    console.error('Usage: npx tsx scripts/set-client-admin.ts <USER_ID>')
    console.log('\nFirst, find the user ID:')
    console.log('npx tsx scripts/check-my-role.ts')
    process.exit(1)
  }

  console.log(`Setting user ${userId} to admin role (client content management)...`)

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)
    .select()

  if (error) {
    console.error('Error:', error)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('User not found')
    process.exit(1)
  }

  console.log('✅ Success! User role is now admin (content management access)')
  console.table(data)
  console.log('\nThis user can now:')
  console.log('- Manage products')
  console.log('- Update site configuration')
  console.log('- View admin panel')
  console.log('\nBut CANNOT:')
  console.log('- Access database management')
  console.log('- Execute SQL queries')
}

setClientAdmin()
