const CACHE = "redx-v1";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  // /api는 프록시라서 절대 캐시하면 안됨!
  if (e.request.url.includes("/api/")) return;
  if (e.request.method !== "GET") return;
});
