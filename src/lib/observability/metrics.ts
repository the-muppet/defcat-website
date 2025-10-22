/**
 * Application Metrics
 * Custom business and performance metrics
 */

import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('defcat-deckvault')

// HTTP Request Metrics
export const httpRequestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'Duration of HTTP requests in milliseconds',
  unit: 'ms',
})

export const httpRequestsTotal = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
})

export const httpRequestErrors = meter.createCounter('http_request_errors_total', {
  description: 'Total number of HTTP request errors',
})

// Database Metrics
export const dbQueryDuration = meter.createHistogram('db_query_duration_ms', {
  description: 'Duration of database queries in milliseconds',
  unit: 'ms',
})

export const dbConnectionsActive = meter.createUpDownCounter('db_connections_active', {
  description: 'Number of active database connections',
})

// Business Metrics
export const deckSubmissions = meter.createCounter('deck_submissions_total', {
  description: 'Total number of deck submissions',
})

export const deckImports = meter.createCounter('deck_imports_total', {
  description: 'Total number of deck imports from Moxfield',
})

export const userLogins = meter.createCounter('user_logins_total', {
  description: 'Total number of user logins',
})

export const patreonSyncs = meter.createCounter('patreon_syncs_total', {
  description: 'Total number of Patreon tier syncs',
})

// Cache Metrics
export const cacheHits = meter.createCounter('cache_hits_total', {
  description: 'Total number of cache hits',
})

export const cacheMisses = meter.createCounter('cache_misses_total', {
  description: 'Total number of cache misses',
})

// Helper function to track request duration
export function trackRequestDuration(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
) {
  httpRequestDuration.record(durationMs, {
    method,
    path,
    status_code: statusCode.toString(),
  })

  httpRequestsTotal.add(1, {
    method,
    path,
    status_code: statusCode.toString(),
  })

  if (statusCode >= 400) {
    httpRequestErrors.add(1, {
      method,
      path,
      status_code: statusCode.toString(),
    })
  }
}
