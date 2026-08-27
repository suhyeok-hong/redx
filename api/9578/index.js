const CODE = "9578";
const TARGET = "https://9578.trips.kro.kr";
const SCOPE = `/${CODE}/`;
export default function handler(req, res) {
  const url = (req.url || "");
  if (url.includes("manifest.json")) {
    res.setHeader("Content-Type","application/manifest+json");
    return res.status(200).send(JSON.stringify({
      name:`redX Trip ${CODE}`, short_name:`Trip ${CODE}`,
      start_url:`${SCOPE}?pwa=1`, scope:SCOPE, display:"standalone",
      background_color:"#ffffff", theme_color:"#ffffff",
      icons:[{src:"/icon-192.png",sizes:"192x192",type:"image/png"}]
    }));
  }
  if (url.includes("sw.js")) {
    res.setHeader("Content-Type","application/javascript");
    return res.status(200).send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());`);
  }
  res.setHeader("Content-Type","text/html; charset=utf-8");
  return res.status(200).send(`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trip ${CODE}</title><link rel="manifest" href="/${CODE}/manifest.json"><style>body{margin:0;background:#fff;color:#000;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}.box{background:#f5f5f5;border-radius:16px;padding:16px 20px;margin-top:20px;font-size:15px;line-height:1.5}</style><script>if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone||new URLSearchParams(location.search).has('pwa')){location.replace("${TARGET}")}</script></head><body><img src="/icon-192.png" style="width:96px;border-radius:24px"><h1>redX Trip ${CODE}</h1><p>PWA 설치가 가능합니다</p><div class="box">우측 상단 <b>⋮ 점3개 메뉴</b>를 누르고<br><b>[홈 화면에 추가]</b> 또는 <b>[앱 설치]</b>를 눌러주세요</div><script>if('serviceWorker' in navigator)navigator.serviceWorker.register('/${CODE}/sw.js',{scope:'/${CODE}/'});</script></body></html>`);
}
