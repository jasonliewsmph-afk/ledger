// 把 App 存在手机里：打开时先用存好的（快、没网络也能开），同时在背后拿新版，下次打开就是新版
const C = 'ledger-2026-11-20b';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('version.json')) return;
  const key = e.request.mode === 'navigate' ? new Request('./') : e.request;
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
