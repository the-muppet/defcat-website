import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/observability/logger'

export const dynamic = 'force-dynamic'

/**
 * Prometheus metrics endpoint
 * Exposes application metrics in Prometheus text format
 */

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Query actual metrics from database
    const [
      { count: deckSubmissionsCount },
      { count: deckImportsCount },
      { count: userCount },
      { count: roastSubmissionsCount },
    ] = await Promise.all([
      supabase.from('deck_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('decks').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('deck_submissions').select('*', { count: 'exact', head: true }).eq('submission_type', 'roast'),
    ])

    // Get submission counts by status
    const { data: submissionsByStatus } = await supabase
      .from('deck_submissions')
      .select('status')

    const statusCounts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
    }

    submissionsByStatus?.forEach((sub) => {
      if (sub.status in statusCounts) {
        statusCounts[sub.status as keyof typeof statusCounts]++
      }
    })

    // Get user counts by tier
    const { data: usersByTier } = await supabase
      .from('profiles')
      .select('patreon_tier')

    const tierCounts: Record<string, number> = {}
    usersByTier?.forEach((user) => {
      const tier = user.patreon_tier || 'none'
      tierCounts[tier] = (tierCounts[tier] || 0) + 1
    })

    const memory = process.memoryUsage()

    const metrics = `
# HELP deck_submissions_total Total number of deck submissions
# TYPE deck_submissions_total counter
deck_submissions_total ${deckSubmissionsCount || 0}

# HELP roast_submissions_total Total number of roast submissions
# TYPE roast_submissions_total counter
roast_submissions_total ${roastSubmissionsCount || 0}

# HELP deck_imports_total Total number of deck imports from Moxfield
# TYPE deck_imports_total counter
deck_imports_total ${deckImportsCount || 0}

# HELP users_total Total number of registered users
# TYPE users_total counter
users_total ${userCount || 0}

# HELP submissions_by_status Submissions grouped by status
# TYPE submissions_by_status gauge
submissions_by_status{status="pending"} ${statusCounts.pending}
submissions_by_status{status="in_progress"} ${statusCounts.in_progress}
submissions_by_status{status="completed"} ${statusCounts.completed}
submissions_by_status{status="rejected"} ${statusCounts.rejected}

# HELP users_by_tier Users grouped by Patreon tier
# TYPE users_by_tier gauge
${Object.entries(tierCounts).map(([tier, count]) =>
  `users_by_tier{tier="${tier}"} ${count}`
).join('\n')}

# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="heapUsed"} ${memory.heapUsed}
nodejs_memory_usage_bytes{type="heapTotal"} ${memory.heapTotal}
nodejs_memory_usage_bytes{type="rss"} ${memory.rss}
nodejs_memory_usage_bytes{type="external"} ${memory.external}

# HELP nodejs_uptime_seconds Node.js process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}
`.trim()

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    })
  } catch (error) {
    logger.error('Failed to generate metrics', error instanceof Error ? error : undefined)

    // Return minimal metrics on error
    const memory = process.memoryUsage()
    const fallbackMetrics = `
# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="heapUsed"} ${memory.heapUsed}
nodejs_memory_usage_bytes{type="heapTotal"} ${memory.heapTotal}
nodejs_memory_usage_bytes{type="rss"} ${memory.rss}
nodejs_memory_usage_bytes{type="external"} ${memory.external}

# HELP nodejs_uptime_seconds Node.js process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}
`.trim()

    return new NextResponse(fallbackMetrics, {
      status: 200, // Return 200 so Prometheus doesn't mark as down
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    })
  }
}
