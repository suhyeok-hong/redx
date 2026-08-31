export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  const bufs=[]; for await(const c of req) bufs.push(c);
  const raw=Buffer.concat(bufs).toString();
  // root 페이지 프록시
  const url = 'http://redx.dothome.co.kr/trips/index.php' + (req.url.includes('?')? '?' + req.url.split('?')[1] : '');
  const r = await fetch(url, {
    method: req.method,
    headers: {
      'Content-Type': req.headers['content-type']||'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': req.headers.cookie||''
    },
    body: ['GET','HEAD'].includes(req.method)? undefined : raw
  });
  const text = await r.text();
  r.headers.getSetCookie?.().forEach(c=>res.appendHeader('Set-Cookie', c));
  if(r.headers.get('location')) res.setHeader('Location', r.headers.get('location'));
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type')||'text/html; charset=utf-8').send(text);
}
