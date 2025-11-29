// api/allocate.js (debug-capable, full-flow)
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

    const debugMode = Boolean(req.query && (req.query.debug === '1' || req.query.debug === 'true'));

    console.log('api/allocate: starting allocation', { debugMode });

    // 1) obtener ventas recientes
    const { data: sales, error: salesErr } = await supa
      .from('sales')
      .select('id, amount, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    console.log("LOG-1 sales_fetched:", Array.isArray(sales) ? sales.length : "null");
    console.log("LOG-1 sales_ids:", sales?.map(s => s.id));

    if (salesErr) {
      console.error('Error fetching sales', salesErr);
      throw salesErr;
    }
    if (!Array.isArray(sales) || sales.length === 0) {
      return res.status(200).json({ processed: 0, total_allocated: 0, reason: 'no_sales' });
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
    console.log("LOG-2 donated_ids:", [...donatedSaleIds].slice(0,50));

    // 3) candidatos
    const candidates = sales.filter(s => !donatedSaleIds.has(String(s.id)));
    console.log("LOG-3 candidates_count:", candidates.length);
    console.log("LOG-3 candidates_ids:", candidates.map(c => c.id).slice(0,100));
    if (!candidates.length) {
      if (debugMode) {
        return res.status(200).json({
          processed: 0,
          total_allocated: 0,
          debug: {
            sales_count: sales.length,
            donated_count: existingDonations?.length || 0,
            donated_ids_sample: Array.from(donatedSaleIds).slice(0,50),
            candidates_count: 0,
            candidates_ids: []
          }
        });
      }
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
    console.log('Prepared inserts sample:', inserts.slice(0,5));

    if (debugMode) {
      // devolvemos todo lo necesario sin escribir nada
      return res.status(200).json({
        processed: 0,
        total_allocated: 0,
        debug: {
          connectedTo: SUPABASE_URL,
          sales_count: sales.length,
          sales_ids: sales.map(s => s.id).slice(0,100),
          donated_count: existingDonations?.length || 0,
          donated_ids: Array.from(donatedSaleIds),
          candidates_count: candidates.length,
          candidates_ids: candidates.map(c => c.id),
          prepared_inserts_count: inserts.length,
          prepared_inserts_sample: inserts.slice(0,10)
        }
      });
    }

    // --- 5) intentar batch insert via RPC (insert_donations_batch) ---
    let results = [];

    try {
      // RPC expects jsonb param _rows (we send JSON string)
      // PASO CORRECTO: pasar el array directamente (no JSON.stringify)
const { data: rpcData, error: rpcErr } = await supa
  .rpc('insert_donations_batch', { _rows: inserts });

      if (rpcErr) {
        console.error('RPC insert_donations_batch error:', rpcErr);
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

    // Fallback: if RPC didn't return rows, try single-row RPC insert calls (idempotent)
    if ((!Array.isArray(results) || results.length === 0)) {
      console.warn('Fallback: RPC returned no results — trying one-by-one via RPC');
      const fallbackResults = [];
      for (const row of inserts) {
        try {
          const { data: singleData, error: singleErr } = await supa
  .rpc('insert_donations_batch', { _rows: [row] });

          if (singleErr) {
            // handle duplicates / conflicts
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
    }

    // --- RECONCILE: if still no results, re-query donations for candidate sale_ids ---
    if (!Array.isArray(results) || results.length === 0) {
      try {
        console.log('RECONCILE: results empty — re-query donations for candidate sale_ids');
        const candidateIds = inserts.map(r => r.sale_id);
        const { data: existingNow, error: existingNowErr } = await supa
          .from('donations')
          .select('*')
          .in('sale_id', candidateIds);

        if (existingNowErr) {
          console.error('RECONCILE: error fetching donations after insert attempts', existingNowErr);
        } else if (Array.isArray(existingNow) && existingNow.length) {
          console.log('RECONCILE: found donations in DB for candidate sale_ids:', existingNow.map(d => d.sale_id));
          results = existingNow;
        } else {
          console.log('RECONCILE: no donations found on re-query');
        }
      } catch (e) {
        console.error('RECONCILE: unexpected error', e);
      }
    }

    // 6) AUDIT + cálculo fiable: calcular totalAllocated desde la tabla donations para las sale_ids procesadas

// Construimos lista de sale_ids procesadas a partir de `results` (maneja varios shapes)
const processedSaleIds = (Array.isArray(results) ? results.map(r => (r.sale_id || r.sale_id_out || r.saleId || (r['sale_id']))) : []);
const uniqueSaleIds = Array.from(new Set(processedSaleIds.filter(Boolean)));

let totalAllocated = 0;
let donationsRows = [];

if (uniqueSaleIds.length) {
  try {
    const { data: donationsFromDb, error: donationsErr } = await supa
      .from('donations')
      .select('id, sale_id, amount, currency, created_at')
      .in('sale_id', uniqueSaleIds);

    if (donationsErr) {
      console.error('Error fetching donations for total calculation', donationsErr);
    } else if (Array.isArray(donationsFromDb) && donationsFromDb.length) {
      donationsRows = donationsFromDb;
      totalAllocated = donationsFromDb.reduce((s, x) => s + Number(x.amount || 0), 0);
    }
  } catch (e) {
    console.error('Unexpected error fetching donations for totalAllocated', e);
  }
}

// Fallback: si no obtuvimos nada de la BD, intentamos calcular desde `results` con normalización
if (totalAllocated === 0 && Array.isArray(results) && results.length) {
  const normalized = results.map(r => {
    const amountCandidates = [r.amount, r.amount_out, r.amountOut, (r.meta && r.meta.amount)];
    let amountVal = 0;
    for (const c of amountCandidates) {
      if (c !== undefined && c !== null && c !== '') {
        const n = Number(c);
        if (!Number.isNaN(n)) { amountVal = n; break; }
      }
    }
    return {
      id: r.id || r.donation_id || r.donation_id_out || null,
      sale_id: r.sale_id || r.sale_id_out || null,
      amount: amountVal,
      currency: r.currency || r.currency_out || (r.meta && r.meta.currency) || 'EUR'
    };
  });

  totalAllocated = normalized.reduce((s, x) => s + Number(x.amount || 0), 0);
  // If donationsRows empty, use normalized to build auditRows below
  if (!donationsRows.length) donationsRows = normalized;
}

// AUDIT: delegamos la creación de logs al trigger de la base de datos.
// Evitamos insertar auditorías desde el backend para no producir filas nulas o duplicadas.
// Mostramos un sample para debugging, el trigger DB (db.trigger.donations) será el encargado real.
console.log('AUDIT: delegating audit insertion to DB trigger. donationsRows sample:', (donationsRows || []).slice(0,10));


// Responder con totals usando el total calculado
const processedCount = (uniqueSaleIds.length || (Array.isArray(results) ? results.length : 0));
console.log('api/allocate: done', { processed: processedCount, totalAllocated });
return res.status(200).json({
  processed: processedCount,
  total_allocated: Math.round(totalAllocated * 100) / 100
});
  } catch (err) {
    console.error('api/allocate error', err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
}
