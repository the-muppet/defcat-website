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
  const userId = '08ee43a7-a212-4d8c-8b08-394822a89002'

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
