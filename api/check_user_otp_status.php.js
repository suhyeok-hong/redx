export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    let rawBody = '';
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    rawBody = Buffer.concat(buffers).toString();
    
    console.log('Incoming body:', rawBody);

    const r = await fetch('http://redx.trips.kro.kr/check_user_otp_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawBody
    });
    
    const text = await r.text();
    console.log('Origin response:', text);
    console.log('Origin status:', r.status);

    res.status(r.status).setHeader('Content-Type', 'application/json').send(text);
  } catch(e) {
    console.error('Proxy Error:', e);
    res.status(500).json({ error: e.message, found: false });
  }
}
