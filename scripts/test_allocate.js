// scripts/test_allocate.js
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ---------- NOTE ----------
// If in GitHub Actions you stored the admin token under the name ADMIN_TOKEN
// instead of VERCEL_ADMIN_TOKEN, change the next line to:
// const VERCEL_TOKEN = process.env.ADMIN_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_ADMIN_TOKEN || process.env.ADMIN_TOKEN;

const ALLOCATE_URL = process.env.VERCEL_ALLOCATE_URL || 'https://pawthways-web.vercel.app/api/allocate';

if (!SUPABASE_URL || !SUPABASE_KEY || !VERCEL_TOKEN) {
  console.error('Missing required env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VERCEL_ADMIN_TOKEN or ADMIN_TOKEN)');
  process.exit(2);
}

const supa = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false }});

async function callAllocate(url, token) {
  console.log('Calling allocate at', url);
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-token': token || '',
      'Accept': 'application/json'
    }
  });

  console.log('allocate status:', resp.status, resp.statusText);
  console.log('allocate content-type:', resp.headers.get('content-type'));

  const text = await resp.text();
  console.log('allocate raw response (first 2000 chars):\n', text.slice(0, 2000));

  // only attempt to parse JSON if content-type explicitly says JSON
  if (resp.headers.get('content-type') && resp.headers.get('content-type').includes('application/json')) {
    try {
      const body = JSON.parse(text);
      console.log('allocate parsed body:', body);
      return body;
    } catch (e) {
      console.warn('allocate body looked like JSON but parse failed:', e);
      return null;
    }
  } else {
    console.warn('allocate did not return JSON (see raw response above).');
    return null;
  }
}

(async () => {
  try {
    // 1) create sale
    const testId = crypto.randomUUID();
    const sale = {
      id: testId,
      product_id: 'c21dfc7d-2b4f-4491-8835-11375901ec76',
      amount: 10.00,
      currency: 'EUR',
      created_at: new Date().toISOString()
    };
    const { data: insertData, error: insertErr } = await supa.from('sales').insert([sale]).select('id').single();
    if (insertErr) throw insertErr;
    console.log('Created test sale id=', testId);

    // 2) call allocate (safer logging)
    const allocBody = await callAllocate(ALLOCATE_URL, VERCEL_TOKEN);
    console.log('allocate response (parsed if any):', allocBody);

    // 3) wait a second and check donations/audit
    await new Promise(r => setTimeout(r, 1500));

    const { data: donations } = await supa.from('donations').select('*').eq('sale_id', testId);
    const { data: audits } = await supa.from('audit_donations_log').select('*').eq('sale_id', testId);

    console.log('donations for test sale:', donations);
    console.log('audits for test sale:', audits);

    if (!Array.isArray(donations) || donations.length === 0) {
      console.error('Test FAILED: no donation for test sale');
      process.exit(1);
    }
    if (!Array.isArray(audits) || audits.length === 0) {
      console.error('Test FAILED: no audit for test sale');
      process.exit(1);
    }

    console.log('Test PASSED: allocate created donation and trigger created audit.');
    process.exit(0);

  } catch (e) {
    console.error('Test failed:', e);
    process.exit(2);
  }
})();
