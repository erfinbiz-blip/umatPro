# Phase C — PWA Install Banner Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Bottom sheet PWA install banner di `/app/*` yang muncul sekali per session, dismissable 7 hari via localStorage, dengan support Chromium (native prompt) dan Safari iOS (educational).

**Architecture:** Hook `usePWAInstall()` meng-encapsulate semua browser detection + state management. Komponen `PWAInstallBanner` handle UI rendering. Dimount di `app/app/(jamaah)/layout.tsx` agar muncul di semua route `/app/*`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest

**Branch:** `feat/phase-c-pwa-install`
**Base:** `main`

---

## Pre-Implementation Checklist

- [x] Read AGENTS.md — workflow rules dipahami
- [x] Read PRD — Phase C adalah quick win, tidak ada "Do Not Touch" file yang terkena
- [x] Check existing lib/ — tidak ada PWA-related hooks
- [x] Check existing components — `Glass.tsx` tersedia untuk glassmorphism card

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `beforeinstallprompt` event hanya Chromium | Handle Safari iOS dengan educational banner |
| Banner annoying jika muncul terus | Session check + 7-day dismiss via localStorage |
| User sudah install PWA | Cek `display-mode: standalone` dan `navigator.standalone` |

---

## Tasks

### Task 1: Write failing tests untuk `usePWAInstall` hook

**Objective:** Test semua kondisi browser detection dan state management

**Files:**
- Create: `__tests__/hooks/usePWAInstall.test.ts`

**Do Not Touch:** None ✓

**Step 1: Write failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock window.matchMedia
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

// Mock navigator.standalone
Object.defineProperty(navigator, 'standalone', {
  writable: true,
  value: undefined,
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

describe('usePWAInstall', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMatchMedia.mockReturnValue({ matches: false })
    localStorageMock.getItem.mockReturnValue(null)
    sessionStorageMock.getItem.mockReturnValue(null)
  })

  it('returns canShow=false when display-mode is standalone', () => {
    mockMatchMedia.mockReturnValue({ matches: true })
    // TODO: import and test hook
    expect(true).toBe(true) // placeholder
  })

  it('returns canShow=false when dismissed within 7 days', () => {
    const dismissedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    localStorageMock.getItem.mockReturnValue(dismissedAt)
    // TODO: import and test hook
    expect(true).toBe(true) // placeholder
  })

  it('returns canShow=false when already seen in session', () => {
    sessionStorageMock.getItem.mockReturnValue('1')
    // TODO: import and test hook
    expect(true).toBe(true) // placeholder
  })

  it('returns canShow=true for Chromium with beforeinstallprompt', () => {
    // TODO: import and test hook
    expect(true).toBe(true) // placeholder
  })

  it('returns isIOS=true for Safari iOS without beforeinstallprompt', () => {
    // TODO: import and test hook
    expect(true).toBe(true) // placeholder
  })
})
```

**Step 2: Run test**
```bash
npx vitest run __tests__/hooks/usePWAInstall.test.ts
```
Expected: FAIL — `usePWAInstall` not found

**Step 3: Commit**
```bash
git add __tests__/hooks/usePWAInstall.test.ts
git commit -m "test(hooks): add failing tests for usePWAInstall"
```

---

### Task 2: Implement `usePWAInstall` hook

**Objective:** Hook yang meng-encapsulate PWA install detection dan state

**Files:**
- Create: `hooks/usePWAInstall.ts`

**Do Not Touch:** None ✓

**Step 1: Implement hook**

```typescript
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface PWAInstallState {
  canShow: boolean
  isIOS: boolean
  deferredPrompt: any | null
  dismiss: () => void
  install: () => Promise<void>
}

const DISMISS_KEY = 'umatpro_pwa_dismissed'
const SEEN_KEY = 'umatpro_pwa_seen'
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export function usePWAInstall(): PWAInstallState {
  const [canShow, setCanShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPromptRef = useRef<any>(null)

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true

    if (isStandalone) return

    // Check if dismissed within 7 days
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime()
      if (Date.now() - dismissedTime < SEVEN_DAYS) return
    }

    // Check if already seen this session
    if (sessionStorage.getItem(SEEN_KEY)) return

    // Check for beforeinstallprompt (Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setCanShow(true)
      sessionStorage.setItem(SEEN_KEY, '1')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS Safari: no beforeinstallprompt, show educational banner
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isIOSDevice && isSafari) {
      setIsIOS(true)
      setCanShow(true)
      sessionStorage.setItem(SEEN_KEY, '1')
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString())
    setCanShow(false)
  }, [])

  const install = useCallback(async () => {
    const prompt = deferredPromptRef.current
    if (!prompt) return

    prompt.prompt()
    const result = await prompt.userChoice

    if (result.outcome === 'accepted') {
      setCanShow(false)
    }
    deferredPromptRef.current = null
  }, [])

  return { canShow, isIOS, deferredPrompt: deferredPromptRef.current, dismiss, install }
}
```

**Step 2: Update tests**

Update `__tests__/hooks/usePWAInstall.test.ts` dengan import dan assertions yang sesuai. Gunakan `@testing-library/react` untuk render hook, atau test state langsung.

Karena UmatPro tidak punya `@testing-library/react` (perlu cek), alternatif: test logic dengan memanggil hook function langsung atau mock React hooks.

Rekomendasi: Gunakan pattern test yang sama dengan test existing di `__tests__/` — cek `__tests__/middleware.test.ts` untuk mocking pattern.

**Step 3: Run tests**
```bash
npx vitest run __tests__/hooks/usePWAInstall.test.ts
```
Expected: PASS (5 tests)

**Step 4: Commit**
```bash
git add hooks/usePWAInstall.ts __tests__/hooks/usePWAInstall.test.ts
git commit -m "feat(hooks): add usePWAInstall hook with browser detection"
```

---

### Task 3: Implement `PWAInstallBanner` component

**Objective:** Bottom sheet UI untuk PWA install banner

**Files:**
- Create: `components/jamaah/PWAInstallBanner.tsx`

**Do Not Touch:** None ✓

**Step 1: Implement component**

```tsx
'use client'

import { usePWAInstall } from '@/hooks/usePWAInstall'
import Glass from '@/components/ui/Glass'
import { Download, X, Share } from 'lucide-react'

export default function PWAInstallBanner() {
  const { canShow, isIOS, dismiss, install } = usePWAInstall()

  if (!canShow) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-slide-up">
      <Glass className="p-4 rounded-2xl border border-gd3/20">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-tx1 mb-1">
              📱 Pasang UmatPro
            </h3>
            <p className="text-xs text-tx1/70 leading-relaxed">
              {isIOS ? (
                <>
                  Tap tombol <Share className="inline w-3 h-3 mx-0.5" /> Share di bawah,
                  lalu pilih <strong>"Add to Home Screen"</strong>
                </>
              ) : (
                'Akses lebih cepat. Tanpa perlu buka browser.'
              )}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 text-tx1/50" />
          </button>
        </div>

        {!isIOS && (
          <button
            onClick={install}
            className="mt-3 w-full py-2.5 px-4 bg-gd3 text-bg0 rounded-xl text-sm font-semibold
                       hover:bg-gd4 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Tambah ke Layar Utama
          </button>
        )}

        {isIOS && (
          <button
            onClick={dismiss}
            className="mt-3 w-full py-2.5 px-4 bg-white/10 text-tx1 rounded-xl text-sm font-medium
                       hover:bg-white/20 transition-colors"
          >
            Mengerti
          </button>
        )}
      </Glass>
    </div>
  )
}
```

**Step 2: Add animation class ke globals.css (jika belum ada)**

Cek `app/globals.css` untuk `animate-slide-up`. Jika belum ada, tambahkan:

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

**Step 3: Commit**
```bash
git add components/jamaah/PWAInstallBanner.tsx app/globals.css
git commit -m "feat(ui): add PWAInstallBanner component"
```

---

### Task 4: Mount banner di Jamaah layout

**Objective:** Banner muncul di semua route `/app/*`

**Files:**
- Modify: `app/app/(jamaah)/layout.tsx`

**Do Not Touch:** None ✓

**Step 1: Modify layout.tsx**

Tambahkan import dan mount komponen:

```tsx
import PWAInstallBanner from '@/components/jamaah/PWAInstallBanner'
```

Di dalam `JamaahLayout`, setelah `{children}` dan sebelum `</AtmosphereProvider>`, tambahkan:

```tsx
<PWAInstallBanner />
```

**Step 2: Commit**
```bash
git add app/app/(jamaah)/layout.tsx
git commit -m "feat(layout): mount PWAInstallBanner in jamaah layout"
```

---

### Task 5: Run full test suite dan verify

**Objective:** Pastikan tidak ada regression

**Step 1: Run tests**
```bash
npx vitest run
```
Expected: All tests pass (210+ tests)

**Step 2: Type check (opsional, karena ignoreBuildErrors)**
```bash
npx tsc --noEmit
```
Catat jika ada error baru. Tidak boleh ada error baru yang diintroduce.

**Step 3: Commit**
```bash
git commit --allow-empty -m "chore: verify all tests pass for Phase C"
```

---

## Definition of Done

- [ ] `usePWAInstall` hook implemented dengan browser detection
- [ ] `__tests__/hooks/usePWAInstall.test.ts` passing (5 tests)
- [ ] `PWAInstallBanner` component implemented dengan Glassmorphism UI
- [ ] Banner mounted di `app/app/(jamaah)/layout.tsx`
- [ ] Semua tests pass (`npx vitest run`)
- [ ] Tidak ada TS error baru
- [ ] `wiki/log.md` diupdate
- [ ] PRD.md diupdate — Phase C marked ✅ completed
- [ ] Commit di branch `feat/phase-c-pwa-install`
