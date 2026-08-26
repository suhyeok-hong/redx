export default async function handler(req, res) {
  const UPSTREAM = "http://redx.dothome.co.kr/trips";
  const url = new URL(req.url, `https://${req.headers.host}`);
  let path = url.pathname;
  if (path.startsWith("/api")) path = path.replace(/^\/api/, "");
  if (path === "") path = "/";

  const target = UPSTREAM + path + url.search;

  // POST body 읽기
  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (req.body) {
      // Vercel이 파싱한 경우
      if (typeof req.body === 'string') body = req.body;
      else if (req.body instanceof Buffer) body = req.body;
      else body = new URLSearchParams(req.body).toString();
    } else {
      // raw body 직접 읽기 (fallback)
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) body = Buffer.concat(chunks);
    }
  }

  const headers = {};
  if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];
  if (req.headers.cookie) headers["Cookie"] = req.headers.cookie;
  headers["User-Agent"] = "Mozilla/5.0";

  const r = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  // 쿠키/리다이렉트 전달
  const setCookie = r.headers.get("set-cookie");
  if (setCookie) res.setHeader("Set-Cookie", setCookie);
  if (r.headers.get("location")) {
    let loc = r.headers.get("location");
    // 닷홈 절대경로를 Vercel 상대경로로 바꾸기
    loc = loc.replace("http://redx.dothome.co.kr/trips", "").replace("https://redx.dothome.co.kr/trips", "");
    res.setHeader("Location", loc);
    return res.status(r.status).end();
  }

  const type = r.headers.get("content-type") || "";
  if (!type.includes("text/html")) {
    const buf = await r.arrayBuffer();
    res.status(r.status).setHeader("Content-Type", type).send(Buffer.from(buf));
    return;
  }

  let html = await r.text();
  // 닷홈 절대 URL을 상대 URL로 치환 (로그인 폼 깨짐 방지)
  html = html.replaceAll("http://redx.dothome.co.kr/trips", "").replaceAll("https://redx.dothome.co.kr/trips", "");

  const pwaTags = `<link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#4f0e1a"><link rel="icon" href="/icon-192.png"><link rel="apple-touch-icon" href="/icon-512.png"><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}</script>`;
  if (!html.toLowerCase().includes("manifest.json")) {
    html = html.toLowerCase().includes("</head>") ? html.replace(/<\/head>/i, pwaTags + "</head>") : pwaTags + html;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8").status(200).send(html);
}
