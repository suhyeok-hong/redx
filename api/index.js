export default async function handler(req, res) {
  const url = (req.url || "/").split("?")[0];

  if (url === "/manifest.json") {
    res.setHeader("Content-Type", "application/manifest+json");
    return res.status(200).send(JSON.stringify({
      name: "redX Trip",
      short_name: "redX Trip",
      start_url: "/",
      display: "standalone",
      background_color: "#4a0a18",
      theme_color: "#4a0a18",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
      ]
    }));
  }

  if (url === "/sw.js") {
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send("self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',()=>self.clients.claim());");
  }

  // 메인 페이지 - 무조건 이거 리턴!
  if (url === "/" || url === "/index.html" || url === "/api" || url === "/api/") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>redX Trip</title><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#4a0a18"></head><body style="margin:0"><div style="background:yellow;color:black;padding:20px;text-align:center;font-weight:bold;font-size:20px">TEST OK - 배포 성공!</div><iframe src="http://redx.dothome.co.kr" style="border:0;width:100%;height:90vh"></iframe></body></html>`);
  }

  // 나머지는 dothome 프록시
  try {
    const target = "http://redx.dothome.co.kr" + (req.url || "").replace(/^\/api/, "");
    const r = await fetch(target);
    let html = await r.text();
    html = html.replaceAll("http://redx.dothome.co.kr", "");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send("error");
  }
}
