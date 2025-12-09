// example for Vercel / Node.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // use service role key for now
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/public_proofs_view?select=id,title,thumb_url,doc_url,proof_date&order=proof_date.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!r.ok) {
      const txt = await r.text().catch(()=>null);
      return res.status(500).json({ error: 'supabase error', details: txt });
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'internal', detail: e.message });
  }
}
