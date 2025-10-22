/**
 * OpenTelemetry Setup for Next.js
 * Provides distributed tracing, metrics, and logging
 */

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api'

export async function registerOTel() {
  // Enable debug logging in development
  if (process.env.NODE_ENV === 'development') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)
  }

  const sdk = new NodeSDK({
    serviceName: 'defcat-deckvault',

    // Trace exporter - can send to Jaeger, Zipkin, or OTLP collector
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    }),

    // Metrics exporter
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
      }),
      exportIntervalMillis: 60000, // Export every 60 seconds
    }),

    // Auto-instrumentation for common libraries
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Too noisy for Next.js
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-fetch': {
          enabled: true,
        },
      }),
    ],
  })

  try {
    await sdk.start()
    console.log('OpenTelemetry instrumentation started')
  } catch (error) {
    console.error('Error initializing OpenTelemetry:', error)
  }

  // Graceful shutdown on process termination
  process.on('SIGTERM', async () => {
    try {
      await sdk.shutdown()
      console.log('OpenTelemetry instrumentation shut down')
    } catch (error) {
      console.error('Error shutting down OpenTelemetry:', error)
    }
  })
}
