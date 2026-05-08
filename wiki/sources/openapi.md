---
type: source
date: 2026-05-09
source_count: 1
tags: [api, openapi, documentation]
---

# OpenAPI API Documentation

## Source
[[sources/openapi.yaml]]

## Summary
OpenAPI 3.0 specification for UmatPro backend API endpoints.

## Endpoints Documented

### Auth
- `GET /auth` — Authentication page (OTP login)

### Campaigns (Phase A)
- `GET /dkm/kampanye` — DKM campaign management
- `GET /app/kampanye` — Jamaah campaign discovery
- `GET /app/infaq` — Infaq with optional campaign pre-selection

### API Routes
- `POST /api/infaq/generate` — Generate unique infaq code
- `POST /api/seed-demo` — Seed demo data
- `GET /api/demo-session` — Demo auto-login

## See Also
- [[sources/prd]] — product requirements
- [[entities/umat-pro]] — platform overview
