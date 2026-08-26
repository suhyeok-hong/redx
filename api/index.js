export default async function handler(req, res) {
  const UPSTREAM = "https://script.google.com/macros/s/AKfycbz.../exec"; // 네 주소로 교체!

  const url = new URL(req.url, `https://${req.headers.host}`);
  const target = UPSTREAM + (UPSTREAM.includes("?") ? "&" : "?") + "path=" + url.pathname + url.search;

  const r = await fetch(target, { method: req.method });
  const type = r.headers.get("content-type") || "";
  if (!type.includes("text/html")) {
    const buf = await r.arrayBuffer();
    res.status(r.status).setHeader("Content-Type", type).send(Buffer.from(buf));
    return;
  }

  let html = await r.text();
  
  // 대문자 </HEAD>여도 무조건 주입되게 수정
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
      html = pwaTags + html; // head가 없으면 맨 앞에 붙임
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8").status(200).send(html);
}
