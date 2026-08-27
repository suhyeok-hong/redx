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
  return res.status(200).send(`<!DOCTYPE html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trip ${CODE}</title>
<link rel="manifest" href="/${CODE}/manifest.json">
<meta name="theme-color" content="#fff">
<style>body{margin:0}iframe{width:100vw;height:100vh;border:0}</style>
</head><body>
<iframe src="${TARGET}"></iframe>
<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/${CODE}/sw.js',{scope:'/${CODE}/'})</script>
</body></html>`);
}
