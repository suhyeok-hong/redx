export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  const bufs=[]; for await(const c of req) bufs.push(c);
  const raw=Buffer.concat(bufs).toString();
  const r=await fetch('http://redx.dothome.co.kr/trips/verify_otp.php',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8', Cookie:req.headers.cookie||''},
    body: raw,
    redirect:'manual'
  });
  const text=await r.text();
  const cookies = r.headers.getSetCookie?.()||[];
  cookies.forEach(c=>{
    let fixed = c.replace(/Path=[^;]*/i, 'Path=/').replace(/Domain=[^;]*/i, '');
    res.appendHeader('Set-Cookie', fixed);
  });
  const loc = r.headers.get('location');
  if(loc){
    res.setHeader('Location', loc.includes('/trips/')? loc.split('/trips/').pop().split('/').pop().replace('index.php','') || '/' : '/');
    // 항상 메인으로 보내기
    res.setHeader('Location','/');
  }
  res.status(loc?302:r.status).setHeader('Content-Type', r.headers.get('content-type')||'text/html').send(text);
}
