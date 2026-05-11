'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

interface PWAInstallState {
  canShow: boolean
  isIOS: boolean
  deferredPrompt: any | null
  dismiss: () => void
  install: () => Promise<void>
}

export const DISMISS_KEY = 'umatpro_pwa_dismissed'
export const SEEN_KEY = 'umatpro_pwa_seen'
export const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

// Pure functions with fp-ts - exported for testing

export const getDismissedAt = (storage: Storage): O.Option<string> =>
  O.fromNullable(storage.getItem(DISMISS_KEY))

export const isDismissedWithin7Days = (dismissedAt: string): boolean => {
  const dismissedTime = new Date(dismissedAt).getTime()
  return Date.now() - dismissedTime < SEVEN_DAYS
}

export const shouldShowFromDismiss = (dismissedAt: O.Option<string>): boolean =>
  pipe(
    dismissedAt,
    O.fold(
      () => true, // Not dismissed, should show
      (date) => !isDismissedWithin7Days(date) // Show if dismissed > 7 days ago
    )
  )

export const isStandalone = (matchMedia: (query: string) => MediaQueryList, navigator: Navigator): boolean =>
  matchMedia('(display-mode: standalone)').matches ||
  (navigator as any).standalone === true

export const getSessionSeen = (storage: Storage): boolean =>
  storage.getItem(SEEN_KEY) !== null

export const isIOSSafari = (userAgent: string, hasMSStream: boolean): boolean => {
  const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !hasMSStream
  // Exclude Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS), Opera (OPiOS)
  const isNotOtherBrowser = !/(CriOS|FxiOS|EdgiOS|OPiOS)/.test(userAgent)
  return isIOSDevice && isNotOtherBrowser
}

export function usePWAInstall(): PWAInstallState {
  const [canShow, setCanShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPromptRef = useRef<any>(null)

  useEffect(() => {
    // Early return if standalone
    if (isStandalone(window.matchMedia, navigator)) return

    // Check dismissal using fp-ts
    const dismissedAt = getDismissedAt(localStorage)
    if (!shouldShowFromDismiss(dismissedAt)) return

    // Check session
    if (getSessionSeen(sessionStorage)) return

    // Listen for beforeinstallprompt (Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setCanShow(true)
      sessionStorage.setItem(SEEN_KEY, '1')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS Safari: no beforeinstallprompt, show educational banner
    if (isIOSSafari(navigator.userAgent, !!(window as any).MSStream)) {
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
