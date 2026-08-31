export default async function handler(req, res) {
  const body = `name=${encodeURIComponent(req.body.name || req.query.name || '')}&telnum=${encodeURIComponent(req.body.telnum || req.query.telnum || '')}`;
  // Vercel에서 직접 form 데이터 읽기
  let rawBody = '';
  if (req.method === 'POST') {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    rawBody = Buffer.concat(buffers).toString();
    if(!rawBody) rawBody = body;
  }
  const r = await fetch('http://redx.trips.kro.kr/check_user_otp_status.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: rawBody
  });
  const text = await r.text();
  res.status(r.status).setHeader('Content-Type', 'application/json').send(text);
}
