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
  let text=await r.text();

  // ★ 추가: rp.id를 현재 접속 도메인으로 강제 치환
  const currentHost = req.headers.host; // redx-sand.vercel.app
  text = text.replace(/redx\.dothome\.co\.kr/g, currentHost);
  text = text.replace(/trips\.kro\.kr/g, currentHost);
  text = text.replace(/redx\.trips\.kro\.kr/g, currentHost);

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
