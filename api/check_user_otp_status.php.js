export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    const rawBody = Buffer.concat(buffers).toString('utf-8');

    const params = new URLSearchParams(rawBody);
    const name = params.get('name') || '';
    const telnum = params.get('telnum') || '';
    const cleanBody = `name=${encodeURIComponent(name)}&telnum=${encodeURIComponent(telnum)}`;

    console.log('cleanBody:', cleanBody);

    const r = await fetch('http://redx.dothome.co.kr/trips/check_user_otp_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: cleanBody
    });
    
    const text = await r.text();
    console.log('origin:', text);
    res.status(200).setHeader('Content-Type', 'application/json; charset=utf-8').send(text);
  } catch (e) {
    console.error(e);
    res.status(500).json({ found: false, error: e.message });
  }
}
