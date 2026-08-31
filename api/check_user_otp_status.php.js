export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  let rawBody = '';
  for await (const chunk of req) {
    rawBody += chunk;
  }
  
  // 강제로 UTF-8로 다시 인코딩
  const params = new URLSearchParams(rawBody);
  const name = params.get('name') || '';
  const telnum = params.get('telnum') || '';
  const cleanBody = `name=${encodeURIComponent(name)}&telnum=${encodeURIComponent(telnum)}`;

  console.log('CleanBody:', cleanBody);

  const r = await fetch('http://redx.trips.kro.kr/check_user_otp_status.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: cleanBody
  });
  
  const text = await r.text();
  console.log('Origin response:', text);
  res.status(r.status).setHeader('Content-Type', 'application/json; charset=utf-8').send(text);
}
