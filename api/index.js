export default function handler(req, res) {
  const url = (req.url || "/").split("?")[0];

  // 1. manifest.json 직접 리턴 - GitHub 파일 무시!
  if (url === "/manifest.json") {
    const manifest = {
      name: "redX Trip",
      short_name: "redX Trip",
      description: "redX Trip travel management service",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#4a0a18",
      theme_color: "#4a0a18",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ]
    };
    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send(JSON.stringify(manifest));
  }

  // 2. sw.js
  if (url === "/sw.js") {
    const sw = `self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))));`;
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(sw);
  }

  // 3. 메인 페이지는 iframe 래퍼 - manifest 링크 100% 포함!
  if (url === "/" ||!url.includes(".")) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>redX Trip</title><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#4a0a18"><link rel="icon" href="/icon-192.png"><link rel="apple-touch-icon" href="/icon-512.png"><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js',{scope:'/'})}</script><style>html,body{margin:0;padding:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100vh;display:block}</style></head><body><iframe src="http://redx.dothome.co.kr" allow="fullscreen"></iframe></body></html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    return res.status(200).send(html);
  }

  // 4. 아이콘이랑 나머지는 그냥 통과
  return res.redirect(302, "http://redx.dothome.co.kr" + (req.url || ""));
}
