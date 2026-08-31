export default async function handler(req, res) {
  let rawBody = '';
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  rawBody = Buffer.concat(buffers).toString();
  const r = await fetch('http://redx.trips.kro.kr/request_otp.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: rawBody
  });
  const text = await r.text();
  res.status(r.status).setHeader('Content-Type', 'application/json').send(text);
}
