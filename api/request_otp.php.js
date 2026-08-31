export const config = { api: { bodyParser: false } };
export default async function handler(req,res){
  const b=[]; for await(const c of req) b.push(c);
  const raw=Buffer.concat(b).toString();
  const r=await fetch('http://redx.dothome.co.kr/trips/request_otp.php',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','Cookie':req.headers.cookie||''},
    body: raw, redirect:'manual'
  });
  const t=await r.text();
  (r.headers.getSetCookie?.()||[]).forEach(c=>{
    res.appendHeader('Set-Cookie', c.replace(/Path=[^;]*/i,'Path=/').replace(/Domain=[^;]*/i,''));
  });
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type')||'application/json').send(t);
}
