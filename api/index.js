export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";

  // 강제로 무조건 /visit/ 붙이기
  let targetUrl = "";
  const originalUrl = req.url; // /visit_pass.php?code=xxx 또는 /apply.php

  if (req.query.url) {
    targetUrl = req.query.url;
  } else {
    // 모든 요청을 /visit/ 안으로 강제 이동
    let file = originalUrl;
    if (file.startsWith('/api')) file = file.replace('/api','');

    // file = /visit_pass.php?code=xxx
    // file에서? 앞부분만 뽑기
    let fileName = file.split('?')[0];
    let query = file.includes('?')? '?' + file.split('?')[1] : '';

    if (fileName === '' || fileName === '/') {
      targetUrl = HOST + '/visit/' + query;
    } else if (fileName.includes('visit_pass.php')) {
      targetUrl = HOST + '/visit/visit_pass.php' + query;
    } else if (fileName.includes('apply.php')) {
      targetUrl = HOST + '/visit/apply.php' + query;
    } else if (fileName.startsWith('/visit/')) {
      targetUrl = HOST + fileName + query;
    } else {
      // 그 외 모든 파일은 /visit/ 아래에 있다고 가정
      targetUrl = HOST + '/visit' + fileName + query;
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
    const html = await r.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send(e.message + " target:" + targetUrl);
  }
}
