export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) return res.status(400).send('url parameter missing');
  try {
    const r = await fetch(target);
    const text = await r.text();
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(text);
  } catch (e) {
    res.status(500).send(e.message);
  }
}
