// Set current user to developer role
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function makeDeveloper() {
  const userId = '6596337a-0e78-4c5a-9cf8-2b2aa6118495'

  console.log(`Setting user ${userId} to developer role...`)

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'developer' })
    .eq('id', userId)
    .select()

  if (error) {
    console.error('Error:', error)
    process.exit(1)
  }

  console.log('✅ Success! Your role is now developer (full system access)')
  console.table(data)
}

makeDeveloper()
