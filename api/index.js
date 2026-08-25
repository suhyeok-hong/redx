export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";
  let path = req.url.replace(/^\/api/, '');
  if (path === '') path = '/';

  // 핵심: 무조건 visit 폴더로 보내기
  // /visit_pass.php -> /visit/visit_pass.php
  // /visit_pass2.php -> /visit/visit_pass2.php
  // /apply.php -> /visit/apply.php
  if (!path.startsWith('/visit/') && !path.startsWith('/visit?')) {
    if (path.startsWith('?')) path = '/visit/' + path;
    else if (path === '/') path = '/visit/';
    else path = '/visit' + (path.startsWith('/')? path : '/' + path);
  }

  // ?url= 로 직접 지정되면 그걸 우선 사용
  const targetUrl = req.query.url || (HOST + path);

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
    const html = await r.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send(e.message + " target:" + targetUrl);
  }
}
