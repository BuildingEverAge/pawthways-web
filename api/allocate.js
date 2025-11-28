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
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    console.log('api/allocate: starting allocation');

    // 1) obtener ventas recientes
    const { data: sales, error: salesErr } = await supa
      .from('sales')
      .select('id, amount, currency')
      .limit(1000);

    console.log("LOG-1 sales_fetched:", Array.isArray(sales) ? sales.length : "null");
    console.log("LOG-1 sales_ids:", sales?.map(s => s.id));

    if (salesErr) {
      console.error('Error fetching sales', salesErr);
      throw salesErr;
    }
    if (!Array.isArray(sales) || sales.length === 0) {
      console.log('No sales found.');
      return res.status(200).json({ processed: 0, total_allocated: 0 });
    }

    // 2) donations existentes
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
    console.log("LOG-2 donations_found:", existingDonations?.length || 0);
    console.log("LOG-2 donated_ids:", [...donatedSaleIds]);

    // 3) candidatos
    const candidates = sales.filter(s => !donatedSaleIds.has(String(s.id)));
    console.log("LOG-3 candidates_count:", candidates.length);
    console.log("LOG-3 candidates_ids:", candidates.map(c => c.id));
    if (!candidates.length) {
      console.log('No unallocated sales found.');
      return res.status(200).json({ processed: 0, total_allocated: 0 });
    }

    // 4) preparar inserts
    const inserts = candidates.map(sale => {
      const amountNum = Number(sale.amount || 0);
      const share = Math.round(amountNum * 0.4 * 100) / 100;
      return {
        sale_id: sale.id,
        amount: share,
        currency: sale.currency || 'EUR',
        allocated_at: new Date().toISOString()
      };
    });

    console.log(`Prepared inserts for ${inserts.length} sales`);

    // --- 5) insertar idempotente vía RPC (insert_donations_batch) ---
let results = [];

// llama a la función SQL que hace INSERT ... ON CONFLICT DO NOTHING RETURNING *
try {
  const { data: rpcData, error: rpcErr } = await supa
    .rpc('insert_donations_batch', { _rows: JSON.stringify(inserts) });

  if (rpcErr) {
    console.error('RPC insert_donations_batch error:', rpcErr);
    // si falla la RPC (raro), fallback a single inserts (ver abajo)
  } else if (Array.isArray(rpcData) && rpcData.length) {
    console.log('RPC: inserted rows count:', rpcData.length);
    results = rpcData;
  } else {
    console.log('RPC: no rows returned (no new inserts)');
    results = [];
  }
} catch (e) {
  console.error('RPC call threw unexpected error:', e);
}

// Fallback robusto: en caso RPC fallase por alguna razón, intentar inserts individuales con ON CONFLICT DO NOTHING via supa.from
if (!Array.isArray(results) || results.length === 0) {
  try {
    // intentamos inserts individuales idempotentes
    const fallbackResults = [];
    for (const row of inserts) {
      try {
        const q = `
          INSERT INTO public.donations (sale_id, amount, currency, allocated_at)
          VALUES ($1::uuid, $2::numeric, $3::text, $4::timestamptz)
          ON CONFLICT (sale_id) DO NOTHING
          RETURNING id, sale_id, amount, currency, allocated_at, created_at;
        `;
        // Supabase JS no expone query with params directly — usamos rpc with single-row wrapper if needed,
        // but aquí simplemente call rpc for single array to keep consistent:
        const { data: singleData, error: singleErr } = await supa
          .rpc('insert_donations_batch', { _rows: JSON.stringify([row]) });

        if (singleErr) {
          console.warn('Fallback single RPC insert error for', row.sale_id, singleErr);
          continue;
        }
        if (Array.isArray(singleData) && singleData[0]) fallbackResults.push(singleData[0]);
      } catch (e) {
        console.error('Fallback single insert unexpected error for', row.sale_id, e);
      }
    }
    if (fallbackResults.length) {
      console.log('Fallback: inserted count:', fallbackResults.length);
      results = fallbackResults;
    }
  } catch (e) {
    console.error('Fallback outer error', e);
  }
}


    // 6) AUDIT: insertar filas en audit_donations_log (verboso + fallback)
    if (results.length) {
      const auditRows = results.map(d => ({
        donation_id: d.id,
        sale_id: d.sale_id,
        action: 'allocated',
        actor: 'system.allocate',
        meta: { amount: d.amount, currency: d.currency }
      }));

      try {
        const { data: auditInserted, error: auditErr } = await supa
          .from('audit_donations_log')
          .insert(auditRows, { returning: 'representation' });

        console.log('AUDIT: inserted rows count:', (auditInserted || []).length);
        console.log('AUDIT: auditInserted sample:', (auditInserted || [])[0] || null);
        if (auditErr) console.error('AUDIT: batch insert error:', auditErr);

        if (auditErr || !Array.isArray(auditInserted) || auditInserted.length !== auditRows.length) {
          console.warn('AUDIT: falling back to single inserts');
          const fallbackInserted = [];
          for (const row of auditRows) {
            try {
              const { data: singleData, error: singleErr } = await supa
                .from('audit_donations_log')
                .insert([row], { returning: 'representation' });
              if (singleErr) {
                console.error('AUDIT: single insert error', singleErr, 'row=', row);
                continue;
              }
              if (Array.isArray(singleData) && singleData[0]) fallbackInserted.push(singleData[0]);
            } catch (e) {
              console.error('AUDIT: unexpected single insert error', e, 'row=', row);
            }
          }
          console.log('AUDIT: fallbackInserted count:', fallbackInserted.length);
        }
      } catch (ae) {
        console.error('AUDIT: unexpected exception inserting audit rows', ae);
      }
    }

    // 7) devolver resumen
    const totalAllocated = results.reduce((s, x) => s + Number(x.amount || 0), 0);
    console.log('api/allocate: done', { processed: results.length, totalAllocated });
    return res.status(200).json({
      processed: results.length,
      total_allocated: Math.round(totalAllocated * 100) / 100
    });

  } catch (err) {
    console.error('api/allocate error', err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
}
