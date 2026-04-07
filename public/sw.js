// UmatPro Service Worker — TV Display offline support
const CACHE_NAME = 'umatpro-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
]

const PRAYER_CACHE = 'umatpro-prayer-v1'
const DATA_CACHE = 'umatpro-data-v1'

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== PRAYER_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Fetch strategy:
// - Prayer API calls: cache-first with 7-day expiry
// - Supabase data (tv): network-first with cache fallback
// - Static assets: cache-first
// - Everything else: network-first
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Prayer times API — cache for 7 days (adhan.js calculation is deterministic)
  if (url.pathname.startsWith('/api/prayer-times')) {
    event.respondWith(
      caches.open(PRAYER_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) {
          const cachedDate = cached.headers.get('sw-cached-at')
          if (cachedDate) {
            const age = Date.now() - parseInt(cachedDate)
            if (age < 7 * 24 * 60 * 60 * 1000) return cached
          }
        }

        try {
          const response = await fetch(event.request)
          const clone = response.clone()

          // Add timestamp header to cached response
          const headers = new Headers(clone.headers)
          headers.set('sw-cached-at', Date.now().toString())
          const body = await clone.arrayBuffer()
          const cachedResponse = new Response(body, {
            status: clone.status,
            statusText: clone.statusText,
            headers,
          })

          cache.put(event.request, cachedResponse)
          return response
        } catch {
          return cached || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      })
    )
    return
  }

  // TV display data (Supabase API calls from TV page) — network-first, cache fallback
  if (url.pathname.startsWith('/tv/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        try {
          const response = await fetch(event.request)
          if (response.ok) {
            cache.put(event.request, response.clone())
          }
          return response
        } catch {
          const cached = await cache.match(event.request)
          return (
            cached ||
            new Response(JSON.stringify({ error: 'Offline — menampilkan data terakhir' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            })
          )
        }
      })
    )
    return
  }

  // Static assets — cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    )
    return
  }

  // Default — network-first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'UmatPro', body: event.data.text() }
  }

  const { title = 'UmatPro', body = '', icon = '/icon-192.png', url = '/' } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/icon-192.png',
      data: { url },
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url === url)
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})
