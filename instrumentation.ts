/**
 * Next.js Instrumentation Hook
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only enable OpenTelemetry if explicitly enabled via environment variable
    // Set ENABLE_OTEL=true in .env.local to enable observability
    if (process.env.ENABLE_OTEL === 'true') {
      const { registerOTel } = await import('./src/lib/observability/otel')
      await registerOTel()
    }
  }
}
