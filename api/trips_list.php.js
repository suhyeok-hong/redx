export const config = { api: { bodyParser: false } };
export default async function handler(req,res){
  const qs = req.url.includes('?')? '?'+req.url.split('?')[1] : '';
  const r = await fetch('http://redx.dothome.co.kr/trips/trips_list.php'+qs,{
    method: req.method,
    headers:{'Cookie':req.headers.cookie||''},
    redirect:'manual'
  });
  const t = await r.text();
  (r.headers.getSetCookie?.()||[]).forEach(c=>{
    res.appendHeader('Set-Cookie', c.replace(/Path=[^;]*/i,'Path=/').replace(/Domain=[^;]*/i,''));
  });
  const loc=r.headers.get('location');
  if(loc) res.setHeader('Location', loc.replace('/trips/','/').replace('trips/','/'));
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type')||'text/html; charset=utf-8').send(t);
}
