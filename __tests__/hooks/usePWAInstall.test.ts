import { describe, it, expect, vi } from 'vitest'
import * as O from 'fp-ts/Option'
import {
  getDismissedAt,
  isDismissedWithin7Days,
  shouldShowFromDismiss,
  isStandalone,
  getSessionSeen,
  isIOSSafari,
  SEVEN_DAYS,
  DISMISS_KEY,
  SEEN_KEY,
} from '../../hooks/usePWAInstall'

describe('usePWAInstall - pure functions', () => {
  describe('getDismissedAt', () => {
    it('returns Some when dismiss key exists in storage', () => {
      const mockStorage = {
        getItem: vi.fn().mockReturnValue('2024-01-01T00:00:00.000Z'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      } as unknown as Storage

      const result = getDismissedAt(mockStorage)
      expect(O.isSome(result)).toBe(true)
    })

    it('returns None when dismiss key does not exist', () => {
      const mockStorage = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      } as unknown as Storage

      const result = getDismissedAt(mockStorage)
      expect(O.isNone(result)).toBe(true)
    })
  })

  describe('isDismissedWithin7Days', () => {
    it('returns true for a date 3 days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      expect(isDismissedWithin7Days(threeDaysAgo)).toBe(true)
    })

    it('returns false for a date 8 days ago', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      expect(isDismissedWithin7Days(eightDaysAgo)).toBe(false)
    })
  })

  describe('shouldShowFromDismiss', () => {
    it('returns true when not dismissed', () => {
      expect(shouldShowFromDismiss(O.none)).toBe(true)
    })

    it('returns false when dismissed within 7 days', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      expect(shouldShowFromDismiss(O.some(threeDaysAgo))).toBe(false)
    })

    it('returns true when dismissed more than 7 days ago', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      expect(shouldShowFromDismiss(O.some(eightDaysAgo))).toBe(true)
    })
  })

  describe('isStandalone', () => {
    it('returns true when display-mode is standalone', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true })
      expect(isStandalone(mockMatchMedia, navigator)).toBe(true)
    })

    it('returns true when navigator.standalone is true', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
      const mockNavigator = { standalone: true } as any
      expect(isStandalone(mockMatchMedia, mockNavigator)).toBe(true)
    })

    it('returns false when not standalone', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
      const mockNavigator = { standalone: false } as any
      expect(isStandalone(mockMatchMedia, mockNavigator)).toBe(false)
    })
  })

  describe('getSessionSeen', () => {
    it('returns true when session has seen banner', () => {
      const mockStorage = {
        getItem: vi.fn().mockReturnValue('1'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      } as unknown as Storage

      expect(getSessionSeen(mockStorage)).toBe(true)
    })

    it('returns false when session has not seen banner', () => {
      const mockStorage = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      } as unknown as Storage

      expect(getSessionSeen(mockStorage)).toBe(false)
    })
  })

  describe('isIOSSafari', () => {
    it('returns true for iPhone Safari user agent', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      expect(isIOSSafari(userAgent, false)).toBe(true)
    })

    it('returns false for Chrome on iOS', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1'
      expect(isIOSSafari(userAgent, false)).toBe(false)
    })

    it('returns false for Android Chrome', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      expect(isIOSSafari(userAgent, false)).toBe(false)
    })
  })
})
