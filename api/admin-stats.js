/* api/admin-stats.js - handler estable para Vercel - FIXED VERSION */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

    // si no hay URL o ninguna key, devolvemos respuesta segura para debug
    if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY && !ADMIN_TOKEN)) {
      console.warn('admin-stats: missing SUPABASE env vars - URL:', !!SUPABASE_URL, 'ANON:', !!SUPABASE_ANON_KEY, 'SERVICE_ROLE:', !!SUPABASE_SERVICE_ROLE_KEY, 'ADMIN_TOKEN:', !!ADMIN_TOKEN);
      return res.status(200).json({
        total_sales: 0,
        total_reserved: 0,
        pending: 0,
        generated_at: new Date().toISOString(),
        note: 'missing_supabase_env_vars'
      });
    }

    // PRIORIDAD EXPLÍCITA: SERVICE_ROLE > ADMIN_TOKEN > ANON
    let keyToUse;
    let keyType;
    
    if (SUPABASE_SERVICE_ROLE_KEY) {
      keyToUse = SUPABASE_SERVICE_ROLE_KEY;
      keyType = 'SERVICE_ROLE';
    } else if (ADMIN_TOKEN) {
      keyToUse = ADMIN_TOKEN;
      keyType = 'ADMIN_TOKEN';
    } else {
      keyToUse = SUPABASE_ANON_KEY;
      keyType = 'ANON';
    }

    const supa = createClient(SUPABASE_URL, keyToUse);

    // Log para debugging en producción
    console.log('admin-stats: using key type:', keyType, 'URL:', SUPABASE_URL);

    // Intentamos leer de una view admin_stats_view si existe (rápido)
    try {
      const { data: viewData, error: viewErr } = await supa
        .from('admin_stats_view')
        .select('total_sales,total_reserved,pending,generated_at')
        .limit(1);

      if (!viewErr && Array.isArray(viewData) && viewData.length) {
        const v = viewData[0];
        console.log('admin-stats: using admin_stats_view successfully');
        return res.status(200).json({
          total_sales: Number(v.total_sales ?? 0),
          total_reserved: Number(v.total_reserved ?? 0),
          pending: Number(v.pending ?? 0),
          generated_at: v.generated_at ?? new Date().toISOString()
        });
      } else if (viewErr) {
        console.error('admin-stats: admin_stats_view error:', {
          message: viewErr.message,
          details: viewErr.details,
          hint: viewErr.hint,
          code: viewErr.code
        });
      }
    } catch (e) {
      console.warn('admin-stats: view read failed, falling back', String(e));
      // fallback continúa
    }

    // Fallback: sumar ventas y donaciones, contar pendientes (ligero)
    console.log('admin-stats: using fallback method - querying tables directly');
    
    const { data: sales, error: sErr } = await supa.from('sales').select('id,amount');
    if (sErr) {
      console.error('sales read error:', {
        message: sErr.message,
        details: sErr.details,
        hint: sErr.hint,
        code: sErr.code
      });
    }

    const { data: donations, error: dErr } = await supa.from('donations').select('sale_id,amount');
    if (dErr) {
      console.error('donations read error:', {
        message: dErr.message,
        details: dErr.details,
        hint: dErr.hint,
        code: dErr.code
      });
    }

    console.log('admin-stats: raw data - sales count:', Array.isArray(sales) ? sales.length : 0, 'donations count:', Array.isArray(donations) ? donations.length : 0);

    const total_sales = (Array.isArray(sales) ? sales : []).reduce((a, r) => a + Number(r.amount || 0), 0);
    const total_reserved = (Array.isArray(donations) ? donations : []).reduce((a, r) => a + Number(r.amount || 0), 0);

    const donatedIds = new Set((donations || []).map(d => String(d.sale_id)));
    const pending = (Array.isArray(sales) ? sales : []).filter(s => !donatedIds.has(String(s.id))).length;

    const result = {
      total_sales: Number(total_sales.toFixed(2)),
      total_reserved: Number(total_reserved.toFixed(2)),
      pending,
      generated_at: new Date().toISOString(),
      debug_info: {
        key_type: keyType,
        sales_count: Array.isArray(sales) ? sales.length : 0,
        donations_count: Array.isArray(donations) ? donations.length : 0,
        has_sales_error: !!sErr,
        has_donations_error: !!dErr
      }
    };

    console.log('admin-stats: final result:', result);

    return res.status(200).json(result);
  } catch (e) {
    console.error('admin-stats runtime error:', {
      name: e.name,
      message: e.message,
      stack: e.stack
    });
    return res.status(500).json({ 
      error: 'internal', 
      message: String(e?.message || e),
      debug_info: {
        error_name: e.name,
        error_message: e.message
      }
    });
  }
}
