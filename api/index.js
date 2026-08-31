export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  const bufs=[]; for await(const c of req) bufs.push(c);
  const raw=Buffer.concat(bufs).toString();
  const target = 'http://redx.dothome.co.kr/trips/index.php' + (req.url.includes('?')?'?'+req.url.split('?')[1]:'');
  const r=await fetch(target,{
    method: req.method,
    headers:{'Content-Type': req.headers['content-type']||'text/html; charset=utf-8', Cookie: req.headers.cookie||''},
    body: ['GET','HEAD'].includes(req.method)?undefined:raw,
    redirect:'manual'
  });
  const text=await r.text();
  const cookies = r.headers.getSetCookie?.()||[];
  cookies.forEach(c=>{
    let fixed = c.replace(/Path=[^;]*/i, 'Path=/').replace(/Domain=[^;]*/i, '');
    res.appendHeader('Set-Cookie', fixed);
  });
  if(r.headers.get('location')){
    res.setHeader('Location','/');
    res.status(302).end();
    return;
  }
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type')||'text/html; charset=utf-8').send(text);
}
