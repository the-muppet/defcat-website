import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

// Helper to create Supabase client at runtime
function getSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    // Verify user is developer
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const browserSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const {
      data: { user },
      error: userError,
    } = await browserSupabase.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is developer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, patreon_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'developer') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Developer access required' },
        { status: 403 }
      )
    }

    // Fetch real tier from Patreon (if available)
    // For now, we'll just reset to 'Citizen' as default
    // TODO: Implement actual Patreon API call to get real tier
    const defaultTier = 'Citizen'

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ patreon_tier: defaultTier })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: `Tier reset to ${defaultTier}`,
    })
  } catch (error) {
    console.error('Failed to reset tier:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset tier',
      },
      { status: 500 }
    )
  }
}
