/**
 * Structured Logging Utility
 * Production-ready JSON logging with correlation IDs, PII redaction, and sampling
 */

import { trace } from '@opentelemetry/api'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  userId?: string
  sessionId?: string
  [key: string]: any
}

const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
]

class Logger {
  private serviceName = 'defcat-deckvault'
  private minLogLevel: LogLevel
  private samplingRate: number = 1.0

  constructor() {
    const envLevel = (process.env.LOG_LEVEL?.toLowerCase() || 'info') as LogLevel
    this.minLogLevel = LOG_LEVEL_VALUES[envLevel] !== undefined ? envLevel : 'info'
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[this.minLogLevel]
  }

  private shouldSample(): boolean {
    return Math.random() < this.samplingRate
  }

  /**
   * Redact sensitive data from log context
   * Replaces values of known sensitive keys with '[REDACTED]'
   */
  private redactSensitiveData(ctx?: LogContext): LogContext | undefined {
    if (!ctx) return ctx

    const redacted: LogContext = {}

    for (const [key, value] of Object.entries(ctx)) {
      const lowerKey = key.toLowerCase()
      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
        lowerKey.includes(sensitiveKey.toLowerCase())
      )

      if (isSensitive) {
        redacted[key] = '[REDACTED]'
      } else if (key === 'email') {
        // Partially redact emails: u***@example.com
        if (typeof value === 'string' && value.includes('@')) {
          const [localPart, domain] = value.split('@')
          redacted[key] = `${localPart[0]}***@${domain}`
        } else {
          redacted[key] = value
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively redact nested objects
        redacted[key] = this.redactSensitiveData(value as LogContext)
      } else {
        redacted[key] = value
      }
    }

    return redacted
  }

  private formatLog(level: LogLevel, message: string, ctx?: LogContext) {
    const span = trace.getActiveSpan()
    const spanContext = span?.spanContext()

    const redactedCtx = this.redactSensitiveData(ctx)

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
      ...redactedCtx,
    })
  }

  debug(message: string, ctx?: LogContext) {
    if (this.shouldLog('debug') && this.shouldSample()) {
      console.debug(this.formatLog('debug', message, ctx))
    }
  }

  info(message: string, ctx?: LogContext) {
    if (this.shouldLog('info') && this.shouldSample()) {
      console.info(this.formatLog('info', message, ctx))
    }
  }

  warn(message: string, ctx?: LogContext) {
    if (this.shouldLog('warn') && this.shouldSample()) {
      console.warn(this.formatLog('warn', message, ctx))
    }
  }

  error(message: string, error?: Error, ctx?: LogContext) {
    if (!this.shouldLog('error')) return

    const errorCtx = error
      ? {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          ...ctx,
        }
      : ctx

    console.error(this.formatLog('error', message, errorCtx))
  }

  /**
   * Create a sampled logger for high-frequency events
   * @param rate Sampling rate between 0 and 1 (e.g., 0.1 = 10% of logs)
   */
  sample(rate: number): Logger {
    const sampledLogger = new Logger()
    sampledLogger.samplingRate = Math.max(0, Math.min(1, rate))
    return sampledLogger
  }

  /**
   * Manually redact specific keys from context
   * @param keys Array of keys to redact
   * @param ctx Context object
   */
  redact(keys: string[], ctx: LogContext): LogContext {
    const redacted = { ...ctx }
    for (const key of keys) {
      if (key in redacted) {
        redacted[key] = '[REDACTED]'
      }
    }
    return redacted
  }
}

export const logger = new Logger()
