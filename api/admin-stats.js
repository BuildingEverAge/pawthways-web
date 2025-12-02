New-Item -ItemType File -Path .\api\admin-stats-public.js -Force -Value @'
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // debe estar en Vercel env vars

const supa = createClient(SUPABASE_URL || "", ADMIN_TOKEN || "");

async function tryView() {
  try {
    // intenta consumir una view admin_stats_view si ya la tienes creada (más eficiente)
    const { data, error } = await supa
      .from('admin_stats_view')
      .select('total_sales,total_reserved,pending,generated_at')
      .limit(1);
    if (error) {
      // no existe o no hay permisos -> fallback
      return null;
    }
    if (Array.isArray(data) && data.length) return data[0];
    return null;
  } catch (e) {
    console.warn('tryView error', e?.message || e);
    return null;
  }
}

async function computeFallback() {
  try {
    // Fallback ligero: suma ventas y donaciones, y calcula pendientes
    const { data: sales, error: sErr } = await supa.from('sales').select('id,amount').limit(10000);
    if (sErr) console.warn('sales read warning', sErr);

    const { data: donations, error: dErr } = await supa.from('donations').select('sale_id,amount').limit(10000);
    if (dErr) console.warn('donations read warning', dErr);

    const total_sales = Array.isArray(sales) ? sales.reduce((s, r) => s + Number(r.amount || 0), 0) : 0;
    const total_reserved = Array.isArray(donations) ? donations.reduce((s, r) => s + Number(r.amount || 0), 0) : 0;

    const donatedSaleIds = new Set((donations || []).map(d => String(d.sale_id)));
    const pending = Array.isArray(sales) ? sales.filter(s => !donatedSaleIds.has(String(s.id))).length : 0;

    return {
      total_sales: Math.round(total_sales * 100) / 100,
      total_reserved: Math.round(total_reserved * 100) / 100,
      pending: Number(pending || 0),
      generated_at: new Date().toISOString()
    };
  } catch (e) {
    console.error('computeFallback error', e);
    return { total_sales:0, total_reserved:0, pending:0, generated_at: new Date().toISOString() };
  }
}

export default async function handler(req, res) {
  try {
    // permitir CORS si es necesario (opcional)
    res.setHeader('Cache-Control', 'max-age=30, s-maxage=60'); // cache corto

    // 1) intenta la view
    const view = await tryView();
    if (view) {
      return res.status(200).json({
        total_sales: Number(view.total_sales ?? 0),
        total_reserved: Number(view.total_reserved ?? 0),
        pending: Number(view.pending ?? 0),
        generated_at: view.generated_at ?? new Date().toISOString()
      });
    }

    // 2) fallback: computo directo (puede ser pesado si tienes muchísimos registros)
    const fallback = await computeFallback();
    return res.status(200).json(fallback);
  } catch (e) {
    console.error('admin-stats-public error', e);
    return res.status(500).json({ error: 'internal', message: String(e?.message || e) });
  }
}
'@
