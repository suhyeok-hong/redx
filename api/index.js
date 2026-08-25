export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const HOST = "http://redx.dothome.co.kr";
  let path = req.url.replace(/^\/api/, '');
  if (path === '' || path === '/') path = '/visit/';

  let targetUrl = req.query.url;

  if (!targetUrl) {
    if (path === '/' || path === '/?') {
      targetUrl = HOST + '/visit/';
    } else if (path.startsWith('/visit/') || path.startsWith('/visit?')) {
      targetUrl = HOST + path;
    } else {
      // 핵심: 파일이 뭐든 무조건 /visit/ 붙이기
      // /visit_pass2.php?code=xxx -> /visit/visit_pass2.php?code=xxx
      // /apply.php -> /visit/apply.php
      let qIdx = path.indexOf('?');
      let fileOnly = qIdx > -1 ? path.substring(0, qIdx) : path;
      let queryOnly = qIdx > -1 ? path.substring(qIdx) : '';
      if (!fileOnly.startsWith('/visit/')) {
        fileOnly = '/visit' + (fileOnly.startsWith('/') ? fileOnly : '/' + fileOnly);
      }
      targetUrl = HOST + fileOnly + queryOnly;
    }
  }

  let body;
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  try {
    const r = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": req.headers['content-type'] || 'application/x-www-form-urlencoded'
      },
      body,
      redirect: 'follow'
    });
    let html = await r.text();

    // 앱에서 새창/인쇄/뒤로가기 안되는 문제 해결 스크립트 주입
    const fixScript = `
    <script>
      (function(){
        // 새창을 현재창에서 열기
        document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach(a=>a.target='_self');
        var _open = window.open;
        window.open = function(url){ window.location.href = url; return null; };
        // 인쇄 버튼이 앱에서 안먹을 때 대비
        document.addEventListener('click', function(e){
          var t = e.target;
          if(t && t.innerText && t.innerText.indexOf('인쇄')>-1){
            setTimeout(function(){ try{ window.print(); }catch(err){} }, 100);
          }
        });
      })();
    </script>
    `;
    if (html.includes('</body>')) {
      html = html.replace('</body>', fixScript + '</body>');
    } else {
      html = html + fixScript;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send(e.message + " target:" + targetUrl);
  }
}
