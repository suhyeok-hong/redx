export default async function handler(req, res) {
  try {
    const body = "name=" + encodeURIComponent("홍수혁") + "&telnum=01086219578";
    const r = await fetch('http://redx.trips.kro.kr/check_user_otp_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body
    });
    const text = await r.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send("<pre>" + text + "</pre><hr><p>sent: " + body + "</p>");
  } catch(e) {
    res.status(500).send("ERROR: " + e.message + "<br>" + e.stack);
  }
}
