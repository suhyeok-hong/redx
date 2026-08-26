import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const url = req.url || "/";

  // 1. 정적 파일 직접 서빙 - PWABuilder 때문에 제일 중요!
  if (url.endsWith("manifest.json")) {
    const file = path.join(process.cwd(), "public", "manifest.json");
    const data = fs.readFileSync(file, "utf-8");
    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    return res.status(200).send(data);
  }
  if (url.endsWith("sw.js")) {
    const file = path.join(process.cwd(), "public", "sw.js");
    const data = fs.readFileSync(file, "utf-8");
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    return res.status(200).send(data);
  }
  if (url.includes("icon-192.png") || url.includes("icon-512.png")) {
    const name = url.includes("192") ? "icon-192.png" : "icon-512.png";
    const file = path.join(process.cwd(), "public", name);
    const data = fs.readFileSync(file);
    res.setHeader("Content-Type", "image/png");
    return res.status(200).send(data);
  }

  // 2. 나머지는 dothome 프록시
  try {
    const target = "http://redx.dothome.co.kr" + (url === "/" ? "" : url);
    const r = await fetch(target, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        "Accept": req.headers["accept"] || "text/html",
        "Accept-Language": req.headers["accept-language"] || "ko-KR"
      }
    });
    let html = await r.text();
    html = html.replaceAll("http://redx.dothome.co.kr", "https://redx-sand.vercel.app");
    html = html.replace(/<link[^>]*manifest[^>]*>/gi, "");
    html = html.replace(/<meta[^>]*theme-color[^>]*>/gi, "");

    const pwaTags = `
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4a0a18">
<link rel="icon" href="/icon-192.png">
<link rel="apple-touch-icon" href="/icon-512.png">
<script>
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js',{scope:'/'});});
}
</script>
`;
    if (html.toLowerCase().includes("</head>")) {
      html = html.replace(/<\/head>/i, pwaTags + "\n</head>");
    } else {
      html = pwaTags + html;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    return res.status(r.status).send(html);
  } catch (e) {
    return res.status(500).send("Proxy Error: " + e.message);
  }
}
