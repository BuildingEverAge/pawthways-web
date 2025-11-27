// api/admin-auth.js
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });

  const provided = req.body && (req.body.token || req.headers['x-admin-token']);
  const secret = process.env.ADMIN_TOKEN;

  if (!secret) {
    console.error('ADMIN_TOKEN not set');
    return res.status(500).json({ error: 'admin token not configured' });
  }
  if (provided && provided === secret) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok:false, error: 'invalid' });
}