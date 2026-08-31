export const config = { api: { bodyParser: false } };
export default async function handler(req,res){
  const b=[]; for await(const c of req) b.push(c);
  const raw=Buffer.concat(b).toString();
  const r=await fetch('http://redx.dothome.co.kr/trips/verify_otp.php',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','Cookie':req.headers.cookie||''},
    body: raw, redirect:'manual'
  });
  const t=await r.text();
  (r.headers.getSetCookie?.()||[]).forEach(c=>{
    res.appendHeader('Set-Cookie', c.replace(/Path=[^;]*/i,'Path=/').replace(/Domain=[^;]*/i,'').replace(/SameSite=[^;]*/i,''));
  });
  // Location 헤더도 Vercel용으로 변환
  const loc=r.headers.get('location');
  if(loc) res.setHeader('Location', '/');
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type')||'application/json').send(t);
}
