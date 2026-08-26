// public/sw.js - RedX Trip PWA 최종본
const CACHE_NAME = "redx-trip-v1";
const ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// 설치될 때 파일 캐시에 저장
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
});

// 활성화될 때 오래된 캐시 삭제
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 모든 요청 가로채기 - 이 fetch가 있어야 "앱 설치"가 뜸
self.addEventListener("fetch", (event) => {
  // 구글 스크립트 API는 캐시 안 함
  if (event.request.url.includes("script.google.com") || event.request.url.includes("/api/")) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // 성공하면 캐시에 복사
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
});
