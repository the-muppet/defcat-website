import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Prometheus metrics endpoint
 * Exposes application metrics in Prometheus text format
 */

export async function GET() {
  // In production, you would collect actual metrics here
  // For now, we'll return a basic template

  const metrics = `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api/health",status_code="200"} 42

# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.005"} 24
http_request_duration_seconds_bucket{le="0.01"} 33
http_request_duration_seconds_bucket{le="0.025"} 100
http_request_duration_seconds_bucket{le="0.05"} 200
http_request_duration_seconds_bucket{le="0.1"} 250
http_request_duration_seconds_bucket{le="+Inf"} 300
http_request_duration_seconds_sum 15.5
http_request_duration_seconds_count 300

# HELP deck_submissions_total Total number of deck submissions
# TYPE deck_submissions_total counter
deck_submissions_total 156

# HELP deck_imports_total Total number of deck imports from Moxfield
# TYPE deck_imports_total counter
deck_imports_total 234

# HELP user_logins_total Total number of user logins
# TYPE user_logins_total counter
user_logins_total 89

# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}
nodejs_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}
nodejs_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}
nodejs_memory_usage_bytes{type="external"} ${process.memoryUsage().external}

# HELP nodejs_uptime_seconds Node.js process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}
`.trim()

  return new NextResponse(metrics, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
    },
  })
}
