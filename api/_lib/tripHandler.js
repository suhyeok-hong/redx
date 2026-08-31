// api/_lib/tripHandler.js
export function createTripHandler(CODE){
  return async function handler(req, res){
    const url = req.url || "";
    const queryFile = req.query?.file || ""; // vercel이 넣어주는 file 파라미터
    const isManifest = fullUrl.includes("manifest.json") || queryFile.includes("manifest");
    const isSW = fullUrl.includes("sw.js") || queryFile.includes("sw.js");
      
    // manifest
    if(url.includes("manifest.json")){
      res.setHeader("Content-Type","application/manifest+json");
      res.setHeader("Cache-Control","no-cache");
      return res.status(200).send(JSON.stringify({
        id: `/${CODE}/`,
        name: `redX Trip ${CODE}`,
        short_name: `Trip ${CODE}`,
        start_url: `/${CODE}/?pwa=1&direct=1`,
        scope: `/${CODE}/`,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4a0a18",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      }));
    }

    // sw - fetch 핸들러 필수!
    if(url.includes("sw.js")){
      res.setHeader("Content-Type","application/javascript");
      res.setHeader("Service-Worker-Allowed", `/${CODE}/`);
      res.setHeader("Cache-Control","no-cache");
      return res.status(200).send(`
        self.addEventListener('install', e => self.skipWaiting());
        self.addEventListener('activate', e => self.clients.claim());
        self.addEventListener('fetch', e => {
          // 네트워크 우선, 실패하면 캐시 (가장 단순한 PWA용)
          e.respondWith(fetch(e.request).catch(()=> caches.match(e.request)));
        });
      `);
    }

    const isDirect = url.includes("direct=1") || url.includes("pwa=1");

    if(isDirect){
      const target = `http://redx.dothome.co.kr/trips/trips_list.php?code=${CODE}&direct=1`;
      try{
        const r = await fetch(target);
        let html = await r.text();
        html = html.replace(/<script[^>]*>[\s\S]*?navigator\.credentials[\s\S]*?<\/script>/gi,'');
        html = html.replace(/생체인증 등록[\s\S]*?<\/button>/gi,'');
        res.setHeader("Content-Type","text/html; charset=utf-8");
        return res.status(200).send(html);
      }catch(e){
        return res.status(500).send("load fail: " + e.message);
      }
    }

    // 설치 유도 페이지
    res.setHeader("Content-Type","text/html; charset=utf-8");
    return res.status(200).send(`<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trip ${CODE}</title>
<link rel="manifest" href="/${CODE}/manifest.json">
<style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;font-family:sans-serif}#installBtn{background:#4a0a18;color:#fff;border:0;padding:18px 36px;border-radius:12px;font-size:20px;font-weight:bold;margin-top:24px;cursor:pointer;display:none}</style>
<script>
if(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone){
  location.replace("/${CODE}/?pwa=1&direct=1");
}
</script>
</head><body>
<h1>redX Trip ${CODE}</h1>
<p>아래 버튼으로 앱을 설치하세요</p>
<button id="installBtn">앱 설치하기</button>
<p id="guide" style="display:none;margin-top:16px;color:#666">이미 standalone 모드거나 브라우저 메뉴 > 홈 화면에 추가로 설치하세요</p>
<script>
let deferredPrompt;
const btn = document.getElementById('installBtn');
const guide = document.getElementById('guide');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btn.style.display = 'block';
});

btn.addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if(outcome === 'accepted') btn.style.display = 'none';
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  location.replace("/${CODE}/?pwa=1&direct=1");
});

// 3초 안에 beforeinstallprompt 안 뜨면 가이드 표시
setTimeout(() => {
  if(!deferredPrompt && btn.style.display === 'none') guide.style.display = 'block';
}, 3000);

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/${CODE}/sw.js', {scope: '/${CODE}/'});
}
</script></body></html>`);
  }
}
