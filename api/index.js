//redploy 1
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const url = (req.url || "/").split("?")[0];

  // manifest.json - 무조건 올바른 거 리턴!
  if (url === "/manifest.json" || url === "/api/manifest.json") {
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
    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Cache-Control", "no-cache");
    return res.status(200).send(JSON.stringify(manifest));
  }

  if (url === "/sw.js" || url === "/api/sw.js") {
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());`);
  }

  if (url.includes("icon-")) {
    try {
      const fileName = url.split("/").pop();
      const p = path.join(process.cwd(), "public", fileName);
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p);
        res.setHeader("Content-Type", "image/png");
        return res.status(200).send(data);
      }
    } catch {}
  }

  // 메인 페이지는 무조건 manifest 링크 포함해서 리턴!
  if (url === "/" || url === "/api" || url === "/api/" ||!url.includes(".")) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>redX Trip</title><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#4a0a18"><link rel="icon" href="/icon-192.png"><style>html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#4a0a18;color:#fff}iframe{border:0;width:100%;height:100vh;display:block}.test{position:fixed;top:0;left:0;background:yellow;color:black;padding:10px;z-index:9999;font-weight:bold}</style><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js',{scope:'/'})}</script></head><body><div class="test">TEST OK - 이제 PWA 됩니다!</div><iframe src="http://redx.dothome.co.kr" allow="fullscreen"></iframe></body></html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    return res.status(200).send(html);
  }

  // 나머지는 dothome 프록시
  try {
    const target = "http://redx.dothome.co.kr" + req.url.replace(/^\/api/, "");
    const r = await fetch(target);
    let text = await r.text();
    text = text.replaceAll("http://redx.dothome.co.kr", "");
    res.setHeader("Content-Type", r.headers.get("content-type") || "text/html");
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(500).send("Proxy Error");
  }
}
