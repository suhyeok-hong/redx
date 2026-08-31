// api/_lib/tripHandler.js
export function createTripHandler(CODE){
  return async function handler(req, res){
    const url = req.url || "";
    const isDirect = url.includes("direct=1") || url.includes("pwa=1");

    // manifest
    if(url.includes("manifest.json")){
      res.setHeader("Content-Type","application/manifest+json");
      return res.status(200).send(JSON.stringify({
        name:`redX Trip ${CODE}`,
        short_name:`Trip ${CODE}`,
        start_url:`/${CODE}?pwa=1&direct=1`,
        scope:`/${CODE}/`,
        display:"standalone",
        background_color:"#ffffff",
        theme_color:"#ffffff",
        icons:[{src:"/icon-192.png",sizes:"192x192",type:"image/png",purpose:"any maskable"}]
      }));
    }
    // sw
    if(url.includes("sw.js")){
      res.setHeader("Content-Type","application/javascript");
      res.setHeader("Service-Worker-Allowed","/");
      return res.status(200).send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());`);
    }

    // 직접 목록 보기 (PWA에서 실행되거나 ?direct=1로 들어온 경우)
    if(isDirect){
      const target = `http://redx.dothome.co.kr/trips/trips_list.php?code=${CODE}&direct=1`;
      try{
        const r = await fetch(target);
        let html = await r.text();
        // 기존 기능 건드리지 않고, direct로 들어올때만 생체인증 코드 제거
        html = html.replace(/<script[^>]*>[\s\S]*?navigator\.credentials[\s\S]*?<\/script>/gi,'');
        html = html.replace(/생체인증 등록[\s\S]*?<\/button>/gi,'');
        res.setHeader("Content-Type","text/html; charset=utf-8");
        return res.status(200).send(html);
      }catch(e){
        return res.status(500).send("load fail");
      }
    }

    // 설치 유도 페이지
    res.setHeader("Content-Type","text/html; charset=utf-8");
    return res.status(200).send(`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trip ${CODE}</title><link rel="manifest" href="/${CODE}/manifest.json"><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;font-family:sans-serif}#installBtn{background:#4a0a18;color:#fff;border:0;padding:18px 36px;border-radius:12px;font-size:20px;font-weight:bold;margin-top:24px;cursor:pointer}</style><script>if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone||new URLSearchParams(location.search).has('pwa')){location.replace("/${CODE}?pwa=1&direct=1")}</script></head><body><h1>redX Trip ${CODE}</h1><p>PWA 설치</p><button id="installBtn">앱 설치하기</button><script>if('serviceWorker' in navigator)navigator.serviceWorker.register('/${CODE}/sw.js',{scope:'/${CODE}/'});</script></body></html>`);
  }
}
