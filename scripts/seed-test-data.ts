/**
 * Test Data Seeding Script
 * Generates realistic test data for development and testing
 *
 * Usage:
 *   bun run scripts/seed-test-data.ts [--users=10] [--decks=50] [--submissions=20]
 */

import { createAdminClient } from '../src/lib/supabase/admin'
import type { PatreonTier } from '../src/types/core'

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_COUNTS = {
  users: 10,
  decks: 50,
  submissions: 20,
}

// Sample data generators
const SAMPLE_NAMES = [
  'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson',
  'Emma Martinez', 'Frank Anderson', 'Grace Taylor', 'Henry Thomas',
  'Iris Jackson', 'Jack White', 'Kate Harris', 'Liam Martin',
]

const SAMPLE_COMMANDERS = [
  'Atraxa, Praetors\' Voice',
  'Tymna the Weaver',
  'Thrasios, Triton Hero',
  'Kinnan, Bonder Prodigy',
  'Kenrith, the Returned King',
  'Sisay, Weatherlight Captain',
  'Najeela, the Blade-Blossom',
  'Zur the Enchanter',
  'Winota, Joiner of Forces',
  'Korvold, Fae-Cursed King',
]

const COLOR_COMBINATIONS = [
  ['W'],
  ['U'],
  ['B'],
  ['R'],
  ['G'],
  ['W', 'U'],
  ['U', 'B'],
  ['B', 'R'],
  ['R', 'G'],
  ['G', 'W'],
  ['W', 'U', 'B'],
  ['U', 'B', 'R'],
  ['B', 'R', 'G'],
  ['R', 'G', 'W'],
  ['G', 'W', 'U'],
  ['W', 'U', 'B', 'R', 'G'],
]

const PATREON_TIERS: PatreonTier[] = [
  'Citizen',
  'Knight',
  'Emissary',
  'Duke',
  'Wizard',
  'ArchMage',
]

const BRACKETS = ['1-2', '3-4', '5-6', '7-8', '9-10']
const BUDGETS = ['Budget ($100-300)', 'Mid ($300-1000)', 'High ($1000+)', 'No Limit']
const THEMES = [
  'Combo',
  'Control',
  'Aggro',
  'Midrange',
  'Stax',
  'Aristocrats',
  'Tokens',
  'Voltron',
  'Tribal',
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateEmail(name: string): string {
  const username = name.toLowerCase().replace(/\s+/g, '.')
  return `${username}@testuser.defcat.net`
}

function generatePatreonId(): string {
  return `test_patreon_${Math.random().toString(36).substring(7)}`
}

function generateMoxfieldId(): string {
  return `test_deck_${Math.random().toString(36).substring(7)}`
}

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedUsers(count: number) {
  console.log(`\n📊 Seeding ${count} test users...`)

  const supabase = createAdminClient()
  const users = []

  for (let i = 0; i < count; i++) {
    const name = randomElement(SAMPLE_NAMES)
    const email = generateEmail(`${name}_${i}`)
    const tier = randomElement(PATREON_TIERS)
    const patreonId = generatePatreonId()

    try {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'test_password_123',
        email_confirm: true,
        user_metadata: {
          full_name: name,
        },
      })

      if (authError) {
        console.error(`  ❌ Failed to create auth user: ${email}`)
        continue
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email,
          patreon_id: patreonId,
          patreon_tier: tier,
          moxfield_username: `moxfield_${name.toLowerCase().replace(/\s+/g, '_')}`,
          role: 'user',
        })

      if (profileError) {
        console.error(`  ❌ Failed to create profile: ${email}`)
        continue
      }

      // Initialize credits
      const deckCredits = tier === 'Duke' ? 1 : tier === 'Wizard' ? 2 : tier === 'ArchMage' ? 3 : 0
      const roastCredits = deckCredits

      await supabase
        .from('user_credits')
        .insert({
          user_id: authUser.user.id,
          credits: { deck: deckCredits, roast: roastCredits },
          last_granted: { deck: new Date().toISOString().slice(0, 7), roast: new Date().toISOString().slice(0, 7) },
        })

      users.push({
        id: authUser.user.id,
        email,
        name,
        tier,
        patreonId,
      })

      console.log(`  ✓ Created user: ${email} (${tier})`)
    } catch (error) {
      console.error(`  ❌ Error creating user: ${error}`)
    }
  }

  console.log(`\n✅ Created ${users.length}/${count} test users`)
  return users
}

async function seedDecks(count: number) {
  console.log(`\n📚 Seeding ${count} test decks...`)

  const supabase = createAdminClient()
  const decks = []

  for (let i = 0; i < count; i++) {
    const moxfieldId = generateMoxfieldId()
    const name = `${randomElement(SAMPLE_COMMANDERS)} ${randomElement(THEMES)}`
    const colors = randomElement(COLOR_COMBINATIONS)
    const author = randomElement(SAMPLE_NAMES)

    try {
      const { data, error } = await supabase
        .from('moxfield_decks')
        .insert({
          moxfield_id: moxfieldId,
          name,
          author_name: author,
          author_username: author.toLowerCase().replace(/\s+/g, '_'),
          format: 'Commander',
          visibility: 'public',
          commanders_count: 1,
          mainboard_count: randomNumber(95, 99),
          sideboard_count: 0,
          view_count: randomNumber(10, 1000),
          like_count: randomNumber(0, 100),
          comment_count: randomNumber(0, 20),
          raw_data: {
            colors,
            colorIdentity: colors,
            commanders: [{ name: randomElement(SAMPLE_COMMANDERS) }],
          },
        })
        .select()
        .single()

      if (error) {
        console.error(`  ❌ Failed to create deck: ${name}`)
        continue
      }

      decks.push(data)
      console.log(`  ✓ Created deck: ${name}`)
    } catch (error) {
      console.error(`  ❌ Error creating deck: ${error}`)
    }
  }

  console.log(`\n✅ Created ${decks.length}/${count} test decks`)
  return decks
}

async function seedSubmissions(count: number, users: any[]) {
  console.log(`\n📝 Seeding ${count} test submissions...`)

  if (users.length === 0) {
    console.error('  ❌ No users available for submissions')
    return []
  }

  const supabase = createAdminClient()
  const submissions = []

  for (let i = 0; i < count; i++) {
    const user = randomElement(users)
    const submissionType = Math.random() > 0.5 ? 'deck' : 'roast'
    const mysteryDeck = Math.random() > 0.7

    try {
      const { data, error } = await supabase
        .from('deck_submissions')
        .insert({
          user_id: user.id,
          patreon_id: user.patreonId,
          patreon_username: user.name,
          patreon_tier: user.tier,
          email: user.email,
          discord_username: `discord_${user.name.toLowerCase().replace(/\s+/g, '_')}`,
          moxfield_username: `moxfield_${user.name.toLowerCase().replace(/\s+/g, '_')}`,
          submission_type: submissionType,
          mystery_deck: mysteryDeck,
          commander: mysteryDeck ? null : randomElement(SAMPLE_COMMANDERS),
          color_preference: mysteryDeck ? null : randomElement(COLOR_COMBINATIONS).join(''),
          theme: mysteryDeck ? null : randomElement(THEMES),
          bracket: randomElement(BRACKETS),
          budget: randomElement(BUDGETS),
          ideal_date: new Date(Date.now() + randomNumber(1, 30) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          deck_list_url: Math.random() > 0.5 ? `https://moxfield.com/decks/${generateMoxfieldId()}` : null,
          coffee_preference: randomElement(['Black', 'Cream', 'Sugar', 'Cream & Sugar', 'Fancy Latte']),
          notes: Math.random() > 0.5 ? 'This is a test submission with some notes.' : null,
          status: randomElement(['pending', 'in_progress', 'completed']),
          submission_month: new Date().toISOString().slice(0, 7),
        })
        .select()
        .single()

      if (error) {
        console.error(`  ❌ Failed to create submission: ${error.message}`)
        continue
      }

      submissions.push(data)
      console.log(`  ✓ Created ${submissionType} submission for ${user.name}`)
    } catch (error) {
      console.error(`  ❌ Error creating submission: ${error}`)
    }
  }

  console.log(`\n✅ Created ${submissions.length}/${count} test submissions`)
  return submissions
}

async function seedProducts() {
  console.log(`\n🛒 Seeding test products...`)

  const supabase = createAdminClient()
  const products = [
    {
      key: 'test-product-1',
      name: 'Commander Deck Box',
      description: 'Premium deck box for Commander decks',
      link: 'https://example.com/deck-box',
      category: 'storage',
      sort_order: 1,
      is_active: true,
    },
    {
      key: 'test-product-2',
      name: 'Playmat - Mountain Art',
      description: 'Beautiful mountain-themed playmat',
      link: 'https://example.com/playmat',
      category: 'accessories',
      sort_order: 2,
      is_active: true,
    },
    {
      key: 'test-product-3',
      name: 'Card Sleeves (100ct)',
      description: 'High-quality card sleeves',
      link: 'https://example.com/sleeves',
      category: 'protection',
      sort_order: 3,
      is_active: true,
    },
  ]

  for (const product of products) {
    const { error } = await supabase
      .from('products')
      .insert(product)

    if (error) {
      console.error(`  ❌ Failed to create product: ${product.name}`)
    } else {
      console.log(`  ✓ Created product: ${product.name}`)
    }
  }

  console.log(`\n✅ Created ${products.length} test products`)
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Starting test data seeding...')

  // Parse command line arguments
  const args = process.argv.slice(2)
  const counts = { ...DEFAULT_COUNTS }

  args.forEach(arg => {
    const match = arg.match(/--(\w+)=(\d+)/)
    if (match) {
      const [, key, value] = match
      if (key in counts) {
        counts[key as keyof typeof counts] = parseInt(value, 10)
      }
    }
  })

  console.log('\n📋 Seed Configuration:')
  console.log(`   Users: ${counts.users}`)
  console.log(`   Decks: ${counts.decks}`)
  console.log(`   Submissions: ${counts.submissions}`)

  // Confirm before proceeding
  console.log('\n⚠️  This will create test data in your database.')
  console.log('   Make sure you are NOT in production!')

  // Seed data
  const users = await seedUsers(counts.users)
  const decks = await seedDecks(counts.decks)
  const submissions = await seedSubmissions(counts.submissions, users)
  await seedProducts()

  console.log('\n🎉 Test data seeding complete!')
  console.log('\n📊 Summary:')
  console.log(`   Users: ${users.length}`)
  console.log(`   Decks: ${decks.length}`)
  console.log(`   Submissions: ${submissions.length}`)
  console.log(`   Products: 3`)
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error)
}

export { seedUsers, seedDecks, seedSubmissions, seedProducts }
