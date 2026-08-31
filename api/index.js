const express = require('express');
const axios = require('axios');
const { generateRegistrationOptions, generateAuthenticationOptions } = require('@simplewebauthn/server');

const app = express();
const TARGET = "http://redx.trips.kro.kr";
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 메모리 저장소
const store = { challenges: new Map() };

// PWA 파일
app.get('/manifest.json', (req,res)=>{
  res.json({
    name: "redX Trip", short_name: "redX Trip",
    start_url: "/", display: "standalone",
    background_color: "#ffffff", theme_color: "#ffffff",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
  });
});
app.get('/sw.js', (req,res)=>{
  res.type('application/javascript').send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());`);
});

// WebAuthn API
app.post('/api/webauthn/register-options', async (req,res)=>{
  const rpID = req.headers.host.split(':')[0];
  const opts = await generateRegistrationOptions({
    rpName: "redX Trip", rpID, userID: req.body.phone || "user", userName: req.body.phone || "user",
    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" }
  });
  store.challenges.set(req.body.phone, opts.challenge);
  res.json(opts);
});
app.post('/api/webauthn/login-options', async (req,res)=>{
  const rpID = req.headers.host.split(':')[0];
  const opts = await generateAuthenticationOptions({ rpID, userVerification: "required" });
  store.challenges.set("login", opts.challenge);
  res.json(opts);
});

// 나머지 모든 요청은 원본 프록시 + 지문 버튼 주입
app.use(async (req,res)=>{
  try {
    const targetUrl = TARGET + req.originalUrl;
    const r = await axios.get(targetUrl, { responseType: 'text', headers: { 'User-Agent': req.headers['user-agent'] } });
    let html = r.data;

    if (typeof html === 'string' && html.includes('</body>')) {
      const inject = `
      <div id="bio-wrap" style="max-width:400px; margin:20px auto; text-align:center;">
        <button id="bioBtn" style="width:100%; background:#008CFF; color:#fff; border:0; padding:16px; border-radius:12px; font-size:18px; font-weight:bold;">👆 지문으로 간편 로그인</button>
      </div>
      <script type="module">
        import { startRegistration, startAuthentication } from 'https://esm.sh/@simplewebauthn/browser@8.3.7';
        document.getElementById('bioBtn').onclick = async () => {
          try {
            const opts = await fetch('/api/webauthn/login-options',{method:'POST', headers:{'Content-Type':'application/json'}, body:'{}'}).then(r=>r.json());
            await startAuthentication(opts);
            alert('지문 성공! 메인으로 이동');
            location.href='/';
          } catch(e){ alert('등록된 지문이 없습니다. OTP 로그인 후 등록해주세요.'); }
        };
      <\/script>
      `;
      html = html.replace('</body>', inject + '</body>');
    }
    res.send(html);
  } catch(e) {
    res.status(500).send('Proxy error: ' + e.message);
  }
});

app.listen(PORT, ()=>console.log('Running on ' + PORT));
