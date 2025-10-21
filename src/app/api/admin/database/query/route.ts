import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify user is admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const browserSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: userError } = await browserSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is developer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'developer') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Developer access required' },
        { status: 403 }
      )
    }

    const { query, table } = await request.json()

    // For safety, only allow SELECT queries and specific tables
    if (table) {
      // Direct table query
      const { data, error } = await supabase
        .from(table)
        .select('*')

      if (error) {
        return NextResponse.json({
          success: false,
          error: error.message
        })
      }

      return NextResponse.json({
        success: true,
        data,
        rowCount: Array.isArray(data) ? data.length : 0,
        table
      })
    }

    // For raw SQL, we'll use the REST API directly
    if (query && typeof query === 'string') {
      // Only allow SELECT queries for safety
      const trimmedQuery = query.trim().toUpperCase()
      if (!trimmedQuery.startsWith('SELECT')) {
        return NextResponse.json({
          success: false,
          error: 'Only SELECT queries are allowed. For modifications, use the admin panel specific functions.'
        }, { status: 400 })
      }

      try {
        // Execute query via PostgREST
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
            },
            body: JSON.stringify({ query })
          }
        )

        const data = await response.json()

        return NextResponse.json({
          success: true,
          data,
          rowCount: Array.isArray(data) ? data.length : null,
          message: 'Query executed successfully'
        })
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: 'Failed to execute query. Please check syntax and try again.'
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid request - provide either query or table parameter'
    }, { status: 400 })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute query'
      },
      { status: 500 }
    )
  }
}
