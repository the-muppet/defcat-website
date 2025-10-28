import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const defaultConfig = [
  {
    key: 'college_video_id',
    value: '',
    category: 'videos',
    description: 'YouTube video ID for Commander College page',
    is_sensitive: false,
  },
  {
    key: 'featured_video_id',
    value: '',
    category: 'videos',
    description: 'YouTube video ID for home page featured video',
    is_sensitive: false,
  },
  {
    key: 'youtube_url',
    value: 'https://youtube.com/@defcatmtg',
    category: 'social',
    description: 'YouTube channel URL',
    is_sensitive: false,
  },
  {
    key: 'twitter_url',
    value: 'https://twitter.com/defcatmtg',
    category: 'social',
    description: 'Twitter/X profile URL',
    is_sensitive: false,
  },
  {
    key: 'discord_url',
    value: 'https://discord.gg/defcat',
    category: 'social',
    description: 'Discord server invite URL',
    is_sensitive: false,
  },
  {
    key: 'patreon_url',
    value: 'https://patreon.com/defcat',
    category: 'social',
    description: 'Patreon page URL',
    is_sensitive: false,
  },
  {
    key: 'site_title',
    value: "DefCat's DeckVault",
    category: 'general',
    description: 'Site title for metadata',
    is_sensitive: false,
  },
  {
    key: 'site_description',
    value: 'Magic: The Gathering Commander deck vault and resources',
    category: 'general',
    description: 'Site description for metadata',
    is_sensitive: false,
  },
  {
    key: 'admin_email',
    value: 'elmo@bdwinc.org',
    category: 'general',
    description: 'Primary admin contact email',
    is_sensitive: false,
  },
]

async function seedSiteConfig() {
  console.log('Checking existing site_config entries...')

  for (const config of defaultConfig) {
    const { data: existing } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', config.key)
      .single()

    if (existing) {
      console.log(`✓ Config ${config.key} already exists`)
    } else {
      console.log(`+ Creating config ${config.key}...`)
      const { error } = await supabase.from('site_config').insert(config)

      if (error) {
        console.error(`✗ Failed to create ${config.key}:`, error.message)
      } else {
        console.log(`✓ Created ${config.key}`)
      }
    }
  }

  console.log('Done!')
}

seedSiteConfig()
