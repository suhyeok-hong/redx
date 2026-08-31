// api/_lib/tripHandler.js
export function createTripHandler(CODE) {
  return async function handler(req, res) {
    const url = req.url || "";
    const file = req.query?.file || "";

    const isManifest = url.includes("manifest.json") || file.includes("manifest");
    const isSW = url.includes("sw.js") || file.includes("sw");

    if (isManifest) {
      res.setHeader("Content-Type", "application/manifest+json");
      res.setHeader("Cache-Control", "no-cache");
      return res.status(200).send(JSON.stringify({
        name: `Trip ${CODE}`,
        short_name: `Trip ${CODE}`,
        start_url: `/${CODE}/?pwa=1`,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }));
    }

    if (isSW) {
      res.setHeader("Content-Type", "application/javascript");
      return res.status(200).send(`self.addEventListener('fetch', e=>{});`);
    }

    // 일반 페이지 (설치 유도 + 생체인증)
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`<!DOCTYPE html><html><head>
      <link rel="manifest" href="/${CODE}/manifest.json">
      <meta name="theme-color" content="#000000">
    </head><body>
      <h1>Trip ${CODE}</h1>
      <a href="/${CODE}/?pwa=1&direct=1">바로 입장</a>
      <div id="installBox"></div>
      <script>
        let promptEvent=null;
        window.addEventListener('beforeinstallprompt', e=>{
          e.preventDefault(); promptEvent=e;
          document.getElementById('installBox').innerHTML='<button onclick="promptEvent.prompt()">앱 설치하기</button>';
        });
        if('serviceWorker' in navigator) navigator.serviceWorker.register('/${CODE}/sw.js');
      </script>
    </body></html>`);
  }
}
