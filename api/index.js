export default async function handler(req, res) {
  const UPSTREAM = "http://redx.dothome.co.kr/trips";

  const url = new URL(req.url, `https://${req.headers.host}`);
  // /api 제거하고 /trips/ 뒤에 붙이기
  let path = url.pathname;
  if (path.startsWith("/api")) path = path.replace(/^\/api/, "");
  if (path === "" ) path = "/";
  
  const target = UPSTREAM + path + url.search;

  try {
    const r = await fetch(target, { 
      method: req.method,
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow"
    });
    
    const type = r.headers.get("content-type") || "";
    if (!type.includes("text/html")) {
      const buf = await r.arrayBuffer();
      res.status(r.status).setHeader("Content-Type", type).send(Buffer.from(buf));
      return;
    }

    let html = await r.text();
    const pwaTags = `
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4f0e1a">
<link rel="icon" href="/icon-192.png">
<link rel="apple-touch-icon" href="/icon-512.png">
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}</script>
`;
    if (!html.toLowerCase().includes("manifest.json")) {
      if (html.toLowerCase().includes("</head>")) {
        html = html.replace(/<\/head>/i, pwaTags + "</head>");
      } else {
        html = pwaTags + html;
      }
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8").status(200).send(html);
  } catch (e) {
    res.status(500).send("UPSTREAM 연결 실패: " + e.message + " target=" + target);
  }
}
