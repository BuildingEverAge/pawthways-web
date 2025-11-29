// scripts/stress_allocate.js
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ALLOCATE_URL = process.env.VERCEL_ALLOCATE_URL;
const VERCEL_TOKEN = process.env.VERCEL_ADMIN_TOKEN || process.env.ADMIN_TOKEN;

if (!SUPABASE_URL || !SUPABASE_KEY || !ALLOCATE_URL || !VERCEL_TOKEN) {
  console.error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VERCEL_ALLOCATE_URL and VERCEL_ADMIN_TOKEN (or ADMIN_TOKEN)');
  process.exit(2);
}

const supa = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false }});

async function createSale(i) {
  const id = crypto.randomUUID();
  const sale = {
    id,
    product_id: 'c21dfc7d-2b4f-4491-8835-11375901ec76',
    amount: 5.00,
    currency: 'EUR',
    created_at: new Date().toISOString()
  };
  try {
    await supa.from('sales').insert([sale]);
    return id;
  } catch (e) {
    console.error('createSale error', i, e.message || e);
    throw e;
  }
}

async function callAllocate(i) {
  try {
    const r = await fetch(ALLOCATE_URL, {
      method: 'POST',
      headers: { 'x-admin-token': VERCEL_TOKEN, 'Accept': 'application/json' }
    });
    const text = await r.text();
    return { i, status: r.status, body: text.slice(0, 1000) };
  } catch (e) {
    return { i, status: 'ERR', body: String(e) };
  }
}

(async () => {
  const N = parseInt(process.env.STRESS_N || '10', 10); // default 10
  console.log('Stress test START, creating', N, 'sales then firing', N, 'concurrent allocate calls');
  const saleIds = [];
  for (let i = 0; i < N; i++) {
    const id = await createSale(i);
    saleIds.push(id);
  }
  console.log('Created sales sample:', saleIds.slice(0,5));

  // espera una fracción para asegurar que DB commit esté visible
  await new Promise(r => setTimeout(r, 500));

  // lanzar N llamadas concurrentes
  const promises = new Array(N).fill(0).map((_, i) => callAllocate(i));
  const results = await Promise.all(promises);
  console.log('Allocate calls results (first 50):', results.slice(0, 50));

  // opcional: comprobar algunas donations/audits
  try {
    const { data: someDonations } = await supa.from('donations').select('sale_id,amount').in('sale_id', saleIds.slice(0, 10));
    console.log('Sample donations rows found:', someDonations?.length || 0);
  } catch (e) {
    console.warn('Error querying donations after stress:', e.message || e);
  }

  console.log('Stress test DONE');
  process.exit(0);
})();
