export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";
  let path = req.url;
  
  // /api 지우기
  if (path.startsWith('/api')) path = path.replace('/api', '');
  if (path === '' || path === '/') path = '/visit/';
  
  // url=? 파라미터가 있으면 그걸 그대로 사용
  let targetUrl = req.query.url;
  
  if (!targetUrl) {
    // /visit/ 로 시작 안하면 무조건 /visit/ 붙이기
    // /apply.php -> /visit/apply.php
    // /visit_pass.php -> /visit/visit_pass.php
    if (!path.startsWith('/visit/') && !path.startsWith('/visit?')) {
      if (path.startsWith('/?') || path.startsWith('?')) {
        path = '/visit/' + path.replace(/^\//, '');
      } else if (path.startsWith('/')) {
        path = '/visit' + path;
      } else {
        path = '/visit/' + path;
      }
    }
    targetUrl = HOST + path;
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
      headers: { 
        "User-Agent": "Mozilla/5.0",
        "Content-Type": req.headers['content-type'] || 'application/x-www-form-urlencoded'
      },
      body,
      redirect: 'follow'
    });
    const html = await r.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send(e.message + " target: " + targetUrl);
  }
}
