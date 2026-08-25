export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";
  const BASE = "/visit";

  let urlPath = req.url;
  if (urlPath.startsWith('/api')) urlPath = urlPath.replace('/api', '');
  if (urlPath === '' || urlPath === '/') urlPath = '/visit/';

  // 핵심 수정: /apply.php -> /visit/apply.php 로 고치기
  if (urlPath.startsWith('/apply.php')) {
    urlPath = '/visit/apply.php' + (urlPath.includes('?')? '?' + urlPath.split('?')[1] : '');
  } else if (!urlPath.startsWith('/visit/')) {
    if (urlPath.startsWith('/?') || urlPath.startsWith('?')) {
      urlPath = '/visit/' + urlPath;
    } else if (!urlPath.startsWith('/visit')) {
      // 다른 페이지도 전부 /visit/ 아래에 있다고 가정
      if (urlPath.startsWith('/')) {
        // 이미 /로 시작하면 /visit을 앞에 붙임
        if (!urlPath.startsWith('/visit')) {
           // /apply.php는 위에서 처리했으니 여긴 다른 파일
        }
      }
    }
  }

  let targetUrl = req.query.url || (HOST + urlPath);

  // q= 검색으로 올 때
  if (!req.query.url && req.query.q) {
     targetUrl = HOST + "/visit/?" + req.url.split('?')[1];
  }
  if (!req.query.url && urlPath === '/visit/' && req.url.includes('?')) {
     targetUrl = HOST + "/visit/?" + req.url.split('?')[1];
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
      body,
    });
    const html = await r.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send(e.message + " target:" + targetUrl);
  }
}
