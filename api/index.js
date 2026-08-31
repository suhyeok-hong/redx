const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const TARGET = "http://redx.trips.kro.kr";

app.use(express.json());

app.use('/', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  selfHandleResponse: false, // 직접 응답 조작 안함
  cookieDomainRewrite: { "*": "" },
  onProxyRes: (proxyRes, req, res) => {
    // 원본이 http라서 Secure 쿠키를 https에서도 쓸 수 있게 강제 재작성
    const setCookie = proxyRes.headers['set-cookie'];
    if (setCookie) {
      const newCookies = setCookie.map(c => 
        c.replace(/Domain=[^;]+;?/gi, '')
         .replace(/Secure;?/gi, '')
         .replace(/SameSite=[^;]+;?/gi, 'SameSite=Lax;')
      );
      proxyRes.headers['set-cookie'] = newCookies;
      console.log('Set-Cookie rewrite:', newCookies);
    }
    console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    res.status(500).send('Proxy Error: ' + err.message);
  }
}));

app.listen(process.env.PORT || 3000);
