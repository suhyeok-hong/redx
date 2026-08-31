export default async function handler(req, res) {
  const name = '홍수혁';
  const tel = '01086219578';
  const body = `name=${encodeURIComponent(name)}&telnum=${encodeURIComponent(tel)}`;
  
  const r = await fetch('http://redx.trips.kro.kr/check_user_otp_status.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: body
  });
  const text = await r.text();
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <h1>원본 서버 응답</h1>
    <pre>${text}</pre>
    <hr>
    <p>보낸값: ${body}</p>
    <p>만약 found:false면 DB에서 못찾은거야</p>
  `);
}
