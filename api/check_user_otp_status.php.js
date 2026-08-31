export const config = { api: { bodyParser: false } };
export default async function handler(req,res){
  const b=[]; for await(const c of req) b.push(c);
  const raw=Buffer.concat(b).toString();
  const p=new URLSearchParams(raw);
  const body=`name=${encodeURIComponent(p.get('name')||'')}&telnum=${encodeURIComponent(p.get('telnum')||'')}`;
  const r=await fetch('http://redx.dothome.co.kr/trips/check_user_otp_status.php',{
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','Cookie':req.headers.cookie||''}, body
  });
  const t=await r.text();
  (r.headers.getSetCookie?.()||[]).forEach(c=>{
    res.appendHeader('Set-Cookie', c.replace(/Path=[^;]*/i,'Path=/').replace(/Domain=[^;]*/i,''));
  });
  res.status(200).setHeader('Content-Type','application/json').send(t);
}
