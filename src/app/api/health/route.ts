import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ComponentHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency_ms?: number
  error?: string
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime_seconds: number
  version: string
  components: {
    database: ComponentHealth
    supabase_auth: ComponentHealth
  }
}

const startTime = Date.now()

export async function GET() {
  const checks: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '1.0.0',
    components: {
      database: { status: 'healthy' },
      supabase_auth: { status: 'healthy' },
    },
  }

  try {
    // Check database connectivity
    const dbStart = Date.now()
    const supabase = await createClient()
    const { error: dbError } = await supabase.from('decks').select('id').limit(1).single()

    checks.components.database.latency_ms = Date.now() - dbStart

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
      checks.components.database.status = 'unhealthy'
      checks.components.database.error = dbError.message
      checks.status = 'degraded'
    }

    // Check Supabase auth
    const authStart = Date.now()
    const { error: authError } = await supabase.auth.getSession()

    checks.components.supabase_auth.latency_ms = Date.now() - authStart

    if (authError) {
      checks.components.supabase_auth.status = 'degraded'
      checks.components.supabase_auth.error = authError.message
      if (checks.status === 'healthy') {
        checks.status = 'degraded'
      }
    }

  } catch (error) {
    checks.status = 'unhealthy'
    checks.components.database.status = 'unhealthy'
    checks.components.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  const statusCode = checks.status === 'healthy' ? 200 : checks.status === 'degraded' ? 200 : 503

  return NextResponse.json(checks, { status: statusCode })
}
