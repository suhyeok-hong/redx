export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  const bufs=[]; for await(const c of req) bufs.push(c);
  const raw=Buffer.concat(bufs).toString();
  const p=new URLSearchParams(raw);
  const body=`name=${encodeURIComponent(p.get('name')||'')}&telnum=${encodeURIComponent(p.get('telnum')||'')}`;
  const r=await fetch('http://redx.dothome.co.kr/trips/check_user_otp_status.php',{
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8', Cookie:req.headers.cookie||''}, body
  });
  const text=await r.text();
  r.headers.getSetCookie?.().forEach(c=>res.appendHeader('Set-Cookie',c));
  res.status(200).setHeader('Content-Type','application/json; charset=utf-8').send(text);
}
