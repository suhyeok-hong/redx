export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";
  const DEFAULT_FOLDER = "/trips/";

  let path = req.url.replace(/^\/api/, '');
  if (path === '' || path === '/') path = DEFAULT_FOLDER;
  if (path.endsWith('/')) path = path + 'index.php';

  if (!path.startsWith(DEFAULT_FOLDER) && !path.startsWith('/trips/') && !path.startsWith('/visit/')) {
    let file = path.startsWith('/') ? path.substring(1) : path;
    let qIdx = file.indexOf('?');
    if (qIdx > -1) path = DEFAULT_FOLDER + file.substring(0, qIdx) + file.substring(qIdx);
    else path = DEFAULT_FOLDER + file;
  }

  let targetUrl = HOST + path;
  let body;
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  const forwardHeaders = {
    "User-Agent": req.headers['user-agent'] || "Mozilla/5.0",
    "Referer": HOST + DEFAULT_FOLDER,
  };
  if (req.headers['content-type']) forwardHeaders["Content-Type"] = req.headers['content-type'];
  if (req.headers.cookie) forwardHeaders["Cookie"] = req.headers.cookie;

  try {
    const r = await fetch(targetUrl, { method: req.method, headers: forwardHeaders, body, redirect: 'manual' });
    
    const setCookie = r.headers.getSetCookie ? r.headers.getSetCookie() : r.headers.get('set-cookie');
    if (setCookie) {
      if (Array.isArray(setCookie)) setCookie.forEach(c => res.appendHeader('Set-Cookie', c));
      else res.setHeader('Set-Cookie', setCookie);
    }
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get('location');
      if (loc) return res.redirect(302, loc.replace(HOST, ''));
    }

    // ★★★ 엑셀 다운로드는 여기서 바로 리턴! HTML 가공 절대 안함!
    if (path.includes('excel_download') || path.includes('export')) {
      const contentType = r.headers.get('content-type') || 'application/octet-stream';
      const contentDispo = r.headers.get('content-disposition') || 'attachment; filename="export.csv"';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', contentDispo);
      const buffer = Buffer.from(await r.arrayBuffer());
      return res.status(r.status).send(buffer);
    }

    let html = await r.text();
    const fixScript = `<script>(function(){document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach(a=>{if(a.href.includes('excel_download')||a.href.includes('export'))return;a.target='_self';});window.open=function(u){if(u&&u.includes('excel_download')){window.location.href=u;return null;}window.location.href=u;return null;};})();</script>`;
    if (html.includes('</body>')) html = html.replace('</body>', fixScript + '</body>');
    else html = html + fixScript;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(r.status).send(html);
  } catch (e) {
    return res.status(500).send(e.message + " target:" + targetUrl);
  }
}
