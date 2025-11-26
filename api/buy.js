// api/buy.js (Node, Vercel)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    const { product } = req.query;
    if (!product) return res.status(400).json({ error: 'missing product' });

    // fetch product by slug
    const { data: products, error: pErr } = await supa
      .from('products')
      .select('*')
      .eq('slug', product)
      .limit(1);

    if (pErr) throw pErr;
    const p = (products && products[0]) || null;
    if (!p) return res.status(404).json({ error: 'product not found' });

    // insert a sale row (manual reservation)
    const insertResp = await supa
      .from('sales')
      .insert([{
        product_id: p.id,
        amount: p.price,
        currency: p.currency || 'EUR',
        buyer_email: req.body?.buyer_email || null,
        source: 'whop',
      }])
      .select('id')
      .single();

    if (insertResp.error) throw insertResp.error;

    return res.status(200).json({
      success: true,
      sale_id: insertResp.data.id,
      whop_url: p.whop_url || null
    });
  } catch (err) {
    console.error('api/buy error', err);
    return res.status(500).json({ error: 'internal' });
  }
}