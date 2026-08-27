export default function handler(req, res) {
  const url = (req.url || "").split("?")[0];

  if (url === "/manifest.json") {
    res.setHeader("Content-Type", "application/manifest+json");
    return res.status(200).send(JSON.stringify({
      name: "redX Trip",
      short_name: "redX Trip",
      description: "redX Trip travel management service",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
      ]
    }));
  }

  if (url === "/sw.js") {
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(`const CACHE="redx-v1";self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["/","/manifest.json"])))});self.addEventListener('activate',e=>self.clients.claim());self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));`);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>redX Trip</title><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#4a0a18"><link rel="icon" href="/icon-192.png"><style>body{margin:0;background:#4a0a18;color:#fff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}h1{font-size:28px;margin:10px 0}button{background:#fff;color:#4a0a18;border:0;padding:16px 32px;border-radius:12px;font-size:18px;font-weight:bold;margin-top:20px;cursor:pointer}</style></head><body><img src="/icon-192.png" style="width:96px;border-radius:24px"><h1>redX Trip</h1><p>PWA 설치가 가능합니다</p><button onclick="location.href='http://redx.dothome.co.kr'">앱으로 이동</button><script>if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');</script></body></html>`);
}
