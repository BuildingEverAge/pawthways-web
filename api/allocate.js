// api/allocate.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    // Solo POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    console.log('api/allocate: starting allocation');

    // 1) obtener ventas recientes (limit para evitar timeouts)
    const { data: sales, error: salesErr } = await supa
      .from('sales')
      .select('id, amount, currency')
      .limit(1000);

    if (salesErr) {
      console.error('Error fetching sales', salesErr);
      throw salesErr;
    }

    if (!Array.isArray(sales) || sales.length === 0) {
      console.log('No sales found.');
      return res.status(200).json({ processed: 0, total_allocated: 0 });
    }

    // 2) obtener donations existentes para estas sales
    const saleIds = sales.map(s => s.id).filter(Boolean);
    const { data: existingDonations, error: dErr } = await supa
      .from('donations')
      .select('sale_id')
      .in('sale_id', saleIds);

    if (dErr) {
      console.error('Error fetching existing donations', dErr);
      throw dErr;
    }

    const donatedSaleIds = new Set((existingDonations || []).map(d => String(d.sale_id)));

    // 3) filtrar sales que no tienen donation ya
    const candidates = sales.filter(s => !donatedSaleIds.has(String(s.id)));
    if (!candidates.length) {
      console.log('No unallocated sales found.');
      return res.status(200).json({ processed: 0, total_allocated: 0 });
    }

    // 4) preparar inserts
    const inserts = candidates.map(sale => {
      const amountNum = Number(sale.amount || 0);
      const share = Math.round(amountNum * 0.4 * 100) / 100; // 2 decimales
      return {
        sale_id: sale.id,
        amount: share,
        currency: sale.currency || 'EUR',
        allocated_at: new Date().toISOString()
      };
    });

    console.log('Prepared inserts for', inserts.length, 'sales');

    // 5) intentar batch insert
    const { data: inserted, error: insertErr } = await supa
      .from('donations')
      .insert(inserts, { returning: 'representation' });

    if (insertErr) {
      console.warn('Batch insert failed, falling back to single inserts:', insertErr);
      const results = [];
      let total = 0;
      for (const row of inserts) {
        try {
          const { data: d, error: e } = await supa
            .from('donations')
            .insert([row], { returning: 'representation' });
          if (e) {
            console.warn('Insert one failed for sale', row.sale_id, e.message || e);
            continue;
          }
          if (Array.isArray(d) && d[0]) {
            results.push(d[0]);
            total += Number(d[0].amount || 0);
          }
        } catch (e) {
          console.error('Unexpected error inserting one-by-one', e);
        }
      }
      return res.status(200).json({
        processed: results.length,
        total_allocated: Math.round(total * 100) / 100
      });
    }

    // 6) devuelve resumen
    const totalAllocated = (inserted || []).reduce((sum, x) => sum + Number(x.amount || 0), 0);
    return res.status(200).json({
      processed: (inserted || []).length,
      total_allocated: Math.round(totalAllocated * 100) / 100
    });

  } catch (err) {
    console.error('api/allocate error', err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
}
