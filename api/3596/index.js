const CODE = "3596";
const TARGET = "https://3596.trips.kro.kr";
const SCOPE = `/${CODE}/`;

export default function handler(req, res) {
  const url = (req.url || "");

  if (url.includes("manifest.json")) {
    res.setHeader("Content-Type", "application/manifest+json");
    return res.status(200).send(JSON.stringify({
      name: `redX Trip ${CODE}`,
      short_name: `Trip ${CODE}`,
      start_url: SCOPE,
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
  return res.status(200).send(`<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trip ${CODE}</title>
<link rel="manifest" href="/${CODE}/manifest.json">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/icon-192.png">
<style>
body{margin:0;background:#ffffff;color:#000000;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}
h1{font-size:28px;margin:10px 0}
button{background:#4a0a18;color:#fff;border:0;padding:16px 32px;border-radius:12px;font-size:18px;font-weight:bold;margin-top:20px;cursor:pointer}
small{opacity:0.6;margin-top:12px}
</style>
</head><body>
<img src="/icon-192.png" style="width:96px;border-radius:24px">
<h1>redX Trip ${CODE}</h1>
<p>PWA 설치가 가능합니다</p>
<button id="installBtn" style="display:none">앱 설치하기</button>
<button onclick="location.href='${TARGET}'" style="background:#eee;color:#000;margin-top:12px">사이트로 이동</button>
<small>${TARGET}</small>
<script>
if('serviceWorker' in navigator) navigator.serviceWorker.register('/${CODE}/sw.js',{scope:'/${CODE}/'});
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBtn').style.display='block';
});
document.getElementById('installBtn').addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});
</script>
</body></html>`);
}
