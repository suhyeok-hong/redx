export default async function handler(req, res) {
  const BASE = "http://redx.dothome.co.kr/visit/";
  let targetUrl = req.query.url;

  // 1. url 파라메터가 없이?q= 검색어로만 오면 자동으로 붙여주기
  if (!targetUrl) {
    // /api?q=검색어 로 온 경우
    if (req.query.q) {
      const qs = req.url.split('?')[1] || '';
      targetUrl = BASE + "?" + qs;
    } else if (req.url.startsWith('/api?') || req.url.includes('?')) {
      // 그 외 파라메터가 있으면 그대로 BASE에 붙이기
      const qs = req.url.split('?')[1] || '';
      if (qs &&!qs.startsWith('url=')) {
        targetUrl = BASE + "?" + qs;
      }
    } else {
      // 아무 파라메터 없으면 그냥 메인 페이지
      targetUrl = BASE;
    }
  }

  try {
    const r = await fetch(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    let html = await r.text();

    // 2. 페이지 안에 있는 링크들이 Vercel 밖으로 나가지 않게 프록시로 고치기
    html = html.replace(/href="\/visit\//g, `href="/api?url=${BASE}`);
    html = html.replace(/href="\/visit"/g, `href="/api?url=${BASE}`);
    html = html.replace(/action="\/visit\//g, `action="/api?url=${BASE}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send('에러: ' + e.message + '<br>target:' + targetUrl);
  }
}
