export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";
  const DEFAULT_FOLDER = "/trips/"; // <-- 폴더 바꿀때 여기 한 줄만 바꾸면 됨!

  let path = req.url.replace(/^\/api/, '');
  if (path === '' || path === '/') path = DEFAULT_FOLDER;

  let targetUrl = req.query.url;
  if (!targetUrl) {
    // path가 뭔지 상관없이 그대로 닷홈으로 전달 - 자동 인식!
    targetUrl = HOST + path;
  }

  let body;
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  const forwardHeaders = {
    "User-Agent": req.headers['user-agent'] || "Mozilla/5.0",
    "Content-Type": req.headers['content-type'] || 'application/x-www-form-urlencoded',
    "Referer": HOST + path,
  };
  if (req.headers.cookie) forwardHeaders["Cookie"] = req.headers.cookie;

  try {
    const r = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual'
    });

    const setCookie = r.headers.getSetCookie ? r.headers.getSetCookie() : r.headers.get('set-cookie');
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach(c => res.appendHeader('Set-Cookie', c));
      } else {
        res.setHeader('Set-Cookie', setCookie);
      }
    }

    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get('location');
      if (loc) {
        let newLoc = loc.replace(HOST, '');
        return res.redirect(302, newLoc);
      }
    }

    let html = await r.text();
    const fixScript = `
    <script>
      (function(){
        document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach(a=>a.target='_self');
        window.open = function(url){ window.location.href = url; return null; };
      })();
    </script>`;
    if (html.includes('</body>')) html = html.replace('</body>', fixScript + '</body>');
    else html = html + fixScript;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(r.status).send(html);
  } catch (e) {
    return res.status(500).send(e.message + " target:" + targetUrl);
  }
}
