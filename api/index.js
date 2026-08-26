// api/index.js - RedX Trip PWA 최종본
export default async function handler(req, res) {
  const UPSTREAM = "https://script.google.com/macros/s/AKfycbz.../exec"; // <-- 여기에 너 구글 앱스스크립트 주소 넣어야함. 원래 쓰던거 그대로 복사

  // 쿼리 유지해서 프록시
  const url = new URL(req.url, `https://${req.headers.host}`);
  const targetUrl = UPSTREAM + url.search + (url.search ? "&" : "?") + "path=" + url.pathname;

  const upstreamRes = await fetch(targetUrl, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    redirect: "follow",
  });

  const contentType = upstreamRes.headers.get("content-type") || "";

  // HTML이 아니면 그대로 전달 (API JSON 등)
  if (!contentType.includes("text/html")) {
    const data = await upstreamRes.arrayBuffer();
    res.status(upstreamRes.status);
    res.setHeader("Content-Type", contentType);
    return res.send(Buffer.from(data));
  }

  // HTML이면 PWA 태그 주입
  let html = await upstreamRes.text();

  // 1. PWA manifest + theme + 아이콘 주입
  if (!html.includes("manifest.json")) {
    html = html.replace("</head>", `
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4f0e1a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icon-192.png">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<script>
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}
</script>
</head>`);
  }

  // 2. 엑셀 다운로드 보호 (네가 쓰던 스크립트 유지)
  const protectScript = `
<script>
document.addEventListener('click', function(e){
  const a = e.target.closest('a');
  if(a && a.href && (a.href.includes('.xlsx') || a.href.includes('export') || a.href.includes('download'))){
    e.preventDefault();
    alert('다운로드는 PC 관리자 모드에서만 가능합니다.');
  }
});
</script>
`;

  html = html.replace("</body>", protectScript + "</body>");

  res.status(200);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  return res.send(html);
}
