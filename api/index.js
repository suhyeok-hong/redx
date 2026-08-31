const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { generateRegistrationOptions, generateAuthenticationOptions } = require('@simplewebauthn/server');

const app = express();
const TARGET = "http://redx.trips.kro.kr";
app.use(express.json());

// WebAuthn API는 프록시보다 먼저 처리
app.post('/api/webauthn/register-options', async (req,res)=>{
  const rpID = req.headers.host.split(':')[0];
  const opts = await generateRegistrationOptions({
    rpName: "redX Trip", rpID, userID: req.body.phone||"user", userName: req.body.phone||"user",
    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" }
  });
  res.json(opts);
});
app.post('/api/webauthn/login-options', async (req,res)=>{
  const rpID = req.headers.host.split(':')[0];
  const opts = await generateAuthenticationOptions({ rpID, userVerification: "required" });
  res.json(opts);
});

// PWA 파일
app.get('/manifest.json', (req,res)=> res.json({ name:"redX Trip", short_name:"redX Trip", start_url:"/", display:"standalone", background_color:"#fff", theme_color:"#fff", icons:[{src:"/icon-192.png", sizes:"192x192", type:"image/png"}] }));
app.get('/sw.js', (req,res)=> res.type('js').send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());`));

// 핵심: http 사이트를 https로 프록시
app.use('/', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  selfHandleResponse: true,
  onProxyRes: async (proxyRes, req, res) => {
    let body = Buffer.from('');
    proxyRes.on('data', chunk => body = Buffer.concat([body, chunk]));
    proxyRes.on('end', () => {
      // html이 아니면 그대로 통과
      const ct = proxyRes.headers['content-type'] || '';
      if (!ct.includes('text/html')) {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        return res.end(body);
      }
      let html = body.toString('utf8');
      // 지문 버튼 주입 - OTP 페이지에만
      if (html.includes('</body>')) {
        const inject = `
        <div id="bio-wrap" style="max-width:400px;margin:16px auto;text-align:center;">
          <button id="bioBtn" style="width:100%;background:#008CFF;color:#fff;border:0;padding:16px;border-radius:12px;font-size:18px;font-weight:bold;">👆 지문으로 간편 로그인</button>
        </div>
        <script type="module">
          import { startAuthentication } from 'https://esm.sh/@simplewebauthn/browser@8.3.7';
          document.getElementById('bioBtn').onclick = async()=>{
            try{
              const opts = await fetch('/api/webauthn/login-options',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.json());
              await startAuthentication(opts);
              alert('지문 성공!');
            }catch(e){ alert('등록된 지문 없음. OTP로 먼저 로그인하세요'); }
          };
        <\/script>`;
        html = html.replace('</body>', inject + '</body>');
      }
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      res.end(html);
    });
  }
}));

app.listen(process.env.PORT||3000);
