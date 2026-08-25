export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr/trips/export.php";
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  const targetUrl = HOST + queryString;

  const forwardHeaders = {
    "User-Agent": req.headers['user-agent'] || "Mozilla/5.0",
  };
  if (req.headers.cookie) forwardHeaders["Cookie"] = req.headers.cookie;

  try {
    const r = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
    });

    // 헤더 그대로 전달 - 중요!
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/octet-stream');
    const dispo = r.headers.get('content-disposition');
    if (dispo) res.setHeader('Content-Disposition', dispo);
    
    const setCookie = r.headers.getSetCookie ? r.headers.getSetCookie() : r.headers.get('set-cookie');
    if (setCookie) {
      if (Array.isArray(setCookie)) setCookie.forEach(c => res.appendHeader('Set-Cookie', c));
      else res.setHeader('Set-Cookie', setCookie);
    }

    const buffer = Buffer.from(await r.arrayBuffer());
    return res.status(r.status).send(buffer);
  } catch (e) {
    return res.status(500).send(e.message);
  }
}
