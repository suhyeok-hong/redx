export const config = { api: { bodyParser: false } };
export default async function handler(req,res){
  const urlObj = new URL(req.url, 'https://'+req.headers.host);
  const qs = urlObj.search; // ?id=xxx 그대로
  const method = req.method;
  let body;
  if(method==='POST'){
    const b=[]; for await(const c of req) b.push(c);
    body=Buffer.concat(b).toString();
  }
  const target = 'http://redx.dothome.co.kr/trips/trips_list.php'+qs;
  const r = await fetch(target,{
    method,
    headers:{
      'Content-Type': req.headers['content-type']||'application/x-www-form-urlencoded',
      'Cookie': req.headers.cookie||''
    },
    body: method==='GET' || method==='HEAD' ? undefined : body,
    redirect:'manual'
  });
  const t = await r.text();
  (r.headers.getSetCookie?.()||[]).forEach(c=>{
    res.appendHeader('Set-Cookie', c.replace(/Path=[^;]*/i,'Path=/').replace(/Domain=[^;]*/i,''));
  });
  if(r.headers.get('location')){
    res.setHeader('Location', r.headers.get('location').replace('/trips/','/'));
  }
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type')||'text/html; charset=utf-8').send(t);
}
