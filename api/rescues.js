// /api/rescues.js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('public_rescue_view')
      .select('id, title, animal_name, location, target_amount, currency, status, image_url, story, total_donated, progress_pct')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Database error' });

    const cleaned = data.map(r => ({
      id: r.id,
      title: r.title || '',
      animal_name: r.animal_name || '',
      location: r.location || '',
      target_amount: Number(r.target_amount || 0),
      currency: r.currency || '',
      image_url: r.image_url || '',
      story: r.story ? String(r.story).substring(0, 220) : '',
      total_donated: Number(r.total_donated || 0),
      progress_pct: Number(r.progress_pct || 0)
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
    return res.status(200).json(cleaned);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}