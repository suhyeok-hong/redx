export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  const BASE = "http://redx.dothome.co.kr";
  let targetUrl = req.query.url;

  if (!targetUrl) {
    // 주소에 url= 없으면 현재 요청 경로 그대로 원본 서버로 연결
    // /apply.php -> http://redx.dothome.co.kr/apply.php
    // /?q=검색어 -> http://redx.dothome.co.kr/visit/?q=검색어
    let path = req.url;
    if (path.startsWith('/api')) path = path.replace('/api', '');
    if (path === '' || path === '/') path = '/visit/';
    if (path.startsWith('/?') || path.startsWith('?')) path = '/visit/' + path;
    if (!path.startsWith('/visit/') &&!path.startsWith('/apply.php')) {
        // /apply.php는 그대로, 그 외는 /visit/ 아래로
        if (!path.startsWith('/')) path = '/' + path;
    }
    if (path.startsWith('/visit/')) {
      targetUrl = BASE + path;
    } else {
      targetUrl = BASE + path;
    }
    // q= 검색어로만 온 경우 처리
    if (req.query.q &&!targetUrl.includes('?')) {
       targetUrl = BASE + "/visit/?" + req.url.split('?')[1];
    }
  }

  // POST 데이터 읽기
  let body = undefined;
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
      body: body,
      redirect: 'follow'
    });
    let html = await r.text();
    // 링크가 Vercel 밖으로 나가지 않게
    html = html.replace(/http:\/\/redx\.dothome\.co\.kr\/visit\//g, '/visit/');
    html = html.replace(/http:\/\/redx\.dothome\.co\.kr\//g, '/');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send('에러:' + e.message + ' target:' + targetUrl);
  }
}
