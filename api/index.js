export default async function handler(req, res) {
  try {
    const target = "http://redx.dothome.co.kr" + (req.url === "/api" || req.url === "/api/" ? "" : req.url.replace(/^\/api/, ""));
    const r = await fetch(target, { headers: { "User-Agent": req.headers["user-agent"] || "Mozilla/5.0" } });
    let html = await r.text();
    html = html.replaceAll("http://redx.dothome.co.kr", "");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    return res.status(r.status).send(html);
  } catch (e) {
    return res.status(500).send("Proxy Error: " + e.message);
  }
}
