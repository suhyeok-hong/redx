export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";
  let path = req.url.replace(/^\/api/, '');
  if (path === '') path = '/';

  // ?url= 파라미터가 있으면 그거 우선
  let targetUrl = req.query.url;

  if (!targetUrl) {
    if (path === '/' || path === '/?' || path === '') {
      targetUrl = HOST + '/visit/';
    } else if (path.startsWith('/visit/') || path.startsWith('/visit?')) {
      targetUrl = HOST + path;
    } else {
      // 무조건 /visit/ 붙이기
      // /visit_pass2.php?code=xxx -> /visit/visit_pass2.php?code=xxx
      if (path.startsWith('?')) {
        targetUrl = HOST + '/visit/' + path;
      } else {
        // /visit_pass2.php?code=xxx
        let qIndex = path.indexOf('?');
        let fileOnly = qIndex > -1 ? path.substring(0, qIndex) : path;
        let queryOnly = qIndex > -1 ? path.substring(qIndex) : '';
        // fileOnly = /visit_pass2.php
        if (!fileOnly.startsWith('/visit/')) {
          fileOnly = '/visit' + fileOnly;
        }
        targetUrl = HOST + fileOnly + queryOnly;
      }
    }
  }

  let body;
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  try {
    const r = await fetch(targetUrl, {
      method: req.method,
      headers: { "User-Agent": "Mozilla/5.0", "Content-Type": req.headers['content-type'] || 'application/x-www-form-urlencoded' },
      body
    });
    let html = await r.text();
    // 디버그: 맨 위에 지금 어디로 요청했는지 표시
    html = `<!-- DEBUG TARGET: ${targetUrl} -->\n` + html;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send(e.message + " target:" + targetUrl);
  }
}
