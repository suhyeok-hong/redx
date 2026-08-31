export function createTripHandler(CODE) {
  return async function handler(req, res) {
    const url = req.url || "";
    const file = req.query?.file || "";
    const isManifest = url.includes("manifest.json") || file.includes("manifest");
    const isSW = url.includes("sw.js") || file.includes("sw");

    if (isManifest) {
      res.setHeader("Content-Type", "application/manifest+json");
      return res.status(200).send(JSON.stringify({
        name: `Trip ${CODE}`, short_name: `Trip ${CODE}`,
        start_url: `/${CODE}/?pwa=1`, display: "standalone",
        background_color: "#ffffff", theme_color: "#111827",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }]
      }));
    }
    if (isSW) {
      res.setHeader("Content-Type", "application/javascript");
      return res.status(200).send(`self.addEventListener('fetch', e=>{});`);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="manifest" href="/${CODE}/manifest.json"/>
<title>Trip ${CODE}</title>
<style>
  *{box-sizing:border-box} body{margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto; background:#f8fafc; color:#111827; display:flex; min-height:100vh; align-items:center; justify-content:center; padding:24px}
  .card{background:white; width:100%; max-width:400px; border-radius:24px; padding:32px; box-shadow:0 10px 30px rgba(0,0,0,.08); text-align:center}
  h1{margin:0 0 8px; font-size:28px} p{color:#6b7280; margin:0 0 24px}
  .btn{display:block; width:100%; padding:16px; border-radius:12px; border:0; font-size:16px; font-weight:600; cursor:pointer; text-decoration:none}
  .btn-primary{background:#111827; color:white; margin-bottom:12px}
  .btn-secondary{background:#f3f4f6; color:#111827}
  #installBox{margin-top:16px}
</style>
</head><body>
<div class="card">
  <h1>Trip ${CODE}</h1>
  <p>여행 전용 앱으로 더 편하게 이용해보세요</p>
  <a class="btn btn-primary" href="/${CODE}/?pwa=1&direct=1">바로 입장하기</a>
  <div id="installBox"></div>
  <button id="installBtn" class="btn btn-secondary" style="display:none">앱 설치하기</button>
</div>
<script>
  let deferredPrompt=null;
  const installBtn=document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault(); deferredPrompt=e; installBtn.style.display='block';
  });
  installBtn.addEventListener('click', async()=>{
    if(!deferredPrompt) return; deferredPrompt.prompt();
    const {outcome}=await deferredPrompt.userChoice;
    deferredPrompt=null; installBtn.style.display='none';
  });
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/${CODE}/sw.js');
</script>
</body></html>`);
  }
}
