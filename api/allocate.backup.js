import { requireAdmin } from '../lib/require-admin.js';
if (!requireAdmin(req, res)) return;

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

    // 1) obtener ventas recientes
    const { data: sales, error: salesErr } = await supa
      .from('sales')
      .select('id, amount, currency')
      .limit(1000);

    if (salesErr) throw salesErr;
    if (!Array.isArray(sales) || sales.length === 0) {
      return res.status(200).json({ processed: 0, total_allocated: 0 });
    }

    // 2) donations existentes
    const saleIds = sales.map(s => s.id).filter(Boolean);
    const { data: existingDonations, error: dErr } = await supa
      .from('donations')
      .select('sale_id')
      .in('sale_id', saleIds);

    if (dErr) throw dErr;
    const donatedSaleIds = new Set((existingDonations || []).map(d => String(d.sale_id)));

    // 3) candidatos
    const candidates = sales.filter(s => !donatedSaleIds.has(String(s.id)));
    if (!candidates.length) {
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

    // 5) intentar batch insert
    const { data: inserted, error: insertErr } = await supa
      .from('donations')
      .insert(inserts, { returning: 'representation' });

    let results = inserted || [];

    if (insertErr) {
      // fallback one-by-one
      results = [];
      for (const row of inserts) {
        try {
          const { data: d, error: e } = await supa
            .from('donations')
            .insert([row], { returning: 'representation' });
          if (e) continue;
          if (Array.isArray(d) && d[0]) results.push(d[0]);
        } catch (e) {
          console.error('Insert single error', e);
        }
      }
    }

    // 6) AUDIT: insertar filas en audit_donations_log
    if (results.length) {
      const auditRows = results.map(d => ({
        donation_id: d.id,
        sale_id: d.sale_id,                 // aÃ±adimos sale_id explÃ­cito
        action: 'allocated',
        actor: 'system.allocate',
        meta: { amount: d.amount, currency: d.currency } // plain JS object -> JSONB
        // no created_at: dejamos que lo ponga la DB por defecto
      }));

      try {
        const { error: auditErr } = await supa
          .from('audit_donations_log')
          .insert(auditRows);

        if (auditErr) {
          console.error('Failed to insert audit rows', auditErr);
          // no hacemos fail total por auditorÃ­a
        }
      } catch (ae) {
        console.error('Unexpected audit insert error', ae);
      }
    }


