export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";
  let path = req.url.replace(/^\/api/, '');
  if (path === '' || path === '/') path = '/trips/';

  let targetUrl = req.query.url;
  if (!targetUrl) {
    if (path === '/' || path === '/?') targetUrl = HOST + '/trips/';
    else if (path.startsWith('/trips/') || path.startsWith('/trips?')) targetUrl = HOST + path;
    else {
      let qIdx = path.indexOf('?');
      let fileOnly = qIdx > -1 ? path.substring(0, qIdx) : path;
      let queryOnly = qIdx > -1 ? path.substring(qIdx) : '';
      if (!fileOnly.startsWith('/trips/')) fileOnly = '/trips' + (fileOnly.startsWith('/') ? fileOnly : '/' + fileOnly);
      targetUrl = HOST + fileOnly + queryOnly;
    }
  }

  // 요청 본문 읽기
  let body;
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  // 브라우저가 보낸 쿠키를 닷홈으로 전달 (세션 유지!)
  const forwardHeaders = {
    "User-Agent": req.headers['user-agent'] || "Mozilla/5.0",
    "Content-Type": req.headers['content-type'] || 'application/x-www-form-urlencoded',
    "Referer": HOST + "/trips/",
  };
  if (req.headers.cookie) forwardHeaders["Cookie"] = req.headers.cookie;

  try {
    const r = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual'
    });

    // 닷홈이 준 쿠키를 다시 앱/브라우저로 전달
    const setCookie = r.headers.getSetCookie ? r.headers.getSetCookie() : r.headers.get('set-cookie');
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach(c => res.appendHeader('Set-Cookie', c));
      } else {
        res.setHeader('Set-Cookie', setCookie);
      }
    }

    // 리다이렉트 처리
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get('location');
      if (loc) {
        // 닷홈 주소로 리다이렉트면 우리 주소로 바꿔서 리다이렉트
        let newLoc = loc.replace(HOST, '');
        if (!newLoc.startsWith('/trips/') && newLoc.startsWith('/')) newLoc = '/trips' + newLoc;
        return res.redirect(302, newLoc);
      }
    }

    let html = await r.text();

    // 앱에서 새창/인쇄/뒤로가기 fix
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
