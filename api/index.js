import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const url = (req.url || "/").split("?")[0];

  if (url === "/manifest.json") {
    const manifest = {
      name: "redX Trip",
      short_name: "redX Trip",
      description: "redX Trip travel service",
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

  if (url === "/sw.js") {
    const sw = `self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).catch(()=>{})));`;
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(sw);
  }

  if (url === "/icon-192.png" || url === "/icon-512.png") {
    try {
      const p = path.join(process.cwd(), "public", url.slice(1));
      const data = fs.readFileSync(p);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(data);
    } catch(e) {}
  }

  if (url === "/" ||!url.includes(".")) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>redX Trip</title><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#4a0a18"><link rel="icon" href="/icon-192.png"><style>html,body{margin:0;padding:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100vh;display:block}</style><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js',{scope:'/'})}</script></head><body><iframe src="http://redx.dothome.co.kr" allow="fullscreen"></iframe></body></html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  }

  res.writeHead(302, { Location: "http://redx.dothome.co.kr" + req.url });
  res.end();
}
