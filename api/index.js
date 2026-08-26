export default async function handler(req, res) {
  const reqUrl = req.url || "/";
  const pathOnly = reqUrl.split("?")[0];

  if (pathOnly === "/manifest.json") {
    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Cache-Control", "public, max-age=0");
    return res.status(200).send(JSON.stringify({
      name: "redX Trip",
      short_name: "redX Trip",
      description: "redX Trip travel management service",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#4a0a18",
      theme_color: "#4a0a18",
      icons: [
        { src: "https://redx-sand.vercel.app/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "https://redx-sand.vercel.app/icon-512.png", sizes: "512x512", type: "image/png" }
      ]
    }));
  }

  if (pathOnly === "/sw.js") {
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());self.addEventListener('fetch',e=>e.respondWith(fetch(e.request)));`);
  }

  try {
    let target = "http://redx.dothome.co.kr" + reqUrl.replace(/^\/api/, "");
    if (target.endsWith("/api")) target = "http://redx.dothome.co.kr/";
    const r = await fetch(target, { headers: { "User-Agent": req.headers["user-agent"] || "Mozilla/5.0" } });
    let contentType = r.headers.get("content-type") || "";
    let body = await r.text();

    if (contentType.includes("text/html")) {
      // manifest와 sw 주입!
      const inject = `<link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#4a0a18"><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js',{scope:'/'})}</script>`;
      if (body.includes("<head>")) body = body.replace("<head>", `<head>${inject}`);
      else if (body.includes("<HEAD>")) body = body.replace("<HEAD>", `<HEAD>${inject}`);
      else body = inject + body;

      body = body.replaceAll("http://redx.dothome.co.kr", "https://redx-sand.vercel.app");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
    } else {
      res.setHeader("Content-Type", contentType);
    }
    return res.status(r.status).send(body);
  } catch (e) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`Error proxy: ${e.message}<br><a href="/">Retry</a>`);
  }
}
