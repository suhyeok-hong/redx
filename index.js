const express = require('express');
const axios = require('axios');
const app = express();

app.get('/', async (req, res) => {
  const targetUrl = req.query.url || 'http://redx.dothome.co.kr/trips/';
  try {
    const r = await axios.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      responseType: 'arraybuffer'
    });
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(r.data);
  } catch (e) {
    res.status(500).send('실패: ' + e.message);
  }
});

app.listen(3000, () => console.log('running'));
