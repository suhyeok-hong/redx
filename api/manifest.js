// api/manifest.js
export default function handler(req,res){
  const code = req.query.code || '0000';
  res.setHeader('Content-Type','application/manifest+json');
  res.setHeader('Cache-Control','public, max-age=0, must-revalidate');
  res.json({
    name: `redX Trip ${code}`,
    short_name: `Trip ${code}`,
    description: "redX Trip travel management service",
    start_url: `/${code}?source=pwa`,
    scope: `/${code}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ]
  });
}
