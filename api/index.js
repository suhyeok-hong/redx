export default async function handler(req, res) {
  try {
    const target = "http://redx.dothome.co.kr" + (req.url === "/" ? "" : req.url);
    
    const r = await fetch(target, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        "Accept": req.headers["accept"] || "text/html",
        "Accept-Language": req.headers["accept-language"] || "ko-KR",
        "Referer": "http://redx.dothome.co.kr/"
      }
    });

    let html = await r.text();

    // http -> https 치환
    html = html.replaceAll("http://redx.dothome.co.kr", "https://redx-sand.vercel.app");
    html = html.replaceAll("http://www.redx.dothome.co.kr", "https://redx-sand.vercel.app");

    // 기존 manifest / theme-color 제거
    html = html.replace(/<link[^>]*manifest[^>]*>/gi, "");
    html = html.replace(/<meta[^>]*theme-color[^>]*>/gi, "");

    // PWA 태그 - 절대주소로!
    const pwaTags = `
<link rel="manifest" href="https://redx-sand.vercel.app/manifest.json">
<meta name="theme-color" content="#ffffff">
<link rel="icon" type="image/png" sizes="192x192" href="https://redx-sand.vercel.app/icon-192.png">
<link rel="apple-touch-icon" href="https://redx-sand.vercel.app/icon-512.png">
<script>
// Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('https://redx-sand.vercel.app/sw.js', {scope: '/'})
      .then(reg => console.log('SW registered', reg.scope))
      .catch(err => console.log('SW fail', err));
  });
}
// 설치 이벤트 잡아두기
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('beforeinstallprompt ready');
});
window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
});
</script>
`;

    // </head> 앞에 삽입
    if (html.toLowerCase().includes("</head>")) {
      html = html.replace(/<\/head>/i, pwaTags + "\n</head>");
    } else {
      html = pwaTags + html;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(r.status).send(html);

  } catch (e) {
    res.status(500).send("Proxy Error: " + e.message);
  }
}
