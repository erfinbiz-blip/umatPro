---
type: concept
date: 2026-05-11
source_count: 1
tags: [auth, session, security, middleware]
---

# Auth & Session Model

## Route Protection Matrix

| Route | Auth Required | Redirect If No Auth | Notes |
|-------|--------------|---------------------|-------|
| `/` (landing) | No | — | Static HTML page |
| `/app/*` | **No** | — | Public discovery (mosques, prayer times, quotes) |
| `/app/profile` | Client-side | Show login prompt | Profile data requires auth |
| `/app/infaq` | Client-side | Show login prompt | Donation flow requires auth |
| `/dkm/*` | **Yes** | → `/auth` | Protected by `proxy.ts` middleware |
| `/dkm/onboarding` | Yes | → `/auth` | If no mosque → stay, if has mosque → `/dkm` |
| `/superadmin/*` | Yes + superadmin role | → `/auth` or `/app` | Protected by `proxy.ts` + role check |
| `/auth` | No (reverse) | → `/app` if already logged in | Login page |

## Session Persistence

- **No explicit expiry** — `auth.sessions.not_after` = `null`
- **Access token**: expires every 1 hour, auto-refreshed by `@supabase/ssr` client
- **Refresh token**: persists indefinitely
- **Logout**: explicit only (`supabase.auth.signOut()`) or browser cookie clear
- **Behavior**: Like Instagram/Twitter — stay logged in forever

## Middleware (`proxy.ts`)

```typescript
// Protected routes
const TAKMIR_ROUTES = ['/dkm']
const SUPERADMIN_ROUTES = ['/superadmin']
// /app is NOT in either list — intentionally public
```

## Auth Model Design

**Public-first Jamaah experience** — users can browse mosques, view prayer times, and discover content without friction. Login only required for actions that need identity:
- Follow mosque
- Make infaq/donation
- View/edit profile
- Receive notifications

This is intentional per PRD to maximize engagement and reduce onboarding friction.

## Related
- [[sources/prd]] — PRD requirements
- [[concepts/architecture]] — Architecture analysis including auth debt
- [[entities/umat-pro]] — Project overview
