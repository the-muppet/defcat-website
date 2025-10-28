// Check current user's role in the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRole() {
  console.log('Checking all user roles...\n')

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, patreon_id, patreon_tier, role, email')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.table(profiles)

  if (profiles && profiles.length > 0) {
    console.log('\nTo set your role to admin, run:')
    console.log(`UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';`)
  }
}

checkRole()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
  })
