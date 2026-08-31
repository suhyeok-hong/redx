const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const TARGET = "http://redx.trips.kro.kr";

// ★ 중요: express.json()을 전역으로 쓰면 POST가 잘림. WebAuthn API에만 적용
app.post('/api/webauthn/*', express.json(), (req,res,next)=>next());

app.get('/manifest.json', (req,res)=> res.json({ 
  name:"redX Trip", short_name:"redX Trip", start_url:"/", display:"standalone",
  background_color:"#ffffff", theme_color:"#2196F3",
  icons:[{src:"/icon-192.png", sizes:"192x192", type:"image/png"}]
}));
app.get('/sw.js', (req,res)=> res.type('js').send(`self.addEventListener('install',e=>self.skipWaiting());`));

// 모든 PHP 요청은 그대로 프록시 - body를 절대 건드리지 않음
app.use('/', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  cookieDomainRewrite: { "*": "" },
  onProxyRes: (proxyRes, req, res) => {
    // http 쿠키를 https에서 쓸 수 있게 Secure 제거
    const sc = proxyRes.headers['set-cookie'];
    if (sc) {
      proxyRes.headers['set-cookie'] = sc.map(c => c.replace(/Domain=[^;]+;?/gi,'').replace(/Secure;?/gi,'').replace(/SameSite=[^;]+;?/gi,'SameSite=Lax;'));
    }
  }
}));

app.listen(process.env.PORT || 3000);
