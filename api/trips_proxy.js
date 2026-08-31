export const config = { api: { bodyParser: false } };
export default async function handler(req,res){
  const url = new URL(req.url, 'https://'+req.headers.host);
  const file = url.searchParams.get('file') || 'index.php';
  const qs = url.search.replace(/^\?file=[^&]*&?/,'').replace(/^\?file=[^&]*$/,'');
  const cleanQs = qs ? (qs.startsWith('?')? qs : '?'+qs) : (url.search.includes('payer_id')||url.search.includes('id')? '' : '');
  // 원래 쿼리스트링 전체 유지
  const fullQs = req.url.includes('?') ? '?'+req.url.split('?').slice(1).join('?').replace(/file=[^&]*&?/,'') : '';
  
  const b=[]; for await(const c of req) b.push(c);
  const raw=Buffer.concat(b).toString();
  
  const target = `http://redx.dothome.co.kr/trips/${file}${fullQs}`;
  const r = await fetch(target,{
    method: req.method,
    headers:{
      'Content-Type': req.headers['content-type']||'application/x-www-form-urlencoded; charset=utf-8',
      'Cookie': req.headers.cookie||''
    },
    body: ['GET','HEAD'].includes(req.method) ? undefined : raw,
    redirect:'manual'
  });
  const t = await r.text();
  (r.headers.getSetCookie?.()||[]).forEach(c=>{
    res.appendHeader('Set-Cookie', c.replace(/Path=[^;]*/i,'Path=/').replace(/Domain=[^;]*/i,''));
  });
  const loc=r.headers.get('location');
  if(loc){
    // trips 내부 리다이렉트는 / 로 변환
    let newLoc = loc.replace('http://redx.dothome.co.kr/trips/','/').replace('/trips/','/');
    if(!newLoc.startsWith('/')) newLoc='/'+newLoc;
    res.setHeader('Location', newLoc);
    res.status(302).end();
    return;
  }
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type')||'text/html; charset=utf-8').send(t);
}
