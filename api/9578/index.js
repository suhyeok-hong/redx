const CODE = "9578";
const TARGET = "http://9578.trips.kro.kr";
const SCOPE = `/${CODE}/`;

export default function handler(req, res) {
  const url = (req.url || "");
  if (url.includes("manifest.json")) {
    res.setHeader("Content-Type", "application/manifest+json");
    return res.status(200).send(JSON.stringify({
      name: `redX Trip ${CODE}`,
      short_name: `Trip ${CODE}`,
      start_url: `${SCOPE}?pwa=1`,
      scope: SCOPE,
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" }]
    }));
  }
  if (url.includes("sw.js")) {
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());`);
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trip ${CODE}</title><link rel="manifest" href="/${CODE}/manifest.json"><meta name="theme-color" content="#ffffff"><style>body{margin:0;background:#fff;color:#000;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}#installBtn{display:block!important;background:#4a0a18;color:#fff;border:0;padding:18px 36px;border-radius:12px;font-size:20px;font-weight:bold;margin-top:24px;cursor:pointer}#guide{display:none;margin-top:14px;background:#f5f5f5;border-radius:12px;padding:12px 16px;font-size:14px}</style><script>if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone||new URLSearchParams(location.search).has('pwa')){location.replace("${TARGET}")}</script></head><body><img src="/icon-192.png" style="width:96px;border-radius:24px"><h1>redX Trip ${CODE}</h1><p>PWA 설치가 가능합니다</p><button id="installBtn">앱 설치하기</button><div id="guide">우측 상단 ⋮ 메뉴 > [홈 화면에 추가] 또는 [앱 설치]를 눌러주세요</div><script>if('serviceWorker' in navigator)navigator.serviceWorker.register('/${CODE}/sw.js',{scope:'/${CODE}/'});let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});document.getElementById('installBtn').addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null}else{document.getElementById('guide').style.display='block';alert('우측 상단 점3개 메뉴 > [홈 화면에 추가] 또는 [앱 설치]를 눌러주세요')}});</script></body></html>`);
}
