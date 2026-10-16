export default function handler(req, res) {
  const code = (req.query.code || "").toString().trim();
  const lower = code.toLowerCase();
  const url = req.url || "";

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  let displayCode = code;
  let target = "";
  let manifestName = "manifest.json";
  let icon = "/icon-512.png";
  let themeColor = "#4a0a18";

  if (lower.startsWith('k')) {
    displayCode = code.replace(/^k+/i, "");
    target = `http://${displayCode}.kaya.kro.kr`;
    manifestName = "manifest_kaya.json";
    icon = "/kaya-512.png";
    themeColor = "#ffffff";
  } else if (lower.startsWith('t')) {
    displayCode = code.replace(/^t+/i, "");
    target = `http://${lower}.trips.kro.kr`;
    manifestName = "manifest.json";
    icon = "/rt-512.png";
    themeColor = "#000000";
  } else {
    displayCode = code;
    target = `http://${code}.trips.kro.kr`;
    manifestName = "manifest.json";
    icon = "/icon-512.png";
    themeColor = "#4a0a18";
  }

  const scope = `/${code}/`;

  if (url.includes("manifest")) {
    res.setHeader("Content-Type", "application/manifest+json");
    const isKaya = lower.startsWith('k');
    return res.status(200).send(JSON.stringify({
      id: `${scope}?pwa=1`,
      name: isKaya ? `Kaya Tours ${displayCode}` : (lower.startsWith('t') ? `RTrip ${displayCode}` : `redX Trip ${code}`),
      short_name: isKaya ? `Kaya ${displayCode}` : (lower.startsWith('t') ? `RT ${displayCode}` : `redX ${code}`),
      start_url: `${scope}?pwa=1`,
      scope: scope,
      display: "standalone",
      background_color: "#ffffff",
      theme_color: themeColor,
      icons: [{ src: icon, sizes: "512x512", type: "image/png", purpose: "any maskable" }]
    }));
  }

  if (url.includes("sw.js")) {
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x)))).then(()=>self.clients.claim())));`);
  }

  const title = lower.startsWith('k') ? `Kaya ${displayCode}` : (lower.startsWith('t') ? `RTrip ${displayCode}` : `redX Trip ${code}`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="manifest" href="/${code}/${manifestName}"><link rel="icon" href="${icon}"><meta name="theme-color" content="${themeColor}"><style>body{margin:0;background:#fff;color:#000;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}#installBtn{display:block!important;background:${themeColor};color:#fff;border:0;padding:18px 36px;border-radius:12px;font-size:20px;font-weight:bold;margin-top:24px;cursor:pointer}</style><script>if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone||new URLSearchParams(location.search).has('pwa')){location.replace("${target}")}</script></head><body><img src="${icon}" style="width:192px;border-radius:24px"><h1>${title}</h1><p>PWA 설치가 가능합니다</p><button id="installBtn">앱 설치하기</button><script>if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()));navigator.serviceWorker.register('${scope}sw.js');}let d=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();d=e});document.getElementById('installBtn').addEventListener('click',async()=>{if(d){d.prompt();await d.userChoice;d=null}});</script></body></html>`);
}
