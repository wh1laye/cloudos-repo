const V = '2'
const CACHE = 'cloudos-' + V
const SCOPE = self.registration.scope
const CORE_FILES = ['offline.html', 'manifest.webmanifest', 'icon.svg', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png']
const CORE_PAGES = ['./', 'handbook/', 'handbook/en/']
const ASSET = /\.(css|js|png|svg|webp|jpg|jpeg|ico|woff2?|json|webmanifest)$/i
const MAX = 300

const forumPath = new URL('forum/', SCOPE).pathname
const isForum = u => u.pathname.startsWith(forumPath)

async function add(c, url) {
  try {
    const r = await fetch(url, { cache: 'reload' })
    if (r.ok && r.type === 'basic') await c.put(url, r)
  } catch (e) {}
}

async function addPage(c, url) {
  try {
    const r = await fetch(url, { cache: 'reload' })
    if (!r.ok) return
    const html = await r.clone().text()
    await c.put(url, r)
    const urls = new Set()
    html.replace(/(?:src|href)=["']([^"'#]+)["']/g, (m, u) => {
      try {
        const a = new URL(u, url)
        if (a.origin === location.origin && ASSET.test(a.pathname) && !isForum(a)) urls.add(a.href)
      } catch (e) {}
      return m
    })
    await Promise.all([...urls].map(u => add(c, u)))
  } catch (e) {}
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE)
    await Promise.all(CORE_FILES.map(f => add(c, new URL(f, SCOPE).href)))
    await Promise.all(CORE_PAGES.map(p => addPage(c, new URL(p, SCOPE).href)))
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const ks = await caches.keys()
    await Promise.all(ks.filter(k => k.startsWith('cloudos-') && k !== CACHE).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

async function trim(c) {
  const k = await c.keys()
  if (k.length > MAX) await Promise.all(k.slice(0, k.length - MAX).map(x => c.delete(x)))
}

async function offlinePage() {
  const c = await caches.open(CACHE)
  const r = await c.match(new URL('offline.html', SCOPE).href)
  let t = r ? await r.text() : '<meta charset="utf-8"><h1>нет сети</h1>'
  t = t.replace('<head>', '<head><base href="' + SCOPE + '">')
  return new Response(t, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}

async function fromCache(c, req, url) {
  let r = await c.match(req)
  if (r) return r
  if (req.mode === 'navigate') {
    const u = new URL(url.href)
    u.search = ''
    r = await c.match(u.href)
    if (r) return r
    if (u.pathname.endsWith('/')) {
      u.pathname += 'index.html'
      r = await c.match(u.href)
      if (r) return r
    } else if (u.pathname.endsWith('/index.html')) {
      u.pathname = u.pathname.slice(0, -'index.html'.length)
      r = await c.match(u.href)
      if (r) return r
    }
  } else {
    r = await c.match(req, { ignoreSearch: true })
    if (r) return r
  }
  return null
}

async function handle(req, url) {
  if (isForum(url)) {
    try {
      return await fetch(req)
    } catch (e) {
      if (req.mode === 'navigate') return offlinePage()
      return Response.error()
    }
  }
  const c = await caches.open(CACHE)
  try {
    const res = await fetch(req)
    if (res.ok && res.type === 'basic') {
      c.put(req, res.clone()).then(() => trim(c)).catch(() => {})
    }
    return res
  } catch (e) {
    const hit = await fromCache(c, req, url)
    if (hit) return hit
    if (req.mode === 'navigate') return offlinePage()
    return Response.error()
  }
}

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return
  if (req.headers.has('range')) return
  const q = url.searchParams
  if (q.has('code') || q.has('error') || q.has('error_description')) return
  e.respondWith(handle(req, url))
})

self.addEventListener('message', e => {
  const d = e.data
  if (!d || d.type !== 'cache' || !Array.isArray(d.urls)) return
  e.waitUntil((async () => {
    const c = await caches.open(CACHE)
    for (const u of d.urls.slice(0, 80)) {
      try {
        const a = new URL(u, SCOPE)
        if (a.origin === location.origin && !isForum(a)) await add(c, a.href)
      } catch (x) {}
    }
  })())
})
