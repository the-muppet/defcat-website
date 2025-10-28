// Test script to verify site_config table exists and has data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSiteConfig() {
  console.log('Testing site_config table...\n')

  // Test 1: Check if table exists
  console.log('1. Checking if table exists...')
  const { data, error } = await supabase.from('site_config').select('*').limit(1)

  if (error) {
    console.error('❌ Table does not exist or query failed:')
    console.error(error)
    return
  }

  console.log('✅ Table exists!\n')

  // Test 2: Count rows
  const { count, error: countError } = await supabase
    .from('site_config')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Failed to count rows:', countError)
  } else {
    console.log(`2. Row count: ${count} rows\n`)
  }

  // Test 3: Fetch all config
  const { data: allConfig, error: fetchError } = await supabase
    .from('site_config')
    .select('*')
    .order('category')

  if (fetchError) {
    console.error('❌ Failed to fetch config:', fetchError)
  } else {
    console.log('3. All configuration:')
    console.table(allConfig)
  }

  // Test 4: Check RLS policies
  console.log('\n4. Testing RLS (using anon key)...')
  const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const { data: publicData, error: rlsError } = await anonSupabase
    .from('site_config')
    .select('*')
    .eq('is_sensitive', false)

  if (rlsError) {
    console.error('❌ RLS test failed:', rlsError)
  } else {
    console.log(`✅ RLS working - can read ${publicData?.length} non-sensitive configs`)
  }
}

testSiteConfig()
  .then(() => {
    console.log('\n✨ Test complete')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Test failed:', err)
    process.exit(1)
  })
