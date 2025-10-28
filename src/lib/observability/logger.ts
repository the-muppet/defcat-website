/**
 * Structured Logging Utility
 * Production-ready JSON logging with correlation IDs
 */

import { trace, context } from '@opentelemetry/api'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  userId?: string
  sessionId?: string
  [key: string]: any
}

class Logger {
  private serviceName = 'defcat-deckvault'

  private formatLog(level: LogLevel, message: string, ctx?: LogContext) {
    const span = trace.getActiveSpan()
    const spanContext = span?.spanContext()

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
      ...ctx,
    })
  }

  debug(message: string, ctx?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('debug', message, ctx))
    }
  }

  info(message: string, ctx?: LogContext) {
    console.info(this.formatLog('info', message, ctx))
  }

  warn(message: string, ctx?: LogContext) {
    console.warn(this.formatLog('warn', message, ctx))
  }

  error(message: string, error?: Error, ctx?: LogContext) {
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
}

export const logger = new Logger()
