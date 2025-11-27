// api/admin-stats.js
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'only GET' });

  // opcional: proteger con header
  // if (req.headers['x-admin-token'] !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });

  try {
    // 1) ventas (id + amount)
    const { data: sales, error: sErr } = await supa
      .from('sales')
      .select('id,amount');

    if (sErr) {
      console.error('admin-stats: sales query error', sErr);
      return res.status(500).json({ error: 'sales_query_failed' });
    }

    // 2) donations (sale_id + amount)
    const { data: donations, error: dErr } = await supa
      .from('donations')
      .select('sale_id,amount');

    if (dErr) {
      console.error('admin-stats: donations query error', dErr);
      return res.status(500).json({ error: 'donations_query_failed' });
    }

    // 3) calcular totales
    const total_sales = (sales || []).reduce((acc, s) => acc + Number(s.amount || 0), 0).toFixed(2);
    const total_reserved = (donations || []).reduce((acc, d) => acc + Number(d.amount || 0), 0).toFixed(2);

    // 4) pendientes = ventas sin donation
    const donatedSaleIds = new Set((donations || []).map(d => String(d.sale_id)));
    const pending = (sales || []).filter(s => !donatedSaleIds.has(String(s.id))).length;

    return res.status(200).json({
      pending,
      total_sales,
      total_reserved
    });
  } catch (e) {
    console.error('admin-stats unexpected error', e);
    return res.status(500).json({ error: e.message || 'internal' });
  }
}
