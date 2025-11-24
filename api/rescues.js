// /api/rescues.js
// Implementación usando la REST API de Supabase para evitar dependencias.
// Requiere: SUPABASE_URL (ej: https://xxxx.supabase.co) y SUPABASE_SERVICE_KEY en env vars.

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Construye la URL REST para la view/table public_rescue_view
    // Selecciona las columnas necesarias (encodeURI por seguridad).
    const select = encodeURIComponent('id,title,animal_name,location,target_amount,currency,status,image_url,story,total_donated,progress_pct,created_at');
    const url = ${SUPABASE_URL}/rest/v1/public_rescue_view?select=${select}&status=eq.active&order=created_at.desc;

    // Llamada REST. Usamos Service Role Key en Authorization (backend seguro).
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: Bearer ${SERVICE_KEY},
        'Accept': 'application/json'
      }
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Supabase REST error status:', resp.status, text);
      return res.status(502).json({ error: 'Upstream error', details: text });
    }

    const data = await resp.json();

    // Normaliza/limpia
    const cleaned = (Array.isArray(data) ? data : []).map(r => ({
      id: r.id,
      title: r.title ?? '',
      animal_name: r.animal_name ?? '',
      location: r.location ?? '',
      target_amount: Number(r.target_amount || 0),
      currency: r.currency ?? '',
      image_url: r.image_url ?? '',
      story: r.story ? String(r.story).substring(0, 220) : '',
      total_donated: Number(r.total_donated || 0),
      progress_pct: Number(r.progress_pct || 0),
      created_at: r.created_at ?? null
    }));

    // Cache short time at CDN
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
    return res.status(200).json(cleaned);
  } catch (err) {
    console.error('Handler error:', err && (err.stack  err.message  err));
    return res.status(500).json({ error: 'Internal server error' });
  }
}