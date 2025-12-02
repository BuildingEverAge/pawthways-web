/* api/admin-stats.js - handler estable para Vercel */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY;

    // si no hay URL o ninguna key, devolvemos respuesta segura para debug
    if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !ADMIN_TOKEN)) {
      console.warn('admin-stats: missing SUPABASE env vars');
      return res.status(200).json({
        total_sales: 0,
        total_reserved: 0,
        pending: 0,
        generated_at: new Date().toISOString(),
        note: 'missing_supabase_env_vars'
      });
    }

    // preferir ADMIN_TOKEN (service_role o ADMIN_TOKEN) si existe, sino anon
    const keyToUse = ADMIN_TOKEN || SUPABASE_ANON_KEY;
    const supa = createClient(SUPABASE_URL, keyToUse);

    // Intentamos leer de una view admin_stats_view si existe (rápido)
    try {
      const { data: viewData, error: viewErr } = await supa
        .from('admin_stats_view')
        .select('total_sales,total_reserved,pending,generated_at')
        .limit(1);

      if (!viewErr && Array.isArray(viewData) && viewData.length) {
        const v = viewData[0];
        return res.status(200).json({
          total_sales: Number(v.total_sales ?? 0),
          total_reserved: Number(v.total_reserved ?? 0),
          pending: Number(v.pending ?? 0),
          generated_at: v.generated_at ?? new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('admin-stats: view read failed, falling back', String(e));
      // fallback continúa
    }

    // Fallback: sumar ventas y donaciones, contar pendientes (ligero)
    const { data: sales, error: sErr } = await supa.from('sales').select('id,amount');
    if (sErr) console.warn('sales read warning', String(sErr));

    const { data: donations, error: dErr } = await supa.from('donations').select('sale_id,amount');
    if (dErr) console.warn('donations read warning', String(dErr));

    const total_sales = (Array.isArray(sales) ? sales : []).reduce((a, r) => a + Number(r.amount || 0), 0);
    const total_reserved = (Array.isArray(donations) ? donations : []).reduce((a, r) => a + Number(r.amount || 0), 0);

    const donatedIds = new Set((donations || []).map(d => String(d.sale_id)));
    const pending = (Array.isArray(sales) ? sales : []).filter(s => !donatedIds.has(String(s.id))).length;

    return res.status(200).json({
      total_sales: Number(total_sales.toFixed(2)),
      total_reserved: Number(total_reserved.toFixed(2)),
      pending,
      generated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('admin-stats runtime error', e);
    return res.status(500).json({ error: 'internal', message: String(e?.message || e) });
  }
}
