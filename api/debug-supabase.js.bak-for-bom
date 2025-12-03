import { requireAdmin } from '../lib/require-admin.js';
if (!requireAdmin(req, res)) return;

// api/debug-supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    const { data, error } = await supa
      .from('sales')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return res.status(200).json({
      connectedTo: SUPABASE_URL,
      lastSales: data,
      error,
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

