/**
 * Logout Route
 * Handles user logout and session cleanup
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const origin = new URL(request.url).origin

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirect to home page with logged out message
  return NextResponse.redirect(`${origin}/?logged_out=true`, 303)
}

// Also support GET for direct navigation
export async function GET(request: Request) {
  return POST(request)
}
