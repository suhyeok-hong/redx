export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('url 파라미터가 없습니다. ?url= 을 붙여주세요');
  }
  try {
    const response = await fetch(targetUrl);
    let html = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send('프록시 에러: ' + e.message);
  }
}
