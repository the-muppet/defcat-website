# Observability Stack

This directory contains the observability infrastructure for DefCat DeckVault using OpenTelemetry, Prometheus, Grafana, and Jaeger.

## Quick Start

### 1. Start the Observability Stack

```bash
cd observability
docker compose up -d
```

This starts:
- **OpenTelemetry Collector** (port 4318) - Receives traces and metrics
- **Jaeger** (port 16686) - Distributed tracing UI
- **Prometheus** (port 9090) - Metrics storage
- **Grafana** (port 3001) - Visualization dashboards

### 2. Enable OpenTelemetry in Your App

Add to your `.env.local`:

```env
ENABLE_OTEL=true
```

### 3. Restart Your Dev Server

```bash
npm run dev
```

## Access the UIs

- **Grafana**: http://localhost:3001 (admin/admin)
  - Pre-configured dashboard: "Service Overview"
- **Jaeger**: http://localhost:16686
  - View distributed traces
- **Prometheus**: http://localhost:9090
  - Query raw metrics

## Application Endpoints

- **Health Check**: http://localhost:8888/api/health
- **Metrics**: http://localhost:8888/api/metrics (Prometheus format)

## Features

### Traces
- HTTP request/response tracking
- Database query tracing (via Supabase)
- External API calls (Moxfield, Scryfall)
- Error tracking with stack traces

### Metrics
- Request duration (p50, p95, p99)
- Error rates
- Business metrics (deck submissions, user logins)
- System metrics (memory, CPU)

### Logs
- Structured JSON logging with trace correlation
- Located in `src/lib/observability/logger.ts`

## Configuration

### Environment Variables

```env
# Enable OpenTelemetry (required)
ENABLE_OTEL=true

# Optional: Custom OTLP endpoint (default: http://localhost:4318)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Prometheus Alerts

Alert rules are in `alerts/service-alerts.yml`:
- ServiceDown (>5min downtime)
- HighErrorRate (>5% errors for 5min)
- HighLatency (p95 >1s for 5min)
- DatabaseUnhealthy
- HighMemoryUsage (>80%)

## Stopping the Stack

```bash
cd observability
docker compose down
```

## Production Deployment

For production, consider:
1. Use managed services (Datadog, New Relic, Honeycomb)
2. Or deploy the stack to your infrastructure with:
   - Persistent volumes for Prometheus data
   - Authentication for Grafana
   - TLS for all endpoints
   - Resource limits in docker-compose.yml

## Troubleshooting

### "Connection Refused" Errors

If you see `ECONNREFUSED ::1:4318` errors:
- Make sure `ENABLE_OTEL=true` is set in `.env.local`
- Start the observability stack: `docker compose up -d`
- Verify containers are running: `docker compose ps`

### No Data in Grafana

- Check Prometheus targets: http://localhost:9090/targets
- Verify app is running and accessible
- Check Prometheus scrape config in `prometheus.yml`

### Traces Not Appearing in Jaeger

- Verify OTLP Collector is running: `docker compose ps`
- Check collector logs: `docker compose logs otel-collector`
- Ensure `ENABLE_OTEL=true` in your `.env.local`
