---
type: concept
date: 2026-05-06
source_count: 2
tags: [technology, stack, nextjs, supabase]
---

# Tech Stack

UmatPro's technology stack is modern, full-stack JavaScript/TypeScript with serverless deployment.

## Frontend
- **[[Next.js]] 14** — App Router, React framework
- **TypeScript** — type safety
- **Tailwind CSS** — utility-first styling with custom tokens:
  - `gd3` = `#D4AF37` (gold)
  - `gd4` = `#F0D060`
  - `em3` = `#065F46`, `em4` = `#10B981` (emerald)
  - `tx1` = `#F0FDF4`, `bg0` = `#060D08`
- **[[lucide-react]]** — icon library
- **[[clsx]]** — conditional className utility
- **[[qrcode.react]]** — QR code generation

## Backend
- **Next.js Route Handlers** — API endpoints in `app/api/*`
- **[[Supabase]] Auth Admin API** — for demo session generation

## Database & Storage
- **[[Supabase]] PostgreSQL** — main database
  - Tables: profiles, mosques, mosque_roles, follows, infaq_codes, kas_transactions, announcements, kajians, prayer_schedules, campaigns
  - Migrations: 001-003 live
  - RLS policies active
- **Supabase Storage** — bucket `kas-receipts` for transaction photos

## Auth
- **[[Supabase Auth]]** — magic link OTP
- **[[@supabase/ssr]]** — server-side auth with cookie sessions
- Middleware protection for `/dkm/*` routes

## Deployment
- **[[Vercel]]** — auto-deploy from `main` branch
- **Domain**: `umatpro.com` (nameserver: `ns1/ns2.vercel-dns.com`)

## Testing
- **[[Vitest]]** + `@edge-runtime/vm`
- 9 test cases (middleware auth + daily quotes)
- Pre-push hook blocks push on failure

## Special Libraries
- **[[adhan]]** — prayer time calculation from GPS coordinates

## See Also
- [[entities/umat-pro]] — project overview
- [[sources/context]] — detailed context
- [[sources/prd]] — requirements doc
