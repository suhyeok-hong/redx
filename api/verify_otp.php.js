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
  const sc = r.headers.getSetCookie? r.headers.getSetCookie() : [];
  sc.forEach(c=>res.appendHeader('Set-Cookie', c));
  const loc = r.headers.get('location');
  if(loc){
    // 도메인 바꿔서 Vercel로 리다이렉트
    const newLoc = loc.replace('http://redx.dothome.co.kr/trips/', 'https://redx-sand.vercel.app/').replace('/trips/', '/');
    res.setHeader('Location', newLoc);
  }
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type')||'text/html; charset=utf-8').send(text);
}
