const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const TARGET = "http://redx.trips.kro.kr";

app.use(express.json());

// PWA
app.get('/manifest.json', (req,res)=> res.json({ name:"redX Trip", short_name:"redX Trip", start_url:"/", display:"standalone", background_color:"#ffffff", theme_color:"#ffffff", icons:[{src:"/icon-192.png", sizes:"192x192", type:"image/png"}] }));
app.get('/sw.js', (req,res)=> res.type('js').send(`self.addEventListener('install',e=>self.skipWaiting());`));

// 프록시 - 쿠키 도메인 재작성 핵심
app.use('/', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  cookieDomainRewrite: { "*": "" }, // ★ 이게 핵심: 원본 도메인 쿠키를 vercel.app용으로 바꿔줌
  onProxyReq: (proxyReq, req) => {
    // 원본이 http라서 https로 오는 요청을 http로 속여줌
    proxyReq.setHeader('X-Forwarded-Proto', 'http');
  }
}));

app.listen(process.env.PORT || 3000);
