---
type: entity
date: 2026-05-06
source_count: 2
tags: [project, mosque, indonesia, platform]
---

# UmatPro

UmatPro is a digital platform for Indonesian mosque ecosystems, enabling digital presence, infaq/donation management, and community engagement.

## Why It Exists
> "Kerinduan untuk dekat dengan masjid dan berkontribusi untuk masjid" — not built for business, but out of personal longing to stay connected with mosques when physical presence isn't possible.

## Core Values
- **Transparansi** — trust in financial management
- **Kedekatan** — feeling connected despite distance
- **Kemudahan** — usable by non-technical mosque admins (DKM)
- **Keberkahan** — every line of code as ongoing charity ([[amal-jariyah]])

## Key Metrics
- Tests: 9/9 passing
- Pre-existing TS errors: 21 (non-blocking)
- Demo data: seeded
- Status: Pre-release, 1 env var blocker

## Architecture
See [[tech-stack]] for detailed technology breakdown.

## Monetization Model
- **Free tier**: Basic features
- **Premium tier**: Rp 99rb/month or Rp 899rb/year
  - Broadcast WA unlimited
  - Laporan PDF (not yet built)
  - Verifikasi masjid badge (not yet built)
  - Analytics jamaah (not yet built)

## User Types
- **Jamaah** — mosque congregants, use `/app/*` routes
- **DKM/Takmir** — mosque administrators, use `/dkm/*` routes
- **Admin Platform** — UmatPro staff, verify mosques

## Key Features
### Jamaah
- Prayer schedule strip with countdown
- Daily Islamic quotes (31 quotes, deterministic rotation)
- Discover mosques with map
- Mosque profile pages (public)
- Digital infaq
- Profile management

### DKM
- Dashboard with kas management
- Infaq verification
- Kajian (study session) CRUD
- Announcement CRUD (4 categories)
- QR code generation for infaq
- WA broadcast (premium-gated)
- TV display for mosque
- Settings management

## See Also
- [[sources/context]] — detailed project context
- [[sources/prd]] — product requirements
- [[supabase]] — database details
- [[vercel]] — deployment info
